import type { ProductRow } from "@/lib/products/queries";

const CATALOG_IMAGE_BASE = "/product-images/rype-catalog";

export const HOME_HERO_IMAGE = {
  src: "/home-images/rype-market-hero-v2.png",
  alt: "Fresh seasonal groceries arranged in warm morning light",
};

const HOME_FEATURED_IMAGES: Record<string, string[]> = {
  "heirloom-tomatoes": [
    "/home-images/featured-products/heirloom-tomatoes.jpg",
    "/home-images/featured-products/heirloom-tomatoes.jpg",
  ],
  "fuji-apples": [
    "/home-images/featured-products/fuji-apples.jpg",
    "/home-images/featured-products/fuji-apples.jpg",
  ],
  "avocado-hass": [
    "/home-images/featured-products/avocado-hass.jpg",
    "/home-images/featured-products/avocado-hass.jpg",
  ],
  strawberries: [
    "/home-images/featured-products/strawberries.jpg",
    "/home-images/featured-products/strawberries.jpg",
  ],
  blueberries: [
    "/home-images/featured-products/blueberries.jpg",
    "/home-images/featured-products/blueberries.jpg",
  ],
  asparagus: [
    "/home-images/featured-products/asparagus.jpg",
    "/home-images/featured-products/asparagus.jpg",
  ],
  "bundle-salad": [
    "/home-images/featured-products/bundle-salad.jpg",
    "/home-images/featured-products/bundle-salad.jpg",
  ],
  "bundle-smoothie": [
    "/home-images/featured-products/bundle-smoothie.jpg",
    "/home-images/featured-products/bundle-smoothie.jpg",
  ],
};

const PRODUCT_COPY: Record<string, Partial<Pick<ProductRow, "tagline" | "description">>> = {
  "bundle-salad": {
    tagline: "A crisp box for easy lunches",
    description:
      "A polished weekly mix of greens, cucumbers, tomatoes, radishes, and herbs, selected to feel fresh from the first card to the last bite.",
  },
  "bundle-smoothie": {
    tagline: "Bright fruit and greens, ready to blend",
    description:
      "A clean breakfast edit of bananas, blueberries, spinach, and citrus, balanced for a fresh grocery routine.",
  },
  "bundle-roast": {
    tagline: "Golden sides in one tidy box",
    description:
      "Root vegetables, garlic, and rosemary grouped for a simple roast dinner with the same warm, honest Rype freshness.",
  },
};

export const HERO_PRODUCT_IMAGES = [
  { src: `${CATALOG_IMAGE_BASE}/heirloom-tomatoes.svg`, alt: "Heirloom tomatoes on a warm neutral background" },
  { src: `${CATALOG_IMAGE_BASE}/strawberries.svg`, alt: "Strawberries on a warm neutral background" },
  { src: `${CATALOG_IMAGE_BASE}/basil.svg`, alt: "Fresh basil on a warm neutral background" },
];

export function productImagesFor(slug: string) {
  return [`${CATALOG_IMAGE_BASE}/${slug}.svg`, `${CATALOG_IMAGE_BASE}/${slug}-detail.svg`];
}

export function presentProduct<T extends ProductRow>(product: T): T {
  const copy = PRODUCT_COPY[product.slug] ?? {};

  return {
    ...product,
    ...copy,
    images: productImagesFor(product.slug),
  };
}

export function presentProducts<T extends ProductRow>(products: T[]): T[] {
  return products.map(presentProduct);
}

export function presentHomepageProduct<T extends ProductRow>(product: T): T {
  const images = HOME_FEATURED_IMAGES[product.slug];

  return images ? { ...product, images } : product;
}

export function presentHomepageProducts<T extends ProductRow>(products: T[]): T[] {
  return products.map(presentHomepageProduct);
}
