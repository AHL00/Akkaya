import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, PanResponder, Dimensions } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  RadialGradient,
  Stop,
  SvgCss,
  SvgUri,
  SvgXml,
} from "react-native-svg";
import simplify from "simplify-js";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { Character, characterScaling } from "@/constants/Character";
import {
  importFromSvg as importCharPathFromSvg,
  PathCheckpoint,
  Stroke,
} from "@/app/char_path";
import { loadAsset } from "@/app/load_asset";
import { CharacterPath } from "@/app/char_path";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const smooth = require("chaikin-smooth");

type DrawingCanvasProps = {
  char: Character;
  /// As a percentage of the screen width
  lineWidth: number;
  svgModuleId: number | string;
  pathSvgModuleId: number | string;
};

type TrackingState = {
  transformedPath: CharacterPath | null;
  strokeCount: number;
  completedStrokeCount: number;
  checkpointIndex: number;
  lastPoint: PathCheckpoint | null;
  nextPoint: PathCheckpoint | null;
  finishedStrokesSmoothed: [number, number][][];
  nextStroke: Stroke | null;
  nextStrokeSmoothed: [number, number][] | null;
};

function strokeToPointsArr(stroke: PathCheckpoint[]): number[][] {
  return stroke.map((point) => {
    return [point.x, point.y];
  });
}

function calculateTangentFromStroke(
  stroke: Stroke,
  index: number
): [number, number] {
  let point = stroke[index];
  let nextPoint = stroke[index + 1];

    if (nextPoint == null) {
      if (point == null) {
          throw new Error("Both point and nextPoint are null");
      }

      nextPoint = point;
      point = stroke[index - 1];
    }

  const dx = nextPoint.x - point.x;
  const dy = nextPoint.y - point.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  return [dx / length, dy / length];
}

function rotate2DVector(
  vector: [number, number],
  angle: number
): [number, number] {
  return [
    vector[0] * Math.cos(angle) - vector[1] * Math.sin(angle),
    vector[0] * Math.sin(angle) + vector[1] * Math.cos(angle),
  ];
}

const DrawingCanvas = (props: DrawingCanvasProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPoints, setCurrentPoints] = useState<
    { x: number; y: number }[]
  >([]);

  const detectionRadiusCoeff = 1.4;
  /// Multiplied by screen width
  const pathVeerLimit = 0.05;
  const lineWidth = props.lineWidth ? props.lineWidth : 0.03;
  const debugPathCircles = false;

  const canvasRef = useRef<View>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const trackingSvgRef = useRef<Svg>(null);

  const [ready, setReady] = useState(false);
  const [trackingReady, setTrackingReady] = useState(false);

  const [trackingState, setTrackingState] = useState<TrackingState>({
    checkpointIndex: 0,
    strokeCount: 0,
    completedStrokeCount: 0,
    transformedPath: null,
    lastPoint: null,
    nextPoint: null,
    finishedStrokesSmoothed: [],
    nextStroke: null,
    nextStrokeSmoothed: null,
  });

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.measure((x, y, width, height, pageX, pageY) => {
        setCanvasPosition({ x: pageX, y: pageY });
      });
    }

    loadAsset(props.pathSvgModuleId)
      .then((data) => {
        let char_path = importCharPathFromSvg(data);
        let transformedPath = transformCharPath(char_path);

        setTrackingState({
          ...trackingState,
          transformedPath,
          nextPoint: transformedPath[0][0][0],
          nextStroke: transformedPath[0][0],
          nextStrokeSmoothed: smooth(strokeToPointsArr(transformedPath[0][0])),
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  let [trackingSvgAbsolute, setTrackingSvgAbsolute] = useState<null | {
    x: number;
    y: number;
  }>(null);

  useEffect(() => {
    trackingSvgRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setTrackingSvgAbsolute({ x: pageX, y: pageY });
    });
  }, [trackingSvgRef.current, ready]);

  let startedStroke = false;

  let [strokeCompleted, setStrokeCompleted] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      if (!trackingReady) return;
      // This is 0, 0 for some reason
      // piece of shit react
      const { moveX, moveY } = gestureState;

      // so now i have to do this
      startedStroke = true;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!trackingReady) return;

      // If all strokes are completed
      if (
        trackingState.completedStrokeCount >=
        trackingState.transformedPath![0].length
      ) {
        // NOTE: Completion logic
        return;
      }

      const { moveX, moveY } = gestureState;

      if (startedStroke) {
        trackingState.strokeCount += 1;
      }

      // Check for collision
      let currentStroke =
        trackingState.transformedPath![0][trackingState.completedStrokeCount];
      let currentPoint = currentStroke[trackingState.checkpointIndex];

      trackingState.nextPoint = currentPoint;

      let currentPointAbsolute = {
        x: currentPoint.x + trackingSvgAbsolute!.x,
        y: currentPoint.y + trackingSvgAbsolute!.y,
      };

      let distance = Math.sqrt(
        (currentPointAbsolute.x - moveX) ** 2 +
          (currentPointAbsolute.y - moveY) ** 2
      );

      if (startedStroke) {
        startedStroke = false;

        if (distance < currentPoint.radius * detectionRadiusCoeff) {
          if (trackingState.checkpointIndex > 0) {
            console.warn("Stroke started too far along the path");
          } else {
            console.log("Stroke", trackingState.strokeCount, "started");
            trackingState.checkpointIndex += 1;
            trackingState.lastPoint = currentPoint;
          }
        }

        setCurrentPoints([
          { x: moveX - canvasPosition.x, y: moveY - canvasPosition.y },
        ]);

        return;
      }

      if (distance < currentPoint.radius * detectionRadiusCoeff) {
        if (trackingState.checkpointIndex === 0) {
          console.warn("First checkpoint reached during stroke");
          return;
        }

        // console.log("Checkpoint", trackingState.checkpointIndex);
        trackingState.checkpointIndex += 1;
        trackingState.lastPoint = currentPoint;
        if (
          trackingState.checkpointIndex >=
          trackingState.transformedPath![0][trackingState.completedStrokeCount]
            .length
        ) {
          trackingState.checkpointIndex = 0;
          trackingState.lastPoint = null;
          // Set next point to next stroke's start if this isnt the last stroke
          if (
            trackingState.completedStrokeCount + 1 <
            trackingState.transformedPath![0].length
          ) {
            trackingState.nextPoint =
              trackingState.transformedPath![0][
                trackingState.completedStrokeCount + 1
              ][0];
            trackingState.nextStroke =
              trackingState.transformedPath![0][
                trackingState.completedStrokeCount + 1
              ];
            trackingState.nextStrokeSmoothed = smooth(
              strokeToPointsArr(trackingState.nextStroke)
            );
          } else {
            trackingState.nextPoint = null;
          }
          trackingState.completedStrokeCount += 1;
          console.log(
            "Stroke completed, set completedStrokeCount to",
            trackingState.completedStrokeCount
          );
          setStrokeCompleted(true);
          trackingState.finishedStrokesSmoothed.push(
            smooth(strokeToPointsArr(currentStroke))
          );
        }

        if (
          distance >
          currentPoint.radius * detectionRadiusCoeff +
            pathVeerLimit * dimensions.width
        ) {
          console.warn("Path veered too far from the checkpoint");
          return;
        }
      }

      // Drawing
      setCurrentPoints((prevPoints) => [...prevPoints, { x: moveX, y: moveY }]);
    },
    onPanResponderRelease: () => {
      if (!trackingReady) return;

      setCurrentPoints([]);

      console.log("replaceNextStrokeWithGuide", strokeCompleted);

      if (strokeCompleted) {
        setStrokeCompleted(false);
        return;
      }

      console.warn("Stroke stopped before completion");
      // TODO: Handle
    },
  });

  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    loadAsset(props.svgModuleId)
      .then((data) => {
        setSvgContent(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props.svgModuleId]);

  useEffect(() => {
    if (trackingState?.transformedPath != null && svgContent != null) {
      setReady(true);
    }
  }, [trackingState, svgContent]);

  useEffect(() => {
    if (trackingSvgAbsolute != null) {
      setTrackingReady(true);
    }
  }, [trackingSvgAbsolute]);

  let dimensions = Dimensions.get("window");

  let styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff00",
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    template: {
      // Absolute, centered, and 80% of the screen width
      position: "absolute",
      // top: "50%",
      // left: "50%",
      // transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
      //   marginLeft: (dimensions.width - dimensions.width * 0.8) / 2,
    },
    svg: {
      flex: 1,
    },
  });

  const charScale = characterScaling[props.char];
  const margin = 0.1;

  let charPathDebug = true;

  /// Transform the character path to overlay perfectly with the template
  const transformCharPath = (charPath: CharacterPath): CharacterPath => {
    let path = charPath[0];
    let bounds = charPath[1];

    let new_path = [];
    for (let stroke of path) {
      let new_stroke = [];
      for (let point of stroke) {
        let ratio =
          (dimensions.width * (charScale[0] - margin)) / charPath[1][0];
        new_stroke.push({
          x: point.x * ratio,
          y: point.y * ratio,
          radius: point.radius * ratio * 2,
        });
      }
      new_path.push(new_stroke);
    }

    return [
      new_path,
      [
        dimensions.width * (charScale[0] - margin),
        // Preserve aspect
        (dimensions.width * (charScale[0] - margin) * bounds[1]) / bounds[0],
      ],
    ];
  };

  const guidePointSize = 0.015 * dimensions.width;

  return (
    <View
      ref={canvasRef}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      {ready && (
        <Svg style={styles.svg}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke="black"
              strokeWidth={lineWidth * dimensions.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPoints.length > 0 && (
            <Path
              d={currentPoints
                .map((point, index) => {
                  const adjustedX = point.x;
                  const adjustedY = point.y;
                  return index === 0
                    ? `M${adjustedX},${adjustedY}`
                    : `L${adjustedX},${adjustedY}`;
                })
                .join(" ")}
              stroke="black"
              strokeWidth={lineWidth * dimensions.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      )}

      {trackingReady && trackingState.transformedPath && charPathDebug && (
        <ThemedText>
          {trackingState.transformedPath[0].length} strokes
        </ThemedText>
      )}

      {ready && trackingState.transformedPath && (
        <Svg
          style={styles.template}
          ref={trackingSvgRef}
          width={dimensions.width * (charScale[0] - margin)}
          height={
            /* Preserve ratio */ dimensions.width *
            (charScale[0] - margin) *
            (trackingState.transformedPath[1][1] /
              trackingState.transformedPath[1][0])
          }
        >
          {/*Draw finished strokes in black, these will be the perfect guide versions*/}
          {trackingState.finishedStrokesSmoothed.map((stroke, index) => (
            <Path
              key={index}
              d={stroke
                .map((point, index) => {
                  return index === 0
                    ? // @ts-ignore
                      `M${point[0]},${point[1]}`
                    : // @ts-ignore
                      `L${point[0]},${point[1]}`;
                })
                .join(" ")}
              stroke="black"
              strokeWidth={lineWidth * dimensions.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {trackingState.nextStrokeSmoothed &&
            trackingState.nextStrokeSmoothed.length > 1 &&
            trackingState.completedStrokeCount <
              trackingState.transformedPath[0].length && (
              <Path
                d={trackingState.nextStrokeSmoothed
                  .map((point, index) => {
                    return index === 0
                      ? // @ts-ignore
                        `M${point[0]},${point[1]}`
                      : // @ts-ignore
                        `L${point[0]},${point[1]}`;
                  })
                  .join(" ")}
                stroke="#aaaaaa"
                strokeWidth={0.01 * dimensions.width} // Adjust the stroke width as needed
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

          {/*Draw an arrow at the last point pointing in the direction of the
          last two points*/}
          {trackingState.nextStrokeSmoothed &&
            trackingState.nextStrokeSmoothed.length > 1 &&
            trackingState.completedStrokeCount <
              trackingState.transformedPath[0].length &&
            (() => {
              const points = trackingState.nextStrokeSmoothed.slice(-2);

              if (points.length < 2) return null;

              const [x1, y1] = points[0];
              const [x2, y2] = points[1];
              const dx = x2 - x1;
              const dy = y2 - y1;
              const angle = Math.atan2(dy, dx);

              const arrowLength = 0.02 * dimensions.width;
              const arrowWidth = 0.02 * dimensions.width;

              const tipOffset = 0.01 * dimensions.width;

              const tip = [
                x2 + tipOffset * Math.cos(angle),
                y2 + tipOffset * Math.sin(angle),
              ];

              const base1 = [
                x2 - arrowLength * Math.cos(angle) + arrowWidth * Math.cos(angle + Math.PI / 2),
                y2 - arrowLength * Math.sin(angle) + arrowWidth * Math.sin(angle + Math.PI / 2),
            ];
    
            const base2 = [
                x2 - arrowLength * Math.cos(angle) + arrowWidth * Math.cos(angle - Math.PI / 2),
                y2 - arrowLength * Math.sin(angle) + arrowWidth * Math.sin(angle - Math.PI / 2),
            ];    

              return (
                <Polygon
                  points={[
                    `${tip[0]},${tip[1]}`,
                    `${base1[0]},${base1[1]}`,
                    `${base2[0]},${base2[1]}`,
                  ].join(" ")}
                  fill="#aaaaaa"
                />
              );
            })()}

          {trackingState.nextStroke &&
            debugPathCircles &&
            trackingState.completedStrokeCount <
              trackingState.transformedPath[0].length &&
            trackingState.nextStroke.map((point, index) => (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={point.radius * detectionRadiusCoeff}
                stroke="red"
                strokeWidth={0.005 * dimensions.width}
                fill="none"
              />
            ))}

          {/* {trackingState.nextPoint &&
            trackingState.completedStrokeCount <
              trackingState.transformedPath[0].length && (
              // Cross
              // <>
              //   <Path
              //     d={`M${trackingState.nextPoint.x - crossLength},${
              //       trackingState.nextPoint.y - crossLength
              //     } L${trackingState.nextPoint.x + crossLength},${
              //       trackingState.nextPoint.y + crossLength
              //     }`}
              //     stroke="green"
              //     strokeWidth={0.005 * dimensions.width}
              //   />
              //   <Path
              //     d={`M${trackingState.nextPoint.x - crossLength},${
              //       trackingState.nextPoint.y + crossLength
              //     } L${trackingState.nextPoint.x + crossLength},${
              //       trackingState.nextPoint.y - crossLength
              //     }`}
              //     stroke="green"
              //     strokeWidth={0.005 * dimensions.width}
              //   />
              // </>

              // Circle
            //   <Circle
            //     cx={trackingState.nextPoint.x}
            //     cy={trackingState.nextPoint.y}
            //     r={guidePointSize}
            //     stroke="#aaaaaa"
            //     strokeWidth={0.0075 * dimensions.width}
            //     fill="none"
            //   />

            //   Arrow in the direction of the next point
                <>
                    
                </>

            )} */}

          {/* If at the start or end of the current stroke, draw a circle. If at the end, draw an arrow pointing in the tangent calculated using the calculateTangentFromStroke(stroke: Stroke, index: number) function */}
          {/*trackingState.nextPoint &&
            trackingState.completedStrokeCount <
              trackingState.transformedPath[0].length &&
            (trackingState.checkpointIndex === 0 ||
              trackingState.checkpointIndex ===
                trackingState.transformedPath![0][
                  trackingState.completedStrokeCount
                ].length -
                  1) &&
            trackingState.completedStrokeCount <
              trackingState.transformedPath![0].length && (
              <Circle
                cx={trackingState.nextPoint!.x}
                cy={trackingState.nextPoint!.y}
                r={guidePointSize}
                stroke="#aaaaaa"
                strokeWidth={0.0075 * dimensions.width}
                fill="none"
              />
            )*/}
          {/* If in one of the middle points, draw an arrow */}
          {trackingState.nextPoint &&
            trackingState.completedStrokeCount <
              trackingState.transformedPath[0].length &&
            (() => {
              const tangent = calculateTangentFromStroke(
                trackingState.transformedPath[0][
                  trackingState.completedStrokeCount
                ],
                trackingState.checkpointIndex
              );
              const arrowLength = 0.035 * dimensions.width;
              const arrowWidth = 0.009;

              let vector1 = rotate2DVector(
                [tangent[0] * arrowLength, tangent[1] * arrowLength],
                Math.PI / 4
              );

              let vector2 = rotate2DVector(
                [tangent[0] * arrowLength, tangent[1] * arrowLength],
                -Math.PI / 4
              );

              let arrowTipX = trackingState.nextPoint!.x;
              let arrowTipY = trackingState.nextPoint!.y;

              return (
                <>
                  <Line
                    x1={arrowTipX}
                    y1={arrowTipY}
                    x2={arrowTipX - vector1[0]}
                    y2={arrowTipY - vector1[1]}
                    stroke="#aaaaaa"
                    strokeWidth={arrowWidth * dimensions.width}
                  />
                  <Line
                    x1={arrowTipX}
                    y1={arrowTipY}
                    x2={arrowTipX - vector2[0]}
                    y2={arrowTipY - vector2[1]}
                    stroke="#aaaaaa"
                    strokeWidth={arrowWidth * dimensions.width}
                  />
                </>
              );
            })()}
        </Svg>
      )}

      {trackingReady && svgContent && (
        <SvgXml
          style={styles.template}
          xml={svgContent}
          width={dimensions.width * (charScale[0] - margin)}
          height={dimensions.height * (charScale[1] - margin)}
          opacity={0.25}
        />
      )}
    </View>
  );
};

export default DrawingCanvas;
