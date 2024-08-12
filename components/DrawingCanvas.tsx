import React, { useState } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";
import simplify from 'simplify-js';

const DrawingCanvas = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPoints, setCurrentPoints] = useState<{ x: number, y: number }[]>([]);
  const drawingWidth = 15;

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
      const path = simplifiedPoints.map((point, index) => {
        return index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
      }).join(' ');

      setPaths((prevPaths) => [...prevPaths, path]);
      setCurrentPoints([]);
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg style={styles.svg}>
        {paths.map((path, index) => (
          <Path key={index} d={path} stroke="black" strokeWidth={drawingWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {currentPoints.length > 0 && (
          <Path
            d={currentPoints.map((point, index) => {
              return index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
            }).join(' ')}
            stroke="black"
            strokeWidth={drawingWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  svg: {
    flex: 1,
  },
});

export default DrawingCanvas;