import { answerWords, candidateWords } from "./data";

export const WordLength = 5;
export const MaxGuesses = 6;

export interface GameState {
  // Words previously guessed
  guesses: string[];

  // State of current guess
  currentGuess: string;

  // Answer word
  answerWordIndex: number;
}

export enum ActionType {
  Noop = "Noop", // Do nothing
  AppendLetter = "AppendLetter", // Append letter to current guess
  RemoveLetter = "RemoveLetter", // Remove letter from current guess
  SubmitGuess = "SubmitGuess", // Submit guess (ENTER) - current guess must be a complete word
  NextGame = "NextGame", // Advance to next game
  ResetGame = "ResetGame", // Reset to start of current game
  StartGame = "StartGame" // Starts a new game
}

export enum AnimationStateType {
  Idle,
  BadGuess,
  PopNewLetter,
  RevealHint
}

export interface AnimationState {
  type: AnimationStateType;
}

//#region Action types

export interface ActionBase {
  type: ActionType;
}

export interface ActionAppendLetter extends ActionBase {
  type: ActionType.AppendLetter;
  letter: string; // Single character
}

export interface ActionRemoveLetter extends ActionBase {
  type: ActionType.RemoveLetter;
}

export interface ActionSubmitGuess extends ActionBase {
  type: ActionType.SubmitGuess;
}

export interface ActionStartGame extends ActionBase {
  type: ActionType.StartGame;
  answerWordIndex: number;
}

export interface ActionNextGame extends ActionBase {
  type: ActionType.NextGame;
}

export interface ActionResetGame extends ActionBase {
  type: ActionType.ResetGame;
}

export interface ActionNoop extends ActionBase {
  type: ActionType.Noop;
}

//#endregion

export type Action =
  | ActionAppendLetter
  | ActionRemoveLetter
  | ActionSubmitGuess
  | ActionStartGame
  | ActionNextGame
  | ActionResetGame
  | ActionNoop;

//#region Action creators

export function createAppendLetterAction(letter: string): ActionAppendLetter {
  return {
    type: ActionType.AppendLetter,
    letter
  };
}

export function createRemoveLetterAction(): ActionRemoveLetter {
  return {
    type: ActionType.RemoveLetter
  };
}

export function createSubmitGuessAction(): ActionSubmitGuess {
  return {
    type: ActionType.SubmitGuess
  };
}

export function createStartGameAction(
  answerWordIndex: number
): ActionStartGame {
  return {
    type: ActionType.StartGame,
    answerWordIndex
  };
}

export function createNextGameAction(): ActionNextGame {
  return {
    type: ActionType.NextGame
  };
}

export function createResetGameAction(): ActionResetGame {
  return {
    type: ActionType.ResetGame
  };
}

export function createNoopAction(): ActionNoop {
  return {
    type: ActionType.Noop
  };
}

//#endregion

export enum Hint {
  /*     */ WrongLetter = "-", // Letter is not in word
  /*   */ WrongPosition = "~", // Letter is in word, but not in correct position
  /* */ CorrectPosition = "=" // Letter is in word and in correct position
}

// Calculate which of the letters guessed are present in the target word, and
// whether or not they're in the correct position
export function calculateHints(guess: string, targetWord: string): Hint[] {
  // Convert target word to an array of letters
  const target = targetWord.split("");

  // Convert guess into an array of letters. Each letter will be converted to
  // a hint (=, ~, or =)
  const hints = guess.split("");

  // Find all letters in the correct position
  hints.forEach((letterGuess, index) => {
    if (target[index] === letterGuess) {
      // Mark the hint as "="
      hints[index] = "=";

      // Mark target letter as 'consumed'
      target[index] = "-";
    }
  });

  // Find all letters present but in the wrong position
  hints.forEach((letterGuess, index) => {
    // Skip letter if it's already been converted to a hint (i.e. letter is in correct position)
    if (letterGuess === "=") {
      return;
    }

    // Try and find guessed letter in target word
    const targetIndex = target.indexOf(letterGuess);

    if (targetIndex === -1) {
      // Letter not found. Mark hint
      hints[index] = "-";
    } else {
      // Letter is found. Mark hint, and 'consume' target letter
      hints[index] = "~";
      target[targetIndex] = "-";
    }
  });

  return hints as Hint[];
}

export interface LetterHints {
  [letter: string]: Hint;
}

// Calculate the correct hint for every letter on the keyboard.
// All letters that appear in any guess are marked with a hint on the keyboard. The correct
// hint is determined as follows:
//  CorrectPosition => letter is in the correct position in the target word in any of the guesses
//  WrongPosition   => letter is in the target word
//  WrongLetter     => letter does not appear in the target word
export function calculateLetterHints(
  guesses: string[],
  targetWord: string
): LetterHints {
  const letterHints: LetterHints = {};

  for (const guess of guesses) {
    guess.split("").forEach((letter, index) => {
      if (targetWord[index] === letter) {
        letterHints[letter] = Hint.CorrectPosition;
      } else if (targetWord.indexOf(letter) !== -1) {
        if (letterHints[letter] !== Hint.CorrectPosition) {
          letterHints[letter] = Hint.WrongPosition;
        }
      } else {
        letterHints[letter] = Hint.WrongLetter;
      }
    });
  }

  return letterHints;
}

export function selectTargetWord(state: GameState): string {
  return answerWords[state.answerWordIndex];
}

export function selectGuesses(state: GameState): string[] {
  return state.guesses;
}

export function selectCurrentGuess(state: GameState): string {
  return state.currentGuess;
}

// Game is finished if maximum guesses or last guess is correct word
export function selectGameOver(state: GameState): boolean {
  return (
    state.guesses.length === MaxGuesses ||
    state.guesses[state.guesses.length - 1] === selectTargetWord(state)
  );
}

export function selectGameWon(state: GameState): boolean {
  return (
    selectGameOver(state) &&
    state.guesses[state.guesses.length - 1] === selectTargetWord(state)
  );
}

export function isValidWord(word: string): boolean {
  if (word.length !== WordLength) {
    return false;
  }

  if (answerWords.indexOf(word) !== -1) {
    return true;
  }

  return candidateWords.indexOf(word) !== -1;
}

export const initialGameState: GameState = {
  guesses: [],
  currentGuess: "",
  answerWordIndex: 0
};

export function gameReducer(state: GameState, action: Action): GameState {
  // Actions permitted in any state
  switch (action.type) {
    case ActionType.StartGame: {
      if (
        action.answerWordIndex < 0 ||
        action.answerWordIndex >= answerWords.length
      ) {
        return state;
      }
      return {
        ...initialGameState,
        answerWordIndex: action.answerWordIndex
      };
    }

    case ActionType.ResetGame:
      return {
        ...initialGameState,
        answerWordIndex: state.answerWordIndex
      };

    case ActionType.NextGame:
      return {
        ...initialGameState,
        answerWordIndex: (state.answerWordIndex + 1) % answerWords.length
      };
  }

  if (selectGameOver(state)) {
    return state;
  }

  // Actions only permitted is game is not over

  switch (action.type) {
    case ActionType.AppendLetter: {
      if (
        state.currentGuess.length < WordLength &&
        action.letter.length === 1 &&
        action.letter >= "a" &&
        action.letter <= "z"
      ) {
        return {
          ...state,
          currentGuess: state.currentGuess + action.letter
        };
      }
      break;
    }

    case ActionType.RemoveLetter: {
      if (state.currentGuess.length > 0) {
        return {
          ...state,
          currentGuess: state.currentGuess.slice(0, -1)
        };
      }
      break;
    }

    case ActionType.SubmitGuess: {
      if (isValidWord(state.currentGuess)) {
        return {
          ...state,
          currentGuess: "",
          guesses: [...state.guesses, state.currentGuess]
        };
      }

      break;
    }
  }

  return state;
}
