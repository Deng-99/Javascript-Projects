const gameBoard = document.querySelector("#game-board");
const scoreElement = document.getElementById("score-num");

let grid;
let gameOver = false;
let isGameRunning = false;
let score = 0;
let isGamePaused = false;
let gameLoopInterval = null;
let clearedLinesScore = 0;
const gameState = Array.from({ length: 20 }, () => Array(10).fill(0));

const tetrominos = {
  I: [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

const colors = {
  I: "cyan",
  O: "rgb(250, 250, 51)",
  T: "rgb(112, 41, 99)",
  S: "rgb(11, 218, 81)",
  Z: "rgb(220, 20, 60)",
  J: "blue",
  L: "rgb(255, 172, 28)",
};

function createGrid() {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = document.createElement("div");
      gameBoard.appendChild(cell);
      grid.push(cell);
    }
  }
  return grid;
}

function createPiece() {
  const tetrominoTypes = Object.keys(tetrominos);
  const randomType =
    tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  const tetromino = tetrominos[randomType];
  return {
    type: randomType,
    shape: tetromino,
    x: 3, // Initial x position
    y: 0, // Initial y position
    rotation: 0, // Initial rotation state
  };
}

let currentPiece = null; // Initialize currentPiece as null

function renderPiece() {
  // Render the current piece at its new position
  if (currentPiece) {
    const { shape, x, y } = currentPiece;

    shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          const boardRow = y + rowIndex;
          const boardCol = x + colIndex;
          const cellIndex = boardRow * 10 + boardCol;
          grid[cellIndex].style.backgroundColor = colors[currentPiece.type];
        }
      });
    });
  }
}

function checkCollision() {
  const { shape, x, y } = currentPiece;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const boardRow = y + row;
        const boardCol = x + col;

        // Check if the cell is out of bounds horizontally
        if (boardCol < 0 || boardCol >= 10) {
          console.log(
            `Collision detected! Out of bounds at row ${boardRow}, col ${boardCol}`
          );
          return true;
        }

        // Check if the cell is out of bounds vertically or occupied
        if (
          boardRow >= 20 ||
          boardRow < 0 ||
          grid[boardRow * 10 + boardCol].classList.contains("occupied")
        ) {
          console.log(
            `Collision detected! Occupied cell at row ${boardRow}, col ${boardCol}`
          );
          return true;
        }
      }
    }
  }

  return false;
}

function updateGameBoard() {
  // Clear the board
  grid.forEach((cell) => {
    cell.style.backgroundColor = "black";
  });

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const cellIndex = row * 10 + col;
      const cell = grid[cellIndex];
      const gameStateValue = gameState[row][col];
      cell.style.backgroundColor = colors[gameStateValue] || "black";
    }
  }
}

function generateNewPieceIfPossible() {
  currentPiece = createPiece();
  currentPiece.x = 3;
  currentPiece.y = 0;

  if (checkCollision()) {
    // If the new piece collides when generated at the top, it's game over
    gameOver = true;
    clearInterval(gameLoopInterval);
    // Additional actions for game over can be added here
    handleGameOver(); // Call your game over handling function
  }
}

function lockPiece() {
  if (currentPiece) {
    const { shape, x, y, type } = currentPiece;

    shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          const boardRow = y + rowIndex;
          const boardCol = x + colIndex;
          gameState[boardRow][boardCol] = type;
          // Add a class to mark the cell as occupied
          grid[boardRow * 10 + boardCol].classList.add("occupied");
        }
      });
    });

    // Generate a new piece after locking the current piece
    generateNewPieceIfPossible();

    // Render the new piece after locking the current piece
    updateGameBoard();
    renderPiece();
  }
}

function checkLineClearing() {
  let linesCleared = 0;
  for (let row = 0; row < 20; row++) {
    let lineFilled = true;
    for (let col = 0; col < 10; col++) {
      const cellIndex = row * 10 + col;
      if (!grid[cellIndex].classList.contains("occupied")) {
        lineFilled = false;
        break;
      }
    }
    if (lineFilled) {
      clearLine(row);
      linesCleared++;
    }
  }
  updateScore(linesCleared);
}

function handleGameOver() {
  // Additional actions for game over can be added here

  // Display the game over message using an alert
  alert("Game Over!");

  // You can also add a restart button logic here
  const restart = confirm("Do you want to restart the game?");
  if (restart) {
    resetGame(); // Call your resetGame function to restart the game
  } else {
    // Handle what happens if the player chooses not to restart
    // For example, you can redirect to a different page or perform other actions.
  }
}

function clearLine(row) {
  // Remove the line from the grid
  for (let col = 0; col < 10; col++) {
    const cellIndex = row * 10 + col;
    // Remove the "occupied" class
    grid[cellIndex].classList.remove("occupied");
    // Clear the cell color
    grid[cellIndex].style.backgroundColor = "black";
    // Update the gameState to mark the cell as unoccupied (0)
    gameState[row][col] = 0;
  }

  // Move down all rows above the cleared line
  for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
    for (let col = 0; col < 10; col++) {
      const aboveCellIndex = aboveRow * 10 + col;
      const cellIndex = (aboveRow + 1) * 10 + col;
      const color = grid[aboveCellIndex].style.backgroundColor;
      grid[cellIndex].classList.toggle(
        "occupied",
        grid[aboveCellIndex].classList.contains("occupied")
      );
      grid[cellIndex].style.backgroundColor = color;
      // Remove the "occupied" class from the above row cells
      grid[aboveCellIndex].classList.remove("occupied");
      // Clear the color and update the gameState
      grid[aboveCellIndex].style.backgroundColor = "black";
      gameState[aboveRow + 1][col] = gameState[aboveRow][col];
      gameState[aboveRow][col] = 0;
    }
  }
}

function updateScore(linesCleared) {
  const scoreToAdd = calculateScore(linesCleared);

  // Update the total score
  score += scoreToAdd;

  // Update the score display
  updateScoreDisplay();
}

function calculateScore(linesCleared) {
  // You can implement your own scoring mechanism here
  // For example, you can give higher scores for clearing multiple lines at once
  return linesCleared * 100;
}

function clearBoard() {
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      gameState[row][col] = 0;
    }
  }
}

function moveLeft() {
  if (!gameOver && !isGamePaused) {
    currentPiece.x--;
    if (checkCollision()) currentPiece.x++;
    updateGameBoard();
    renderPiece();
  }
}

function moveRight() {
  if (!gameOver && !isGamePaused) {
    currentPiece.x++;
    if (checkCollision()) currentPiece.x--;
    updateGameBoard();
    renderPiece();
  }
}

function moveDown() {
  if (!gameOver && !isGamePaused) {
    currentPiece.y++;

    if (checkCollision()) {
      currentPiece.y--;

      // Lock the piece if it collides
      lockPiece();

      // Generate a new piece after locking the current piece
      generateNewPieceIfPossible();
    }

    updateGameBoard();
    renderPiece();
  }
}

function rotate() {
  if (!gameOver) {
    const { shape } = currentPiece;
    const previousShape = currentPiece.shape; // Save the previous shape
    const previousRotation = currentPiece.rotation;
    currentPiece.rotation = (currentPiece.rotation + 1) % 4;
    currentPiece.shape = rotateShape(shape);

    // Check collision after rotation
    if (checkCollision()) {
      // Restore the previous shape and rotation
      currentPiece.shape = previousShape;
      currentPiece.rotation = previousRotation;
    }

    updateGameBoard();
    renderPiece();
  }
}

function rotateShape(shape) {
  const rotatedShape = [];
  const size = shape.length;
  for (let row = 0; row < size; row++) {
    rotatedShape[row] = [];
    for (let col = 0; col < size; col++) {
      rotatedShape[row][col] = shape[size - col - 1][row];
    }
  }
  return rotatedShape;
}

function handleKeyPress(event) {
  switch (event.key) {
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case "ArrowDown":
      moveDown();
      break;
    case "ArrowUp":
      rotate();
      break;
    default:
      break;
  }
}

function updateScoreDisplay() {
  scoreElement.textContent = score.toString();
}

function updateScore(linesCleared) {
  const scoreToAdd = calculateScore(linesCleared);

  // Update the total score
  score += scoreToAdd;

  // Update the score display
  updateScoreDisplay();
}

function checkGameOver() {
  // Check if any cell in the top row is occupied
  for (let col = 0; col < 10; col++) {
    if (grid[col].classList.contains("occupied")) {
      gameOver = true;
      clearInterval(gameLoopInterval);
      // Additional actions to perform when the game is over
      handleGameOver(); // Call your game over handling function
      return; // Exit the loop and function
    }
  }
}

function gameLogic() {
  if (!gameOver && !isGamePaused) {
    // Move the current piece down if possible
    currentPiece.y++;

    if (checkCollision()) {
      // Move the piece back up since it's colliding
      currentPiece.y--;

      // Lock the piece and check for game over
      lockPiece();

      // Check if the locked piece reaches the top (game over condition)
      if (currentPiece.y <= 0) {
        gameOver = true;
        clearInterval(gameLoopInterval);
        // Additional actions for game over
        handleGameOver(); // Call your game over handling function
        return;
      } else {
        // Generate a new piece
        currentPiece = createPiece();

        // Check for game over immediately with the new piece
        if (checkCollision()) {
          gameOver = true;
          clearInterval(gameLoopInterval);
          // Additional actions for game over
          handleGameOver(); // Call your game over handling function
          return;
        }
      }

      // Update game board and render the piece
      updateGameBoard();
      renderPiece();
    } else {
      // Continue game logic
      checkLineClearing();
      checkGameOver();
      updateGameBoard();
      renderPiece(); // Render the piece after moving it down
    }
  }

  if (!gameOver && !isGamePaused) {
    requestAnimationFrame(gameLogic);
  }
}

let lastDropTime = 0;
const dropInterval = 1000;

function dropTetromino(timestamp) {
  if (!isGamePaused) {
    const elapsed = timestamp - lastDropTime;

    if (elapsed > dropInterval) {
      // Move the tetromino down
      moveDown();

      // Update last drop time
      lastDropTime = timestamp;

      // Check collision after moving down
      if (checkCollision()) {
        // Lock the piece and create a new one
        lockPiece();

        // Generate a new piece
        generateNewPieceIfPossible();

        // Check for game over
        if (checkCollision()) {
          gameOver = true;
          clearInterval(gameLoopInterval);
          // Additional actions for game over can be added here
          handleGameOver(); // Call your game over handling function
          return;
        } else {
          // Continue game logic
          checkLineClearing();
          checkGameOver();
          updateGameBoard();
          renderPiece(); // Render the new piece here
        }
      } else {
        // Continue game logic
        checkLineClearing();
        checkGameOver();
        updateGameBoard();
        renderPiece(); // Render the piece after moving it down
      }
    }
  }

  if (!gameOver) {
    requestAnimationFrame(dropTetromino);
  }
}

grid = createGrid();

const start = document.getElementById("start");
const pause = document.getElementById("pause");
const quit = document.getElementById("quit");
const restart = document.getElementById("restart");
function resetGame() {
  // Clear the game state
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      gameState[row][col] = 0;
    }
  }

  // Clear the visual grid
  grid.forEach((cell) => {
    cell.classList.remove("occupied");
    cell.style.backgroundColor = "black";
  });

  // Reset other game variables
  currentPiece = createPiece();
  gameOver = false;
  isGamePaused = false;
  score = 0;
  clearedLinesScore = 0;
  updateScoreDisplay();
  updateGameBoard();
}

function initializeGame() {
  // Clear the game state
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      gameState[row][col] = 0;
    }
  }

  // Clear the visual grid
  grid.forEach((cell) => {
    cell.classList.remove("occupied");
    cell.style.backgroundColor = "black";
  });

  // Reset other game variables
  currentPiece = createPiece();
  gameOver = false;
  isGamePaused = false;
  score = 0;
  clearedLinesScore = 0;
  updateScoreDisplay();
  updateGameBoard();
}

function quitGameBoard() {
  // Clear the game state
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      gameState[row][col] = 0;
    }
  }

  // Clear the visual grid
  grid.forEach((cell) => {
    cell.classList.remove("occupied");
    cell.style.backgroundColor = "black";
  });

  // Reset the score to zero
  score = 0;
  updateScoreDisplay();
  gameOver = true; // Set game over to true to prevent further game logic
  isGamePaused = false;
  clearedLinesScore = 0;
  updateGameBoard();

  // Clear any existing game loop interval
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
}

function startButton() {
  // Reset the game state
  resetGame();

  // Generate a new piece
  generateNewPieceIfPossible();

  // Update the score display
  updateScoreDisplay();

  // Start the game loop
  dropTetromino(performance.now());
}
function pauseButton() {
  if (!gameOver) {
    isGamePaused = !isGamePaused;

    if (isGamePaused) {
      // Game is paused, stop the game loop by not calling requestAnimationFrame
      isGameRunning = true;
    } else {
      // Game is resumed, start the game loop if not already running
      if (!isGameRunning) {
        isGameRunning = true;
        requestAnimationFrame(dropTetromino);
      }
    }
  }
}

function restartButton() {
  initializeGame();
}

function quitButton() {
  quitGameBoard();
}

start.addEventListener("click", startButton);
pause.addEventListener("click", pauseButton);
restart.addEventListener("click", restartButton);
quit.addEventListener("click", quitButton);
document.addEventListener("keydown", handleKeyPress);
updateGameBoard();
