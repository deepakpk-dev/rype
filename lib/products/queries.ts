import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type ProductRow = Prisma.ProductGetPayload<object>;

export type Nutrition = {
  calories: number;
  carbs: number;
  protein: number;
  fiber: number;
};

// Prisma stores nutrition as JsonValue. The seed always writes the same shape,
// but the type system doesn't know that — narrow at the boundary.
export function nutritionOf(p: ProductRow): Nutrition {
  return p.nutrition as Nutrition;
}

export async function listProducts(): Promise<ProductRow[]> {
  return prisma.product.findMany({ orderBy: { name: "asc" } });
}

export async function lowStockCount(threshold = 10): Promise<number> {
  return prisma.product.count({ where: { stock: { lte: threshold } } });
}

export async function listFeaturedProducts(limit = 8): Promise<ProductRow[]> {
  return prisma.product.findMany({
    where: { featured: true },
    orderBy: { name: "asc" },
    take: limit,
  });
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  return prisma.product.findUnique({ where: { slug } });
}

export async function listRelatedProducts(
  category: ProductRow["category"],
  excludeId: string,
  limit = 4
): Promise<ProductRow[]> {
  return prisma.product.findMany({
    where: { category, NOT: { id: excludeId } },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function listAllProductSlugs(): Promise<{ slug: string }[]> {
  return prisma.product.findMany({ select: { slug: true } });
}
