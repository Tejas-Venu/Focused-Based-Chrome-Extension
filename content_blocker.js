// content_blocker.js
(async function () {
  const STORAGE_KEYS = {
    BLOCKED_SITES: "blockedSites",
    SESSION_ACTIVE: "sessionActive",
    SESSION_END: "sessionEnd",
    ATTEMPTS: "attempts"
  };

  // quick utility: get base domain from hostname
  function getBaseDomain(hostname) {
    // naive: take last two parts (e.g., example.com); works for many cases
    const parts = hostname.split(".");
    if (parts.length <= 2) return hostname;
    return parts.slice(-2).join(".");
  }

  // check if overlay already present
  if (document.getElementById("stayfocused-overlay")) return;

  // read status
  const storage = await chrome.storage.local.get([STORAGE_KEYS.BLOCKED_SITES, STORAGE_KEYS.SESSION_ACTIVE, STORAGE_KEYS.SESSION_END]);
  const blocked = storage[STORAGE_KEYS.BLOCKED_SITES] || [];
  const sessionActive = storage[STORAGE_KEYS.SESSION_ACTIVE];
  const sessionEnd = storage[STORAGE_KEYS.SESSION_END] || 0;

  if (!sessionActive) return; // not in session -> do nothing

  // if session ended in background, don't block
  if (Date.now() > sessionEnd) return;

  const hostname = window.location.hostname;
  const base = getBaseDomain(hostname);

  // match blocked patterns: check if any blocked string is included in hostname or base domain matches
  const isBlocked = blocked.some(pattern => {
    const p = pattern.trim().toLowerCase();
    if (!p) return false;
    return hostname.includes(p) || base === p || hostname.endsWith("." + p);
  });

  if (!isBlocked) return;

  // create overlay
  const overlay = document.createElement("div");
  overlay.id = "stayfocused-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.color = "#fff";
  overlay.style.zIndex = 2147483647;
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.textAlign = "center";
  overlay.style.fontFamily = "Arial, sans-serif";
  overlay.innerHTML = `
    <div style="max-width:720px; padding:24px;">
      <h1 style="margin:0 0 8px 0; font-size:28px;">Focus session in progress</h1>
      <p style="margin:0 0 16px 0; font-size:16px; opacity:0.9;">
        You've blocked this site for your study session. Try to stay focused — you can check your streak in the extension.
      </p>
      <div id="sf-attempts" style="margin-bottom:16px; font-size:14px; opacity:0.9;"></div>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="sf-close-btn" style="padding:10px 16px; border-radius:8px; border: none; cursor:pointer; background:#999; color:#111;">Temporarily allow (1 attempt)</button>
        <button id="sf-ignore-btn" style="padding:10px 16px; border-radius:8px; border:none; cursor:pointer; background:#2ecc71; color:#fff;">I will focus</button>
      </div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  const attemptsDiv = document.getElementById("sf-attempts");
  const closeBtn = document.getElementById("sf-close-btn");
  const ignoreBtn = document.getElementById("sf-ignore-btn");

  // show attempts count from storage
  async function refreshAttempts() {
    const data = await chrome.storage.local.get(STORAGE_KEYS.ATTEMPTS);
    const attempts = data[STORAGE_KEYS.ATTEMPTS] || 0;
    attemptsDiv.textContent = `Distraction attempts this session: ${attempts}`;
  }

  refreshAttempts();

  closeBtn.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ type: "INCREMENT_ATTEMPT" }, response => {
      refreshAttempts();
    });
    overlay.remove();
  });

  ignoreBtn.addEventListener("click", () => {
    ignoreBtn.style.transform = "scale(0.98)";
    setTimeout(() => (ignoreBtn.style.transform = ""), 120);
  });
})();
