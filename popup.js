const STORAGE_KEYS = {
  STREAK: "streak",
  LAST_SESSION_TIME: "lastSessionTime",
  SESSION_ACTIVE: "sessionActive",
  SESSION_END: "sessionEnd"
};

let countdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const durationInput = document.getElementById("duration");
  const timeDisplay = document.getElementById("timeDisplay");
  const streakSpan = document.getElementById("streak");
  const optionsLink = document.getElementById("optionsLink");
  const lockedNote = document.getElementById("lockedNote");

  optionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });


  chrome.storage.local.get(
    [STORAGE_KEYS.STREAK, STORAGE_KEYS.LAST_SESSION_TIME],
    (data) => {
      const streak = data[STORAGE_KEYS.STREAK] || 0;
      const lastSession = data[STORAGE_KEYS.LAST_SESSION_TIME];
      const now = Date.now();

      if (lastSession && now - lastSession > 24 * 60 * 60 * 1000) {
        chrome.storage.local.set({ [STORAGE_KEYS.STREAK]: 0 });
        streakSpan.textContent = 0;
      } else {
        streakSpan.textContent = streak;
      }
    }
  );


  startBtn.addEventListener("click", () => {
    const minutes = Math.max(1, parseInt(durationInput.value || "25", 10));
    startBtn.disabled = true;
    startBtn.classList.add("disabled");
    resetBtn.disabled = false;

    chrome.runtime.sendMessage(
      { type: "START_SESSION", durationMinutes: minutes },
      (res) => {
        if (res?.ok) {
          startCountdownUI();
          updateOptionsLinkState(true); 
        }
      }
    );
  });

  resetBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CANCEL_SESSION" }, (res) => {
      if (res?.ok) {
        clearInterval(countdownInterval);
        timeDisplay.innerHTML = `
          <span class="time-label">Time Left:</span>
          <span class="time-value">00:00</span>`;
        startBtn.disabled = false;
        startBtn.classList.remove("disabled");
        resetBtn.disabled = true;
        updateOptionsLinkState(false); 
      }
    });
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEYS.STREAK])
      streakSpan.textContent = changes[STORAGE_KEYS.STREAK].newValue || 0;
  });
  chrome.storage.local.get(
    [STORAGE_KEYS.SESSION_ACTIVE, STORAGE_KEYS.SESSION_END],
    (data) => {
      if (data[STORAGE_KEYS.SESSION_ACTIVE] && Date.now() < data[STORAGE_KEYS.SESSION_END]) {
        startBtn.disabled = true;
        startBtn.classList.add("disabled");
        resetBtn.disabled = false;
        updateOptionsLinkState(true);
        startCountdownUI(data[STORAGE_KEYS.SESSION_END]);
      } else {
        startBtn.disabled = false;
        startBtn.classList.remove("disabled");
        resetBtn.disabled = true;
        updateOptionsLinkState(false);
      }
    }
  );
});

function startCountdownUI(sessionEndTime) {
  clearInterval(countdownInterval);

  if (!sessionEndTime) {
    chrome.storage.local.get(STORAGE_KEYS.SESSION_END, (data) => {
      if (data.sessionEnd) startCountdownUI(data.sessionEnd);
    });
    return;
  }

  const timeDisplay = document.getElementById("timeDisplay");
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");

  function updateCountdown() {
    const now = Date.now();
    const remainingMs = sessionEndTime - now;
    if (remainingMs <= 0) {
      clearInterval(countdownInterval);
      timeDisplay.innerHTML = `<span class="completed">✅ Session Complete!</span>`;
      startBtn.disabled = false;
      startBtn.classList.remove("disabled");
      resetBtn.disabled = true;
      updateOptionsLinkState(false);
      chrome.runtime.sendMessage({ type: "SESSION_COMPLETE" });
      return;
    }

    const mins = Math.floor(remainingMs / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    timeDisplay.innerHTML = `
      <span class="time-label">⏳ Time Left:</span>
      <span class="time-value">${mins}:${secs.toString().padStart(2, "0")}</span>`;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateOptionsLinkState(disable = false) {
  const optionsLink = document.getElementById("optionsLink");
  const lockedNote = document.getElementById("lockedNote");

  if (disable) {
    optionsLink.style.pointerEvents = "none";
    optionsLink.style.opacity = "0.4";
    lockedNote.style.display = "block";
  } else {
    optionsLink.style.pointerEvents = "auto";
    optionsLink.style.opacity = "1";
    lockedNote.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const streakSpan = document.getElementById("streak");
    const STORAGE_KEYS = {
        STREAK: "user_streak",
        LAST_SESSION_TIME: "last_session_time",
    };

    chrome.storage.local.get([STORAGE_KEYS.STREAK, STORAGE_KEYS.LAST_SESSION_TIME], (data) => {
        let streak = data[STORAGE_KEYS.STREAK] || 0;
        const lastSession = Number(data[STORAGE_KEYS.LAST_SESSION_TIME]); 
        const now = Date.now();

        if (lastSession && (now - lastSession) > 24 * 60 * 60 * 1000) {
            streak = 0;
            chrome.storage.local.set({ [STORAGE_KEYS.STREAK]: 0 });
        }

        streak++;
        streakSpan.textContent = streak;

        chrome.storage.local.set({
            [STORAGE_KEYS.STREAK]: streak,
            [STORAGE_KEYS.LAST_SESSION_TIME]: now,
        });
    });
});
