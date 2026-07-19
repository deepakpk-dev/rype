import { describe, expect, it } from "vitest";
import {
  publicGrowthEventSchema,
  trustedOrderEventSchema,
} from "@/lib/growth/schema";

const base = {
  eventId: "evt_000000000001",
  sessionId: "sess_000000000001",
  occurredAt: "2026-07-19T10:00:00.000Z",
};

describe("publicGrowthEventSchema", () => {
  it("accepts a bounded add-to-cart event", () => {
    expect(publicGrowthEventSchema.safeParse({
      ...base,
      name: "add_to_cart",
      properties: {
        productId: "p01",
        quantity: 2,
        unitPrice: 549,
        cartValue: 1098,
        cartSize: 2,
        placement: "pdp",
      },
    }).success).toBe(true);
  });

  it("rejects trusted conversions and unknown personal fields", () => {
    expect(publicGrowthEventSchema.safeParse({
      ...base,
      name: "order_completed",
      properties: { orderId: "ord_1" },
    }).success).toBe(false);
    expect(publicGrowthEventSchema.safeParse({
      ...base,
      name: "product_viewed",
      properties: { productId: "p01", email: "person@example.com" },
    }).success).toBe(false);
  });

  it("rejects unknown keys at event, properties, attribution, and experiment levels", () => {
    const event = {
      ...base,
      name: "checkout_started",
      properties: { cartValue: 1098, cartSize: 2 },
    } as const;

    expect(publicGrowthEventSchema.safeParse({ ...event, email: "person@example.com" }).success).toBe(false);
    expect(publicGrowthEventSchema.safeParse({
      ...event,
      properties: { ...event.properties, coupon: "SUMMER" },
    }).success).toBe(false);
    expect(publicGrowthEventSchema.safeParse({
      ...event,
      attribution: {
        landingPath: "/checkout",
        referrerCategory: "direct",
        email: "person@example.com",
      },
    }).success).toBe(false);
    expect(publicGrowthEventSchema.safeParse({
      ...event,
      experiments: { unknown_experiment: "control" },
    }).success).toBe(false);
  });
});

describe("trustedOrderEventSchema", () => {
  it("accepts only the trusted order-completed contract", () => {
    expect(trustedOrderEventSchema.safeParse({
      ...base,
      name: "order_completed",
      properties: { orderId: "ord_1", orderTotal: 1098, itemCount: 2 },
    }).success).toBe(true);
    expect(trustedOrderEventSchema.safeParse({
      ...base,
      name: "add_to_cart",
      properties: { orderId: "ord_1", orderTotal: 1098, itemCount: 2 },
    }).success).toBe(false);
  });
});
