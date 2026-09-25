// Transactional email via Resend (https://resend.com).
// Fire-and-forget helpers used by server code (webhooks, actions). Nothing
// here should ever throw to the caller — failures are logged and swallowed so
// the purchase flow is never blocked by email issues.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const DEFAULT_FROM = "The Audition Guidebook <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function formatAmount(amountMinor: number | null, currency: string | null): string {
  const c = (currency || "aud").toUpperCase();
  const amount = (amountMinor ?? 0) / 100;
  return `$${amount.toLocaleString("en-AU")} ${c}`;
}

function purchaseConfirmationHtml(input: {
  amount: string;
  date: string;
  orderRef: string;
  portalUrl: string;
}): string {
  const { amount, date, orderRef, portalUrl } = input;
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f6f5f2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f2;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Brand -->
          <tr>
            <td align="center" style="padding:0 0 20px;">
              <span style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1B2A4A;letter-spacing:-0.2px;">The Audition Guidebook</span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #e5e2da;padding:36px 32px;">
              <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#1B2A4A;">Welcome aboard!</p>
              <p style="margin:0 0 22px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.55;color:#55586b;">Thanks for your purchase — your course is ready. You now have full lifetime access to every module, lesson, and resource.</p>

              <!-- Order summary -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f2;border:1px solid #ece9e0;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#55586b;padding:2px 0;">Course</td>
                        <td align="right" style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;font-weight:600;color:#1B2A4A;padding:2px 0;">The Audition Guidebook</td>
                      </tr>
                      <tr>
                        <td style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#55586b;padding:2px 0;">Paid</td>
                        <td align="right" style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;font-weight:700;color:#1B2A4A;padding:2px 0;">${amount}</td>
                      </tr>
                      <tr>
                        <td style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#55586b;padding:2px 0;">Date</td>
                        <td align="right" style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#55586b;padding:2px 0;">${date}</td>
                      </tr>
                      <tr>
                        <td style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#55586b;padding:2px 0;">Order</td>
                        <td align="right" style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#8a8d9b;padding:2px 0;">#${orderRef}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="display:inline-block;background:#1B2A4A;color:#ffffff;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;padding:14px 32px;">Go to your course</a>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;line-height:1.55;color:#55586b;">Sign in with the same email address you used at checkout — your access is tied to it. Need help? Reply to this email and we&apos;ll get you sorted.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:18px 16px 0;">
              <p style="margin:0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:11px;color:#8a8d9b;">The Audition Guidebook &middot; 14-day money-back guarantee &middot; <a href="${APP_URL}" style="color:#8a8d9b;">${APP_URL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function purchaseConfirmationText(input: {
  amount: string;
  date: string;
  orderRef: string;
  portalUrl: string;
}): string {
  const { amount, date, orderRef, portalUrl } = input;
  return [
    "Welcome aboard!",
    "",
    "Thanks for your purchase — your course is ready. You now have full lifetime access to every module, lesson, and resource.",
    "",
    `Course: The Audition Guidebook`,
    `Paid: ${amount}`,
    `Date: ${date}`,
    `Order: #${orderRef}`,
    "",
    "Go to your course:",
    portalUrl,
    "",
    "Sign in with the same email address you used at checkout — your access is tied to it.",
  ].join("\n");
}

export async function sendPurchaseConfirmation(input: {
  email: string;
  amountMinor: number | null;
  currency: string | null;
  paymentId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const portalUrl = `${APP_URL}/welcome`;
  const orderRef = input.paymentId.slice(-10).toUpperCase();
  const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const amount = formatAmount(input.amountMinor, input.currency);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to: [input.email],
        subject: "Your course is ready — The Audition Guidebook",
        html: purchaseConfirmationHtml({ amount, date, orderRef, portalUrl }),
        text: purchaseConfirmationText({ amount, date, orderRef, portalUrl }),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend ${res.status}: ${body}`);
    }
    return { ok: true };
  } catch (error) {
    console.error("Resend purchase confirmation error:", error);
    return { ok: false, error: "Failed to send purchase confirmation email" };
  }
}