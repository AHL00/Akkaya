import { Image, StyleSheet, Platform, SafeAreaView, Animated, Button, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Link, useRouter } from "expo-router";
import { Letter } from "@/constants/Letters";

export default function HomeScreen() {
  return (
    <ParallaxScrollView>
      <ThemedText type="title">Hello, World!</ThemedText>
      {/* <Button
        title="Click me!"
        onPress={() => {
          let router = useRouter();
          router.push("/draw");
        }}
      /> */}

      <Link href="/draw">Draw</Link>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
