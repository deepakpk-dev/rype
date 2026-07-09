"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { shippingFor } from "@/lib/cart-math";
import type { OrderStatus } from "@prisma/client";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const satisfies readonly OrderStatus[];

const placeSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive().max(999),
      })
    )
    .min(1)
    .max(100),
});

// Prices, names, and totals come from the database — never from the client.
// Stock verification, stock decrement, and order creation happen in a single
// transaction so a failed availability check rolls everything back.
export async function placeOrderAction(
  input: z.infer<typeof placeSchema>
): Promise<{ ok: true; id: string; total: number } | { ok: false; error: string }> {
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid order payload" };
  }
  const { customer, items } = parsed.data;

  // Merge duplicate product ids so the per-product stock guard sees the
  // combined quantity.
  const qtyById = new Map<string, number>();
  for (const item of items) {
    qtyById.set(item.productId, (qtyById.get(item.productId) ?? 0) + item.qty);
  }
  const ids = [...qtyById.keys()];

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      // OrderItem.productId has no FK to Product — reject unknown ids here.
      if (products.length !== ids.length) throw new Error("UNKNOWN_PRODUCT");

      let subtotal = 0;
      for (const p of products) {
        subtotal += p.price * qtyById.get(p.id)!;
      }
      const shipping = shippingFor(subtotal);
      const total = subtotal + shipping;

      for (const p of products) {
        const qty = qtyById.get(p.id)!;
        const res = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (res.count === 0) throw new Error(`OUT_OF_STOCK:${p.id}`);
      }

      return tx.order.create({
        data: {
          id: `ord_${randomUUID().replaceAll("-", "").slice(0, 16)}`,
          status: "pending",
          customerName: customer.name,
          customerEmail: customer.email,
          customerAddress: customer.address,
          customerCity: customer.city,
          customerZip: customer.zip,
          customerCountry: customer.country,
          subtotal,
          shipping,
          total,
          items: {
            create: products.map((p) => ({
              productId: p.id,
              name: p.name,
              qty: qtyById.get(p.id)!,
              price: p.price,
            })),
          },
        },
      });
    });

    // Refresh admin views that show orders, plus the storefront ISR pages
    // that render stock.
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/inventory");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/products/[slug]", "page");

    return { ok: true, id: order.id, total: order.total };
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("OUT_OF_STOCK")) {
      return { ok: false, error: "One or more items are out of stock" };
    }
    if (e instanceof Error && e.message === "UNKNOWN_PRODUCT") {
      return { ok: false, error: "Invalid product in cart" };
    }
    console.error("placeOrderAction failed:", e);
    return { ok: false, error: "Could not save order. Is DATABASE_URL set?" };
  }
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export async function setOrderStatusAction(
  input: z.infer<typeof statusSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.role) return { ok: false, error: "Unauthorized" };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid status" };

  try {
    await prisma.order.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    console.error("setOrderStatusAction failed:", e);
    return { ok: false, error: "Update failed" };
  }
}

export async function removeOrderAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  // Server-side RBAC: only admin can delete orders.
  if (session?.user?.role !== "admin") {
    return { ok: false, error: "Admin only" };
  }

  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    console.error("removeOrderAction failed:", e);
    return { ok: false, error: "Delete failed" };
  }
}
