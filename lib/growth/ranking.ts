const AFFINITY: Record<string, readonly string[]> = {
  fruits: ["bundles", "herbs", "vegetables"],
  vegetables: ["herbs", "bundles", "fruits"],
  herbs: ["vegetables", "bundles", "fruits"],
  bundles: ["fruits", "vegetables", "herbs"],
};

export function rankRelatedProducts<T extends { id: string; category: string; stock: number }>(
  products: readonly T[], anchorCategory: string
): T[] {
  const affinity = AFFINITY[anchorCategory] ?? [];
  const affinityIndex = (category: string) => {
    const index = affinity.indexOf(category);
    return index === -1 ? affinity.length : index;
  };
  return [...products].sort((left, right) =>
    Number(right.stock > 0) - Number(left.stock > 0) ||
    affinityIndex(left.category) - affinityIndex(right.category) ||
    left.id.localeCompare(right.id));
}
