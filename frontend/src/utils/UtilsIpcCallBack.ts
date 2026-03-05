// import { cb } from "./UtilsCallBack";
// import { getStaticPath } from "./UtilsElectron";
// import { ipcMain, ipcRenderer } from "./UtilsExports";
// class IpcCallback<T, F> {
//   name: string;
//   on: (event: Electron.IpcMainInvokeEvent) => void;
//   constructor(map: {
//     name: string;
//     on: (event: Electron.IpcMainInvokeEvent) => void;
//   }) {
//     const { name, on } = map;
//     this.name = name;
//     cb.ipcCb[name].on
//     // ipcMain.handle(name, on);
//   }
//   trigger(map: T): Promise<F> {
//     return ipcRenderer.invoke(this.name, map);
//   }
// }
// export const ipcCb = new (class {
//   map = {
//     getStaticPath: new IpcCallback<void, string>({
//       name: "getStaticPath",
//       on(event: Electron.IpcMainInvokeEvent) {
//         console.log(event, "event");
//       },
//     }),
//   };
//   init() {}
// })();
