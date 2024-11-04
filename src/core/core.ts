/**
 * @time   2024/04/15 19:01:06
 * @author Eval
 * @description 全局控制脚本
 */
import {app as EC_APP, shell as EC_SHELL, BrowserWindow} from "electron";
import {join as EC_Join} from "path";
import {notify as EC_Notify} from "node-notifier";
import TrayMgr from "../plugins/ec-tray";
import {IPCResult} from "./IPCResult";
import {ec_is_test} from "../plugins/ec-proce";
import GlobalStatus from "./global";
import EC_Event from "../lib/ec-event";
import EC_Shortcut from "../lib/ec-shortcut";

class Core {
    private icon: any;
    constructor(win: BrowserWindow, icon: any) {
        // 初始化全局配置
        GlobalStatus.loadConfig(win, this);
        new EC_Event();
        new EC_Shortcut();
        this.icon = icon;
        if (!GlobalStatus.config.app_name) {
            win.show();
            win.title = "EC框架 - 请设置应用名称";
            throw new Error("请设置应用名称");
        }
        // 高版本在窗体加载的时候显示 开发者控制台  会输出警告. 旧版本 ^22.3.4 正常
        if (ec_is_test && GlobalStatus.config.dev_tool?.active) {
            if (!win.webContents.isDevToolsOpened()) {
                win.webContents.toggleDevTools();
            }
        }
        // 托盘
        GlobalStatus.tray = new TrayMgr();
        win.title = GlobalStatus.config.app_name;
        // 基础的加载完成之后再显示窗口
        win.show();
        GlobalStatus.control.SendRenderMsg({success: true, msg: "", data: {winID: win.id, type: "winID"}});
    }

    /**
     * 关闭指定ID的窗口
     * @param winID
     */
    closeWin(winID: number) {
        if (winID === GlobalStatus.winMain.id) {
            // 关闭主窗口
            EC_APP.quit();
        }
        const childWin = GlobalStatus.childWin[winID];
        if (!childWin) {
            return;
        }
        childWin.destroy();
    }

    /**
     * 根据传入的窗口ID获取窗口对象
     * @param winID
     * @returns
     */
    GetWinByWinID(winID: string): BrowserWindow {
        return GlobalStatus.childWin[winID];
    }

    /**
     * 重启程序
     */
    reloadWin() {
        // 仅正式环境能正常使用重启应用
        if (ec_is_test && process.env["ELECTRON_RENDERER_URL"]) {
            GlobalStatus.control.SendRenderMsgToAll(IPCResult(false, "开发环境无法重启应用", {type: "tip"}));
        } else {
            EC_APP.relaunch();
            EC_APP.exit();
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
            parent: GlobalStatus.winMain,
            ...(process.platform === "linux" ? {icon} : {icon}),
            webPreferences: {
                preload: EC_Join(__dirname, "../preload-child/child-preload.js"), // 加载预加载脚本
                contextIsolation: true,
                sandbox: false,
            },
        });
        win.setSkipTaskbar(false); // 不显示子窗口的任务栏图标

        win.on("ready-to-show", () => {
            win.title = `EC框架-子窗体:${win.id}`;
            // 设置窗口类型-为子窗口
            win["win_type"] = "child-win";
            // 保存窗口对象
            GlobalStatus.childWin[win.id] = win;
            win.show();
            // 测试环境 才显示控制台
            if (ec_is_test && !win.webContents.isDevToolsOpened() && GlobalStatus.config.dev_tool?.active) {
                win.webContents.toggleDevTools();
            }
            GlobalStatus.control.SendRenderMsgChild(win, {success: true, msg: "", data: {winID: win.id, type: "winID"}});
        });

        win.webContents.setWindowOpenHandler((details) => {
            EC_SHELL.openExternal(details.url);
            return {action: "deny"};
        });

        // 关闭子窗口之后,从主进程的窗口管理里面去除
        win.on("close", () => {
            delete GlobalStatus.childWin[win.id];
        });
        // 如果没有传入地址,那就默认新增小工具窗口
        if (!url) {
            win.loadFile(EC_Join(__dirname, "../renderer/index.html"));
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
        const obj = EC_Notify({
            appID: "EC-eval",
            title,
            message,
            icon: EC_Join(process.cwd(), "resources\\assets\\icon.png"),
        });
        return obj;
    };
}

Core.toString = () => "[class Core]";
export default Core;
