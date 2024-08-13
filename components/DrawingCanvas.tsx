import { LetterSvgs } from "@/constants/Letters";
import React, { useState } from "react";
import { View, StyleSheet, PanResponder, Dimensions } from "react-native";
import Svg, { Path, SvgCss, SvgUri, SvgXml } from "react-native-svg";
import simplify from "simplify-js";

const DrawingCanvas = (props: any) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const lineWidth = props.lineWidth ? props.lineWidth : 20;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const { x0, y0 } = gestureState;
      setCurrentPoints([{ x: x0, y: y0 }]);
    },
    onPanResponderMove: (evt, gestureState) => {
      const { moveX, moveY } = gestureState;
      setCurrentPoints((prevPoints) => [...prevPoints, { x: moveX, y: moveY }]);
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

  let svg = LetterSvgs[props.letter];

  let dimensions = Dimensions.get("window");

  let styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff00",
      width: "100%",
      height: "100%",
    },
    template: {
      // Absolute, centered, and 80% of the screen width
      position: "absolute",
      // top: "50%",
      // left: "50%",
      // transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
      marginLeft: (dimensions.width - dimensions.width * 0.8) / 2,
    },
    svg: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
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

      <SvgXml style={styles.template} xml={svg} width={dimensions.width * 0.8} height={dimensions.height}></SvgXml>

      {/* <SvgUri style={styles.template} uri={props} /> */}
    </View>
  );
};

export default DrawingCanvas;
