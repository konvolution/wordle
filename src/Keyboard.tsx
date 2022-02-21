import * as React from "react";
import * as AppModel from "./appModel";
import { Key } from "./Key";
import { hintToClass } from "./utils";

export interface KeyboardProps {
  keyHints: AppModel.LetterHints;
  onPressKey: (key: string) => void;
}

const keyLayout = ["qwertyuiop", "asdfghjkl", "\rzxcvbnm\b"].map((row) =>
  row.split("")
);

export const Keyboard: React.FunctionComponent<KeyboardProps> = ({
  keyHints,
  onPressKey
}) => {
  return (
    <div className="Keyboard">
      {keyLayout.map((row, iRow) => (
        <div key={iRow} className="row">
          {row.map((char, iCol) => (
            <Key
              key={iCol}
              className={hintToClass(keyHints[char])}
              letter={char}
              onPress={() => onPressKey(char)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
