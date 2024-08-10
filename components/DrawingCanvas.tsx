import React, { useState } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";

const DrawingCanvas = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  const drawingWidth = 12;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const { x0, y0 } = gestureState;
      setCurrentPath(`M${x0},${y0}`);
    },
    onPanResponderMove: (evt, gestureState) => {
      const { moveX, moveY } = gestureState;
      setCurrentPath((prevPath) => `${prevPath} L${moveX},${moveY}`);
    },
    onPanResponderRelease: () => {
      setPaths((prevPaths) => [...prevPaths, currentPath]);
      setCurrentPath("");
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg style={styles.svg}>
        {paths.map((path, index) => (
          <Path key={index} d={path} stroke="black" strokeWidth={drawingWidth} fill="none" />
        ))}
        {currentPath ? <Path d={currentPath} stroke="black" strokeWidth={drawingWidth} fill="none" /> : null}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  svg: {
    flex: 1,
  },
});

export default DrawingCanvas;
