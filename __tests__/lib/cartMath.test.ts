import { describe, it, expect } from "vitest";
import { shippingFor, FREE_SHIPPING_AT, SHIPPING_FLAT } from "@/lib/cart-math";

describe("shippingFor", () => {
  it("is free for an empty cart", () => {
    expect(shippingFor(0)).toBe(0);
  });

  it("charges the flat rate below the free-shipping threshold", () => {
    expect(shippingFor(1)).toBe(SHIPPING_FLAT);
    expect(shippingFor(FREE_SHIPPING_AT - 1)).toBe(399);
  });

  it("is free at exactly the threshold", () => {
    expect(shippingFor(FREE_SHIPPING_AT)).toBe(0);
  });

  it("is free above the threshold", () => {
    expect(shippingFor(9999)).toBe(0);
  });
});
