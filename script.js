const gameBoard = document.getElementById('gameBoard');
const inputRow = document.getElementById('rows');
const inputColumn = document.getElementById('cols');
const inputMines = document.getElementById('mines');
const buttonStart = document.getElementById('btnStart');

const mineString = '💣';
const explosionString = '💥';
const flagString = '🚩';
const emptyString = '';

var points = 0;
var is_first_click = true;
var is_over = false;
var start_time = 0;
var end_time = 0;

const hiddeElement = (element) => {
  element.classList.add('hidden');
};

const showElement = (element) => {
  element.classList.remove('hidden');
}

function generateMines() {
  let rows = inputRow.value; 
  let columns = inputColumn.value;
  let mines = inputMines.value;

  let minesArray = [];
  for (let i = 0; i < mines; i++) {
    let row = Math.floor(Math.random() * rows);
    let col = Math.floor(Math.random() * columns);

    let mine = { row, col };
    if (minesArray.find(m => m.row === mine.row && m.col === mine.col)) {
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

function createBoard() {
  is_first_click = true;
  is_over = false;
  points = 0;
  let rows = inputRow.value; 
  let columns = inputColumn.value;

  let stringBoard = '';

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

function cellClick(cell, event) {
  if (is_first_click) {
    is_first_click = false;
    start_time = new Date().getTime();
    generateMines();
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
    alert(`Has ganado! 🏆\n Puntos -> ${points}\n Tiempo -> ${time}`);
  }
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