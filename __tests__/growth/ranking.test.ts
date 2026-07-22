import { describe, expect, it } from "vitest";
import { rankRelatedProducts } from "@/lib/growth/ranking";

describe("rankRelatedProducts", () => {
  it("puts in-stock complementary categories first with stable ties", () => {
    const products = [
      { id: "b", category: "fruits", stock: 4 },
      { id: "c", category: "herbs", stock: 0 },
      { id: "a", category: "herbs", stock: 4 },
    ];
    expect(rankRelatedProducts(products, "vegetables").map((product) => product.id))
      .toEqual(["a", "b", "c"]);
  });

  it("does not mutate the server-provided list", () => {
    const products = [{ id: "b", category: "fruits", stock: 1 }, { id: "a", category: "herbs", stock: 1 }];
    rankRelatedProducts(products, "vegetables");
    expect(products.map((product) => product.id)).toEqual(["b", "a"]);
  });
});
