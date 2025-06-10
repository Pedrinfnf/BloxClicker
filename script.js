const clickBtn = document.getElementById('click-btn');
const coinsDisplay = document.getElementById('coins');
const upgradeBtn = document.getElementById('upgrade-btn');
const upgradeCostDisplay = document.getElementById('upgrade-cost');
const upgradeLevelDisplay = document.getElementById('upgrade-level');
const autoBtn = document.getElementById('auto-btn');
const autoCostDisplay = document.getElementById('auto-cost');
const autoLevelDisplay = document.getElementById('auto-level');
const popcatImg = document.getElementById('popcat-img');

const clickSound = document.getElementById('click-sound');
const upgradeSound = document.getElementById('upgrade-sound');

let coins = 0;
let coinsPerClick = 1;
let upgradeLevel = 0;
let upgradeCost = 10;
let autoLevel = 0;
let autoCost = 50;

function saveGame() {
  const gameData = {
    coins,
    coinsPerClick,
    upgradeLevel,
    upgradeCost,
    autoLevel,
    autoCost
  };
  localStorage.setItem('bloxClickerSave', JSON.stringify(gameData));
}

function loadGame() {
  const saved = localStorage.getItem('bloxClickerSave');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 0;
    coinsPerClick = data.coinsPerClick || 1;
    upgradeLevel = data.upgradeLevel || 0;
    upgradeCost = data.upgradeCost || 10;
    autoLevel = data.autoLevel || 0;
    autoCost = data.autoCost || 50;
  }
  updateDisplay();
}

function updateDisplay() {
  coinsDisplay.textContent = coins;
  upgradeCostDisplay.textContent = upgradeCost;
  upgradeLevelDisplay.textContent = upgradeLevel;
  autoCostDisplay.textContent = autoCost;
  autoLevelDisplay.textContent = autoLevel;
}

clickBtn.addEventListener('mousedown', () => {
  coins += coinsPerClick;
  coinsDisplay.textContent = coins;
  clickSound.play();
  popcatImg.src = "https://popcat.click/popcat-open.png"; // boca aberta
});

clickBtn.addEventListener('mouseup', () => {
  popcatImg.src = "https://popcat.click/popcat.png"; // boca fechada
  saveGame();
});

clickBtn.addEventListener('mouseleave', () => {
  popcatImg.src = "https://popcat.click/popcat.png";
});

upgradeBtn.addEventListener('click', () => {
  if (coins >= upgradeCost) {
    coins -= upgradeCost;
    upgradeLevel++;
    coinsPerClick += 1;
    upgradeCost = Math.floor(upgradeCost * 1.5);
    upgradeSound.play();
    updateDisplay();
    saveGame();
  } else {
    alert('Você não tem moedas suficientes para o upgrade!');
  }
});

autoBtn.addEventListener('click', () => {
  if (coins >= autoCost) {
    coins -= autoCost;
    autoLevel++;
    autoCost = Math.floor(autoCost * 1.7);
    updateDisplay();
    saveGame();
  } else {
    alert('Você não tem moedas suficientes para comprar Auto Clicker!');
  }
});

setInterval(() => {
  if (autoLevel > 0) {
    coins += autoLevel;
    updateDisplay();
    saveGame();
  }
}, 1000);

loadGame();
