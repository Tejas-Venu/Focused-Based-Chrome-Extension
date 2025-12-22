const remainingEl = document.getElementById("remaining");

function formatTime(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateRemaining() {
  chrome.storage.local.get(["sessionEnd", "sessionActive"], (data) => {
    const { sessionEnd, sessionActive } = data;
    const now = Date.now();

    if (!sessionActive || !sessionEnd) {
      allowAccess();
      return;
    }

    const diff = sessionEnd - now;

    if (diff <= 0) {
      allowAccess();
    } else {
      remainingEl.textContent = formatTime(diff);
    }
  });
}

function allowAccess() {
  const ref = document.referrer;

  if (ref && ref.startsWith("http")) {
    window.location.href = ref;
  } else {
    window.location.href = "chrome://newtab";
  }
}

setInterval(updateRemaining, 1000);
updateRemaining();
