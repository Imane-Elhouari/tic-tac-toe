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

let circleTurn = false;
let gameActive = true;
let isAIMode = false;
let aiDifficulty = 'basic'; // 'basic', 'intelligent', or 'master'

function setActiveMode(buttonId) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(buttonId);
    if (btn) btn.classList.add('active');
}

// Mode selection buttons
document.getElementById('playerVsPlayer').addEventListener('click', () => {
    isAIMode = false;
    board.classList.remove('ai-mode', 'intelligent-ai-mode', 'master-ai-mode');
    setActiveMode('playerVsPlayer');
    startGame();
});

document.getElementById('playerVsBasicAI').addEventListener('click', () => {
    isAIMode = true;
    aiDifficulty = 'basic';
    board.classList.remove('intelligent-ai-mode', 'master-ai-mode');
    board.classList.add('ai-mode');
    setActiveMode('playerVsBasicAI');
    startGame();
});

document.getElementById('playerVsIntelligentAI').addEventListener('click', () => {
    isAIMode = true;
    aiDifficulty = 'intelligent';
    board.classList.remove('master-ai-mode');
    board.classList.add('ai-mode', 'intelligent-ai-mode');
    setActiveMode('playerVsIntelligentAI');
    startGame();
});

document.getElementById('playerVsMasterAI').addEventListener('click', () => {
    isAIMode = true;
    aiDifficulty = 'master';
    board.classList.remove('intelligent-ai-mode');
    board.classList.add('ai-mode', 'master-ai-mode');
    setActiveMode('playerVsMasterAI');
    startGame();
});

restartButton.addEventListener('click', startGame);

function startGame() {
    circleTurn = false;
    gameActive = true;
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winning-combination');
        cell.textContent = '';
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    statusMessage.textContent = "Player X's turn";
}

function handleClick(e) {
    // Prevent human clicks when game is over or when waiting for AI's move
    if (!gameActive || (isAIMode && circleTurn)) return;

    const cell = e.target;
    if (cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)) return;

    const currentClass = circleTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);

    if (checkWin(currentClass)) {
        endGame(false, currentClass);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();

        if (isAIMode && circleTurn) {
            triggerAIMove();
        }
    }
}

function triggerAIMove() {
    if (aiDifficulty === 'basic') {
        makeBasicAIMove();
    } else if (aiDifficulty === 'intelligent') {
        makeIntelligentAIMove();
    } else if (aiDifficulty === 'master') {
        makeMasterAIMove();
    }
}

// 1. Easy Bot: picks any available cell at random
function makeBasicAIMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    if (availableCells.length > 0) {
        setTimeout(() => {
            if (!gameActive) return;
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            executeAIMove(randomCell);
        }, 400);
    }
}

// 2. Smart Bot: heuristic strategy (win > block > take center > random)
function makeIntelligentAIMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    if (availableCells.length > 0) {
        const bestMove = findHeuristicMove();
        setTimeout(() => {
            if (!gameActive) return;
            executeAIMove(bestMove);
        }, 400);
    }
}

function findHeuristicMove() {
    const opponentClass = X_CLASS;
    const aiClass = O_CLASS;

    // Check if AI can win immediately
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
    }

    // Otherwise pick a random available cell
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

// 3. Master Bot: Minimax algorithm (optimal play, actively builds winning combinations & traps)
function makeMasterAIMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    if (availableCells.length > 0) {
        const boardState = getBoardState();
        const bestMove = minimax(boardState, 0, true);
        const bestCell = cells[bestMove.index];

        setTimeout(() => {
            if (!gameActive) return;
            executeAIMove(bestCell);
        }, 400);
    }
}

function executeAIMove(cell) {
    placeMark(cell, O_CLASS);

    if (checkWin(O_CLASS)) {
        endGame(false, O_CLASS);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
    }
}

function getBoardState() {
    return Array.from(cells).map(cell => {
        if (cell.classList.contains(X_CLASS)) return X_CLASS;
        if (cell.classList.contains(O_CLASS)) return O_CLASS;
        return null;
    });
}

function checkWinnerOnBoard(boardState, player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => boardState[index] === player);
    });
}

function getAvailableIndices(boardState) {
    const indices = [];
    boardState.forEach((val, idx) => {
        if (val === null) indices.push(idx);
    });
    return indices;
}

function minimax(boardState, depth, isMaximizing) {
    if (checkWinnerOnBoard(boardState, O_CLASS)) {
        return { score: 10 - depth };
    }
    if (checkWinnerOnBoard(boardState, X_CLASS)) {
        return { score: depth - 10 };
    }

    const availableMoves = getAvailableIndices(boardState);
    if (availableMoves.length === 0) {
        return { score: 0 };
    }

    if (isMaximizing) {
        let maxScore = -Infinity;
        let bestIndex = availableMoves[0];

        for (const move of availableMoves) {
            boardState[move] = O_CLASS;
            const result = minimax(boardState, depth + 1, false);
            boardState[move] = null;

            if (result.score > maxScore) {
                maxScore = result.score;
                bestIndex = move;
            }
        }
        return { score: maxScore, index: bestIndex };
    } else {
        let minScore = Infinity;
        let bestIndex = availableMoves[0];

        for (const move of availableMoves) {
            boardState[move] = X_CLASS;
            const result = minimax(boardState, depth + 1, true);
            boardState[move] = null;

            if (result.score < minScore) {
                minScore = result.score;
                bestIndex = move;
            }
        }
        return { score: minScore, index: bestIndex };
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
    cell.textContent = currentClass.toUpperCase();
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

function highlightWinningCombination(winningClass) {
    const winningCombination = WINNING_COMBINATIONS.find(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(winningClass);
        });
    });

    if (winningCombination) {
        winningCombination.forEach(index => {
            cells[index].classList.add('winning-combination');
        });
    }
}

function endGame(draw, winningClass) {
    gameActive = false;
    if (draw) {
        statusMessage.textContent = "Draw!";
    } else {
        statusMessage.textContent = `${winningClass === O_CLASS ? "Player O" : "Player X"} Wins!`;
        highlightWinningCombination(winningClass);
    }
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

// Initial setup
setActiveMode('playerVsPlayer');
startGame();
