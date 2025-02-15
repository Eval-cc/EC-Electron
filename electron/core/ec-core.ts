/**
 * @time   2024/04/15 19:01:06
 * @author Eval
 * @description 全局控制脚本
 */
import {app as EC_APP, shell as EC_SHELL, BrowserWindow} from "electron";
import {join as EC_Join} from "path";
import {notify as EC_Notify} from "node-notifier";
import TrayMgr from "../plugins/ec-tray";
import {IPCResult} from "./ec-IPCResult";
import {ec_is_test} from "../plugins/ec-proce";
import GlobalStatus from "./ec-global";
import EC_Event from "../lib/ec-event";
import EC_Shortcut from "../lib/ec-shortcut";
import AutoLaunch from "auto-launch";

class Core {
    private icon: any;
    constructor(win: BrowserWindow, icon: any) {
        // 直接显示,等待logo的时候开始加载配置信息
        win.show();
        // 初始化全局配置
        GlobalStatus.loadConfig(win, this);
        new EC_Event();
        this.icon = icon;
        if (!GlobalStatus.config.app_name) {
            win.show();
            win.title = "EC框架 - 请设置应用名称";
            throw new Error("请设置应用名称");
        }
        // 延迟加载不重要的配置
        this.__init__delay(win);
    }

    /**
     * 初始化延迟加载
     * @param win
     */
    private __init__delay(win: BrowserWindow) {
        GlobalStatus.control.SendRenderMsg({success: true, msg: "", data: {type: "winID"}});
        // 托盘可以延迟一点加载
        setTimeout(() => {
            win.title = GlobalStatus.config.app_name as string;

            if (ec_is_test && GlobalStatus.config.dev_tool?.active) {
                if (!win.webContents.isDevToolsOpened()) {
                    win.webContents.toggleDevTools();
                }
            }
            // 注册快捷键
            new EC_Shortcut();

            const autoLaunch = new AutoLaunch({
                name: GlobalStatus.config.app_name as string, // 设置应用名称
                isHidden: GlobalStatus.config.auto_launch?.isHidden, // 启动时是否隐藏窗口
            });
            // 启用开机自启动
            autoLaunch
                .isEnabled()
                .then((isEnabled: boolean) => {
                    //  读取配置文件是否配置了自启动
                    if (GlobalStatus.config.auto_launch?.active && !isEnabled) {
                        autoLaunch.enable(); // 启用自启动
                    } else {
                        autoLaunch.disable(); // 关闭自启动
                    }
                })
                .catch((error: any) => {
                    throw new Error(`EC框架-自动启动失败:${error.stack}`);
                });

            // 托盘开关是否打开
            if (GlobalStatus.config.tray?.active) {
                // 托盘
                GlobalStatus.tray = new TrayMgr();
            }
        }, 1000);
    }

    /**
     * 关闭指定ID的窗口
     * @param winID
     */
    closeWin(winID: number) {
        if (winID === GlobalStatus.winMain.id) {
            // 关闭主窗口
            EC_APP.quit();
            Object.values(GlobalStatus.ecWinList).forEach((win) => {
                win.destroy();
            });
            return;
        }
        const ecWinList = GlobalStatus.ecWinList[winID];
        if (!ecWinList) {
            return;
        }
        delete GlobalStatus.ecWinList[winID];
        ecWinList.destroy();
    }

    /**
     * 根据传入的窗口ID获取窗口对象
     * @param winID
     * @returns
     */
    GetWinByWinID(winID: string): BrowserWindow {
        return GlobalStatus.ecWinList[winID];
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
            ...(process.platform === "linux" ? {icon} : {icon}),
            webPreferences: {
                // preload: EC_Join(__dirname, "../child-preload/index.js"), // 加载预加载脚本
                preload: EC_Join(__dirname, "../preload/child-preload.js"), // 加载预加载脚本
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
            GlobalStatus.ecWinList[win.id] = win;
            win.show();
            // 测试环境 才显示控制台
            if (ec_is_test && !win.webContents.isDevToolsOpened() && GlobalStatus.config.dev_tool?.active) {
                win.webContents.toggleDevTools();
            }
            GlobalStatus.control.SendRenderMsg({success: true, msg: "", data: {type: "winID"}}, win);
        });

        win.webContents.setWindowOpenHandler((details) => {
            EC_SHELL.openExternal(details.url);
            return {action: "deny"};
        });

        // 关闭子窗口之后,从主进程的窗口管理里面去除
        win.on("close", () => {
            win.destroy();
            delete GlobalStatus.ecWinList[win.id];
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
