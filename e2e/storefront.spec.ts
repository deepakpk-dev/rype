import { test, expect } from "@playwright/test";

// Storefront happy path. Requires no database and no login — the catalog
// falls back to the static seed when DATABASE_URL is absent.
test.describe("Storefront happy path", () => {
  test("browse → PDP → add to basket → drawer → checkout page", async ({ page }) => {
    test.setTimeout(60_000);

    // 1. Product list renders cards.
    await page.goto("/products", { waitUntil: "networkidle" });
    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible();

    // 2. Open the first product's detail page.
    await firstCard.getByRole("link").first().click();
    await expect(page).toHaveURL(/\/products\/.+/);

    // 3. Add to basket — the cart drawer auto-opens.
    await page.getByRole("button", { name: /add to basket/i }).first().click();
    const drawer = page.locator("aside", {
      has: page.getByRole("heading", { name: "Your basket" }),
    });
    await expect(drawer.getByRole("heading", { name: "Your basket" })).toBeVisible();

    // 4. Increment quantity inside the drawer; the subtotal changes.
    const subtotal = drawer.locator("dd").first();
    const before = await subtotal.textContent();
    await drawer.getByRole("button", { name: "Increase" }).click();
    await expect(subtotal).not.toHaveText(before ?? "");

    // 5. Proceed to checkout; the address step renders.
    await drawer.getByRole("link", { name: /checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Delivery address" })).toBeVisible();
  });
});
