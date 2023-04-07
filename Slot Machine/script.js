const addMoneyBtn = document.getElementById('addMoney');
const moneyInput = document.getElementById('money');
const status = document.getElementById('status');
const slots = document.querySelectorAll('.slot');
const spinBtn = document.getElementById('spin');
const betButtons = document.querySelectorAll('.bet-buttons button');
const resultMessage = document.getElementById('resultMessage');

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
      slot.style.backgroundColor = '';
      await sleep(100);
    }

    slot.textContent = finalNumber;
  }
}

function highlightResults(results) {
  const winIndices = [];
  const loseIndices = [];

  // Code to determine winning and losing indices

  winIndices.forEach(index => {
    slots[index].style.backgroundColor = 'limegreen';
  });
  loseIndices.forEach(index => {
    slots[index].style.backgroundColor = 'red';
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculatePayout(results) {
  const winIndices = [];
  const loseIndices = [];

  if (results.every(num => num === 7)) {
    winIndices.push(0, 1, 2, 3, 4);
  } else if (results.slice(0, 4).every(num => num === 7)) {
    winIndices.push(0, 1, 2, 3);
    loseIndices.push(4);
  } else if (results.slice(0, 3).every(num => num === 7)) {
    winIndices.push(0, 1, 2);
    loseIndices.push(3, 4);
  } else if (results.slice(0, 2).every(num => num === 7)) {
    winIndices.push(0, 1);
    loseIndices.push(2, 3, 4);
  } else if (results[0] === 7) {
    winIndices.push(0);
    loseIndices.push(1, 2, 3, 4);
  } else {
    for (let i = 0; i < 4; i++) {
      if (results[i] === results[i + 1]) {
        winIndices.push(i, i + 1);
      } else {
        loseIndices.push(i);
      }
    }
    loseIndices.push(4);
  }

  winIndices.forEach(index => {
    slots[index].style.backgroundColor = 'limegreen';
  });
  loseIndices.forEach(index => {
    slots[index].style.backgroundColor = 'red';
  });

  if (results.every(num => num === 7)) {
    return selectedBet * 1000;
  } else if (results.slice(0, 4).every(num => num === 7)) {
    return selectedBet * 100;
  } else if (results.slice(0, 3).every(num => num === 7)) {
    return selectedBet * 50;
  } else if (results.slice(0, 2).every(num => num === 7)) {
    return selectedBet * 20;
  } else if (results[0] === 7) {
    return selectedBet * 5;
  } else if (results.slice(0, 3).every((num, idx) => num === results[idx + 1])) {
    return selectedBet * 10;
  } else if (results.slice(0, 2).every((num, idx) => num === results[idx + 1])) {
    return selectedBet * 5;
  } else if (results[0] === results[1] || results[1] === results[2] || results[2] === results[3] || results[3] === results[4]) {
    return selectedBet * 2;
  } else {
    return 0;
    }
}
