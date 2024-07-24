/**
 * @time   2024/04/15 19:01:06
 * @author Eval
 * @description 全局控制脚本
 */
import {app as AppMange, shell, BrowserWindow} from "electron";
import {is} from "@electron-toolkit/utils";
import path from "path";
import notifier from "node-notifier";
import TrayMgr from "./tray";
import {IPCResult} from "./IPCResult";
import {isDev} from "./proce";
import GlobalStatus from "./global";
import Controller from "./controller";
import EC_Event from "../lib/ec-event";
import EC_Shortcut from "../lib/ec-shortcut";
import {randomUUID} from "crypto";

class Core {
    private winList: Array<BrowserWindow>;
    private icon: any;
    public contr: Controller;
    downSta: any;
    constructor(win: any, icon: any) {
        GlobalStatus.winMain = win;
        new EC_Event();
        new EC_Shortcut();
        // 设置窗口类型
        win["win_type"] = "main";
        this.winList = [win];
        this.icon = icon;
        this.contr = new Controller(this);
        if (isDev()) {
            if (!win.webContents.isDevToolsOpened()) {
                win.webContents.toggleDevTools();
            }
        } else {
            // debug模式的热更新会导致出现托盘残影,放在生产模式才出现
            GlobalStatus.tray = new TrayMgr(win, this);
        }
        // 基础的加载完成之后在显示窗口
        win.show();
    }

    /**
     * 关闭指定ID的窗口
     * @param winID
     */
    closeWin(winID: string) {
        if (winID === "-1") {
            // 关闭主窗口
            AppMange.quit();
        }
        const childWin = this.winList.find((win: BrowserWindow) => String(win["win_uid"]) === winID);
        if (!childWin) {
            return;
        }
        childWin.destroy();
    }

    /**
     * 重启程序
     */
    reloadWin() {
        // 仅正式环境能正常使用重启应用
        if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "开发环境无法重启应用", {type: "tip"}));
        } else {
            AppMange.relaunch();
            AppMange.exit();
        }
    }

    /**
     * 新建窗体
     * @param url 新窗体的加载路径
     */
    openWin(url: string | null) {
        const icon = this.icon;
        // 创建浏览器窗口。
        const win = new BrowserWindow({
            width: 900,
            height: 700,
            minWidth: 900,
            minHeight: 700,
            show: false,
            autoHideMenuBar: true,
            // parent: this.win,
            ...(process.platform === "linux" ? {icon} : {icon}),
            webPreferences: {
                preload: path.join(__dirname, "../preload/index.js"), // 加载预加载脚本
                contextIsolation: true,
                sandbox: false,
            },
        });
        win.setSkipTaskbar(false); // 不显示子窗口的任务栏图标

        win.on("ready-to-show", () => {
            win.title = `子窗体:${this.winList.length}`;
            // 设置窗口类型-为子窗口
            win["win_type"] = "child-win";
            win["win_uid"] = randomUUID();
            this.winList.push(win);
            GlobalStatus.childWin[win.id] = win;
            GlobalStatus.control.SendRenderMsg(IPCResult(true, "", {type: "childID", id: win["win_uid"]}), "message-child-channel");
            win.show();
        });

        win.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url);
            return {action: "deny"};
        });

        // 关闭子窗口之后,从主进程的窗口管理里面去除
        win.on("close", () => {
            for (let wi in this.winList) {
                if (this.winList[wi].id === win.id) {
                    // 从全局状态管理处踢出此子窗口
                    delete GlobalStatus.childWin[win.id];
                    this.winList.splice(Number(wi), 1);
                    break;
                }
            }
        });
        // 如果没有传入地址,那就默认新增小工具窗口
        if (!url) {
            win.loadFile(path.join(__dirname, "../renderer/index.html"));
        } else {
            win.loadURL(url);
        }
    }

    /**
     * 触发气泡消息
     * @param message
     * @param options
     */
    show_notifier = (message: string, options: any = {}): any => {
        const title = options?.title ? options.title : "气泡消息";
        const obj = notifier.notify({
            appID: "EC-eval",
            title,
            message,
            icon: path.join(process.cwd(), "resources\\assets\\icon.png"),
        });
        return obj;
    };
}

Core.toString = () => "[class Core]";
export default Core;
