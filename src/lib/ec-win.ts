/**
 * @time   2024/07/24 12:23:13
 * @author Eval
 * @description 主视图相关
 */
import {app, shell, BrowserWindow, Menu} from "electron";
import {join} from "path";
import {electronApp, optimizer, is} from "@electron-toolkit/utils";
import icon from "../../resources/assets/icon.png?asset";
import Core from "../core/core";

class EC_Win {
    constructor() {
        // Electron 完成初始化并准备创建浏览器窗口时调用此方法。
        app.whenReady().then(() => {
            // 为 Windows 设置应用程序用户模型 ID。
            electronApp.setAppUserModelId("com.electron.eval");
            app.on("browser-window-created", (_, window) => {
                optimizer.watchWindowShortcuts(window);
            });

            app.on("activate", () => {
                // 在 macOS 上，当单击 dock 图标且没有其他窗口打开时，重新创建窗口
                if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
            });
            this.createWindow();
        });
    }
    createWindow(): void {
        // 创建浏览器窗口。
        const mainWindow = new BrowserWindow({
            width: 900,
            height: 700,
            minWidth: 900,
            minHeight: 700,
            show: false,
            autoHideMenuBar: true,
            ...(process.platform === "linux" ? {icon} : {icon}),
            webPreferences: {
                webviewTag: true,
                contextIsolation: true,
                preload: join(__dirname, "../preload/index.js"), // 加载预加载脚本
                sandbox: false,
            },
        });

        // 禁用默认菜单栏（设置为空的菜单）
        Menu.setApplicationMenu(null);
        mainWindow.setMenuBarVisibility(false); // 确保菜单栏不可见
        mainWindow.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url);
            return {action: "deny"};
        });
        mainWindow.on("ready-to-show", () => {
            // 确保应用程序只有一个实例
            if (!app.requestSingleInstanceLock()) {
                // 退出当前重复打开的实例-
                app.quit();
            } else {
                new Core(mainWindow, icon);
            }
        });

        // 根据环境加载远程 URL（开发环境）或本地 HTML 文件（生产环境）。
        if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
            mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
        } else {
            mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
        }
    }
}

EC_Win.toString = () => "[class EC_Win]";
export default EC_Win;
