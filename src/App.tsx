import * as React from "react";
import * as AppModel from "./appModel";
import { Keyboard } from "./Keyboard";
import { WordGrid } from "./WordGrid";

import "./styles.css";
import { answerWords } from "./data";

function getInitialWord() {
  return Math.floor(Date.now() / 86400000) % answerWords.length;
}

export default function App() {
  const [gameState, dispatch] = React.useReducer(
    AppModel.gameReducer,
    undefined,
    () =>
      AppModel.gameReducer(
        AppModel.initialGameState,
        AppModel.createStartGameAction(getInitialWord())
      )
  );

  const keyHints = AppModel.calculateLetterHints(
    AppModel.selectGuesses(gameState),
    AppModel.selectTargetWord(gameState)
  );

  const onPressKey = React.useCallback((key: string) => {
    switch (key) {
      case "\r":
        dispatch(AppModel.createSubmitGuessAction());
        break;
      case "\b":
        dispatch(AppModel.createRemoveLetterAction());
        break;
      default:
        dispatch(AppModel.createAppendLetterAction(key));
        break;
    }
  }, []);

  const onClickNewGame = () =>
    dispatch(
      AppModel.selectGameWon(gameState)
        ? AppModel.createNextGameAction()
        : AppModel.createResetGameAction()
    );

  // Handle key press events at the document level
  React.useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      switch (ev.key) {
        case "Enter":
          onPressKey("\r");
          break;
        case "Backspace":
          onPressKey("\b");
          break;

        case "Escape":
          // Blur the focused element
          const activeElement = document.activeElement;
          if (activeElement !== null) {
            const focusedElement = activeElement as { blur?: () => void };
            focusedElement.blur?.();
          }

          break;
        default:
          onPressKey(ev.key.toLowerCase());
          break;
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPressKey]);

  return (
    <div className="App">
      <h1>Wordle</h1>
      <div style={{ position: "relative" }}>
        <WordGrid gameState={gameState} />
        {AppModel.selectGameOver(gameState) && (
          <div className="overlay">
            <button className="appbutton" onClick={onClickNewGame}>
              {AppModel.selectGameWon(gameState) ? "New game?" : "Try again?"}
            </button>
          </div>
        )}
      </div>
      <Keyboard keyHints={keyHints} onPressKey={onPressKey} />
    </div>
  );
}
