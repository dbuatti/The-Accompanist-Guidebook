/**
 * The Audition Guidebook — Chrome Extension content script.
 *
 * Runs on course pages (/modules*). Provides:
 *  - Progress badge injected into the page header
 *  - "Mark complete" keyboard shortcut (Alt+C)
 *  - Quick navigation hints
 */

const COURSE_BASE = "https://www.theauditionguidebook.com";

let progressBadge = null;

function injectProgressBadge() {
  if (progressBadge) return;

  const header = document.querySelector('header[class*="sticky"]');
  if (!header) return;

  progressBadge = document.createElement("div");
  progressBadge.className =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent-foreground text-xs font-medium";
  progressBadge.innerHTML = `
    <span class="w-3 h-3 rounded-full bg-accent-foreground"></span>
    <span id="extension-progress-text">Course active</span>
  `;

  const nav = header.querySelector("nav");
  if (nav) {
    nav.appendChild(progressBadge);
  }
}

// Update badge text based on what's visible on the page
function updateBadge() {
  if (!progressBadge) return;
  const text = progressBadge.querySelector("#extension-progress-text");
  if (!text) return;

  // Look for progress indicators on the page
  const pctEl = document.querySelector('[class*="font-medium"][class*="tabular-nums"]');
  if (pctEl) {
    text.textContent = pctEl.textContent.trim();
  } else {
    text.textContent = "Course active";
  }
}

// Keyboard shortcut: Alt+M to open course, Alt+C to mark current lesson complete
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "m") {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: "openCourse" });
  }
});

// Run once the page is interactive
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectProgressBadge();
    updateBadge();
  });
} else {
  injectProgressBadge();
  updateBadge();
}

// Re-check badge when URL changes (SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    progressBadge = null;
    injectProgressBadge();
    updateBadge();
  }
}).observe(document, { subtree: true, childList: true });
