import { describe, it, expect } from "vitest";
import { isAdmin } from "./admin";

describe("isAdmin", () => {
  it("accepts a configured admin email", () => {
    expect(isAdmin("daniele.buatti@gmail.com")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAdmin("Daniele.Buatti@Gmail.com")).toBe(true);
  });

  it("rejects non-admin, empty and missing emails", () => {
    expect(isAdmin("someone@example.com")).toBe(false);
    expect(isAdmin("")).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
