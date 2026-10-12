import { describe, it, expect } from "vitest";
import { isPurchaseClaimedByOther } from "./purchase-rules";

// The "one purchase = one account" rule is the security boundary that stops a
// forwarded checkout/receipt link from unlocking the course for unlimited
// accounts. These tests pin its behaviour independently of the database.
describe("isPurchaseClaimedByOther", () => {
  it("returns false when no purchase rows exist", () => {
    expect(isPurchaseClaimedByOther([], "u1")).toBe(false);
  });

  it("returns false when already applied to the same user", () => {
    expect(isPurchaseClaimedByOther([{ appliedToUserId: "u1" }], "u1")).toBe(false);
  });

  it("returns false when the purchase is unclaimed", () => {
    expect(isPurchaseClaimedByOther([{ appliedToUserId: null }], "u1")).toBe(false);
  });

  it("returns true when claimed by a different user", () => {
    expect(isPurchaseClaimedByOther([{ appliedToUserId: "u2" }], "u1")).toBe(true);
  });

  it("only inspects the first row (matching the limit(1) query)", () => {
    expect(
      isPurchaseClaimedByOther([{ appliedToUserId: "u2" }, { appliedToUserId: "u1" }], "u1"),
    ).toBe(true);
    expect(
      isPurchaseClaimedByOther([{ appliedToUserId: "u1" }, { appliedToUserId: "u2" }], "u1"),
    ).toBe(false);
  });
});
