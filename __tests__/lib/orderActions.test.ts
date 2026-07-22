import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    order: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    product: { findMany: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/growth/persistence", () => ({
  recordTrustedOrderCompleted: vi.fn(),
}));

import {
  placeOrderAction,
  setOrderStatusAction,
  removeOrderAction,
} from "@/lib/orders/actions";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { recordTrustedOrderCompleted } from "@/lib/growth/persistence";

const mockAuth = vi.mocked(auth);
const mockTransaction = vi.mocked(prisma.$transaction);
const recordTrustedOrderCompletedMock = vi.mocked(recordTrustedOrderCompleted);

const customer = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  address: "1 Analytical Way",
  city: "Dublin",
  zip: "D01",
  country: "Ireland",
};

// Simulate the interactive transaction: run the callback against a tx stub
// backed by the given product rows.
function stubTransaction(rows: { id: string; name: string; price: number }[]) {
  const tx = {
    product: {
      findMany: vi.fn().mockResolvedValue(rows),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    order: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve(data)),
    },
  };
  mockTransaction.mockImplementation(
    async (fn: unknown) => (fn as (t: typeof tx) => Promise<unknown>)(tx)
  );
  return tx;
}

beforeEach(() => {
  vi.clearAllMocks();
  recordTrustedOrderCompletedMock.mockResolvedValue({ accepted: true, duplicate: false });
});

describe("placeOrderAction", () => {
  it("rejects an empty items array without touching the DB", async () => {
    const res = await placeOrderAction({ customer, items: [] });
    expect(res).toEqual({ ok: false, error: "Invalid order payload" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("rejects an invalid email without touching the DB", async () => {
    const res = await placeOrderAction({
      customer: { ...customer, email: "not-an-email" },
      items: [{ productId: "p01", qty: 1 }],
    });
    expect(res.ok).toBe(false);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("rejects non-positive and non-integer quantities", async () => {
    for (const qty of [0, -1, 1.5]) {
      const res = await placeOrderAction({
        customer,
        items: [{ productId: "p01", qty }],
      });
      expect(res.ok).toBe(false);
    }
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("prices the order from the database, not the client", async () => {
    const tx = stubTransaction([{ id: "p01", name: "Tomatoes", price: 549 }]);
    const res = await placeOrderAction({
      customer,
      items: [{ productId: "p01", qty: 2 }],
    });
    expect(res.ok).toBe(true);
    const created = tx.order.create.mock.calls[0][0].data;
    expect(created.subtotal).toBe(1098);
    expect(created.shipping).toBe(399);
    expect(created.total).toBe(1497);
    expect(created.items.create).toEqual([
      { productId: "p01", name: "Tomatoes", qty: 2, price: 549 },
    ]);
  });

  it("merges duplicate product ids before checking stock", async () => {
    const tx = stubTransaction([{ id: "p01", name: "Tomatoes", price: 549 }]);
    const res = await placeOrderAction({
      customer,
      items: [
        { productId: "p01", qty: 1 },
        { productId: "p01", qty: 2 },
      ],
    });
    expect(res.ok).toBe(true);
    expect(tx.product.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: { id: "p01", stock: { gte: 3 } },
      data: { stock: { decrement: 3 } },
    });
  });

  it("rejects unknown product ids", async () => {
    stubTransaction([]); // DB knows none of the requested ids
    const res = await placeOrderAction({
      customer,
      items: [{ productId: "ghost", qty: 1 }],
    });
    expect(res).toEqual({ ok: false, error: "Invalid product in cart" });
  });

  it("fails with an out-of-stock error when the guarded decrement matches nothing", async () => {
    const tx = stubTransaction([{ id: "p01", name: "Tomatoes", price: 549 }]);
    tx.product.updateMany.mockResolvedValue({ count: 0 });
    const res = await placeOrderAction({
      customer,
      items: [{ productId: "p01", qty: 5 }],
    });
    expect(res).toEqual({ ok: false, error: "One or more items are out of stock" });
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it("returns ok:false instead of throwing when the DB is down", async () => {
    mockTransaction.mockRejectedValue(new Error("connect ECONNREFUSED"));
    const res = await placeOrderAction({
      customer,
      items: [{ productId: "p01", qty: 1 }],
    });
    expect(res.ok).toBe(false);
  });

  it("records a trusted conversion after a successful order", async () => {
    stubTransaction([{ id: "p01", name: "Tomatoes", price: 549 }]);

    const result = await placeOrderAction({
      customer,
      items: [{ productId: "p01", qty: 2 }],
      growth: {
        sessionId: "sess_000000000002",
        experiments: { checkout_reassurance_v1: "treatment" },
      },
    });

    expect(result.ok).toBe(true);
    expect(recordTrustedOrderCompletedMock).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: "sess_000000000002",
      total: 1497,
      itemCount: 2,
      experiments: { checkout_reassurance_v1: "treatment" },
    }));
  });

  it("does not fail checkout when analytics persistence fails", async () => {
    stubTransaction([{ id: "p01", name: "Tomatoes", price: 549 }]);
    recordTrustedOrderCompletedMock.mockRejectedValue(new Error("analytics unavailable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(placeOrderAction({
      customer,
      items: [{ productId: "p01", qty: 2 }],
      growth: {
        sessionId: "sess_000000000002",
        experiments: { checkout_reassurance_v1: "treatment" },
      },
    })).resolves.toEqual(expect.objectContaining({ ok: true, total: 1497 }));

    expect(errorSpy).toHaveBeenCalledWith("Order conversion analytics failed:", expect.any(Error));
    errorSpy.mockRestore();
  });

  it("rejects growth payloads containing checkout PII before opening a transaction", async () => {
    const result = await placeOrderAction({
      customer,
      items: [{ productId: "p01", qty: 1 }],
      growth: {
        sessionId: "sess_000000000002",
        experiments: { checkout_reassurance_v1: "treatment" },
        email: "ada@example.com",
      },
    } as never);

    expect(result).toEqual({ ok: false, error: "Invalid order payload" });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(recordTrustedOrderCompletedMock).not.toHaveBeenCalled();
  });
});

describe("setOrderStatusAction", () => {
  it("rejects an unauthenticated caller before touching the DB", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await setOrderStatusAction({ id: "ord_1", status: "shipped" });
    expect(res).toEqual({ ok: false, error: "Unauthorized" });
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("rejects a session without a role", async () => {
    mockAuth.mockResolvedValue({ user: { email: "x@x" } } as never);
    const res = await setOrderStatusAction({ id: "ord_1", status: "shipped" });
    expect(res).toEqual({ ok: false, error: "Unauthorized" });
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("rejects a status outside the enum even when authed", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } } as never);
    const res = await setOrderStatusAction({
      id: "ord_1",
      status: "refunded" as never,
    });
    expect(res).toEqual({ ok: false, error: "Invalid status" });
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("allows staff to update statuses (staff manage orders by design)", async () => {
    mockAuth.mockResolvedValue({ user: { role: "staff" } } as never);
    vi.mocked(prisma.order.update).mockResolvedValue({} as never);
    const res = await setOrderStatusAction({ id: "ord_1", status: "shipped" });
    expect(res).toEqual({ ok: true });
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "ord_1" },
      data: { status: "shipped" },
    });
  });
});

describe("removeOrderAction", () => {
  it("rejects staff before touching the DB", async () => {
    mockAuth.mockResolvedValue({ user: { role: "staff" } } as never);
    const res = await removeOrderAction("ord_1");
    expect(res).toEqual({ ok: false, error: "Admin only" });
    expect(prisma.order.delete).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated caller", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await removeOrderAction("ord_1");
    expect(res).toEqual({ ok: false, error: "Admin only" });
    expect(prisma.order.delete).not.toHaveBeenCalled();
  });

  it("deletes for admin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } } as never);
    vi.mocked(prisma.order.delete).mockResolvedValue({} as never);
    const res = await removeOrderAction("ord_1");
    expect(res).toEqual({ ok: true });
    expect(prisma.order.delete).toHaveBeenCalledWith({ where: { id: "ord_1" } });
  });
});
