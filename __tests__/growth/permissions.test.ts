import { describe, expect, it } from "vitest";

import {
  adminPathDecision,
  isAdminOnlyPath,
} from "@/auth.config";

describe("growth dashboard permissions", () => {
  it("treats the growth route and descendants as admin-only", () => {
    expect(isAdminOnlyPath("/admin/growth")).toBe(true);
    expect(isAdminOnlyPath("/admin/growth/details")).toBe(true);
  });

  it("redirects staff away while permitting admins", () => {
    expect(adminPathDecision("/admin/growth", "staff")).toBe("deny");
    expect(adminPathDecision("/admin/growth", "admin")).toBe("allow");
  });

  it("lets Auth.js send anonymous admin requests to sign-in", () => {
    expect(adminPathDecision("/admin/growth", undefined)).toBe("sign-in");
  });
});
