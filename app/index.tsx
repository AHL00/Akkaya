import {
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  Animated,
  Button,
  View,
  Pressable,
  Dimensions,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Link, Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { SvgXml } from "react-native-svg";
import { Character, characterSvgs } from "@/constants/Character";
import { loadAsset } from "./load_asset";

type SvgModuleTuple = [Character, string | number];

export default function HomeScreen() {
  let [charSvgs, setCharSvgs] = useState<[Character, string][]>([]);

  useEffect(() => {
    const loadSvgs = async () => {
      let charSvgsTemp: [Character, string][] = [];
      for (let i of Object.entries(characterSvgs)) {
        let svgData = await loadAsset(i[1]);

        // @ts-ignore
        charSvgsTemp.push([i[0], svgData]);
      }
      setCharSvgs([...charSvgsTemp]);
    };

    loadSvgs();
  }, []);

  return (
      <ParallaxScrollView>
        <ThemedText type="title">Burmese Handwriting</ThemedText>
        <View style={styles.gridContainer}>
          {charSvgs.map((charSvg, index) => (
            <Link
              key={index}
              asChild
              push
              href={{ pathname: "/draw/[slug]", params: { slug: charSvg[0] } }}
            >
              <Pressable style={styles.gridItem}>
                <SvgXml xml={charSvg[1]} width="80%" height="50%" />
                <ThemedText type="subtitle">{`Draw ${charSvg[0]}`}</ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>
      </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  gridItem: {
    width: Dimensions.get("window").width / 2 - 20,
    height: 150,
    backgroundColor: "#f0f0f0",
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
