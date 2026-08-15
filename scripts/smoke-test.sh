#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Smoke test — The Accompanist Guidebook
# Verifies the deployed (or local) app is wired correctly WITHOUT a browser.
# Tests: routes up, env wired, admin guard rejects anonymous, drafts not leaked.
#
# Usage:  ./scripts/smoke-test.sh [BASE_URL]
#   ./scripts/smoke-test.sh                              # -> http://localhost:3000
#   ./scripts/smoke-test.sh https://accompanist-guidebook.vercel.app
#
# Exit code: 0 = all passed, 1 = at least one failure.
# ---------------------------------------------------------------------------
set -uo pipefail

BASE="${1:-http://localhost:3000}"
BASE="${BASE%/}"   # strip trailing slash

GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; YELLOW=$'\033[1;33m'; DIM=$'\033[2m'; RESET=$'\033[0m'
pass=0; fail=0

ok()   { printf "  ${GREEN}✓${RESET} %s\n" "$1"; ((pass++)); return 0; }
bad()  { printf "  ${RED}✗${RESET} %s\n" "$1"; ((fail++)); return 0; }
note() { printf "  ${YELLOW}•${RESET} %s\n" "$1"; return 0; }

http_code() {  # $1 = path, $2 = expected code (without following redirects)
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "${BASE}${1}")
  echo "$code"
}

http_code_follow() {  # follow redirects, return final code
  code=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 20 "${BASE}${1}")
  echo "$code"
}

printf "${DIM}Target:${RESET} %s\n\n" "$BASE"

# ---------------------------------------------------------------------------
echo "1) Public routes reachable"
# ---------------------------------------------------------------------------
code=$(http_code "/")
[ "$code" = "200" ] && ok "GET / -> 200" || bad "GET / -> $code (expected 200)"

code=$(http_code "/modules")
[ "$code" = "200" ] && ok "GET /modules -> 200" || bad "GET /modules -> $code (expected 200)"

code=$(http_code_follow "/auth/sign-in")
[ "$code" = "200" ] && ok "GET /auth/sign-in -> 200 (final)" || bad "GET /auth/sign-in -> $code (expected 200)"

code=$(http_code "/nonexistent-page-xyz")
[ "$code" = "404" ] && ok "GET /nonexistent -> 404" || bad "GET /nonexistent -> $code (expected 404)"

# ---------------------------------------------------------------------------
echo
echo "2) Admin pages reject anonymous (server-side guard)"
# ---------------------------------------------------------------------------
# With no session, /admin should redirect (30x), NOT 200. We check two ways:
#   a) without -L: expect a redirect code (307)
#   b) following redirects: expect to land on /auth/sign-in (200) and NOT on /admin content
code=$(http_code "/admin")
case "$code" in
  307|302|308) ok "GET /admin (anon) -> redirect ($code, guard fires)" ;;
  200)         bad "GET /admin (anon) -> 200 (GUARD NOT FIRING — server-side guard missing/buggy)" ;;
  *)           bad "GET /admin (anon) -> $code (expected redirect)" ;;
esac

# Following the redirect should land on sign-in, and the body should NOT contain
# admin dashboard text like "Admin Dashboard" or "Course Content".
body=$(curl -sL --max-time 20 "${BASE}/admin")
if echo "$body" | grep -q "Admin Dashboard"; then
  bad "Anonymous followed to a page containing 'Admin Dashboard' (guard bypassed)"
else
  ok "Anonymous does NOT reach 'Admin Dashboard' content"
fi

# ---------------------------------------------------------------------------
echo
echo "3) Admin API rejects anonymous -> 401"
# ---------------------------------------------------------------------------
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 \
        -X POST -H "Content-Type: application/json" -d '{"action":"scaffold"}' \
        "${BASE}/api/admin")
[ "$code" = "401" ] && ok "POST /api/admin (anon) -> 401" || bad "POST /api/admin (anon) -> $code (expected 401)"

# ---------------------------------------------------------------------------
echo
echo "4) Draft lessons NOT leaked to anonymous visitors"
# ---------------------------------------------------------------------------
# Titles known to be (or have been) unpublished drafts. If ANY appear in the
# public /modules HTML, the published-only filter is broken.
DRAFT_TITLES=(
  "What Is Audition Repertoire?"
  "Building Six Pieces"
  "Intellectual Choice vs Vibe"
  "Composers Worth Knowing"
  "Intellectual Choice vs Vibe [New]"
  "Composers Worth Knowing [New]"
)
body=$(curl -sL --max-time 20 "${BASE}/modules")
leak=0
for title in "${DRAFT_TITLES[@]}"; do
  if echo "$body" | grep -qF "$title"; then
    bad "Draft title leaked to anonymous: '$title'"
    leak=1
  fi
done
[ "$leak" = "0" ] && ok "No known draft titles in anonymous /modules HTML"

# ---------------------------------------------------------------------------
echo
echo "5) Auth endpoints respond"
# ---------------------------------------------------------------------------
# Neon Auth handler is mounted at /api/auth/[...path]. Hitting the root should
# return a non-5xx (typically 404/400 without proper path, but NOT 500/timeout).
code=$(http_code "/api/auth")
[ "$code" -lt 500 ] && ok "GET /api/auth -> $code (not a server crash)" || bad "GET /api/auth -> $code"

# ---------------------------------------------------------------------------
echo
echo "6) Robots + icon served"
# ---------------------------------------------------------------------------
code=$(http_code "/robots.txt")
[ "$code" = "200" ] && ok "GET /robots.txt -> 200" || bad "GET /robots.txt -> $code"

icon_body=$(curl -sL --max-time 20 "${BASE}/")
if echo "$icon_body" | grep -q '<link rel="icon"'; then
  ok "Home HTML emits a favicon <link rel=\"icon\">"
else
  bad "No <link rel=\"icon\"> in home HTML (icon.tsx not wired)"
fi

# ---------------------------------------------------------------------------
echo
echo "----------------------------------------"
if [ "$fail" = "0" ]; then
  printf "${GREEN}All %d checks passed.${RESET}\n" "$pass"
  exit 0
else
  printf "${RED}%d failed, %d passed.${RESET}\n" "$fail" "$pass"
  exit 1
fi