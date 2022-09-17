'use strict';

let playerScore = 0;
let computerScore = 0;

function getPlayerChoice() {
  let choices = ["rock", "paper", "scissors"];
  let playerSelection = prompt("Choose rock, paper, or scissors");

  if (!choices.includes(playerSelection.toLowerCase())) {
    alert(`${playerSelection} is invalid.  Please try again`);
    return getPlayerChoice();
  }

  return playerSelection.toLowerCase();
}

function getComputerChoice() {
  let choices = ["rock", "paper", "scissors"];
  return choices[Math.floor(Math.random() * choices.length)];
}

function playRound(playerSelection, computerSelection) {
  let message;

  if (playerSelection === computerSelection) {
    message = `Tie game`;
  } else if ((playerSelection === "rock" && computerSelection === "scissors") ||
             (playerSelection === "paper" && computerSelection === "rock") ||
             (playerSelection === "scissors" && computerSelection === "paper")) {
    playerScore++;
    message = `You win!  ${capitalize(playerSelection)} beats ${computerSelection}`;
  } else {
    computerScore++;
    message = `You lose!  ${capitalize(computerSelection)} beats ${playerSelection}`;
  }

  message += `.  [Player: ${playerScore} Computer: ${computerScore}]`;
  return message;
}

function isGameOver() {
  return (playerScore === 5 || computerScore === 5) ? true : false;
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function game() {
  while (!isGameOver()) {
    console.log(playRound(getPlayerChoice(), getComputerChoice()));
  }

  if (playerScore === 5) {
    console.log("YAY!  You win!");
  } else {
    console.log("OH NO!  You lose!");
  }

  resetGame();
}

game();