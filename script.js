// Create the board and initialize variables
const board = document.getElementById('gameBoard');
const statusText = document.getElementById('gameStatus');
const resetButton = document.getElementById('resetGame');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const themeSelector = document.getElementById('themeSelector');
const toggleAI = document.getElementById('toggleAI');

let gameActive = true;
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0 };
let isAIEnabled = false;

const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Howler.js for sound effects
const clickSound = new Howl({
    src: ['assets/cheering.mp3']
});

// Set default theme to 'neon' when the page loads
document.body.classList.add('neon');
themeSelector.value = 'neon';

// Switch themes
themeSelector.addEventListener('change', (e) => {
    // Remove all theme classes
    document.body.classList.remove('dark', 'light', 'neon');
    
    // Add the selected theme class
    document.body.classList.add(e.target.value);
});

// Create the board
function createBoard() {
    board.innerHTML = '';
    gameState.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.index = index;
        cellElement.textContent = cell;
        cellElement.addEventListener('click', handleCellClick);
        board.appendChild(cellElement);
    });
}

// Handle cell click
function handleCellClick(event) {
    const cellIndex = event.target.dataset.index;
    if (!gameActive || gameState[cellIndex] !== '') return;

    gameState[cellIndex] = currentPlayer;
    event.target.textContent = currentPlayer;
    event.target.classList.add('taken');

    checkResult();

    if (gameActive) {
        if (isAIEnabled && currentPlayer === 'X') {
            switchPlayer(); // Switch to O's turn for AI
            aiMove(); // Make AI move for O
        } else {
            switchPlayer(); // Switch between two players
        }
    }
}

// Switch player turn
function switchPlayer() {
    if (isAIEnabled) {
        // In Play with AI mode, only switch after AI's move
        if (currentPlayer === 'X') {
            currentPlayer = 'O';
            statusText.textContent = "AI's Turn";
        } else {
            currentPlayer = 'X';
            statusText.textContent = `Player ${currentPlayer}'s Turn`;
        }
    } else {
        // In Play with Friend mode, alternate turns between X and O
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

// Check game result
function checkResult() {
    let winner = null;
    winningPatterns.forEach(pattern => {
        const [a, b, c] = pattern;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            winner = gameState[a];
        }
    });

    if (winner) {
        gameActive = false;
        scores[winner]++;
        updateScore();
        clickSound.play(); // Play the cheering sound when someone wins
        triggerWinEffects(winner);
        statusText.textContent = `Player ${winner} Wins!`;
    } else if (gameState.every(cell => cell !== '')) {
        gameActive = false;
        statusText.textContent = 'It\'s a Draw!';
    }
}

// Update score
function updateScore() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

// Reset the game
function resetGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    statusText.textContent = 'Player X\'s Turn';
    createBoard();
}

// Minimax AI algorithm
function minimax(state, depth, isMaximizingPlayer) {
    const winner = checkWinner(state);
    if (winner === 'X') return -10 + depth;
    if (winner === 'O') return 10 - depth;
    if (state.every(cell => cell !== '')) return 0; // Draw

    const availableMoves = getAvailableMoves(state);
    let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

    availableMoves.forEach(move => {
        const newState = [...state];
        newState[move] = isMaximizingPlayer ? 'O' : 'X';
        const score = minimax(newState, depth + 1, !isMaximizingPlayer);
        bestScore = isMaximizingPlayer
            ? Math.max(bestScore, score)
            : Math.min(bestScore, score);
    });

    return bestScore;
}

// Get available moves (empty cells)
function getAvailableMoves(state) {
    return state.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
}

// AI Move using minimax
function aiMove() {
    if (!gameActive) return;

    const availableMoves = getAvailableMoves(gameState);
    let bestMove = null;
    let bestScore = -Infinity;

    availableMoves.forEach(move => {
        const newState = [...gameState];
        newState[move] = 'O';
        const moveScore = minimax(newState, 0, false);
        if (moveScore > bestScore) {
            bestScore = moveScore;
            bestMove = move;
        }
    });

    gameState[bestMove] = 'O';
    const cellElement = board.children[bestMove];
    cellElement.textContent = 'O';
    cellElement.classList.add('taken');
    checkResult();

    // Only switch to "X" after AI move is completed
    if (gameActive) {
        switchPlayer();
    }
}

// Check winner
function checkWinner(state) {
    for (let pattern of winningPatterns) {
        const [a, b, c] = pattern;
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a];
        }
    }
    return null;
}

// Trigger confetti and win blast
function triggerWinEffects(winner) {
    // Confetti
    confetti();

    // Win blast effect
    const blastText = document.createElement('div');
    blastText.classList.add('win-blast');
    blastText.textContent = `Player ${winner} Wins!`;
    document.body.appendChild(blastText);
    setTimeout(() => blastText.remove(), 3000);
}

// Event listeners
resetButton.addEventListener('click', resetGame);
toggleAI.addEventListener('click', () => {
    isAIEnabled = !isAIEnabled;
    toggleAI.textContent = isAIEnabled ? 'Play with Friend' : 'Play with AI';
    resetGame();
});

createBoard();
