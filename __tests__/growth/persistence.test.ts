import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  growthSession: { upsert: vi.fn() },
  growthEvent: { create: vi.fn() },
  experimentExposure: { upsert: vi.fn() },
  product: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

import {
  persistPublicEvent,
  recordExposure,
  recordTrustedOrderCompleted,
} from "@/lib/growth/persistence";

const attribution = {
  utmSource: "google",
  utmCampaign: "spring",
  landingPath: "/products",
  referrerCategory: "search" as const,
};

const validCheckoutStarted = {
  eventId: "evt_000000000001",
  sessionId: "sess_000000000001",
  occurredAt: "2026-07-19T10:00:00.000Z",
  name: "checkout_started" as const,
  properties: { cartValue: 1098, cartSize: 2 },
};

function runInteractiveTransaction() {
  prismaMock.$transaction.mockImplementation(async (callback: unknown) =>
    (callback as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock));
}

beforeEach(() => {
  vi.clearAllMocks();
  runInteractiveTransaction();
  prismaMock.growthSession.upsert.mockResolvedValue({});
  prismaMock.growthEvent.create.mockResolvedValue({});
  prismaMock.experimentExposure.upsert.mockResolvedValue({});
  prismaMock.product.findUnique.mockResolvedValue({ id: "p01" });
});

describe("persistPublicEvent", () => {
  it("treats a duplicate event id as a successful retry", async () => {
    prismaMock.growthEvent.create.mockRejectedValue({ code: "P2002" });

    await expect(persistPublicEvent(validCheckoutStarted, attribution)).resolves.toEqual({
      accepted: true,
      duplicate: true,
    });
  });

  it("creates the session and normalized event in one transaction", async () => {
    await expect(persistPublicEvent(validCheckoutStarted, attribution)).resolves.toEqual({
      accepted: true,
      duplicate: false,
    });

    expect(prismaMock.growthSession.upsert).toHaveBeenCalledWith({
      where: { id: "sess_000000000001" },
      create: {
        id: "sess_000000000001",
        utmSource: "google",
        utmMedium: undefined,
        utmCampaign: "spring",
        landingPath: "/products",
        referrerCategory: "search",
      },
      update: {},
    });
    expect(prismaMock.growthEvent.create).toHaveBeenCalledWith({
      data: {
        id: "evt_000000000001",
        sessionId: "sess_000000000001",
        name: "checkout_started",
        occurredAt: new Date("2026-07-19T10:00:00.000Z"),
        cartValue: 1098,
        cartSize: 2,
      },
    });
  });

  it("does not overwrite first-touch attribution on later requests", async () => {
    await persistPublicEvent(validCheckoutStarted, attribution);

    expect(prismaMock.growthSession.upsert.mock.calls[0][0].update).toEqual({});
  });

  it("rejects an unknown product before persisting its event", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const event = {
      ...validCheckoutStarted,
      name: "product_viewed" as const,
      properties: {
        productId: "missing-product",
        category: "fruits" as const,
        priceBand: "under_5" as const,
        placement: "catalog" as const,
      },
    };

    await expect(persistPublicEvent(event, attribution)).resolves.toEqual({
      accepted: false,
      reason: "invalid_product",
    });
    expect(prismaMock.growthEvent.create).not.toHaveBeenCalled();
  });

  it("rethrows non-duplicate database failures", async () => {
    const failure = new Error("database unavailable");
    prismaMock.growthEvent.create.mockRejectedValue(failure);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(persistPublicEvent(validCheckoutStarted, attribution)).rejects.toBe(failure);
    expect(errorSpy).toHaveBeenCalledWith("Growth event persistence failed", failure);
    errorSpy.mockRestore();
  });
});

describe("recordExposure", () => {
  it("upserts one exposure per session and allocation version", async () => {
    const exposedAt = new Date("2026-07-19T10:00:00.000Z");

    await recordExposure({
      sessionId: "sess_000000000001",
      experiment: "free_shipping_progress_v1",
      variant: "treatment",
      exposedAt,
      attribution,
    });

    expect(prismaMock.experimentExposure.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        sessionId_experiment_version: {
          sessionId: "sess_000000000001",
          experiment: "free_shipping_progress_v1",
          version: 1,
        },
      },
      create: {
        sessionId: "sess_000000000001",
        experiment: "free_shipping_progress_v1",
        version: 1,
        variant: "treatment",
        exposedAt,
      },
      update: {},
    }));
  });

  it("rejects a variant that differs from deterministic assignment", async () => {
    await expect(recordExposure({
      sessionId: "sess_000000000001",
      experiment: "free_shipping_progress_v1",
      variant: "control",
      exposedAt: new Date(),
    })).rejects.toThrow("INVALID_VARIANT");
    expect(prismaMock.experimentExposure.upsert).not.toHaveBeenCalled();
  });
});

describe("recordTrustedOrderCompleted", () => {
  it("normalizes the trusted order conversion and makes retries idempotent", async () => {
    await recordTrustedOrderCompleted({
      sessionId: "sess_000000000001",
      orderId: "ord_1",
      total: 1497,
      itemCount: 2,
      occurredAt: new Date("2026-07-19T10:00:00.000Z"),
      experiments: { free_shipping_progress_v1: "treatment" },
    });

    expect(prismaMock.growthEvent.create).toHaveBeenCalledWith({
      data: {
        id: "order_ord_1",
        sessionId: "sess_000000000001",
        name: "order_completed",
        occurredAt: new Date("2026-07-19T10:00:00.000Z"),
        orderId: "ord_1",
        cartValue: 1497,
        cartSize: 2,
      },
    });
  });
});
