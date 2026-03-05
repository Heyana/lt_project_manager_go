import {
  app,
  clipboard,
  dialog,
  electron,
  fs,
  ipcMain,
  ipcRenderer,
  path,
} from "@utils/UtilsExports";

import { getExt, notHasCreateDir, readDir } from "./UtilsNode";
import { join } from "path";
import { shell } from "electron";
export const electronInit = (ipcMain: Electron.IpcMain) => {
  const a = getDataPath();
  console.log(a, "a");
  //   console.log(ipcRenderer, "ipcRenderer");
  //   console.log(require("electron"), 'require("electron")');
  ipcMain.on("copyText", (event, map) => {
    const { text } = map;
    clipboard.writeText(text);
  });
  ipcMain.on("openUrl", (event, map) => {
    const { url } = map;
    shell.openExternal(url);
  });
  ipcMain.handle("getPath", (event, map) => {
    const { type } = map || {};
    if (type === "data") {
      return getEditorPath();
    }
    console.log(app.getPath("home"), "");

    return app.getAppPath();
  });
  ipcMain.handle("readDir", (event, map) => {
    const { path } = map || {};
    return readDir(path);
  });
  ipcMain.handle("getSelectPath", (event, map) => {
    let { def, isMulti, isFile, title, filters, type } = map;
    const ls: Array<
      | "openFile"
      | "openDirectory"
      | "multiSelections"
      | "showHiddenFiles"
      | "createDirectory"
      | "promptToCreate"
      | "noResolveAliases"
      | "treatPackageAsDirectory"
      | "dontAddToRecent"
    > = [
      // 'openFile'
      // "openDirectory",
      "createDirectory",
    ];
    if (isFile) {
      ls.push("openFile");
    } else {
      ls.push("openDirectory");
    }
    if (isMulti) {
      ls.push("multiSelections");
    }
    console.log(type, "type");
    if (type) {
      if (type === "video") {
        filters = [
          {
            extensions: ["mp4", "mov", "avi"],
            name: "请选择视频文件",
          },
        ];
      } else if (type === "image") {
        filters = [
          {
            extensions: ["webp", "png", "jpg"],
            name: "请选择图片文件",
          },
        ];
      }
    }
    console.log(filters, "filters");
    const path = dialog.showOpenDialogSync({
      title: title || "选择保存路径",
      defaultPath: def,
      properties: ls,
      filters,
    });
    return path;
    // event.sender.send(a);
  });
};
export const copyText = (val: string) => {
  console.log(ipcRenderer, "ipcRenderer");
  ipcRenderer.send("copyText", {
    text: val,
  });
  //   clipboard.writeText(val);
};

export const getSelectPath = async (): Promise<string> => {
  const path = await ipcRenderer.invoke("getSelectPath", {});
  if (!path || !Array.isArray(path) || !path[0]) return "";
  return path[0];
};

export const isMac = () => {
  return process.platform === "darwin";
};
export const isWeb = () => {
  return process.env.BUILD_TARGET;
};
export const appName = "3dEditorEx_2.0";
export const getDataPath = () => {
  const p = join(app.getPath("appData"), appName);
  notHasCreateDir(p);
  return p;
};

export const getShortcutBypath = (
  dir: string
): Electron.ShortcutDetails | null => {
  try {
    return electron.shell.readShortcutLink(dir);
  } catch (e) {
    return null;
  }
};
export const isShortcut = (p: string) => {
  return getExt(p) === ".lnk";
};

export const toTruthPath = (p: string) => {
  const ext = getExt(p);

  if (ext === ".lnk") {
    const short = getShortcutBypath(p);
    return short ? short.target : "";
  }
  return p;
};
export const toTruthPaths = (files: string[]) => {
  return files.map((i) => toTruthPath(i));
};

export const sWithFiles = (base: string, dirs: string[]) => {
  return dirs.map((dir) => {
    const back = path.join(base, dir);
    if (isShortcut(dir)) {
      return toTruthPath(back);
    }
    return back;
  });
};

export const getEditorPath = () => {
  const p = path.join(getDataPath(), "editor");
  notHasCreateDir(p);
  return p;
};

export const getStaticPath = (type: "static") => {
  return process.env.__static;
};

// export const
