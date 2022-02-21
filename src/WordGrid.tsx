import * as React from "react";
import * as AppModel from "./appModel";
import { hintToClass } from "./utils";

export interface WordGridProps {
  gameState: AppModel.GameState;
}

interface Cell {
  hint?: AppModel.Hint;
  letter?: string;
  invalidGuess?: boolean;
  wave?: boolean;
}

const emptyRow: Cell[] = Array(AppModel.WordLength).fill({});

export const WordGrid: React.FunctionComponent<WordGridProps> = ({
  gameState
}) => {
  const targetWord = AppModel.selectTargetWord(gameState);
  const guesses = AppModel.selectGuesses(gameState);
  const currentGuess = AppModel.selectCurrentGuess(gameState);
  const guessMissingLetters = AppModel.WordLength - currentGuess.length;

  const invalidGuess =
    currentGuess.length === AppModel.WordLength &&
    !AppModel.isValidWord(currentGuess);

  const wave = AppModel.selectGameWon(gameState);

  const grid: Cell[][] = [
    ...guesses.map((guess, iGuess) =>
      AppModel.calculateHints(guess, targetWord).map((hint, index) => ({
        hint,
        letter: guess[index],
        wave: wave && iGuess === guesses.length - 1
      }))
    ),
    [
      ...currentGuess.split("").map((letter) => ({ letter, invalidGuess })),
      ...Array(guessMissingLetters).fill({})
    ],
    ...Array(AppModel.MaxGuesses).fill(emptyRow)
  ].slice(0, AppModel.MaxGuesses);

  return (
    <div className="WordGrid">
      {grid.map((row, iRow) => (
        <div key={iRow} className="row">
          {row.map((cell, iCol) => (
            <div
              key={iCol}
              className={[
                "cell",
                cell.invalidGuess ? "invalid" : hintToClass(cell.hint),
                cell.letter && "filled",
                cell.wave && "wave",
                cell.wave && iCol && `delay${iCol}N`
              ]
                .filter((i) => i)
                .join(" ")}
            >
              {cell.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
