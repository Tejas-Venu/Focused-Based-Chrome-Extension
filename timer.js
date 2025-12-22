let timerInterval;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_TIMER") {
    document.getElementById("time").textContent = msg.time;
  }
  if (msg.type === "END_TIMER") {
    window.close();
  }
});
