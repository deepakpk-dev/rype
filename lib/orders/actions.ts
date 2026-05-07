"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
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
        name: z.string().min(1),
        qty: z.number().int().positive(),
        price: z.number().int().nonnegative(),
      })
    )
    .min(1),
  subtotal: z.number().int().nonnegative(),
  shipping: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export async function placeOrderAction(
  input: z.infer<typeof placeSchema>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid order payload" };
  }
  const { customer, items, subtotal, shipping, total } = parsed.data;

  try {
    const order = await prisma.order.create({
      data: {
        id: `ord_${Date.now().toString(36)}`,
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
        items: { create: items },
      },
    });

    // Refresh admin views that show orders.
    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return { ok: true, id: order.id };
  } catch (e) {
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
