const STORAGE_KEYS = {
  BLOCKED_SITES: "blockedSites",
  SESSION_ACTIVE: "sessionActive",
  SESSION_END: "sessionEnd",
  STREAK: "streak",
  LAST_SESSION_DATE: "lastSessionDate",
  ATTEMPTS: "attempts",
  HIGH_SCORE: "highScore",
};

let badgeInterval = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(Object.values(STORAGE_KEYS), (data) => {
    if (data[STORAGE_KEYS.BLOCKED_SITES] === undefined) {
      chrome.storage.local.set({
        [STORAGE_KEYS.BLOCKED_SITES]: [
          "facebook.com",
          "twitter.com",
          "youtube.com",
        ],
      });
    }
    if (data[STORAGE_KEYS.STREAK] === undefined)
      chrome.storage.local.set({ [STORAGE_KEYS.STREAK]: 0 });
    if (data[STORAGE_KEYS.ATTEMPTS] === undefined)
      chrome.storage.local.set({ [STORAGE_KEYS.ATTEMPTS]: 0 });
    if (data[STORAGE_KEYS.HIGH_SCORE] === undefined)
      chrome.storage.local.set({ [STORAGE_KEYS.HIGH_SCORE]: 0 });
  });
});

async function handleStreakUpdate(sessionCompleted = false) {
  const today = new Date().toISOString().slice(0, 10); 
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.STREAK,
    STORAGE_KEYS.LAST_SESSION_DATE,
  ]);

  let streak = data[STORAGE_KEYS.STREAK] || 0;
  const lastDate = data[STORAGE_KEYS.LAST_SESSION_DATE];

  const lastDateObj = lastDate ? new Date(lastDate) : null;
  const diffDays = lastDateObj
    ? (new Date(today) - lastDateObj) / (1000 * 60 * 60 * 24)
    : null;

  if (diffDays >= 2) {
    streak = 0;
    await chrome.storage.local.set({ [STORAGE_KEYS.STREAK]: streak });
    console.log("⏱️ Streak reset (missed more than 24h).");
  } else if (sessionCompleted && lastDate !== today) {
    streak += 1;
    await chrome.storage.local.set({
      [STORAGE_KEYS.STREAK]: streak,
      [STORAGE_KEYS.LAST_SESSION_DATE]: today,
    });
    console.log("🔥 Streak increased to", streak);
  }
}

async function startSession(durationMinutes) {
  const now = Date.now();
  const end = now + durationMinutes * 60 * 1000;

  await chrome.storage.local.set({
    [STORAGE_KEYS.SESSION_ACTIVE]: true,
    [STORAGE_KEYS.SESSION_END]: end,
  });

  chrome.alarms.create("endSession", { when: end });
  startBadgeCountdown(end);
  console.log("🚀 Focus session started for", durationMinutes, "minutes");
}

async function endSession() {
  console.log("Session ended — opening break page");
  await chrome.storage.local.set({
    [STORAGE_KEYS.SESSION_ACTIVE]: false,
    [STORAGE_KEYS.SESSION_END]: 0,
  });

  stopBadgeCountdown();
  chrome.alarms.clear("endSession");

  await handleStreakUpdate(true);
  openBreakPage();
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title: "Focus Session Complete 🎯",
    message: "Nice work! Time for a break.",
  });
}

async function cancelSession() {
  console.log("⛔ Session cancelled");
  await chrome.storage.local.set({
    [STORAGE_KEYS.SESSION_ACTIVE]: false,
    [STORAGE_KEYS.SESSION_END]: 0,
  });
  stopBadgeCountdown();
  chrome.alarms.clear("endSession");
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "endSession") endSession();
});

function startBadgeCountdown(sessionEndTime) {
  stopBadgeCountdown();
  updateBadge(sessionEndTime);
  badgeInterval = setInterval(() => updateBadge(sessionEndTime), 1000);
}

function stopBadgeCountdown() {
  clearInterval(badgeInterval);
  chrome.action.setBadgeText({ text: "" });
}

function updateBadge(sessionEndTime) {
  const now = Date.now();
  const remainingMs = sessionEndTime - now;

  if (remainingMs <= 0) {
    stopBadgeCountdown();
    return;
  }

  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  const formatted = `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;

  let color = "#2ecc71"; // Green
  if (mins < 5) color = "#f1c40f"; // Yellow
  if (mins < 1) color = "#e74c3c"; // Red

  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text: formatted });
}

function openBreakPage() {
  chrome.tabs.create({ url: chrome.runtime.getURL("break.html") });
}

async function updateHighScore(newScore) {
  const data = await chrome.storage.local.get(STORAGE_KEYS.HIGH_SCORE);
  const current = data[STORAGE_KEYS.HIGH_SCORE] || 0;
  if (newScore > current) {
    await chrome.storage.local.set({ [STORAGE_KEYS.HIGH_SCORE]: newScore });
    console.log("🏆 New high score:", newScore);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_SESSION") {
    startSession(msg.durationMinutes).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === "CANCEL_SESSION") {
    cancelSession().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === "END_SESSION_MANUAL") {
    endSession().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === "REPORT_SCORE") {
    updateHighScore(msg.score);
    handleStreakUpdate(true);
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "INCREMENT_ATTEMPT") {
    chrome.storage.local.get(STORAGE_KEYS.ATTEMPTS, (data) => {
      const attempts = (data[STORAGE_KEYS.ATTEMPTS] || 0) + 1;
      chrome.storage.local.set({ [STORAGE_KEYS.ATTEMPTS]: attempts });
      sendResponse({ attempts });
    });
    return true;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading") return;

  const data = await chrome.storage.local.get([
    STORAGE_KEYS.BLOCKED_SITES,
    STORAGE_KEYS.SESSION_ACTIVE,
  ]);

  if (!data.sessionActive) return;

  const blockedSites = data.blockedSites || [];
  const url = tab.url || "";

  if (blockedSites.some((site) => url.includes(site))) {
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
});
