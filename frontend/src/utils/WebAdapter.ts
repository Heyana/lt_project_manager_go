// Web 适配层 - 替换 Electron 的 IPC 和文件系统功能
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  Project,
} from "@/api/project";

// 模拟 ipcRenderer
export const ipcRenderer = {
  invoke: async (channel: string, ...args: any[]) => {
    console.log("IPC invoke:", channel, args);

    switch (channel) {
      case "getStaticPath":
        return "/cdn"; // CDN 路径

      case "getAssetsPath":
        return "/cdn"; // CDN 路径

      case "getInterfaceKeys":
        return []; // 暂时返回空数组

      case "setChildWin":
        // 打开预览窗口
        const { link, type, name } = args[0];
        if (type === "link") {
          window.open(link, "_blank");
        } else {
          // 本地项目或视频,使用路由跳转
          window.open(
            `/preview?link=${encodeURIComponent(link)}&type=${type}&name=${encodeURIComponent(name)}`,
            "_blank",
          );
        }
        return;

      default:
        console.warn("未实现的 IPC 调用:", channel);
        return null;
    }
  },

  on: (channel: string, callback: Function) => {
    console.log("IPC on:", channel);
    // Web 环境不需要监听
  },

  send: (channel: string, ...args: any[]) => {
    console.log("IPC send:", channel, args);
    // Web 环境不需要发送
  },
};

// 模拟 fs
export const tFs = {
  readFileSync: (path: string, encoding?: string) => {
    console.warn("Web 环境不支持直接读取文件系统:", path);
    // 从 localStorage 读取
    const data = localStorage.getItem("projectManager");
    return data || "{}";
  },

  writeFileSync: (path: string, data: string) => {
    console.log("保存数据到 localStorage:", path);
    // 保存到 localStorage
    localStorage.setItem("projectManager", data);
  },

  existsSync: (path: string) => {
    return false;
  },

  mkdirSync: (path: string, options?: any) => {
    console.log("Web 环境不需要创建目录:", path);
  },
};

// 模拟 path
export const tPath = {
  join: (...paths: string[]) => {
    return paths.join("/").replace(/\/+/g, "/");
  },

  extname: (path: string) => {
    const match = path.match(/\.[^.]+$/);
    return match ? match[0] : "";
  },

  basename: (path: string) => {
    return path.split("/").pop() || "";
  },

  dirname: (path: string) => {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  },
};

// 导出所有适配器
export default {
  ipcRenderer,
  tFs,
  tPath,
};
