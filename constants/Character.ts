import { Letter, LetterPathSvgs, LetterSvgs } from "./Letters";
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

export const getPathSvgModuleId = (char: Character): number | string => {
    if (isLetter(char)) {
        return LetterPathSvgs[char];
    } else {
        return 0;
        // return NumberSvgs[char];
    }
}

// 0 <-> 1
// x and y components
export const characterScaling: Record<Character, [number, number]> = {
    [Letter.KAGYI]: [0.9, 0.9],
    [Letter.KHAGWE]: [0.6, 0.6],
    [Letter.GANGE]: [1, 1],
    [Letter.GHAGYI]: [1, 1],
    [Letter.NGA]: [1, 1],
    [Letter.SALONE]: [1, 1],
    [Letter.SALEIN]: [1, 1],
    [Letter.ZAGWE]: [1, 1],
    [Letter.ZAMYINZWE]: [1, 1],
    [Letter.NYA]: [1, 1],
    [Letter.NNYA]: [1, 1],
    [Letter.TTA]: [1, 1],
    [Letter.TTHA]: [1, 1],
    [Letter.DDA]: [1, 1],
    [Letter.DDHA]: [1, 1],
    [Letter.NNA]: [1, 1],
    [Letter.TA]: [1, 1],
    [Letter.THA]: [1, 1],
    [Letter.DA]: [1, 1],
    [Letter.DHA]: [1, 1],
    [Letter.NA]: [1, 1],
    [Letter.PA]: [1, 1],
    [Letter.PHA]: [1, 1],
    [Letter.BA]: [1, 1],
    [Letter.BHA]: [1, 1],
    [Letter.MA]: [1, 1],
    [Letter.YA]: [1, 1],
    [Letter.RA]: [1, 1],
    [Letter.LA]: [1, 1],
    [Letter.WA]: [1, 1],
    [Letter.SA]: [1, 1],
    [Letter.HA]: [1, 1],
    [Letter.LLA]: [1, 1],
    [Letter.A]: [1, 1],
    [NumberChar.ZERO]: [1, 1],
    [NumberChar.ONE]: [1, 1],
    [NumberChar.TWO]: [1, 1],
    [NumberChar.THREE]: [1, 1],
    [NumberChar.FOUR]: [1, 1],
    [NumberChar.FIVE]: [1, 1],
    [NumberChar.SIX]: [1, 1],
    [NumberChar.SEVEN]: [1, 1],
    [NumberChar.EIGHT]: [1, 1],
    [NumberChar.NINE]: [1, 1],
};