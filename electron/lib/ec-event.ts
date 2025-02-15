/**
 * @time   2024/07/24 12:27:42
 * @author Eval
 * @description 主进程窗口事件
 */

import {app, dialog} from "electron";
import GlobalStatus from "../core/ec-global";

class EC_Event {
    constructor() {
        // 当所有窗口关闭时退出应用程序，但在 macOS 上除外。
        // 在 macOS 上，应用程序和菜单栏通常会保持活动状态，直到用户使用 Cmd + Q 明确退出。
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
        // 手动触发了页面刷新之后, 会导致重复监听.
        process.removeAllListeners();
        process.on("uncaughtException", (error) => {
            // 如果窗口已经被销毁了就不执行
            if (GlobalStatus.winMain.isDestroyed()) {
                return;
            }
            GlobalStatus.logger.error(`EC框架异常,${error.stack}`);
            if (GlobalStatus.control) {
                GlobalStatus.control.SendRenderMsg({success: false, msg: error.message, data: {title: "EC框架异常", type: "dialog"}});
            } else {
                GlobalStatus.winMain.hide(); // 隐藏主窗口
                dialog
                    .showMessageBox({
                        type: "warning",
                        title: "警告",
                        message: "EC框架异常,见日志文件",
                        detail: `EC框架异常,${error.stack}`,
                        buttons: ["退出"],
                    })
                    .then(() => {
                        app.quit();
                    });
            }
        });

        /** 重复启动实例时,显示主窗口 */
        app.on("second-instance", () => {
            if (process.platform === "win32") {
                if (GlobalStatus.winMain) {
                    if (GlobalStatus.winMain.isMinimized()) {
                        GlobalStatus.winMain.restore();
                    }
                    if (GlobalStatus.winMain.isVisible()) {
                        GlobalStatus.winMain.focus();
                    } else {
                        GlobalStatus.winMain.show();
                    }
                }
            }
        });

        /**
         * * 主窗口关闭前, 销毁所有子窗口
         */
        GlobalStatus.winMain.on("close", (event: Electron.Event) => {
            Object.values(GlobalStatus.ecWinList).forEach((win) => {
                if (win["win_type"] === "main") {
                    event.preventDefault();
                    if (GlobalStatus.config.tray?.active && GlobalStatus.config.standby) {
                        win.hide();
                        GlobalStatus.tray.setMsg("程序正在运行中,隐藏窗口时间为:" + new Date().toLocaleString());
                        return;
                    }
                }
                win.destroy();
            });
        });

        /**
         * * 主窗口关闭后, 销毁所有子窗口
         */
        GlobalStatus.winMain.on("closed", () => {
            Object.values(GlobalStatus.ecWinList).forEach((win) => {
                win.destroy();
            });
        });
    }
}

EC_Event.toString = () => "[class EC_Event]";
export default EC_Event;
