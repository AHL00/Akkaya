import DrawingCanvas from "@/components/DrawingCanvas";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Letter } from "@/constants/Letters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

export default function DrawPage() {
  const { letter } = useLocalSearchParams();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Draw the letter {letter}</ThemedText>
      {/* <Canvas thickness={25} /> */}
        <DrawingCanvas letter={Letter.KAGYI} lineWidth={40}></DrawingCanvas>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 0,
    height: "100%",
  },
});
