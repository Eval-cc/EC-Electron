/** 
 * @time   2024/10/23 21:19:22
 * @author Eval
 * @description 子窗体的预加载脚本
 */
import {contextBridge, ipcRenderer} from "electron";
import {electronAPI} from "@electron-toolkit/preload";

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("win_type", "child-win");
        contextBridge.exposeInMainWorld("electron", electronAPI);
        contextBridge.exposeInMainWorld("IPCcontrol", {
            IPCcontrol: (args: any) => ipcRenderer.invoke("handleIPC", args),
        });
    } catch (error) {
        console.error(error);
    }
}

