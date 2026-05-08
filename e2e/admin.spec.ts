import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@rype.local";
const ADMIN_PASSWORD = "admin123";

test.describe("Admin happy path", () => {
  test("login → orders table → open drawer → close with Escape", async ({ page }) => {
    // 1. Login
    await page.goto("/admin/login");
    await page.locator('[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('[name="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    // 2. Redirects to admin dashboard
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText("Rype Admin").or(page.getByText("Dashboard"))).toBeVisible();

    // 3. Navigate to orders
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page).toHaveURL(/\/admin\/orders/);

    // 4. Orders table has at least one row
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    await expect(rows).not.toHaveCount(0);

    // 5. Click first order row → drawer opens
    await rows.first().click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // 6. Close button inside drawer is focused (focus management)
    const closeBtn = drawer.getByRole("button", { name: "Close" });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeFocused();

    // 7. Escape key closes the drawer
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
  });
});
