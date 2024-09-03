const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const statusMessage = document.getElementById('statusMessage');
const restartButton = document.getElementById('restartButton');

const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let circleTurn;
let gameActive = true;
let isAIMode = false;
let aiDifficulty = 'basic';  

document.getElementById('playerVsPlayer').addEventListener('click', () => {
    isAIMode = false;
    board.classList.remove('ai-mode'); 
    startGame();
});

document.getElementById('playerVsBasicAI').addEventListener('click', () => {
    isAIMode = true;
    aiDifficulty = 'basic'; // Set AI difficulty to basic
    board.classList.add('ai-mode');
    startGame();
});

document.getElementById('playerVsIntelligentAI').addEventListener('click', () => {
    isAIMode = true;
    aiDifficulty = 'intelligent'; // Set AI difficulty to intelligent
    board.classList.add('ai-mode');
    startGame();
});

startGame();

restartButton.addEventListener('click', startGame);

function highlightWinningCombination() {
    const winningCombination = WINNING_COMBINATIONS.find(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(circleTurn ? O_CLASS : X_CLASS);
        });
    });

    if (winningCombination) {
        winningCombination.forEach(index => {
            cells[index].classList.add('winning-combination');
        });
    }
}


function startGame() {
    circleTurn = false;
    gameActive = true;
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winning-combination');
        cell.textContent = ''; // Clear previous marks
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    statusMessage.textContent = "Player X's turn";
}


function makeBasicAIMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    if (availableCells.length > 0) {
        setTimeout(() => {
        const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        placeMark(randomCell, O_CLASS);

        if (checkWin(O_CLASS)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            setBoardHoverClass();
        }
    }, 400);
    }
}

function makeIntelligentAIMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    if (availableCells.length > 0) {
        // Simple intelligent AI: Block winning moves or make strategic moves
        const bestMove = findBestMove();
        setTimeout(() => {
            placeMark(bestMove, O_CLASS);

            if (checkWin(O_CLASS)) {
                endGame(false);
            } else if (isDraw()) {
                endGame(true);
            } else {
                swapTurns();
                setBoardHoverClass();
            }
        }, 400); // 1 second delay
    }
}

function findBestMove() {
    // Implement a simple AI strategy here
    // Example strategy: Block opponent's winning move or take the center if available
    const opponentClass = X_CLASS;
    const aiClass = O_CLASS;

    // Check if AI can win
    for (const combination of WINNING_COMBINATIONS) {
        const cellsToCheck = combination.map(index => cells[index]);
        const aiCells = cellsToCheck.filter(cell => cell.classList.contains(aiClass));
        const emptyCells = cellsToCheck.filter(cell => !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS));

        if (aiCells.length === 2 && emptyCells.length === 1) {
            return emptyCells[0];
        }
    }

    // Block opponent's winning move
    for (const combination of WINNING_COMBINATIONS) {
        const cellsToCheck = combination.map(index => cells[index]);
        const opponentCells = cellsToCheck.filter(cell => cell.classList.contains(opponentClass));
        const emptyCells = cellsToCheck.filter(cell => !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS));

        if (opponentCells.length === 2 && emptyCells.length === 1) {
            return emptyCells[0];
        }
    }

    // Take the center if available
    const centerCell = cells[4];
    if (!centerCell.classList.contains(X_CLASS) && !centerCell.classList.contains(O_CLASS)) {
        return centerCell;
    }else makeBasicAIMove()

    // Otherwise, take a random move
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}


function handleClick(e) {
    if (!gameActive) return; 

    const cell = e.target;
    const currentClass = circleTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();

        if (isAIMode && circleTurn) {
            if (aiDifficulty === 'basic') {

                makeBasicAIMove(); // Basic AI move

            } else if (aiDifficulty === 'intelligent') {

                makeIntelligentAIMove(); // Intelligent AI move
            }

        } 
    }
}

function endGame(draw) {
    gameActive = false; 
    if (draw) {
        statusMessage.textContent = "Draw!";
    } else {
        statusMessage.textContent = `${circleTurn ? "Player O" : "Player X"} Wins!`;
    }
    highlightWinningCombination() 
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
    cell.textContent = currentClass.toUpperCase(); // Display X or O
}

function swapTurns() {
    circleTurn = !circleTurn;
    statusMessage.textContent = `Player ${circleTurn ? "O" : "X"}'s turn`;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    if (circleTurn) {
        board.classList.add(O_CLASS);
    } else {
        board.classList.add(X_CLASS);
    }
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}
