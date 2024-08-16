import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, PanResponder, Dimensions } from "react-native";
import Svg, { Circle, Path, SvgCss, SvgUri, SvgXml } from "react-native-svg";
import simplify from "simplify-js";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { Character, characterScaling } from "@/constants/Character";
import {
  importFromSvg as importCharPathFromSvg,
  PathCheckpoint,
} from "@/app/char_path";
import { loadAsset } from "@/app/load_asset";
import { CharacterPath } from "@/app/char_path";
import { ThemedText } from "./ThemedText";

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
};

const DrawingCanvas = (props: DrawingCanvasProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPoints, setCurrentPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const lineWidth = props.lineWidth ? props.lineWidth : 0.03;
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

        if (distance < currentPoint.radius) {
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

      if (distance < currentPoint.radius) {
        if (trackingState.checkpointIndex === 0) {
          console.warn("First checkpoint reached during stroke");
          return;
        }

        console.log("Checkpoint", trackingState.checkpointIndex);
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
          } else {
            trackingState.nextPoint = null;
          }
          trackingState.completedStrokeCount += 1;
          console.log(
            "Stroke completed, set completedStrokeCount to",
            trackingState.completedStrokeCount
          );
        }
      }

      // Drawing
      setCurrentPoints((prevPoints) => [...prevPoints, { x: moveX, y: moveY }]);
    },
    onPanResponderRelease: () => {
      if (!trackingReady) return;
      const simplifiedPoints = simplify(currentPoints, 1, true);
      const path = simplifiedPoints
        .map((point, index) => {
          return index === 0
            ? `M${point.x},${point.y}`
            : `L${point.x},${point.y}`;
        })
        .join(" ");

      setPaths((prevPaths) => [...prevPaths, path]);
      setCurrentPoints([]);
    },
  });

  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const [{ localUri }] = await Asset.loadAsync(props.svgModuleId);

        if (!localUri) {
          throw new Error("Failed to load SVG file");
        }

        const content = await FileSystem.readAsStringAsync(localUri);

        setSvgContent(content);
      } catch (error) {
        console.error("Error reading SVG file:", error);
      }
    };

    loadSvg();
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
                  return index === 0
                    ? `M${point.x},${point.y}`
                    : `L${point.x},${point.y}`;
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
          {/* {trackingState.transformedPath[0].map((stroke, index) =>
            stroke.map((point, index2) => (
              <Circle
                key={index + index2}
                cx={point.x}
                cy={point.y}
                r={point.radius}
                fill="black"
                fillRule="nonzero"
              />
            ))
          )} */}
          {trackingState.nextPoint && (
            <Circle
              cx={trackingState.nextPoint.x}
              cy={trackingState.nextPoint.y}
              r={trackingState.nextPoint.radius}
              fill="red"
              fillRule="nonzero"
            />
          )}
        </Svg>
      )}

      {trackingReady && svgContent && (
        <SvgXml
          style={styles.template}
          xml={svgContent}
          width={dimensions.width * (charScale[0] - margin)}
          height={dimensions.height * (charScale[1] - margin)}
        />
      )}
    </View>
  );
};

export default DrawingCanvas;
