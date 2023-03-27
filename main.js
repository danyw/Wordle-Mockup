const keyboard = document.querySelectorAll("[data-key]");
const keyboardContainer = document.querySelector(".keyboard-container");
const userGridContainer = document.querySelector(".user-grid-container");
const usedKeys = document.querySelector(".key");
const word = 5;
const generatedWord = "";
const dictionary = [];
require('dotenv').config();

function GenerateWordAPI() {
  // API_KEY = process.env.GenerateWordAPI;
  const API_Generate = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": process.env.GENERATE_HOST,
    },
  };

  fetch("https://random-words5.p.rapidapi.com/getRandom?wordLength=5", API_Generate)
    .then((response) => response.json())
    .then((response) => {
      generatedWord = response.toUpperCase();
      console.log(generatedWord);
    })
    .catch((err) => console.error(err));
}
async function dictionaryAPI(userWord) {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.API_KEY,
      'X-RapidAPI-Host': process.envDICTIONARY_HOST
    }
  };
  
  const response = await fetch(`https://twinword-word-graph-dictionary.p.rapidapi.com/association/?entry=${userWord}`, options)
  const jsonResponse = await response.json();
  return jsonResponse.result_code === "200";
    
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    letterAdd(e.target.dataset.key);
  } else if (e.target.matches("[data-enter]")) {
    submitWord();
  } else if (e.target.matches("[data-backspace]")) {
    backspaceLastKey();
  }
}

function handleKeyDown(e) {
  if (e.key === "Enter") {
    submitWord();
  } else if (e.key === "Backspace") {
    backspaceLastKey();
  } else if (e.key.match(/^[a-z]$/) || e.key.match(/^[A-Z]$/)) {
    letterAdd(e.key);
  }
}

function letterAdd(key) {
  const currentCells = userGridContainer.querySelectorAll('[data-state="current"]');
  if (currentCells.length < word) {
    const nextCell = userGridContainer.querySelector(":not([data-letter])");
    nextCell.dataset.letter = key.toLowerCase();
    nextCell.textContent = key;
    nextCell.dataset.state = "current";
  }
}

userGridContainer.addEventListener("animationend", (e) => {
  if (e.target.matches("[data-state='current']")) {
    e.target.classList.remove("animate"); // Remove the "animate" class
  }
});

function backspaceLastKey() {
  const currentCells = userGridContainer.querySelectorAll('[data-state="current"]');
  if (currentCells.length > 0) {
    const lastCell = currentCells[currentCells.length - 1];
    lastCell.textContent = "";
    delete lastCell.dataset.letter;
    delete lastCell.dataset.state;
  }
}

function submitWord() {
  const currentCells = userGridContainer.querySelectorAll('[data-state="current"]');
  if (currentCells.length === word) {
    let userWord = userLettersToUserWord(currentCells);
    checkForMatch(userWord);

  } else {
    alert("Word must be 5 letters long");
  }
}

function userLettersToUserWord(currentCells) {
  const userLetters = Array.from(currentCells).map((cell) => cell.dataset.letter);
  const userWord = userLetters.join("").toUpperCase();
  console.log(userWord);
  return userWord;
}

async function checkForMatch(userWord) {
  try {
  const isWordInDictionary = await dictionaryAPI(userWord);
  console.log(isWordInDictionary);
  // if (!dictionary.includes(userWord)) {
  //   alert("Word not found in dictionary");
  //   return;
  // }
  if (!isWordInDictionary) {
    alert("Word not found in dictionary");
    return;
  }

  if (generatedWord === userWord) {
    winingRow();

    // stopGame();
  } else {
    checkString(generatedWord, userWord);
  }
} catch (error) {
  console.log(error);
}
}

function winingRow() {
  const userGridContainer = document.querySelector(".user-grid-container");
  currentCells = userGridContainer.querySelectorAll('[data-state="current"]');
  currentCellsArr = [...currentCells];

  const animationDuration = 500;

  currentCellsArr.forEach((element, index) => {
    setTimeout(() => {
      element.setAttribute("data-state", "green");
      element.classList.add("animate");
    }, index * animationDuration);
  });
}

function checkString(generatedWord, userWord) {
  let userLetters = [...userWord];
  let generatedLetters = [...generatedWord];

  let keyboardArr = [...keyboard];

  currentCells = userGridContainer.querySelectorAll('[data-state="current"]');
  currentCellsArr = [...currentCells];

  // look for matches
  for (let i = 0; i < userLetters.length; i++) {
    if (userLetters[i] === generatedLetters[i]) {
      cellTransitionAnimation(currentCells, i);
      generatedLetters[i] = "green";
      currentCellsArr[i].setAttribute("data-state", "green");
      currentCellsArr[i].classList.add("animate");
      setTimeout(() => currentCellsArr.length * animationDuration);
      keyboardLettersState(userLetters[i], "green");
    }
  }
  // look for misplaced letters
  for (let i = 0; i < userLetters.length; i++) {
    if (generatedLetters[i] !== "green") {
      let index = generatedLetters.indexOf(userLetters[i]);
      currentCellsArr[i].classList.add("animate");
      if (index !== -1) {
        currentCellsArr[i].setAttribute("data-state", "yellow");
        generatedLetters[index] = "yellow";
        currentCellsArr[i].classList.add("animate");
        setTimeout(() => currentCellsArr.length * animationDuration);
        keyboardLettersState(userLetters[i], "yellow");
      } else {
        currentCellsArr[i].setAttribute("data-state", "gray");
        keyboardLettersState(userLetters[i], "gray");
        currentCellsArr[i].classList.add("animate");
        setTimeout(() => currentCellsArr.length * animationDuration);
      }
    }
  }
}

function cellTransitionAnimation(currentCells, i) {
  currentCells[i].addEventListener("animationiteration", (event) => {
    if (event.animation.currentTime >= event.animation.duration / 2) {
      console.log("animation reached 50%");
    }
  });
}

function keyboardLettersState(letter, state) {
  const keyboardLetter = keyboardContainer.querySelector(`[data-key="${letter}"]`);
  if (keyboardLetter.dataset.state !== "green") {
    keyboardLetter.setAttribute("data-state", state);
  }
}

function gameStart() {
  GenerateWordAPI();
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyDown);
}

//* Transitions and animations

userGridContainer.addEventListener("transitionend", (e) => {
  if (e.animationName === "letter-enter") {
  }
});

gameStart();
