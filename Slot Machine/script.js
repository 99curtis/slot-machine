const addMoneyBtn = document.getElementById('addMoney');
const moneyInput = document.getElementById('money');
const status = document.getElementById('status');
const slots = document.querySelectorAll('.slot');
const spinBtn = document.getElementById('spin');
const betButtons = document.querySelectorAll('.bet-buttons button');
const resultMessage = document.getElementById('resultMessage');
const spinHistory = document.getElementById('spinHistory');


let balance = 0;
let spinning = false;
let selectedBet = null;
const baseBet = 0.08;
const betAmounts = [baseBet, baseBet * 2, baseBet * 3, baseBet * 4, baseBet * 5];

betButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (spinning) return;

    betButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    selectedBet = betAmounts[index];
  });
});

spinBtn.addEventListener('click', async () => {
  if (spinning || selectedBet === null) return;
  

  if (selectedBet > balance) {
    alert("You don't have enough balance.");
    return;
    
  }

  balance -= selectedBet;
  spinning = true;
  status.textContent = `Spinning...`;

  const results = Array.from(slots).map(() => Math.floor(Math.random() * 9) + 1);
  await spinSlots(results);
  highlightResults(results);

  spinning = false;
  status.textContent = `Balance: ${balance.toFixed(2)}`;

  const payout = calculatePayout(results);
  balance += payout;

  if (payout > 0) {
    resultMessage.textContent = `You won $${payout.toFixed(2)} with the combination ${results.join('-')}`;
  } else {
    resultMessage.textContent = `Sorry, you didn't win this time.`;
  }
  updateSpinHistory(results);
});

addMoneyBtn.addEventListener('click', () => {
  const money = parseFloat(moneyInput.value);
  if (isNaN(money) || money <= 0) {
    alert('Please enter a valid amount.');
    return;
  }
  balance += money;
  status.textContent = `Balance: ${balance.toFixed(2)}`;
});

async function spinSlots(results) {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const finalNumber = results[i];

    for (let j = 0; j < 10; j++) {
      slot.textContent = (j % 9) + 1;
      slot.classList.remove('win-border', 'lose-border');
      await sleep(100);
    }

    slot.textContent = finalNumber;
  }
}


function highlightResults(results) {
  const winIndices = calculateWinIndices(results);
  const loseIndices = calculateLoseIndices(results, winIndices);

  winIndices.forEach(index => {
    slots[index].classList.add('win-border');
  });
  loseIndices.forEach(index => {
    slots[index].classList.add('lose-border');
  });
}

function calculateWinIndices(results) {
  const winIndices = [];

  for (let i = 0; i < results.length - 1; i++) {
    if (results[i] === results[i + 1]) {
      if (!winIndices.includes(i)) {
        winIndices.push(i);
      }
      winIndices.push(i + 1);
    }
  }

  return winIndices;
}

function calculateLoseIndices(results, winIndices) {
  const loseIndices = [];

  for (let i = 0; i < results.length; i++) {
    if (!winIndices.includes(i)) {
      loseIndices.push(i);
    }
  }

  return loseIndices;
}

function updateSpinHistory(spin) {
  const spinText = spin.join('-');
  const listItem = document.createElement('li');
  listItem.textContent = spinText;

  if (spinHistory.childElementCount >= 10) {
    spinHistory.removeChild(spinHistory.lastChild);
  }

  spinHistory.insertBefore(listItem, spinHistory.firstChild);
}

function calculatePayout(results) {
  const winIndices = calculateWinIndices(results);
  const winCount = winIndices.length;

  if (winCount >= 5 && results.every(num => num === 7)) {
    return selectedBet * 1000;
  } else if (winCount >= 4 && results.slice(0, 4).every(num => num === 7)) {
    return selectedBet * 100;
  } else if (winCount >= 3 && results.slice(0, 3).every(num => num === 7)) {
    return selectedBet * 50;
  } else if (winCount >= 2 && results.slice(0, 2).every(num => num === 7)) {
    return selectedBet * 20;
  } else if (winCount === 1 && results[0] === 7) {
    return selectedBet * 5;
  } else if (winCount >= 3 && results.slice(0, 3).every((num, idx) => num === results[idx + 1])) {
    return selectedBet * 10;
  } else if (winCount >= 2 && results.slice(0, 2).every((num, idx) => num === results[idx + 1])) {
    return selectedBet * 5;
  } else if (winCount >= 2) {
    return selectedBet * 2;
  } else {
    return 0;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}