import { ipcRenderer, path, tPath } from "./UtilsExports";
import { notHasCreateDir } from "./UtilsNode";

export const handleMap = {
  getEnvMode: "getEnvMode",
};

export const getAssetsPath = async () => {
  const staticPath = await ipcRenderer.invoke("getStaticPath");
  return tPath.join(staticPath, "projectAssets");
};
