import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  assignVariant,
  EXPERIMENTS,
  type ExperimentKey,
  type Variant,
} from "@/lib/growth/experiments";
import type { PublicGrowthEvent } from "@/lib/growth/schema";

export type GrowthAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPath: string;
  referrerCategory: "direct" | "search" | "social" | "referral" | "internal";
};

export type ExposureInput = {
  sessionId: string;
  experiment: ExperimentKey;
  variant: Variant;
  exposedAt: Date;
  attribution?: GrowthAttribution;
};

export type TrustedOrderCompletedInput = {
  sessionId: string;
  orderId: string;
  total: number;
  itemCount: number;
  occurredAt?: Date;
  experiments?: Partial<Record<ExperimentKey, Variant>>;
};

type PersistenceResult =
  | { accepted: true; duplicate: boolean }
  | { accepted: false; reason: "invalid_product" };

function sessionCreateData(sessionId: string, attribution?: GrowthAttribution) {
  return {
    id: sessionId,
    utmSource: attribution?.utmSource,
    utmMedium: attribution?.utmMedium,
    utmCampaign: attribution?.utmCampaign,
    landingPath: attribution?.landingPath,
    referrerCategory: attribution?.referrerCategory,
  };
}

async function upsertSession(
  tx: Prisma.TransactionClient,
  sessionId: string,
  attribution?: GrowthAttribution,
) {
  return tx.growthSession.upsert({
    where: { id: sessionId },
    create: sessionCreateData(sessionId, attribution),
    // Attribution is first-touch. An existing session is deliberately only
    // touched for lastSeenAt by Prisma's @updatedAt behavior.
    update: {},
  });
}

function eventData(event: PublicGrowthEvent) {
  const common = {
    id: event.eventId,
    sessionId: event.sessionId,
    name: event.name,
    occurredAt: new Date(event.occurredAt),
  };

  switch (event.name) {
    case "product_viewed":
      return {
        ...common,
        productId: event.properties.productId,
        placement: event.properties.placement,
      };
    case "add_to_cart":
      return {
        ...common,
        productId: event.properties.productId,
        quantity: event.properties.quantity,
        unitPrice: event.properties.unitPrice,
        cartValue: event.properties.cartValue,
        cartSize: event.properties.cartSize,
        placement: event.properties.placement,
      };
    case "checkout_started":
      return {
        ...common,
        cartValue: event.properties.cartValue,
        cartSize: event.properties.cartSize,
      };
    case "checkout_step_completed":
      return {
        ...common,
        checkoutStep: event.properties.step,
        cartValue: event.properties.cartValue,
      };
  }
}

function productIdFor(event: PublicGrowthEvent) {
  return event.name === "product_viewed" || event.name === "add_to_cart"
    ? event.properties.productId
    : undefined;
}

function isUniqueConstraintError(error: unknown): error is { code: "P2002" } {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "P2002";
}

export async function persistPublicEvent(
  event: PublicGrowthEvent,
  attribution: GrowthAttribution | undefined = event.attribution,
): Promise<PersistenceResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const productId = productIdFor(event);
      if (productId) {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true },
        });
        if (!product) return { accepted: false, reason: "invalid_product" } as const;
      }

      await upsertSession(tx, event.sessionId, attribution);
      await tx.growthEvent.create({ data: eventData(event) });
      return { accepted: true, duplicate: false } as const;
    });
    return result;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { accepted: true, duplicate: true };
    }
    console.error("Growth event persistence failed", error);
    throw error;
  }
}

export async function recordExposure(input: ExposureInput) {
  const definition = EXPERIMENTS[input.experiment];
  if (assignVariant(input.sessionId, input.experiment) !== input.variant) {
    throw new Error("INVALID_VARIANT");
  }

  return prisma.$transaction(async (tx) => {
    await upsertSession(tx, input.sessionId, input.attribution);
    return tx.experimentExposure.upsert({
      where: {
        sessionId_experiment_version: {
          sessionId: input.sessionId,
          experiment: input.experiment,
          version: definition.version,
        },
      },
      create: {
        sessionId: input.sessionId,
        experiment: input.experiment,
        version: definition.version,
        variant: input.variant,
        exposedAt: input.exposedAt,
      },
      update: {},
    });
  });
}

export async function recordTrustedOrderCompleted(input: TrustedOrderCompletedInput) {
  for (const [experiment, variant] of Object.entries(input.experiments ?? {})) {
    if (assignVariant(input.sessionId, experiment as ExperimentKey) !== variant) {
      throw new Error("INVALID_VARIANT");
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await upsertSession(tx, input.sessionId);
      await tx.growthEvent.create({
        data: {
          id: `order_${input.orderId}`,
          sessionId: input.sessionId,
          name: "order_completed",
          occurredAt: input.occurredAt ?? new Date(),
          orderId: input.orderId,
          cartValue: input.total,
          cartSize: input.itemCount,
        },
      });
    });
    return { accepted: true, duplicate: false } as const;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { accepted: true, duplicate: true } as const;
    }
    console.error("Trusted growth conversion persistence failed", error);
    throw error;
  }
}
