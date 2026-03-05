import path from "path";
import { notHasCreateDir } from "./UtilsNode";
import { staticPath, staticPaths } from "@main/config/StaticPath";

export const getStaticPath = () => {
  return staticPath.__static;
};
console.log("Log-- ", getStaticPath(), "getStaticPath()");
export const dbPath = path.join(getStaticPath(), "db");
notHasCreateDir(dbPath);
export const dbProxyPath = path.join(dbPath, "proxy.json");
