import { describe, it, expect } from "vitest";
import { cartTotals } from "@/lib/stores";
import type { Product } from "@/data/products";

const p = (id: string, price: number): Product =>
  ({ id, price } as unknown as Product);

const products = [p("p01", 549), p("p02", 399), p("p03", 1000)];

describe("cartTotals", () => {
  it("returns zeros for empty cart", () => {
    const result = cartTotals([], products);
    expect(result).toEqual({
      subtotal: 0,
      shipping: 0,
      total: 0,
      count: 0,
      FREE_SHIPPING_AT: 5000,
    });
  });

  it("calculates subtotal and count correctly", () => {
    const { subtotal, count } = cartTotals(
      [{ productId: "p01", qty: 2 }, { productId: "p02", qty: 1 }],
      products
    );
    expect(subtotal).toBe(549 * 2 + 399); // 1497
    expect(count).toBe(3);
  });

  it("adds €3.99 shipping when subtotal is below €50", () => {
    const { shipping, total } = cartTotals(
      [{ productId: "p02", qty: 1 }], // 399 cents
      products
    );
    expect(shipping).toBe(399);
    expect(total).toBe(399 + 399);
  });

  it("free shipping at exactly €50 (5000 cents)", () => {
    // p03 = 1000 cents × 5 = 5000
    const { shipping } = cartTotals(
      [{ productId: "p03", qty: 5 }],
      products
    );
    expect(shipping).toBe(0);
  });

  it("free shipping above €50", () => {
    const { shipping } = cartTotals(
      [{ productId: "p03", qty: 6 }], // 6000 cents
      products
    );
    expect(shipping).toBe(0);
  });

  it("just under free shipping threshold (4999 cents) incurs shipping", () => {
    // p01=549 × 9 = 4941, p02=399 × 1 = 399 → too high
    // p02=399 × 12 = 4788 + p01=549 × 0 = 4788 → still needs tweaking
    // Simplest: 1 item at price 4999 cents
    const cheapProducts = [p("pX", 4999)];
    const { shipping } = cartTotals([{ productId: "pX", qty: 1 }], cheapProducts);
    expect(shipping).toBe(399);
  });

  it("skips items whose productId is not in the products list", () => {
    const { subtotal, count } = cartTotals(
      [{ productId: "unknown", qty: 5 }],
      products
    );
    expect(subtotal).toBe(0);
    expect(count).toBe(0);
  });

  it("total = subtotal + shipping", () => {
    const result = cartTotals([{ productId: "p01", qty: 1 }], products);
    expect(result.total).toBe(result.subtotal + result.shipping);
  });
});
