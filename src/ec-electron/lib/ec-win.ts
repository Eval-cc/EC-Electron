/**
 * @time   2024/07/24 12:23:13
 * @author Eval
 * @description 主视图相关
 */
import {app, shell, BrowserWindow, Menu} from "electron";
import {join as EC_Join} from "path";
import {electronApp, optimizer, is} from "@electron-toolkit/utils";
import icon from "@resources/assets/icon.png?asset";
import linu_icon from "@resources/assets/linux-icon.ico?asset";
import Core from "../core/ec-core";
import GlobalStatus from "../core/ec-global";
import {ec_is_test} from "../plugins/ec-proce";

class EC_Win {
    constructor() {
        app.removeAllListeners();
        // Electron 完成初始化并准备创建浏览器窗口时调用此方法。
        app.whenReady().then(() => {
            // 为 Windows 设置应用程序用户模型 ID。
            electronApp.setAppUserModelId("ec.electron.app");
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
            ...(process.platform === "linux" ? {linu_icon} : {icon}),
            webPreferences: {
                webviewTag: true,
                contextIsolation: true,
                preload: EC_Join(__dirname, "../preload/index.js"), // 加载预加载脚本
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
                new Core(mainWindow, icon, this.CreateLogo);
            }
        });

        // 根据环境加载远程 URL（开发环境）或本地 HTML 文件（生产环境）。
        if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
            mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
        } else {
            // mainWindow.loadURL("https://github.com/Eval-cc?tab=repositories")
            mainWindow.loadFile(EC_Join(__dirname, "../renderer/index.html"));
        }
    }

    /**
     * 弹出小logo展示
     * @param url 新窗体的加载路径
     */
    CreateLogo() {
        // 创建浏览器窗口。
        const win = new BrowserWindow({
            width: 400,
            height: 400,
            minWidth: 400,
            minHeight: 400,
            maxWidth: 400,
            maxHeight: 400,
            frame: false, // 隐藏标题栏
            transparent: true, // 窗口透明
            modal: true,
            show: true,
            autoHideMenuBar: true,
            ...(process.platform === "linux" ? {icon} : {icon}),
            webPreferences: {
                preload: EC_Join(__dirname, "../preload/child-preload.js"), // 加载预加载脚本
                contextIsolation: true,
                sandbox: false,
            },
        });
        win.setSkipTaskbar(true); // 不显示子窗口的任务栏图标

        win.on("ready-to-show", () => {
            GlobalStatus.winMain.hide();
            // 设置窗口类型-为子窗口
            win["win_type"] = "child-widget";
            win.show();
            // 设置窗口置顶
            win.setAlwaysOnTop(true, "screen-saver");
            win.setIgnoreMouseEvents(true); // 忽略鼠标事件
            setTimeout(() => {
                GlobalStatus.winMain.show();
                win.close();
            }, 1500);
        });

        // 关闭子窗口之后,从主进程的窗口管理里面去除
        win.on("close", () => {
            win.destroy();
        });
        if (ec_is_test) {
            win.loadURL("http://localhost:5173/child.html");
        } else {
            win.loadFile(EC_Join(__dirname, "../renderer/child.html"));
        }
    }
}

EC_Win.toString = () => "[class EC_Win]";
export default EC_Win;
