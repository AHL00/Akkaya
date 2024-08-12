import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useRef } from "react";
import { StyleSheet, Image, Platform, SafeAreaView } from "react-native";

import DrawingCanvas from "@/components/DrawingCanvas";
import { Canvas, CanvasRef } from "@benjeau/react-native-draw";
import { ThemedText } from "@/components/ThemedText";
import { Letter } from "@/constants/Letters";
import { useLocalSearchParams } from "expo-router";

export default function DrawScreen() {
  const canvasRef = useRef<CanvasRef>(null);
  const params = useLocalSearchParams();

  const letter = params.letter as Letter;

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Draw the letter {letter}</ThemedText>
      <Canvas ref={canvasRef} thickness={25} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
