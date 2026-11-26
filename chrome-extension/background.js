/**
 * The Audition Guidebook — Chrome Extension background service worker.
 *
 * Handles:
 *  - Alarms for daily lesson reminders
 *  - Message passing from content script & popup
 *  - Quick navigation to the course
 */

const COURSE_URL = "https://www.theauditionguidebook.com/modules";

// --- Daily reminder alarm (fires at 9am Melbourne time) ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "daily-lesson-reminder") {
    chrome.notifications.create("lesson-reminder", {
      type: "basic",
      iconUrl: "icons/icon-128.png",
      title: "The Audition Guidebook",
      message: "Time for your next audition-prep lesson. Walk into the room ready.",
    });
  }
});

// Initialize alarm on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("daily-lesson-reminder", {
    periodInMinutes: 1440,
    delayInMinutes: 60,
  });
});

// Open the course when the user clicks "Open course" from a notification
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "lesson-reminder") {
    chrome.tabs.create({ url: COURSE_URL });
  }
});

// Handle messages from popup / content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCourseUrl") {
    sendResponse({ url: COURSE_URL });
    return true;
  }
  if (request.action === "openCourse") {
    chrome.tabs.create({ url: COURSE_URL });
    sendResponse({ ok: true });
    return true;
  }
  return false;
});
