import { expect, test, type Page } from "@playwright/test";

test.use({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });

async function openPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}

test.describe("Mobile storefront regressions", () => {
  test("tapping the listing purchase button adds to the basket, not compare", async ({ page }) => {
    await openPage(page, "/products");
    const card = page.locator("article").first();
    const productName = await card.locator("h3").innerText();
    const button = card.getByRole("button", { name: "Add to basket", exact: true });
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    // A coordinate tap catches transparent controls intercepting the purchase button.
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);

    const drawer = page.locator("aside", { has: page.getByRole("heading", { name: "Your basket" }) });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(productName, { exact: true })).toBeVisible();
    await expect(page.getByText("Added to compare", { exact: true })).toHaveCount(0);
  });

  test("product prices stay inside their cards at phone widths", async ({ page }) => {
    await openPage(page, "/products");
    for (const width of [320, 360, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      const clipped = await page.locator("article").evaluateAll((cards) => cards.flatMap((card) => {
        const edge = card.getBoundingClientRect().right;
        return [...card.querySelectorAll("div")]
          .filter((element) => element.children.length === 0 && /^€\d/.test(element.textContent ?? ""))
          .filter((element) => element.getBoundingClientRect().right > edge + 1)
          .map(() => card.querySelector("h3")?.textContent);
      }));
      expect(clipped, `Clipped prices at ${width}px`).toEqual([]);
    }
  });

  test("checkout steps fit without horizontal scrolling on phones", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rype-cart", JSON.stringify({
        state: { items: [{ productId: "p02", qty: 1 }] }, version: 0,
      }));
    });
    await openPage(page, "/checkout");
    await expect(page.getByRole("heading", { name: "Delivery address" })).toBeVisible();
    for (const width of [320, 360, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `Checkout overflow at ${width}px`).toBeLessThanOrEqual(width);
    }
  });
});
