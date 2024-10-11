/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Palette = [
  {
    name: "Licorice",
    hex: "1c110a",
    rgb: [28, 17, 10],
    cmyk: [0, 39, 64, 89],
    hsb: [23, 64, 11],
    hsl: [23, 47, 7],
    lab: [6, 4, 5],
  },
  {
    name: "Vanilla",
    hex: "e4d6a7",
    rgb: [228, 214, 167],
    cmyk: [0, 6, 27, 11],
    hsb: [46, 27, 89],
    hsl: [46, 53, 77],
    lab: [86, -2, 25],
  },
  {
    name: "Hunyadi yellow",
    hex: "e9b44c",
    rgb: [233, 180, 76],
    cmyk: [0, 23, 67, 9],
    hsb: [40, 67, 91],
    hsl: [40, 78, 61],
    lab: [76, 9, 59],
  },
  {
    name: "Rufous",
    hex: "9b2915",
    rgb: [155, 41, 21],
    cmyk: [0, 74, 86, 39],
    hsb: [9, 86, 61],
    hsl: [9, 76, 35],
    lab: [35, 46, 39],
  },
  {
    name: "Verdigris",
    hex: "50a2a7",
    rgb: [80, 162, 167],
    cmyk: [52, 3, 0, 35],
    hsb: [183, 52, 65],
    hsl: [183, 35, 48],
    lab: [62, -23, -10],
  },
];

export const Colors = {
    light: {
      text: `#${Palette[0].hex}`,
      background: `#${Palette[1].hex}`,
      primary: `#${Palette[2].hex}`,
      secondary: `#${Palette[3].hex}`,
      tertiary: `#${Palette[4].hex}`,
    },
  };
  