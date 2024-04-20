const gameBoard = document.getElementById('gameBoard');
const inputRow = document.getElementById('rows');
const inputColumn = document.getElementById('cols');
const inputMines = document.getElementById('mines');
const buttonStart = document.getElementById('btnStart');

const mineString = '💣';
const explosionString = '💥';
const flagString = '🚩';
const emptyString = '';
const minBoardSize = 9;
const maxBoardSize = 30;
const minMines = .1;
const maxMines = .6;

var points = 0;
var is_first_click = true;
var is_over = false;
var start_time = 0;
var end_time = 0;
var difficulty = null;

const dificulties = {
  easy: {
    text : 'Fácil',
    minDensity: .1,
    maxDensity: .15,
    multiplier: 1,
    timeFactor: .5,
    foundMineFactor: 10
  },
  medium: {
    text : 'Intermedio',
    minDensity: .15,
    maxDensity: .22,
    multiplier: 1.5,
    timeFactor: 1,
    foundMineFactor: 20
  },
  hard: {
    text : 'Difícil',
    minDensity: .22,
    maxDensity: .3,
    multiplier: 2,
    timeFactor: 2,
    foundMineFactor: 30
  },
  expert: {
    text : 'Experto',
    minDensity: .3,
    maxDensity: .6,
    multiplier: 3,
    timeFactor: 3,
    foundMineFactor: 40
  }
}

const showAllCells = () => {
  let cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.classList.add('game-over');
  });
}

const hiddeElement = (element) => {
  element.classList.add('hidden');
};

const setDifficulty = (mineDensity) => {
  if (mineDensity >= dificulties.easy.minDensity && mineDensity <= dificulties.easy.maxDensity) {
    difficulty = dificulties.easy;
  } else if (mineDensity >= dificulties.medium.minDensity && mineDensity <= dificulties.medium.maxDensity) {
    difficulty = dificulties.medium;
  } else if (mineDensity >= dificulties.hard.minDensity && mineDensity <= dificulties.hard.maxDensity) {
    difficulty = dificulties.hard;
  } else if (mineDensity >= dificulties.expert.minDensity && mineDensity <= dificulties.expert.maxDensity) {
    difficulty = dificulties.expert;
  }
}

const showElement = (element) => {
  element.classList.remove('hidden');
}

const calcMineDensity = () => {
  let rows = inputRow.value; 
  let columns = inputColumn.value;
  let mines = inputMines.value;

  return mines / (rows * columns);
}

const calcPoints = (points, time) => {
  let timePoints = calcTimePoints(time);
  let mineFoundPoints = calcMineFoundPoints();

  return ((points + mineFoundPoints) * difficulty.multiplier) - timePoints;
}

const calcTimePoints = (time) => {
  return (time * difficulty.timeFactor);
}

const calcMineFoundPoints = () => {
  let cells = document.querySelectorAll('.cell');
  let foundMines = 0;
  
  cells.forEach(cell => {
    if (cell.classList.contains('flag') && cell.classList.contains('mine')) {
      foundMines++;
    }
  });

  return foundMines * difficulty.foundMineFactor;
}

function hasWon() {
  let rows = inputRow.value; 
  let columns = inputColumn.value;
  let mines = inputMines.value;

  let cells = document.querySelectorAll('.cell');
  let clickedCells = 0;
  let flaggedCells = 0;
  cells.forEach(cell => {
    if (cell.classList.contains('clicked')) {
      clickedCells++;
    }
    if (cell.classList.contains('flag') && cell.classList.contains('mine')) {
      flaggedCells++;
    }
  });
  return (rows * columns) - mines == clickedCells && flaggedCells == mines;
}

function createBoard() {
  is_first_click = true;
  is_over = false;
  points = 0;
  let rows = inputRow.value; 
  let columns = inputColumn.value;
  let stringBoard = '';

  if (rows < minBoardSize) {
    alert(`El tamaño del tablero es muy pequeño.\nValor mínimo -> ${minBoardSize}`);
    inputRow.value = minBoardSize;
    rows = minBoardSize;
  }

  if (rows > maxBoardSize) {
    alert(`El tamaño del tablero es muy grande.\nValor máximo -> ${maxBoardSize}`);
    inputRow.value = maxBoardSize;
    rows = maxBoardSize;
  }

  if (columns < minBoardSize) {
    alert(`El tamaño del tablero es muy pequeño.\nValor mínimo -> ${minBoardSize}`);
    inputColumn.value = minBoardSize;
    columns = minBoardSize;
  }

  if (columns > maxBoardSize) {
    alert(`El tamaño del tablero es muy grande.\nValor máximo -> ${maxBoardSize}`);
    inputColumn.value = maxBoardSize;
    columns = maxBoardSize;
  }

  for (let i = 0; i < rows; i++) {
    stringBoard += '<div class="row">';
    for (let j = 0; j < columns; j++) {
      stringBoard += `<div class="cell" data-row="${i}" data-col="${j}" onclick="cellClick(this, event)"></div>`;
    }
    stringBoard += '</div>';
  }

  gameBoard.innerHTML = stringBoard;
  buttonStart.innerHTML = 'Nueva partida';
}

function generateMines(cell) {
  let rows = inputRow.value; 
  let columns = inputColumn.value;
  let mines = inputMines.value;
  let minesArray = [];

  if (mines < minMines * rows * columns) {
    mines = Math.floor(minMines * rows * columns);
    alert(`El número de minas es muy bajo.\nValor de minas cambiado a 10%\nMinas -> ${mines}`);
    inputMines.value = mines;
  }

  if (mines > maxMines * rows * columns) {
    mines = Math.floor(maxMines * rows * columns);
    alert(`El número de minas es muy alto.\nValor de minas cambiado a 60%\nMinas -> ${mines}`);
    inputMines.value = mines;
  }

  for (let i = 0; i < mines; i++) {
    let row = Math.floor(Math.random() * rows);
    let col = Math.floor(Math.random() * columns);

    let mine = { row, col };
    if ((minesArray.find(m => m.row === mine.row && m.col === mine.col)) || (cell.dataset.row == mine.row && cell.dataset.col == mine.col)) {
      i--;
      continue;
    }
 
    minesArray.push(mine);
  }

  minesArray.forEach(mine => {
    let cell = document.querySelector(`[data-row="${mine.row}"][data-col="${mine.col}"]`);
    cell.classList.add('mine');
    cell.innerHTML = mineString;
  });

  calculateDanger();
  setDifficulty(calcMineDensity());

  return minesArray;
}

function calculateDanger() {
  let rows = inputRow.value; 
  let columns = inputColumn.value;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      let cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      if (cell.innerHTML === mineString) {
        continue;
      }

      let danger = 0;
      for (let k = i - 1; k <= i + 1; k++) {
        for (let l = j - 1; l <= j + 1; l++) {
          if (k < 0 || k >= rows || l < 0 || l >= columns) {
            continue;
          }

          let neighbour = document.querySelector(`[data-row="${k}"][data-col="${l}"]`);
          if (neighbour.innerHTML === mineString) {
            danger++;
          }
        }
      }

      if (danger > 0) {
        let dangerClass = `danger-level-${danger}`;
        cell.classList.add(dangerClass);
        cell.innerHTML = danger;
      }
    }
  }
}

function cellClick(cell, event) {
  event.preventDefault();

  if (is_first_click) {
    is_first_click = false;
    start_time = new Date().getTime();
    generateMines(cell);
  }

  if (is_over) {
    return;
  }

  if (cell.classList.contains('clicked')) {
    return;
  }

  if (event.shiftKey) {
    if (cell.classList.contains('flag')) {
      cell.classList.remove('flag');
    } else {
      cell.classList.add('flag');
    }
  } else {
    if (cell.classList.contains('flag')) {
      return;
    }

    if (cell.classList.contains('mine')) {
      is_over = true;
      showAllCells();
      cell.innerHTML = explosionString;
      alert(`Game Over 😢\n Puntos -> ${points}`);
    }
    cell.classList.add('clicked');
    points++;
  }

  if (hasWon()) {
    is_over = true;
    end_time = new Date().getTime();
    let time = (end_time - start_time) / 1000;
    alert(`Has ganado! 🏆\n Puntos -> ${calcPoints(points, time)}\n Tiempo -> ${time}`);
  }
}