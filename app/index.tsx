import AnimatedSplash from "react-native-animated-splash-screen";
import App from "./app";
import { Colors } from "@/constants/Colors";
import React, { createContext, useContext } from "react";
import { LoadedStateProvider, useLoadedState } from "./loaded_state_ctx";

const SplashScreen = () => {
    const { loaded } = useLoadedState();
  
    return (
      <AnimatedSplash
        translucent={true}
        isLoaded={loaded}
        logoImage={require("../assets/images/splash.png")}
        backgroundColor={"#fff"}
        logoHeight={250}
        logoWidth={250}
      >
        <App />
      </AnimatedSplash>
    );
  };
  
  export default function Main() {
    return (
      <LoadedStateProvider>
        <SplashScreen />
      </LoadedStateProvider>
    );
  }