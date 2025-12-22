const STORAGE_KEY = "blockedSites";
const defaultSites = ["facebook.com", "instagram.com", "youtube.com"];

const blockedListContainer = document.getElementById("blockedListContainer");
const websiteInput = document.getElementById("websiteInput");
const addBtn = document.getElementById("addBtn");

chrome.storage.local.get([STORAGE_KEY], (data) => {
  let list = data[STORAGE_KEY] || [];
  if (list.length === 0) {
    list = [...defaultSites];
    chrome.storage.local.set({ [STORAGE_KEY]: list });
  }
  renderList(list);
});

addBtn.addEventListener("click", addSite);
websiteInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addSite();
});

function addSite() {
  const site = websiteInput.value.trim().toLowerCase();
  if (!site) return;

  chrome.storage.local.get([STORAGE_KEY], (data) => {
    const list = data[STORAGE_KEY] || [];
    if (!list.includes(site)) {
      list.push(site);
      chrome.storage.local.set({ [STORAGE_KEY]: list }, () => {
        websiteInput.value = "";
        renderList(list);
      });
    }
  });
}

function removeSite(site) {
  chrome.storage.local.get([STORAGE_KEY], (data) => {
    let list = (data[STORAGE_KEY] || []).filter((s) => s !== site);
    chrome.storage.local.set({ [STORAGE_KEY]: list }, () => renderList(list));
  });
}

function renderList(list) {
  blockedListContainer.innerHTML = "";
  if (list.length === 0) {
    blockedListContainer.innerHTML = `<p style="opacity:0.6;">No sites blocked yet ✨</p>`;
    return;
  }

  list.forEach((site) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `
      ${site}
      <button class="remove">×</button>
    `;
    chip.querySelector(".remove").addEventListener("click", () => removeSite(site));
    blockedListContainer.appendChild(chip);
  });
}
