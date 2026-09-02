import { expect, test } from "@playwright/test";

const STAFF_EMAIL = "staff@rype.local";
const STAFF_PASSWORD = "staff123";

test("guests are redirected from protected admin routes", async ({ page }) => {
  await page.goto("/admin/orders");

  await expect(page).toHaveURL(/\/admin\/login\?callbackUrl=/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("staff cannot open inventory or user management", async ({ page }) => {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator('[name="email"]').fill(STAFF_EMAIL);
  await page.locator('[name="password"]').fill(STAFF_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/inventory");
  await expect(page).toHaveURL(/\/admin\?denied=1$/);

  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin\?denied=1$/);
});
