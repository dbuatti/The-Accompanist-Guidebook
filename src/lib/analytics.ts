/**
 * The Audition Guidebook — lightweight, privacy-first analytics.
 *
 * Sends page-view and custom events to a self-hosted /api/analytics endpoint
 * (or to a Plausible/Google Analytics endpoint if configured). All events are
 * fire-and-forget: failures never block the UI. No cookies, no personal data,
 * no IP logging — just anonymous event counts.
 */

const ENDPOINT = "/api/analytics";
let queue: { name: string; props?: Record<string, unknown> }[] = [];
let flushed = false;

function flushQueue() {
  if (flushed || typeof window === "undefined") return;
  flushed = true;
  const pending = queue.slice();
  queue = [];
  if (pending.length) {
    void sendBatch(pending);
  }
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
  // Debounce: flush on next idle tick, max ~10 events per batch.
  if (queue.length >= 10) {
    const batch = queue.slice();
    queue = [];
    void sendBatch(batch);
  } else if (!flushed) {
    void (requestIdleCallback?.(flushQueue, { timeout: 2000 }) || setTimeout(flushQueue, 2000));
  }
}

/** Capture an uncaught error for reporting. */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  void track("error", { message: String(error), ...context });
}

/** Expose on window for the extension/content script to reach if needed. */
if (typeof window !== "undefined") {
  (window as unknown as { __AGA?: typeof analytics }).__AGA = analytics;
}
