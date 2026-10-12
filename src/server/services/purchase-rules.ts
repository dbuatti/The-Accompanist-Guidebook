// Pure domain rules for purchase claiming — no database or Stripe dependency,
// so the security-critical logic can be unit-tested in isolation.

export interface PurchaseClaimRow {
  appliedToUserId: string | null;
}

// The "one purchase = one account" rule. A payment may only unlock the course
// for the account it was first applied to — otherwise a forwarded
// checkout/receipt link could grant access to unlimited accounts.
export function isPurchaseClaimedByOther(
  existing: PurchaseClaimRow[],
  userId: string,
): boolean {
  const first = existing[0];
  return !!first && first.appliedToUserId != null && first.appliedToUserId !== userId;
}
