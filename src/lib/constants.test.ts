import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadConstants() {
  vi.resetModules();
  return import("./constants");
}

describe("isFreePreview", () => {
  it("matches the configured free preview lessons exactly", async () => {
    const { isFreePreview, FREE_PREVIEWS } = await loadConstants();
    for (const preview of FREE_PREVIEWS) {
      expect(isFreePreview(preview.moduleSlug, preview.lessonSlug)).toBe(true);
    }
  });

  it("returns false for anything not on the allow-list", async () => {
    const { isFreePreview } = await loadConstants();
    expect(isFreePreview("some-module", "some-lesson")).toBe(false);
    expect(isFreePreview("", "")).toBe(false);
  });
});

describe("previewHref", () => {
  it("builds the canonical /preview path", async () => {
    const { previewHref } = await loadConstants();
    expect(previewHref({ moduleSlug: "m", lessonSlug: "l" })).toBe("/preview/m/l");
  });
});

describe("checkoutUrlFor", () => {
  it("falls back to sign-in when no payment link is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PAYMENT_LINK", "");
    const { checkoutUrlFor } = await loadConstants();
    expect(checkoutUrlFor({ id: "u1", email: "a@b.com" })).toBe("/auth/sign-in");
  });

  it("returns the bare link for anonymous users", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PAYMENT_LINK", "https://buy.stripe.com/test_abc");
    const { checkoutUrlFor } = await loadConstants();
    expect(checkoutUrlFor(null)).toBe("https://buy.stripe.com/test_abc");
    expect(checkoutUrlFor({})).toBe("https://buy.stripe.com/test_abc");
  });

  it("tags the payment link with the user id and prefilled email", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PAYMENT_LINK", "https://buy.stripe.com/test_abc");
    const { checkoutUrlFor } = await loadConstants();
    const url = new URL(checkoutUrlFor({ id: "u1", email: "a@b.com" }));
    expect(url.origin + url.pathname).toBe("https://buy.stripe.com/test_abc");
    expect(url.searchParams.get("client_reference_id")).toBe("u1");
    expect(url.searchParams.get("prefilled_email")).toBe("a@b.com");
  });
});
