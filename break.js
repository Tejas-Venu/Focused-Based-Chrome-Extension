const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const basket = document.getElementById("basket");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const highScoreEl = document.getElementById("highScore");

let score = 0;
let highScore = 0;
let gameInterval, dotInterval, timerInterval;
let basketX = 115;
let timeLeft = 20;
const basketSpeed = 10;
const dots = [];

chrome.storage.local.get(["highScore"], (data) => {
  highScore = data.highScore || 0;
  highScoreEl.textContent = highScore;
});

startBtn.addEventListener("click", () => {
  startBtn.classList.add("hidden");
  gameArea.classList.remove("hidden");
  resetGame();
  startGame();
});

function resetGame() {
  score = 0;
  scoreEl.textContent = score;
  timeLeft = 20;
  timerEl.textContent = timeLeft;
  dots.forEach(d => d.remove());
  dots.length = 0;
  basketX = 115;
  basket.style.left = `${basketX}px`;
}

function startGame() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) finishGame();
  }, 1000);

  dotInterval = setInterval(spawnDot, 800);
  gameInterval = setInterval(updateGame, 30);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") basketX -= basketSpeed;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") basketX += basketSpeed;
  basketX = Math.max(0, Math.min(230, basketX)); 
  basket.style.left = `${basketX}px`;
});


function spawnDot() {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  dot.style.left = `${Math.random() * 280}px`;
  dot.style.top = `0px`;
  gameArea.appendChild(dot);
  dots.push(dot);
}

function updateGame() {
  for (let i = dots.length - 1; i >= 0; i--) {
    const dot = dots[i];
    const top = parseFloat(dot.style.top) + 4; 
    dot.style.top = `${top}px`;
    const dotX = parseFloat(dot.style.left);
    const dotY = top;
    if (dotY >= 270 && dotX >= basketX - 10 && dotX <= basketX + 70) {
      score++;
      scoreEl.textContent = score;
      dot.remove();
      dots.splice(i, 1);
    } else if (dotY > 300) {
      dot.remove();
      dots.splice(i, 1);
    }
  }
}

function finishGame() {
  clearInterval(dotInterval);
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  if (score > highScore) {
    highScore = score;
    chrome.storage.local.set({ highScore });
  }

  chrome.runtime.sendMessage({ type: "REPORT_SCORE", score }, () => {
    chrome.tabs.update({ url: chrome.runtime.getURL("break-finish.html") });
  });
}
