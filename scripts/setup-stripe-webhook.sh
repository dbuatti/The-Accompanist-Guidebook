#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Register the Stripe webhook endpoint for checkout.session.completed.
#
# This registers the endpoint on Stripe and prints the signing secret (whsec_…)
# that you must paste into .env.local (STRIPE_WEBHOOK_SECRET) and Vercel.
#
# Usage:
#   STRIPE_SECRET_KEY=sk_test_... ./scripts/setup-stripe-webhook.sh [https://your-domain.com/api/webhooks/stripe]
#
# Defaults to the production URL; pass a different URL for a staging/preview
# deployment (one endpoint per environment).
# ---------------------------------------------------------------------------
set -euo pipefail

SECRET_KEY="${STRIPE_SECRET_KEY:-}"
URL="${1:-https://theauditionguidebook.vercel.app/api/webhooks/stripe}"

if [ -z "$SECRET_KEY" ]; then
  echo "✗ Set STRIPE_SECRET_KEY (sk_test_... or sk_live_...)." >&2
  exit 1
fi

echo "Registering webhook endpoint: $URL"

RESPONSE=$(curl -sS --request POST "https://api.stripe.com/v1/webhook_endpoints" \
  --user "$SECRET_KEY:" \
  --data "url=$URL" \
  --data "enabled_events[]=checkout.session.completed" \
  --data "api_version=2025-09-30.basil")

SECRET=$(printf '%s' "$RESPONSE" | grep -o '"secret": *"[^"]*"' | head -1 | sed 's/.*: *"//; s/"$//')

if [ -n "$SECRET" ]; then
  echo ""
  echo "✓ Webhook endpoint registered."
  echo "  Copy this into .env.local and Vercel:"
  echo ""
  echo "  STRIPE_WEBHOOK_SECRET=$SECRET"
  echo ""
  echo "Also set STRIPE_SECRET_KEY in both places."
else
  echo "✗ Registration failed. Stripe said:"
  echo "$RESPONSE"
  exit 1
fi
