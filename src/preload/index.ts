/**
 * @time   2024/04/15 23:31:24
 * @author Eval
 * @description 预加载脚本
 */

import {contextBridge, ipcRenderer} from "electron";
import {electronAPI} from "@electron-toolkit/preload";

// Custom APIs for renderer
// const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI);
        // contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);
        // contextBridge.exposeInMainWorld("api", api);
        contextBridge.exposeInMainWorld("IPCcontrol", {
            IPCcontrol: (args: any) => ipcRenderer.invoke("handleIPC", args),
        });
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-ignore (define in dts)
    // window.electron = electronAPI;
    // @ts-ignore (define in dts)
    // window.api = api;
}
