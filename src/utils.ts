import * as AppModel from "./appModel";

const _hintToClass: Record<AppModel.Hint, string> = {
  [AppModel.Hint.CorrectPosition]: "match-position",
  [AppModel.Hint.WrongPosition]: "present",
  [AppModel.Hint.WrongLetter]: "absent"
};

export function hintToClass(hint?: AppModel.Hint): string | undefined {
  return hint ? _hintToClass[hint] : undefined;
}
