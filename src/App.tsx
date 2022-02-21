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

  const onPressKey = (key: string) => {
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
  };

  const onClickNewGame = () =>
    dispatch(
      AppModel.selectGameWon(gameState)
        ? AppModel.createNextGameAction()
        : AppModel.createResetGameAction()
    );

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
