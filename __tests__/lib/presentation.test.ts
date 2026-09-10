import { describe, expect, it } from "vitest";

import { HOME_HERO_IMAGE } from "@/lib/products/presentation";

describe("homepage hero presentation", () => {
  it("points at the current generated hero image with descriptive alt text", () => {
    expect(HOME_HERO_IMAGE).toEqual({
      src: "/home-images/rype-home-hero-reference.png",
      alt: "A European shopper carrying a bag of fresh seasonal groceries",
    });
  });
});
