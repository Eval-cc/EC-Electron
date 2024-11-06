/**
 * @time   2024/04/15 23:31:24
 * @author Eval
 * @description 预加载脚本
 */

import {contextBridge, ipcRenderer} from "electron";
import {electronAPI} from "@electron-toolkit/preload";
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("win_type", "main");
        contextBridge.exposeInMainWorld("electron", electronAPI);
        contextBridge.exposeInMainWorld("IPCcontrol", {
            IPCcontrol: (args: any) => ipcRenderer.invoke("handleIPC", args),
        });
    } catch (error) {
        console.error(error);
    }
}
