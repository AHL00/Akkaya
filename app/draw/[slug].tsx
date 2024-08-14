import DrawingCanvas from "@/components/DrawingCanvas";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getSvgModuleId } from "@/constants/Character";
import { Letter } from "@/constants/Letters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

export default function DrawPage() {
  const { slug } = useLocalSearchParams();
  // @ts-ignore
  let char: Letter = slug;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title} type="title">
        Draw the letter {slug}
      </ThemedText>
      {/* <Canvas thickness={25} /> */}
      <DrawingCanvas char={char} lineWidth={40} svgModuleId={getSvgModuleId(char)}></DrawingCanvas>
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
  title: {
    position: "absolute",
    top: 0,
    marginHorizontal: "auto",
  },
});
