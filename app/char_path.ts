export type PathCheckpoint = { x: number; y: number; radius: number };
export type Stroke = PathCheckpoint[];
export type CharacterPath = Stroke[];

const { parse } = require('svgson')

// NOTE: Path SVGs are expected to be in the format:
// <svg>
//  ellipse
//  ellipse
//  ellipse
//  ellipse
//  ellipse
//  path
//  ellipse
//  ellipse
//  ellipse
//  path
//  ...
// </svg>
// where the ellipses are the points of a stroke and the paths are the separation between strokes

export const importFromSvg = (svg: string): CharacterPath => {
    let svg_json = parse(svg);

    let svg_els = svg_json["_j"]["children"];

    let current_stroke = [];
    let path = [];
    for (let el of svg_els) {
        if (el["name"] === "ellipse") {
            // Continuation of a stroke
            current_stroke.push({
                x: parseFloat(el["attributes"]["cx"]),
                y: parseFloat(el["attributes"]["cy"]),
                radius: parseFloat(el["attributes"]["rx"] + el["attributes"]["ry"]) / 2
            });
        } else if (el["name"] === "path") {
            // New stroke
            if (current_stroke.length > 0) {
                path.push(current_stroke);
            }
            current_stroke = [];
        }
    }

    return path;
}
