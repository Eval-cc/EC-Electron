/**
 * @time   2024/07/24 12:34:15
 * @author Eval
 * @description 注册快捷键
 */

import {globalShortcut} from "electron";
import Logger from "../core/logger";
import GlobalStatus from "../core/global";

class EC_Shortcut {
    private logger: Logger;
    constructor() {
        this.logger = new Logger();
        this.OnRegister();
    }

    /**
     * 监听未捕获的异常
     */
    private OnRegister() {
        // 注册全局快捷键---方便调试
        const ret = globalShortcut.register("CommandOrControl+Shift+F10", () => {
            // 当快捷键被触发时执行的操作
            GlobalStatus.winMain.webContents.toggleDevTools();
        });

        // 检查快捷键是否注册成功
        if (!ret) {
            this.logger.error("注册快捷键失败");
        }
    }
}
EC_Shortcut.toString = () => "[class EC_Shortcut]";

export default EC_Shortcut;
