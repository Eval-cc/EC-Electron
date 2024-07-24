/**
 * @time   2024/04/16 20:59:53
 * @author Eval
 * @description 托盘控件
 */
import {BrowserWindow, Tray, Menu, nativeImage} from "electron";
import path from "path";
import Core from "./core";
import GlobalStatus from "./global";

class TrayMgr {
    private tray: Tray;
    private win: BrowserWindow;
    private core: Core;
    private fliTime!: NodeJS.Timeout | null; // 闪烁定时器
    private iconDict: any;
    constructor(win: BrowserWindow, core: Core) {
        this.win = win;
        this.core = core;
        this.iconDict = {
            icon1: nativeImage.createFromPath(path.join(process.cwd(), "resources/assets/icon.png")),
            icon2: nativeImage.createFromPath(path.join(process.cwd(), "resources/assets/none.png")),
        };

        this.tray = new Tray(this.iconDict.icon1);
        const contextMenu = Menu.buildFromTemplate([
            {label: "打开新窗口", type: "normal", click: () => GlobalStatus.control.openWin()},
            {label: "关闭闪烁", type: "normal", click: () => this.flicker(false)},
            {label: "显  示", type: "normal", click: () => this.win.show()},
            {label: "隐  藏", type: "normal", click: () => this.win.hide()},
            {label: "退  出", type: "normal", click: () => this.core.closeWin("-1")},
        ]);
        // 双击托盘图标时显示主窗口
        this.tray.on("double-click", () => {
            this.win.show();
        });
        this.tray.setContextMenu(contextMenu);
        this.tray.setToolTip("EC框架 @Eval");
        this.tray.setTitle("EC框架");
    }

    /**
     * 切换托盘闪烁状态
     * @param flash
     * @returns
     */
    flicker(flash: boolean = true) {
        if (!flash) {
            this.tray.setImage(this.iconDict.icon1);
            if (!this.fliTime) return;
            // 已经在闪烁状态了就停止闪烁
            clearInterval(this.fliTime as NodeJS.Timeout);
            this.fliTime = null;
        } else {
            let sta = true;
            this.fliTime = setInterval(() => {
                // 开始闪烁
                this.tray.setImage(sta ? this.iconDict.icon1 : this.iconDict.icon2);
                sta = !sta;
            }, 500);
        }
    }

    /**
     * 设置托盘气泡内容
     * @param msg
     */
    setMsg(msg: string) {
        this.tray.setToolTip(msg);
    }
}

export default TrayMgr;
