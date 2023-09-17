// Function to shuffle an array in place
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Load the HSK data from hsk.json
let hskData = [];
let selectedHskData = [];

// Function to fetch and load HSK data from hsk.json
async function loadHskData() {
    try {
        const response = await fetch('hsk.json'); // Adjust the path if needed
        if (!response.ok) {
            throw new Error('Failed to load HSK data.');
        }
        hskData = await response.json();
    } catch (error) {
        console.error(error);
    }
}

let selectedLevel = 1;
let numCards = 10; // Default to 10 cards
let gameMode = "Guess Pinyin";
let currentIndex = 0;
let totalGuesses = 0;
let correctGuesses = 0;
let showTranslations = false;
let sessionStartTime;

function setButtonActive(buttonGroup, selectedButton) {
    buttonGroup.forEach(button => {
        button.classList.remove('active');
    });
    selectedButton.classList.add('active');
}

document.getElementById('level-buttons').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        selectedLevel = parseInt(e.target.getAttribute('data-level'));
        setButtonActive(document.querySelectorAll('#level-buttons button'), e.target);
    }
});

document.getElementById('num-cards-buttons').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        numCards = parseInt(e.target.getAttribute('data-num-cards'));
        setButtonActive(document.querySelectorAll('#num-cards-buttons button'), e.target);
    }
});

document.getElementById('mode-buttons').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        gameMode = e.target.getAttribute('data-mode');
        setButtonActive(document.querySelectorAll('#mode-buttons button'), e.target);
    }
});

document.getElementById('start').addEventListener('click', () => {
    startGame();
});

function startGame() {
    loadHskData();
    selectedHskData = hskData.filter(item => item.level === selectedLevel);
    shuffleArray(selectedHskData);
    selectedHskData = selectedHskData.slice(0, numCards); // Limit the number of cards
    currentIndex = 0; // Reset the current index

    if (selectedHskData.length > 0) {
        document.getElementById('level-buttons').style.display = 'none';
        document.getElementById('num-cards-buttons').style.display = 'none';
        document.getElementById('mode-buttons').style.display = 'none';
        document.getElementById('start').style.display = 'none';

        document.getElementById('game-container').style.display = 'block';
        sessionStartTime = new Date();
        displayFlashcard(currentIndex);
    } else {
        alert('No flashcards available for the selected level and number of cards.');
    }
}

function displayFlashcard(index) {
    if (selectedHskData.length > index) {
        const flashcard = selectedHskData[index];
        document.querySelector('.hanzi').textContent = flashcard.hanzi;
        document.querySelector('.pinyin').textContent = '';
        document.querySelector('.translations').textContent = '';

        if (gameMode === "Guess Character") {
            const characters = [flashcard.hanzi, ...getRandomCharactersFromLevel(selectedLevel, 5)];
            shuffleArray(characters);
            document.querySelector('.translations').innerHTML = characters.map(char => `<button>${char}</button>`).join('');
            document.querySelectorAll('.translations button').forEach(button => {
                button.addEventListener('click', () => {
                    handleUserInput(button.textContent);
                });
            });
        }
    } else {
        endSession();
    }
}

document.getElementById('hint').addEventListener('click', () => {
    if (!showTranslations) {
        showTranslations = true;
        setTimeout(() => {
            showTranslations = false;
            document.querySelector('.translations').textContent = '';
        }, 5000);
        
        if (selectedHskData.length > currentIndex) {
            const flashcard = selectedHskData[currentIndex];
            if (gameMode === "Guess Pinyin") {
                document.querySelector('.translations').textContent = flashcard.translations.join(', ');
            } else if (gameMode === "Guess Character") {
                document.querySelector('.translations').textContent = flashcard.translations.join(', ');
            }
        }
    }
});

document.getElementById('check').addEventListener('click', () => {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput !== "") {
        handleUserInput(userInput);
    }
});

document.getElementById('skip').addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < selectedHskData.length) {
        displayFlashcard(currentIndex);
    } else {
        endSession();
    }
});

function handleUserInput(userInput) {
    const flashcard = selectedHskData[currentIndex];
    if (gameMode === "Guess Pinyin") {
        if (userInput.toLowerCase() === flashcard.pinyin.toLowerCase()) {
            alert("Ok?");
            correctGuesses++;
            currentIndex++;
            if (currentIndex < selectedHskData.length) {
                displayFlashcard(currentIndex);
            } else {
                endSession();
            }
        } else {
            alert("Try again");
        }
    } else if (gameMode === "Guess Character") {
        if (userInput === flashcard.hanzi) {
            alert("Ok?");
            correctGuesses++;
            currentIndex++;
            if (currentIndex < selectedHskData.length) {
                displayFlashcard(currentIndex);
            } else {
                endSession();
            }
        } else {
            alert("Try again");
        }
    }
    
    totalGuesses++;
}

function endSession() {
    document.getElementById('game-container').style.display = 'none';
    const sessionDuration = new Date() - sessionStartTime;
    const accuracy = ((correctGuesses / totalGuesses) * 100).toFixed(2);

    alert(`Session Ended\nTime Trained: ${Math.floor(sessionDuration / 1000)} seconds\nAccuracy: ${accuracy}%`);
}

window.addEventListener('load', () => {
    document.getElementById('start').removeAttribute('disabled');
});
