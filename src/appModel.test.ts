import * as AppModel from "./appModel";
import { answerWords, candidateWords } from "./data";

describe("Game reducer", () => {
  test("Noop action", () => {
    expect(
      AppModel.gameReducer(
        AppModel.initialGameState,
        AppModel.createNoopAction()
      )
    ).toEqual(AppModel.initialGameState);
  });

  test("Start game with invalid word index", () => {
    expect(
      AppModel.gameReducer(
        AppModel.initialGameState,
        AppModel.createStartGameAction(-2)
      )
    ).toEqual(AppModel.initialGameState);

    expect(
      AppModel.gameReducer(
        AppModel.initialGameState,
        AppModel.createStartGameAction(answerWords.length)
      )
    ).toEqual(AppModel.initialGameState);
  });

  test("Start game with valid word index", () => {
    expect(
      AppModel.gameReducer(
        AppModel.initialGameState,
        AppModel.createStartGameAction(12)
      )
    ).toEqual({
      ...AppModel.initialGameState,
      answerWordIndex: 12
    });
  });

  test("Append letter to current guess starting from empty word", () => {
    expect(
      AppModel.gameReducer(
        AppModel.initialGameState,
        AppModel.createAppendLetterAction("t")
      )
    ).toEqual({
      ...AppModel.initialGameState,
      currentGuess: "t"
    });
  });

  test("Append letter to current guess with full word", () => {
    const currentState: AppModel.GameState = {
      ...AppModel.initialGameState,
      currentGuess: "cream"
    };

    expect(
      AppModel.gameReducer(currentState, AppModel.createAppendLetterAction("t"))
    ).toEqual(currentState);
  });

  test("Append letter to current guess after game already lost", () => {
    const currentState: AppModel.GameState = {
      ...AppModel.initialGameState,
      guesses: candidateWords.slice(0, AppModel.MaxGuesses)
    };

    expect(
      AppModel.gameReducer(currentState, AppModel.createAppendLetterAction("t"))
    ).toEqual(currentState);
  });
});

describe("Selector tests", () => {
  it("selectGameOver on initial state is false", () => {
    expect(AppModel.selectGameOver(AppModel.initialGameState)).toBe(false);
  });

  it("selectGameOver when last guess is the target word", () => {
    const currentState: AppModel.GameState = {
      ...AppModel.initialGameState,
      guesses: [candidateWords[0], candidateWords[1], answerWords[0]]
    };

    expect(AppModel.selectGameOver(currentState)).toBe(true);
  });

  it("selectGameOver when maximum guesses submitted", () => {
    const currentState: AppModel.GameState = {
      ...AppModel.initialGameState,
      guesses: candidateWords.slice(0, AppModel.MaxGuesses)
    };

    expect(AppModel.selectGameOver(currentState)).toBe(true);
  });
});
