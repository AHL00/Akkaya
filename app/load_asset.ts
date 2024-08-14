import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

export const loadAsset = async (moduleId: number | string): Promise<string> => {
  const [{ localUri }] = await Asset.loadAsync(moduleId);

  if (!localUri) {
    throw new Error(`Failed to load asset for module id: ${moduleId}`);
  }

  let data = await FileSystem.readAsStringAsync(localUri);

  return data;
};
