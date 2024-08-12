import { Image, StyleSheet, Platform, SafeAreaView, Animated, Button, View, Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Link, Stack, useRouter } from "expo-router";
import { Letter } from "@/constants/Letters";
import { Canvas } from "@benjeau/react-native-draw";

export default function HomeScreen() {
  return (
    // <Stack>
    //   <Stack.Screen name="draw" options={{ headerShown: false }} />
    //   <Stack.Sc${Letter.KAGYI}reen name="+not-found" />
    // </Stack>
    <ParallaxScrollView>
      <ThemedText type="title">Hello, World!</ThemedText>
      {/* <Button
        title="Click me!"
        onPress={() => {
          let router = useRouter();
          router.push("/draw");
        }}
      /> */}
      <Link push href={{ pathname: "/draw/[letter]", params: { letter: `${Letter.KAGYI}` } }}>
        <Pressable>
          <ThemedText type="subtitle">Draw</ThemedText>
        </Pressable>
      </Link>
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
