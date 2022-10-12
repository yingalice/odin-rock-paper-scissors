'use strict';
let score = { player: 0, computer: 0 };
let round = 0;
let scheduled = null;
let showChooseWeaponText;

const weaponBtns = document.querySelector('.weapons');
const nextRoundBtn = document.querySelector('.btn__next-round');
const newGameBtn = document.querySelector('.btn__new-game');
const main = document.querySelector('.main');
const mainContainer = document.querySelector('.main__container');
const mainText = document.querySelector('.main__text');
const resultsPanel = document.querySelector('.results');
const playerScoreCounter = document.querySelector('.score__player-counter');
const computerScoreCounter = document.querySelector('.score__computer-counter');
let table;

weaponBtns.addEventListener('mouseover', respondHoverWeapon);
weaponBtns.addEventListener('mouseout', respondNotHoverWeapon);
weaponBtns.addEventListener('click', respondClickWeapon);
nextRoundBtn.addEventListener('click', respondClickNextRound);
newGameBtn.addEventListener('click', respondClickNewGame);
window.addEventListener('keydown', respondKeydown);
window.addEventListener('keydown', respondDisableSpacebarScroll);
document.addEventListener('animationend', respondRemoveAnimation);

// Core logic
function showChooseWeapon() {
  main.dataset.screen = 'choose-weapon';

  showElements(weaponBtns);
  hideElements(resultsPanel, nextRoundBtn);

  playAnimation(mainText, 'fade-in');
  mainText.textContent = '\u200b';
  mainText.classList.add('main__text--default');
  mainText.classList.remove('main__text--large');
}

function showRoundResult(outcome, playerChoice, computerChoice) {
  const playerImg = resultsPanel.querySelector('.results__player');
  const computerImg = resultsPanel.querySelector('.results__computer');
  main.dataset.screen = 'round-result';

  hideElements(weaponBtns);
  showElements(resultsPanel, nextRoundBtn);

  playAnimation(mainContainer, 'fade-in');

  playerImg.setAttribute('src', `img/${playerChoice}.png`);
  playerImg.setAttribute('alt', `player's choice: ${playerChoice}`);
  computerImg.setAttribute('src', `img/${computerChoice}.png`);
  computerImg.setAttribute('alt', `computer's choice: ${computerChoice}`);

  switch (outcome) {
    case 'win':
      updateScoreCounter('player', score.player);
      playAudio('round-won');
      updateMsg(`You win! ${capitalize(playerChoice)} beats ${computerChoice}.`);
      break;
    case 'lose':
      updateScoreCounter('computer', score.computer);
      playAudio('round-lost');
      updateMsg(`You lose! ${capitalize(computerChoice)} beats ${playerChoice}.`);
      break;
    case 'tie':
      playAudio('round-tie');
      updateMsg(`You tied!  Both chose ${playerChoice}.`);
  }
}

function showGameResult(outcome) {
  main.style.height = `${main.offsetHeight}px`;
  main.dataset.screen = 'game-result';

  hideElements(weaponBtns);
  showElements(newGameBtn);
  playAnimation(mainContainer, 'zoom-out');
  mainText.classList.add('main__text--large');

  switch (outcome) {
    case 'win':
      updateScoreCounter('player', score.player);
      playAudio('game-won');
      updateMsg(`HOORAY!  You win!`);
      newGameBtn.textContent = 'Play Again?';
      break;
    case 'lose':
      updateScoreCounter('computer', score.computer);
      playAudio('game-lost');
      updateMsg(`OH NO!  You lose!`);
      newGameBtn.textContent = 'Retry?';
  }
}

function playRound(playerChoice, computerChoice) {
  let outcome;

  if (playerChoice === computerChoice) {
    outcome = 'tie';
  } else if (
    (playerChoice === 'rock' && computerChoice === 'scissors') ||
    (playerChoice === 'paper' && computerChoice === 'rock') ||
    (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
      outcome = 'win';
      score.player++;
    } else {
      outcome = 'lose';
      score.computer++;
    }
    round++;

  const roundResult = {
    round: round,
    player: playerChoice,
    computer: computerChoice,
    outcome: outcome,
  };

  mainText.classList.remove('main__text--default');
  if (!isGameOver()) {
    showRoundResult(outcome, playerChoice, computerChoice);
  } else {
    showGameResult(outcome);
  }
  table || createTable();
  addTableRow(roundResult);
}

function getComputerChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
}

function updateMsg(msg) {
  mainText.innerHTML = msg;
}

function playAudio(id) {
  const audio = document.getElementById(id);
  audio.currentTime = 0;
  audio.play();
}

function updateScoreCounter(user, score) {
  const node = (user === 'player') ? playerScoreCounter : computerScoreCounter;
  node.textContent = score;
  playAnimation(node, 'slide-up');
}

function isGameOver() {
  return score.player === 5 || score.computer === 5 ? true : false;
}

//Table
function createTable() {
  const tableHeaders = ['Round', 'Player', 'Computer', 'Outcome'];
  const footer = document.querySelector('.footer');

  table = document.createElement('table');
  document.querySelector('.table').appendChild(table);
  const thead = table.createTHead();
  const row = thead.insertRow();

  for (const header of tableHeaders) {
    const th = document.createElement('th');
    th.textContent = header;
    row.appendChild(th);
  }
}

function addTableRow(data) {
  const tbody = table.querySelector('tbody') || table.createTBody();
  const row = tbody.insertRow();
  for (const key in data) {
    const cell = row.insertCell();
    cell.innerHTML = key === 'outcome' ? showIcon(data[key]) : data[key];
  }
  tbody.insertBefore(row, tbody.firstChild);

  function showIcon(outcome) {
    switch (outcome) {
      case 'win':
        return '<span style="color: lime;">\u2713</span>';
      case 'lose':
        return '<span style="color: red;">\u2717</span>';
      case 'tie':
        return '\u2014';
    }
  }
}

function deleteTable() {
  if (!table) return;
  table.parentNode.removeChild(table);
  table = null;
}

// Utility
function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function hideElements(...nodes) {
  nodes.forEach((node) => node.classList.add('hide'));
}

function showElements(...nodes) {
  nodes.forEach((node) => node.classList.remove('hide'));
}

function playAnimation(node, animationClassName) {
  // Remove any currently playing animations on this node
  node.getAnimations().forEach((animation) => {
    node.classList.remove(animation.animationName);
  });
  node.offsetHeight; //Trigger reflow to reset animation
  node.classList.add(animationClassName);
}

// Event Listeners
function respondClickWeapon(e) {
  if (e.target.matches('img')) {
    clearTimeout(showChooseWeaponText);
    const playerChoice = e.target.id;
    playRound(playerChoice, getComputerChoice());
  }
}

function respondKeydown(e) {
  const screen = main.dataset.screen;
  const keyPress = e.code;

  if (keyPress !== 'KeyJ' &&
      keyPress !== 'KeyK' &&
      keyPress !== 'KeyL' &&
      keyPress !== 'Space') return;
  if (scheduled) return;  // Prevent multiple keypress from playing extra rounds

  switch (screen) {
    case 'welcome':
    case 'game-result':
      if (keyPress !== 'Space') return;
      simulateHoverClick(100,
                        newGameBtn, 
                        'btn__new-game--kbd',
                        respondClickNewGame);
      break;
    case 'choose-weapon':
      const playerChoice = keyPress === 'KeyJ' ? 'rock' : 
                         keyPress === 'KeyK' ? 'paper' :
                         keyPress === 'KeyL' ? 'scissors' :
                         null;
      if (!playerChoice) return;
      const weaponImg = document.querySelector(`#${playerChoice}`);
      simulateHoverClick(200,
                        weaponImg,
                        'weapons__btn--kbd',
                        playRound, playerChoice, getComputerChoice());
      break;
    case 'round-result':
      if (keyPress !== 'Space') return;
      simulateHoverClick(100,
                        nextRoundBtn,
                        'btn__next-round--kbd',
                        respondClickNextRound);
      break;
    default:
      console.error(`Error: Unknown screen: ${screen}`);
  }

  function simulateHoverClick(timeout, node, cls, callback, ...callbackArgs) {
    const evtMouseover = new MouseEvent('mouseover', { bubbles: true });

    scheduled = true;
    node.dispatchEvent(evtMouseover);
    node.classList.add(cls);
    setTimeout(() => {
      node.classList.remove(cls);
      callback(...callbackArgs);
      scheduled = null;
    }, timeout);
  }
}

function respondDisableSpacebarScroll(e) {
  if (e.code === 'Space') e.preventDefault();
}

function respondHoverWeapon(e) {
  if (e.target.matches('img')) {
    clearTimeout(showChooseWeaponText);
    const playerChoice = e.target.id;
    mainText.classList.remove('main__text--default');
    mainText.textContent = playerChoice.toUpperCase();
    playAudio('weapon-hover');
  }
}

function respondNotHoverWeapon(e) {
  if (main.dataset.screen !== 'choose-weapon') return;
  if (e.target.matches('img')) {
    showChooseWeaponText = setTimeout(() => {
      mainText.classList.add('main__text--default');
      playAnimation(mainText, 'fade-in');
    }, 200);
    mainText.textContent = '\u200b';
  }
}

function respondClickNextRound() {
  showChooseWeapon();
  playAnimation(mainContainer, 'fade-in');
}

function respondClickNewGame() {
  const scoreCounter = document.querySelector('.score');
  const welcomePanel = document.querySelector('.welcome');

  main.classList.remove('main--skinny');
  playAnimation(main, 'fade-in');
  hideElements(welcomePanel, newGameBtn);
  showElements(mainText);

  score.player = 0;
  score.computer = 0;
  round = 0;

  deleteTable();
  updateScoreCounter('player', score.player);
  updateScoreCounter('computer', score.computer);
  playAnimation(main, 'shake');
  playAnimation(scoreCounter, 'shake');
  
  showChooseWeapon();
}

function respondRemoveAnimation(e) {
    e.target.classList.remove(e.animationName);
}