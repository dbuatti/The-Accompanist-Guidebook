/**
 * The Audition Guidebook — lightweight, privacy-first analytics.
 *
 * Sends page-view and custom events to a self-hosted /api/analytics endpoint
 * (or to a Plausible/Google Analytics endpoint if configured). All events are
 * fire-and-forget: failures never block the UI. No cookies, no email addresses
 * or payment details, no IP logging — just event counts with opaque user ids.
 */

const ENDPOINT = "/api/analytics";
let queue: { name: string; props?: Record<string, unknown> }[] = [];
let scheduled = false;

function flushQueue() {
  if (typeof window === "undefined" || queue.length === 0) return;
  const pending = queue.slice();
  queue = [];
  void sendBatch(pending);
}

function scheduleFlush() {
  if (scheduled || typeof window === "undefined") return;
  scheduled = true;
  const run = () => {
    scheduled = false;
    flushQueue();
  };
  if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 2000 });
  else setTimeout(run, 2000);
}

async function sendBatch(events: { name: string; props?: Record<string, unknown> }[]) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
    if (!res.ok) console.warn("[analytics] endpoint returned", res.status);
  } catch {
    // Silently swallow — analytics must never break the user experience.
  }
}

/** Public API — safe to call from any client component. */
export const analytics = {
  page: (path: string) => {
    track("page_view", { path });
  },
  event: (name: string, props?: Record<string, unknown>) => {
    track(name, props);
  },
};

function track(name: string, props?: Record<string, unknown>) {
  const event = { name, props, ts: Date.now() };

  // In SSR, just queue; flush on first client render.
  if (typeof window === "undefined") {
    queue.push(event);
    return;
  }

  queue.push(event);
  // Debounce: flush on the next idle tick, or immediately at ~10 events.
  // Scheduling must work for every batch, not only the first one.
  if (queue.length >= 10) flushQueue();
  else scheduleFlush();
}

/** Capture an uncaught error for reporting. */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  void track("error", { message: String(error), ...context });
}

/** Expose on window for the extension/content script to reach if needed. */
if (typeof window !== "undefined") {
  (window as unknown as { __AGA?: typeof analytics }).__AGA = analytics;
}
