'use strict';
let round = 0;
let playerScore = 0;
let computerScore = 0;
let responseScheduled = null;  // Prevent spamming & playing multiple rounds at once
let audioContext;
let audioOn = true;
let audios = {};
let audio;
let screen = 'welcome-start';
let prevScreen;
let prevScreenElements;
let timeoutShowText;
let table;

const rules = document.querySelector('.rules');
const settings = document.querySelector('.settings');
const welcome = document.querySelector('.welcome');
const main = document.querySelector('.main');
const mainContainer = document.querySelector('.main__container');
const mainText = document.querySelector('.main__text');
const weapons = document.querySelector('.weapons');
const results = document.querySelector('.results');
const startGameBtn = document.querySelector('.btn__start-game');
const nextRoundBtn = document.querySelector('.btn__next-round');
const replayGameBtn = document.querySelector('.btn__replay-game');
const closeBtn = document.querySelector('.btn__close');
const tableParent = document.querySelector('.table')

rules.addEventListener('click', respondToggleRules);
settings.addEventListener('change', respondToggleSettings);
weapons.addEventListener('mouseover', respondHoverWeapon);
weapons.addEventListener('mouseout', respondNotHoverWeapon);
weapons.addEventListener('click', respondSelectWeapon);
startGameBtn.addEventListener('click', respondNewGame);
nextRoundBtn.addEventListener('click', respondNextRound);
replayGameBtn.addEventListener('click', respondNewGame);
closeBtn.addEventListener('click', respondClose);
document.addEventListener('keydown', respondKeydown);
document.addEventListener('animationend', respondRemoveAnimation);
document.addEventListener('animationcancel', respondRemoveAnimation);
window.addEventListener('resize', respondResizeWindow);

// ---Core logic---
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
    closeBtn,
  ];

  allElements.forEach((element) => {
    if (screen === 'welcome-info') {
      // Save previous screen so it can be restored when rules are closed
      if (!element.classList.contains('hide')) {
        prevScreenElements.push(element);
      }
    }
    
    // Show desired elements, hide everything else
    if (visibleElements.includes(element)) {
      element.classList.remove('hide');
    } else {
      element.classList.add('hide');
    }
  });

  // If main height is blank, set it after elements are displayed so it knows how much room to take
  if (!main.style.height && visibleElements.includes(main)) {
    respondResizeWindow();
  }
}

function showChooseWeapon() {
  const orgScreen = screen;

  screen = 'choose-weapon';
  updateMsg('Choose your weapon');
  showComponents(main, weapons, mainText);

  switch (orgScreen) {
    case 'game-result':
      mainText.classList.remove('main__text--large');
    case 'welcome-start':
    case 'game-result':
      // Finish shake animation before starting fade in (prevents slight element resize)
      mainContainer.style.opacity = 0;
      main.addEventListener('animationend', fadeIn, { once: true });
      break;
    default:
      fadeIn();
  }

  function fadeIn(e) {
    mainContainer.style.opacity = '';
    playAnimation(mainContainer, 'fade-in');
    playAnimation(mainText, 'fade-in');
  }
}

function showRoundResult(outcome, playerChoice, computerChoice) {
  const playerImg = results.querySelector('.results__player');
  const computerImg = results.querySelector('.results__computer');
  
  playerImg.setAttribute('src', `img/${playerChoice}.png`);
  playerImg.setAttribute('alt', `${playerChoice} (player's choice)`);
  computerImg.setAttribute('src', `img/${computerChoice}.png`);
  computerImg.setAttribute('alt', `${computerChoice} (computer's choice)`);

  switch (outcome) {
    case 'win':
      updateScoreCounter('player', playerScore);
      playAudio('round-won');
      updateMsg(`You win! ${capitalize(playerChoice)} beats ${computerChoice}.`);
      break;
    case 'lose':
      updateScoreCounter('computer', computerScore);
      playAudio('round-lost');
      updateMsg(`You lose! ${capitalize(computerChoice)} beats ${playerChoice}.`);
      break;
    case 'tie':
      playAudio('round-tie');
      updateMsg(`You tied!  Both chose ${playerChoice}.`);
      break;
    default:
      console.error(`Error: Invalid outcome ${outcome}`);
  }

  screen = 'round-result';
  showComponents(main, results, nextRoundBtn, mainText);
  playAnimation(mainContainer, 'fade-in');
}

function showGameResult(outcome) {
  switch (outcome) {
    case 'win':
      updateScoreCounter('player', playerScore);
      playAudio('game-won');
      updateMsg(`HOORAY!  You win!`);
      replayGameBtn.textContent = 'Play Again?';
      break;
    case 'lose':
      updateScoreCounter('computer', computerScore);
      playAudio('game-lost');
      updateMsg(`OH NO!  You lose!`);
      replayGameBtn.textContent = 'Retry?';
      break;
    default:
      console.error(`Error: Invalid outcome ${outcome}`);
  }

  screen = 'game-result';
  mainText.classList.add('main__text--large');
  showComponents(main, mainText, replayGameBtn);
  playAnimation(mainContainer, 'zoom-out');
}

function getComputerChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
}

function playRound(playerChoice, computerChoice) {
  let outcome;

  switch (true) {
    case (playerChoice === computerChoice):
      outcome = 'tie';
      break;
    case (playerChoice === 'rock' && computerChoice === 'scissors'):
    case (playerChoice === 'paper' && computerChoice === 'rock'):
    case (playerChoice === 'scissors' && computerChoice === 'paper'):
      outcome = 'win';
      playerScore++;
      break;
    default:
      outcome = 'lose'
      computerScore++;
  }

  const roundResult = {
    round: ++round,
    player: playerChoice,
    computer: computerChoice,
    outcome: outcome,
  };

  updateTable(roundResult);
  if (isGameOver()) {
    showGameResult(outcome);
  } else {
    showRoundResult(outcome, playerChoice, computerChoice);
  }
}

function isGameOver() {
  return (playerScore === 5 || computerScore === 5);
}

function updateScoreCounter(user, score) {
  const playerScoreCounter = document.querySelector('.score__player .score__counter');
  const computerScoreCounter = document.querySelector('.score__computer .score__counter');
  const counter = (user === 'player') ? playerScoreCounter : computerScoreCounter;

  counter.textContent = score;
  playAnimation(counter, 'slide-up');
}

function updateMsg(msg) {
  mainText.textContent = msg;
}

function playAnimation(element, animationClass) {
  if (element.classList.contains(animationClass)) {
    element.classList.remove(animationClass);
  }

  // Remove any currently playing animations on this element
  element.getAnimations().forEach((animation) => {
    element.classList.remove(animation.animationName);
  });
  
  window.requestAnimationFrame(() => {
    element.classList.add(animationClass);
  });
}

function initAudios() {
  const sources = {
    'weapon-hover': 'audio/weapon-hover.mp3',
    'round-won': 'audio/round-won.mp3',
    'round-lost': 'audio/round-lost.mp3',
    'round-tie': 'audio/round-tie.mp3',
    'game-won': 'audio/game-won.mp3',
    'game-lost': 'audio/game-lost.mp3',
  }
  
  audioContext = new AudioContext();
  for (const id in sources) {
    fetch(sources[id])
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(decodedAudio => audios[id] = decodedAudio);
  }
}

function playAudio(id) {
  if (!audioOn) return;
  if (audio) audio.stop();
  audio = audioContext.createBufferSource();
  audio.buffer = audios[id];
  audio.connect(audioContext.destination);
  audio.start();
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

// ---Table---
function createTable() {
  const tableHeaders = ['#', 'Player', 'Computer', 'Outcome'];
  
  table = document.createElement('table');
  const thead = table.createTHead();
  const row = thead.insertRow();
  tableHeaders.forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    row.appendChild(th);
  });
  table.createTBody();

  tableParent.appendChild(table);
}

function addTableRow(data) {
  const tbody = table.tBodies[0];
  const row = tbody.insertRow(0);
  for (const col in data) {
    const cell = row.insertCell();
    cell.innerHTML = (col === 'outcome') ? showIcon(data[col]) : data[col];
  }

  function showIcon(outcome) {
    switch (outcome) {
      case 'win':
        return '<span style="color: lime;">\u2713</span>';
      case 'lose':
        return '<span style="color: red;">\u2717</span>';
      case 'tie':
        return '\u2014';
      default:
        console.error(`Error: Invalid outcome ${outcome}`);
    }
  }
}

function updateTable(data) {
  table || createTable();
  addTableRow(data);
}

function deleteTable() {
  table.remove();
  table = null;
}

// ---Event Listeners---
// For some non-mouse 'click' events below (touch or keyboard), there is a small timeout 
// so hover effects have time to play (ie. change button color, enlarge weapon image)
function respondToggleRules(e) {
  if (screen === 'welcome-info') {
    respondClose(e);
    return;
  }
  
  const welcomeTitle = welcome.querySelector('.welcome__title');
  welcomeTitle.textContent = 'Info';
  prevScreen = screen;
  prevScreenElements = [];
  screen = 'welcome-info';
  showComponents(welcome, closeBtn);
  playAnimation(welcome, 'fade-in');
}

function respondToggleSettings(e) {
  const setting = e.target;

  switch (setting.id) {
    case 'audio':
      audioOn = setting.checked;
      break;
    case 'table':
      tableParent.classList.toggle('hide');
      break;
    default:
      console.error(`Error: Unknown toggle ${setting.id}`);
  }
}

function respondHoverWeapon(e) {
  if (e.target.matches('img')) {
    const playerChoice = e.target.id;
    clearTimeout(timeoutShowText);
    updateMsg(playerChoice.toUpperCase());
    playAudio('weapon-hover');
  }
}

function respondNotHoverWeapon(e) {
  if (screen !== 'choose-weapon') return;
  if (e.target.matches('img')) {
    updateMsg('\u200b');
    timeoutShowText = setTimeout(() => {
      updateMsg('Choose your weapon');
      playAnimation(mainText, 'fade-in');
    }, 400);
  }
}

function respondSelectWeapon(e) {
  const element = e.target;
    
  if (element.matches('img')) {
    if (responseScheduled) return;
    responseScheduled = true;
    
    playAnimation(element, 'scale-up');
    const timeout = 200;

    setTimeout(() => {
      const playerChoice = element.id;
      playRound(playerChoice, getComputerChoice());
      clearTimeout(timeoutShowText);
      responseScheduled = null;
    }, timeout);
  }
}

function respondNewGame(e) {
  if (responseScheduled) return;
  responseScheduled = true;
  
  const element = e.target;
  const score = document.querySelector('.score');
  const timeout = (e.pointerType === 'mouse') ? 0 : 100;
  if (e.kbdClass) element.classList.add(e.kbdClass);

  setTimeout(() => {
    if (e.kbdClass) element.classList.remove(e.kbdClass);
    switch (element) {
      case replayGameBtn:
        round = 0;
        playerScore = 0;
        computerScore = 0;
        deleteTable();
        break;
      case startGameBtn:
        const unhide = [rules, settings, score, main];
        unhide.forEach((element) => element.classList.remove('hide'));
        welcome.classList.add('hide');
        initAudios();
        break;
      default:
        console.error(`Error: Unexpected element ${element}`);
    }
    updateScoreCounter('player', playerScore);
    updateScoreCounter('computer', computerScore);
    playAnimation(score, 'shake');
    playAnimation(main, 'shake');
    showChooseWeapon();
    responseScheduled = null;
  }, timeout);
}

function respondNextRound(e) {
  if (responseScheduled) return;
  responseScheduled = true;
  
  const element = e.target;
  const timeout = (e.pointerType === 'mouse') ? 0 : 100;
  if (e.kbdClass) element.classList.add(e.kbdClass);

  setTimeout(() => {
    if (e.kbdClass) element.classList.remove(e.kbdClass);
    showChooseWeapon();
    responseScheduled = null;
  }, timeout);
}

function respondClose(e) {
  if (responseScheduled) return;
  responseScheduled = true;
  
  const element = e.target;
  const timeout = (e.pointerType === 'mouse') ? 0 : 100;
  if (e.kbdClass) element.classList.add(e.kbdClass);

  setTimeout(() => {
    if (e.kbdClass) element.classList.remove(e.kbdClass);
    screen = prevScreen;
    showComponents(...prevScreenElements);
    playAnimation(mainContainer, 'fade-in');
    responseScheduled = null;
  }, timeout);
}

function respondKeydown(e) {
  const keyPress = e.code;
  let args = { pointerType: 'keyboard' };

  if (
    keyPress !== 'KeyJ' &&
    keyPress !== 'KeyK' &&
    keyPress !== 'KeyL' &&
    keyPress !== 'Space'
  ) {
    return;
  }
  if (keyPress === 'Space') e.preventDefault();

  // Simulate mouse behavior when using keyboard controls (activate button's hover styles)
  // CSS :hover won't trigger programmatically, so manually add/remove equivalent class
  switch (screen) {
    case 'welcome-start':
      if (keyPress !== 'Space') return;
      args.target = startGameBtn;
      args.kbdClass = 'btn--black-kbd';
      respondNewGame(args);
      break;
    case 'welcome-info':
      if (keyPress !== 'Space') return;
      args.target = closeBtn;
      args.kbdClass = 'btn--black-kbd';
      respondClose(args);
      break;
    case 'choose-weapon':
      const playerChoice =
        keyPress === 'KeyJ' ? 'rock' :
        keyPress === 'KeyK' ? 'paper' :
        keyPress === 'KeyL' ? 'scissors' :
        null;
      if (!playerChoice) return;
      const weaponImg = document.querySelector(`#${playerChoice}`);
      const evtMouseOver = new MouseEvent('mouseover', { bubbles: true });
      weaponImg.dispatchEvent(evtMouseOver);
      args.target = weaponImg;
      respondSelectWeapon(args);
      break;
    case 'round-result':
      if (keyPress !== 'Space') return;
      args.target = nextRoundBtn;
      args.kbdClass = 'btn--white-kbd';
      respondNextRound(args);
      break;
    case 'game-result':
      if (keyPress !== 'Space') return;
      args.target = replayGameBtn;
      args.kbdClass = 'btn--black-kbd';
      respondNewGame(args);
      break;
    default:
      console.error(`Error: Unknown screen ${screen}`);
  }
}

function respondRemoveAnimation(e) {
  e.target.classList.remove(e.animationName);
}

function respondResizeWindow() {
  // Keep main height consistent across screens
  // 1. Clear height so it resizes according to contents
  // 2. Base new height on screens with the most content
  main.style.height = '';
  
  if (screen === 'choose-weapon' || screen === 'round-result') {
    main.style.height = `${main.offsetHeight}px`;
  }
}