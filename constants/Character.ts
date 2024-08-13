import { Letter, LetterSvgs } from "./Letters";
import { NumberChar, NumberSvgs } from "./Numbers";

export type Character = NumberChar | Letter;

export const isLetter = (char: Character): char is Letter => {
    return Object.values(Letter).includes(char as Letter);
}

export const isNumber = (char: Character): char is NumberChar => {
    return Object.values(NumberChar).includes(char as NumberChar);
}

export const getSvgModuleId = (char: Character): number | string => {
    if (isLetter(char)) {
        return LetterSvgs[char];
    } else {
        return NumberSvgs[char];
    }
}