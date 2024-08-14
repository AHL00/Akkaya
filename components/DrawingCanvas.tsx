import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, PanResponder, Dimensions } from "react-native";
import Svg, { Path, SvgCss, SvgUri, SvgXml } from "react-native-svg";
import simplify from "simplify-js";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { Character, characterScaling } from "@/constants/Character";

type DrawingCanvasProps = {
  char: Character;
  lineWidth: number;
  svgModuleId: number | string;
};

const DrawingCanvas = (props: DrawingCanvasProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const lineWidth = props.lineWidth ? props.lineWidth : 20;
  const canvasRef = useRef<View>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.measure((x, y, width, height, pageX, pageY) => {
        setCanvasPosition({ x: pageX, y: pageY });
      });
    }
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const { x0, y0 } = gestureState;
      setCurrentPoints([{ x: x0 - canvasPosition.x, y: y0 - canvasPosition.y }]);
    },
    onPanResponderMove: (evt, gestureState) => {
      const { moveX, moveY } = gestureState;
      setCurrentPoints((prevPoints) => [...prevPoints, { x: moveX - canvasPosition.x, y: moveY - canvasPosition.y }]);
    },
    onPanResponderRelease: () => {
      const simplifiedPoints = simplify(currentPoints, 1, true);
      const path = simplifiedPoints
        .map((point, index) => {
          return index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
        })
        .join(" ");

      setPaths((prevPaths) => [...prevPaths, path]);
      setCurrentPoints([]);
    },
  });

  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    console.log("Loading SVG file: ", props.svgModuleId);

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

  return (
    <View ref={canvasRef} style={styles.container} {...panResponder.panHandlers}>
      <Svg style={styles.svg}>
        {paths.map((path, index) => (
          <Path key={index} d={path} stroke="black" strokeWidth={lineWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {currentPoints.length > 0 && (
          <Path
            d={currentPoints
              .map((point, index) => {
                return index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
              })
              .join(" ")}
            stroke="black"
            strokeWidth={lineWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>

      {svgContent && <SvgXml style={styles.template} xml={svgContent} width={dimensions.width * (charScale[0] - margin)} height={dimensions.height * (charScale[1] - margin)} />}
      {/* <SvgUri style={styles.template} uri={props} /> */}
    </View>
  );
};

export default DrawingCanvas;
