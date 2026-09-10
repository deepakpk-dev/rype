import { describe, expect, it } from "vitest";

import {
  HOME_CATEGORY_ART,
  HOME_FEATURED_SLUGS,
  HOME_STORY_IMAGES,
} from "@/lib/home/presentation";

describe("homepage presentation", () => {
  it("keeps the reference page's image-led sections wired to local assets", () => {
    expect(HOME_CATEGORY_ART).toEqual({
      fruits: "/home-images/featured-products/strawberries.jpg",
      vegetables: "/home-images/featured-products/heirloom-tomatoes.jpg",
      herbs: "/home-images/featured-products/bundle-salad.jpg",
      bundles: "/home-images/rype-seasonal-box.png",
    });
    expect(HOME_STORY_IMAGES).toEqual({
      hero: "/home-images/rype-home-hero-reference.png",
      seasonalBox: "/home-images/rype-seasonal-box.png",
      growers: "/home-images/rype-growers-story.png",
    });
  });

  it("limits the home featured shelf to the six reference products", () => {
    expect(HOME_FEATURED_SLUGS).toEqual([
      "fuji-apples",
      "avocado-hass",
      "heirloom-tomatoes",
      "asparagus",
      "blueberries",
      "bundle-salad",
    ]);
  });
});
