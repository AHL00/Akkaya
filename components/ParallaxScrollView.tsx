import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useAnimatedRef, useScrollViewOffset } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

export default function ParallaxScrollView({
  children,
}: PropsWithChildren<{}>) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  return (
    <ThemedView style={styles.container} safeArea={true}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
    overflow: "hidden",
  },
});
