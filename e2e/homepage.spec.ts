import { expect, test } from "@playwright/test";

test.describe("Homepage client-readiness safeguards", () => {
  test("does not expose an admin account link to shoppers", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.getByRole("link", { name: "Account" })).toHaveCount(0);
  });

  test("qualifies the 24-hour delivery promise by delivery area", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.getByText("From farm to your door within 24 hours in selected delivery areas.")).toBeVisible();
    await expect(page.getByText("24h delivery in selected areas")).toBeVisible();
    await expect(page.getByText("22h", { exact: true })).toHaveCount(0);
  });

  test("does not nest interactive controls inside links", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.locator("a button")).toHaveCount(0);

    const firstProduct = page.locator("article").first();
    await expect(firstProduct.getByRole("link", { name: "Fuji Apples" }).first()).toHaveAttribute("href", "/products/fuji-apples");
    await firstProduct.getByRole("button", { name: "Wishlist Fuji Apples" }).click();
    await expect(page.getByText("Saved to wishlist")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
