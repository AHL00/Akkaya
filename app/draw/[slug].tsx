import DrawingCanvas from "@/components/DrawingCanvas";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { characterPathSvg as characterPathSvgs, characterSvgs } from "@/constants/Character";
import { Colors } from "@/constants/Colors";
import { Letter } from "@/constants/Letters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
    
export default function DrawPage() {
  const { slug } = useLocalSearchParams();
  // @ts-ignore
  let char: Letter = slug;

  return (
    <ThemedView style={styles.container} safeArea={false}>
      <ThemedText style={styles.title} type="title">
        Draw the letter {slug}
      </ThemedText>
      <DrawingCanvas
        char={char}
        lineWidth={0.085}
        svgModuleId={characterSvgs[char]}
        pathSvgModuleId={characterPathSvgs[char]}
      ></DrawingCanvas>
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
    top: 200,
    marginHorizontal: "auto",
  },
});
