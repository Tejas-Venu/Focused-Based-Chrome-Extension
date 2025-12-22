document.getElementById("yesBtn").addEventListener("click", () => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 365,
    height: 442,
  });
  window.close();
});

document.getElementById("noBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://newtab" });
  window.close();
});
