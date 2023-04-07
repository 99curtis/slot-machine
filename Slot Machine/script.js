const addMoneyBtn = document.getElementById('addMoney');
const moneyInput = document.getElementById('money');
const status = document.getElementById('status');
const slots = document.querySelectorAll('.slot');
const spinBtn = document.getElementById('spin');
const betButtons = document.querySelectorAll('.bet-buttons button');
const payout7NotFirstTwoCell = document.getElementById("payout_7_not_first_two");
const payout17Cell = document.getElementById("payout_1_7");
const payout2EqualCell = document.getElementById("payout_2_equal");
const resultMessage = document.getElementById("resultMessage");

let balance = 0;
let spinning = false;
let selectedBet = null;
const payoutHeader = document.getElementById('payoutHeader');
const jackpotCell = document.getElementById('jackpot');

betButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (spinning) return;

    // Clear the active state from other buttons
    betButtons.forEach((btn) => btn.classList.remove("active"));

    // Set the clicked button as active
    button.classList.add("active");

    selectedBet = index + 1;

    payoutHeader.style.opacity = 0;
    setTimeout(() => {
      jackpotCell.textContent = `Jackpot (${selectedBet * 100})`;
      payout7NotFirstTwoCell.textContent = `${selectedBet * 5}`;
      payout17Cell.textContent = `${selectedBet * 2}`;
      payout2EqualCell.textContent = `${selectedBet}`;
      payoutHeader.style.opacity = 1;
    }, 300);
  });
});

async function spinSlots(results) {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const inner = slot.querySelector(".slot-inner");
    inner.textContent = '';

    const spinDuration = (i > 0 && results.slice(0, i).every((r) => r === 9)) ? 2000 : 1000;

    if (i > 0 && results.slice(0, i).every((r) => r === 9)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await new Promise((resolve) => {
      const translateYValue = window.innerWidth > 600 ? -50 : -35;
      const animation = inner.animate(
        [
          { transform: `translateY(${translateYValue}%)` },
          { transform: `translateY(-${results[i] * 110 + translateYValue}%)` },
        ],
        { duration: spinDuration, easing: "ease-out", fill: "forwards" }
      );

      animation.onfinish = () => {
        inner.style.transform = `translateY(-${results[i] * 110 + translateYValue}%)`;
        inner.textContent = results[i];
        resolve();
      };
    });
  }

  spinBtn.addEventListener('click', async () => {
    if (spinning || selectedBet === null) return;

    if (selectedBet > balance) {
      alert("You don't have enough balance.");
      return;
    }

    balance -= selectedBet;
    spinning = true;

    const results = Array.from(slots).map(() => Math.floor(Math.random() * 9) + 1);
    await spinSlots(results);
    spinning = false;

    const payout = calculatePayout(results);
    balance += payout;

    status.textContent = `Balance: ${balance.toFixed(2)}`;

    if (payout > 0) {
      resultMessage.textContent = `You won ${payout.toFixed(2)} with the combination ${results.join('-')}`;
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
  

  // Highlight boxes depending on the outcome
  const payout = calculatePayout(results);
  slots.forEach((slot, index) => {
    slot.style.borderColor = payout > 0 ? "green" : "red";
  });

  return payout;
}

window.addEventListener("resize", () => {
    const translateYValue = window.innerWidth > 600 ? -50 : -35;
    slots.forEach((slot, index) => {
      const inner = slot.querySelector(".slot-inner");
      if (inner.textContent) {
        inner.style.transform = `translateY(-${parseInt(inner.textContent) * 110 + translateYValue}%)`;
      }
    });
  });
  
  function calculatePayout(results) {
    const uniqueNumbers = new Set(results);
    const count = results.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
  
    if (uniqueNumbers.size === 1) {
      if (results[0] === 9) {
        return selectedBet * 100;
      } else if (results[0] === 7) {
        return selectedBet * 20;
      } else {
        return selectedBet * 10;
      }
    } else if (uniqueNumbers.size === 2 && count[7] === 2) {
      return selectedBet * 5;
    } else if (count[7] === 1) {
      return selectedBet * 2;
    } else if (uniqueNumbers.size === 2) {
      return selectedBet;
    } else {
      return Math.floor(Math.random() * 50) / 100;
    }
  }
  