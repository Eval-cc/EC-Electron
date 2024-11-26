/**
 * @time   2024/07/24 12:34:15
 * @author Eval
 * @description 注册快捷键
 */

import {globalShortcut} from "electron";
import EC_Logger from "../plugins/ec-log";
import GlobalStatus from "../core/ec-global";

class EC_Shortcut {
    constructor() {
        this.OnRegister();
    }

    /**
     * 监听未捕获的异常
     */
    private OnRegister() {
        if (GlobalStatus.config.dev_tool?.cmd) {
            // 注册 切换控制台的快捷键
            const ret = globalShortcut.register(GlobalStatus.config.dev_tool.cmd, () => {
                // 当快捷键被触发时执行的操作
                GlobalStatus.winMain.webContents.toggleDevTools();
                // 包括子窗体
                Object.values(GlobalStatus.ecWinList)
                    .filter((win) => win.id !== GlobalStatus.winMain.id)
                    .forEach((win) => {
                        win.webContents.toggleDevTools();
                    });
            });

            // 检查快捷键是否注册成功
            if (!ret) {
                GlobalStatus.logger.error("注册快捷键失败");
            }
        }
    }
}
EC_Shortcut.toString = () => "[class EC_Shortcut]";

export default EC_Shortcut;
