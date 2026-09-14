import { test, expect } from "@playwright/test";

test("footer navigation groups form two columns on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const footer = page.locator("footer");
  const shop = footer.getByText("Shop", { exact: true });
  const care = footer.getByText("Care", { exact: true });
  const promise = footer.getByText("Our promise", { exact: true });
  const contact = footer.getByText("Contact", { exact: true });
  const shopBox = await shop.boundingBox();
  const careBox = await care.boundingBox();
  const promiseBox = await promise.boundingBox();
  const contactBox = await contact.boundingBox();

  expect(shopBox).not.toBeNull();
  expect(careBox).not.toBeNull();
  expect(promiseBox).not.toBeNull();
  expect(contactBox).not.toBeNull();
  expect(Math.abs((shopBox?.y ?? 0) - (careBox?.y ?? 0))).toBeLessThan(32);
  expect(careBox?.x ?? 0).toBeGreaterThan((shopBox?.x ?? 0) + 100);
  expect(Math.abs((promiseBox?.y ?? 0) - (contactBox?.y ?? 0))).toBeLessThan(32);
  expect(contactBox?.x ?? 0).toBeGreaterThan((promiseBox?.x ?? 0) + 100);
});
