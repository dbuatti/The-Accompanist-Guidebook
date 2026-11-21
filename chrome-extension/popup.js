/**
 * The Audition Guidebook — Chrome Extension popup script.
 */

const openCourseBtn = document.getElementById("openCourse");
const viewProgressBtn = document.getElementById("viewProgress");
const statusEl = document.getElementById("status");

const COURSE_URL = "https://theauditionguidebook.vercel.app/modules";

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = type === "success" ? "status success" : "status";
}

openCourseBtn.addEventListener("click", () => {
  setStatus("Opening course…", "info");
  chrome.tabs.create({ url: COURSE_URL }, () => {
    if (chrome.runtime.lastError) {
      setStatus("Could not open course", "error");
    } else {
      setStatus("Course opened", "success");
      setTimeout(() => setStatus(""), 1500);
    }
  });
});

viewProgressBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${COURSE_URL}#curriculum` }, () => {
    if (chrome.runtime.lastError) {
      setStatus("Could not open progress page", "error");
    } else {
      setStatus("Opening progress…", "success");
      setTimeout(() => setStatus(""), 1500);
    }
  });
});

// Check if user is logged in by probing the course URL
chrome.tabs.query({ url: ["https://theauditionguidebook.vercel.app/modules*"] }, (tabs) => {
  if (tabs.length > 0) {
    setStatus("Course tab is open", "success");
  }
});
