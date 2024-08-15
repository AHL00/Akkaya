

export enum NumberChar {
    ZERO = "၀",
    ONE = "၁",
    TWO = "၂",
    THREE = "၃",
    FOUR = "၄",
    FIVE = "၅",
    SIX = "၆",
    SEVEN = "၇",
    EIGHT = "၈",
    NINE = "၉",
}

/// number | string refers to the module id of the svg file
export const NumberSvgs: Record<NumberChar, number | string> = {
    [NumberChar.ZERO]: require('@/assets/chars/zero.svg'),
    [NumberChar.ONE]: require('@/assets/chars/one.svg'),
    [NumberChar.TWO]: require('@/assets/chars/two.svg'),
    [NumberChar.THREE]: require('@/assets/chars/three.svg'),
    [NumberChar.FOUR]: require('@/assets/chars/four.svg'),
    [NumberChar.FIVE]: require('@/assets/chars/five.svg'),
    [NumberChar.SIX]: require('@/assets/chars/six.svg'),
    [NumberChar.SEVEN]: require('@/assets/chars/seven.svg'),
    [NumberChar.EIGHT]: require('@/assets/chars/eight.svg'),
    [NumberChar.NINE]: require('@/assets/chars/nine.svg'),
}

export const NumberPathSvgs: Record<NumberChar, number | string> = {
    [NumberChar.ZERO]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.ONE]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.TWO]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.THREE]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.FOUR]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.FIVE]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.SIX]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.SEVEN]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.EIGHT]: require('@/assets/chars/paths/a.svg'),
    [NumberChar.NINE]: require('@/assets/chars/paths/a.svg'),
}