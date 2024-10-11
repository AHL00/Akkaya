import React, { createContext, useState, useContext } from "react";

type LoadedStateContextType = {
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
};

const LoadedStateContext = createContext<LoadedStateContextType | undefined>(undefined);

export const LoadedStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <LoadedStateContext.Provider value={{ loaded, setLoaded }}>
      {children}
    </LoadedStateContext.Provider>
  );
};

export const useLoadedState = () => {
  const context = useContext(LoadedStateContext);
  if (!context) {
    throw new Error("useLoadedState must be used within a LoadedStateProvider");
  }
  return context;
};