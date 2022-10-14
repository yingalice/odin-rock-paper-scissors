'use strict';
let score = { player: 0, computer: 0 };
let round = 0;
let scheduled = null;
let showChooseWeaponText;
let audioOn = true;
let prevScreenName;
let prevScreenElements = [];

const playerScoreCounter = document.querySelector('.score__player-counter');
const computerScoreCounter = document.querySelector('.score__computer-counter');
const settings = document.querySelector('.settings');
const rulesBtn = document.querySelector('.rules');
const welcome = document.querySelector('.welcome');
const main = document.querySelector('.main');
const mainText = document.querySelector('.main__text');
const mainContainer = document.querySelector('.main__container');
const weapons = document.querySelector('.weapons');
const results = document.querySelector('.results');
const startGameBtn = document.querySelector('.btn__start-game');
const nextRoundBtn = document.querySelector('.btn__next-round');
const replayGameBtn = document.querySelector('.btn__replay-game');
const closeBtn = document.querySelector('.btn__close');
const tableParent = document.querySelector('.table')
let table;

rulesBtn.addEventListener('click', respondClickRules);
settings.addEventListener('change', respondToggleSettings);
weapons.addEventListener('mouseover', respondHoverWeapon);
weapons.addEventListener('mouseout', respondNotHoverWeapon);
weapons.addEventListener('click', respondClickWeapon);
startGameBtn.addEventListener('click', respondClickNewGame);
nextRoundBtn.addEventListener('click', respondClickNextRound);
replayGameBtn.addEventListener('click', respondClickNewGame);
closeBtn.addEventListener('click', respondClickClose);
window.addEventListener('keydown', respondKeydown);
document.addEventListener('animationend', respondRemoveAnimation);

// Core logic
function showComponents(...visibleElements) {
  const allElements = [
    welcome,
    main,
    mainText,
    weapons,
    results,
    startGameBtn,
    nextRoundBtn,
    replayGameBtn,
    closeBtn
  ];
  
  prevScreenName = main.dataset.screen;
  prevScreenElements = [];
  allElements.forEach((element) => {
    if (!element.classList.contains('hide')) prevScreenElements.push(element);
    if (visibleElements.includes(element)) {
      element.classList.remove('hide');
    } else {
      element.classList.add('hide');
    }
  });

}

function showChooseWeapon() {
  main.dataset.screen = 'choose-weapon';

  showComponents(main, weapons, mainText);
  playAnimation(mainContainer, 'fade-in');
  playAnimation(mainText, 'fade-in');
  mainText.textContent = '\u200b';
  mainText.classList.add('main__text--default');
  mainText.classList.remove('main__text--large');
}

function showRoundResult(outcome, playerChoice, computerChoice) {
  const playerImg = results.querySelector('.results__player');
  const computerImg = results.querySelector('.results__computer');
  main.dataset.screen = 'round-result';

  showComponents(main, results, nextRoundBtn, mainText);
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
  showComponents(main, replayGameBtn, mainText);
  main.dataset.screen = 'game-result';

  playAnimation(mainContainer, 'zoom-out');
  mainText.classList.add('main__text--large');0

  switch (outcome) {
    case 'win':
      updateScoreCounter('player', score.player);
      playAudio('game-won');
      updateMsg(`HOORAY!  You win!`);
      replayGameBtn.textContent = 'Play Again?';
      break;
    case 'lose':
      updateScoreCounter('computer', score.computer);
      playAudio('game-lost');
      updateMsg(`OH NO!  You lose!`);
      replayGameBtn.textContent = 'Retry?';
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
  if (!audioOn) return;
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
  
  table = document.createElement('table');
  tableParent.appendChild(table);
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

function playAnimation(node, animationClassName) {
  // Remove any currently playing animations on this node
  node.getAnimations().forEach((animation) => {
    node.classList.remove(animation.animationName);
  });
  node.offsetHeight;  //Trigger reflow to reset animation
  node.classList.add(animationClassName);
}

// Event Listeners
function respondToggleSettings(e) {
  const item = e.target;

  switch (item.id) {
    case 'audio':
      audioOn = item.checked;
      break;
    case 'table':
      tableParent.classList.toggle('hide');
      break;
    default:
      console.error(`Error: Unknown toggle ${item.id}`);
  }
}

function respondClickRules() {
  if (
    main.dataset.screen === 'welcome' ||
    main.dataset.screen === 'welcome-start'
  )
    return;
  
  const welcomeTitle = welcome.querySelector('.welcome__title');
  welcomeTitle.textContent = 'Info';
  showComponents(welcome, closeBtn);
  main.dataset.screen = 'welcome';
  playAnimation(main, 'fade-in');
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

function respondClickWeapon(e) {
  if (e.target.matches('img')) {
    let timeout = (e.pointerType === 'touch') ? 200 : 0;
    setTimeout(() => {
      clearTimeout(showChooseWeaponText);
      const playerChoice = e.target.id;
      playRound(playerChoice, getComputerChoice());  
    }, timeout);
  }
}

function respondClickNewGame(e) {
  const scoreCounter = document.querySelector('.score');
  const element = e.target || e;

  let timeout = (e.pointerType === 'touch') ? 100 : 0;
  setTimeout(() => {
    if (element === replayGameBtn) {
      score.player = 0;
      score.computer = 0;
      round = 0;
      deleteTable();
    } else if (element === startGameBtn) {
      main.classList.remove('hide');
      rulesBtn.classList.remove('hide');
      welcome.classList.add('hide');
    }

    updateScoreCounter('player', score.player);
    updateScoreCounter('computer', score.computer);
    playAnimation(main, 'shake');
    playAnimation(scoreCounter, 'shake');
    showChooseWeapon();
  }, timeout);
}

function respondClickNextRound(e) {
  let timeout = (e.pointerType === 'touch') ? 100 : 0;
  setTimeout(() => {
    showChooseWeapon();
    playAnimation(mainContainer, 'fade-in');
  }, timeout);
}

function respondClickClose(e) {
  let timeout = (e.pointerType === 'touch') ? 100 : 0;
  setTimeout(() => {
    main.dataset.screen = prevScreenName;
    showComponents(...prevScreenElements);
  }, timeout);
}

function respondKeydown(e) {
  const screen = main.dataset.screen;
  const keyPress = e.code;

  if (
    keyPress !== 'KeyJ' &&
    keyPress !== 'KeyK' &&
    keyPress !== 'KeyL' &&
    keyPress !== 'Space'
  ) 
    return;
  if (keyPress === 'Space') e.preventDefault();
  if (scheduled) return; // Prevent multiple keypress from playing extra rounds

  switch (screen) {
    case 'welcome-start':
      if (keyPress !== 'Space') return;
      simulateHoverClick(
        100,
        startGameBtn,
        'btn--black-kbd',
        respondClickNewGame, startGameBtn
      );
      break;
    case 'welcome':
      if (keyPress !== 'Space') return;
      simulateHoverClick(
        100,
        closeBtn,
        'btn--black-kbd',
        respondClickClose, closeBtn
      );
      break;
    case 'game-result':
      if (keyPress !== 'Space') return;
      simulateHoverClick(
        100,
        replayGameBtn,
        'btn--black-kbd',
        respondClickNewGame, replayGameBtn
      );
      break;
    case 'choose-weapon':
      const playerChoice =
        keyPress === 'KeyJ' ? 'rock' :
        keyPress === 'KeyK' ? 'paper' :
        keyPress === 'KeyL' ? 'scissors' :
        null;
      if (!playerChoice) return;
      const weaponImg = document.querySelector(`#${playerChoice}`);
      simulateHoverClick(
        200,
        weaponImg,
        'weapons__btn--kbd',
        playRound, playerChoice, getComputerChoice()
      );
      break;
    case 'round-result':
      if (keyPress !== 'Space') return;
      simulateHoverClick(
        100,
        nextRoundBtn,
        'btn--white-kbd',
        respondClickNextRound, nextRoundBtn
      );
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

function respondRemoveAnimation(e) {
    e.target.classList.remove(e.animationName);
}