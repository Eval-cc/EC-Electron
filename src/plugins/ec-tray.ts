/**
 * @time   2024/04/16 20:59:53
 * @author Eval
 * @description 托盘控件
 */
import {Tray, Menu, nativeImage} from "electron";
import path from "path";
import Core from "../core/core";
import GlobalStatus from "../core/global";


class TrayMgr {
    private tray!: Tray;
    private core: Core;
    private fliTime!: NodeJS.Timeout | null; // 闪烁定时器
    private iconDict: any;
    constructor(core: Core) {
        this.core = core;
        this.LoadConfig();
    }

    /**
     * 读取本地文件并初始化配置
     */
    private LoadConfig() {
        if (!GlobalStatus.config.tray) {
            throw new Error("tray配置不存在");
        }
        const contextMenu = Menu.buildFromTemplate([
            {label: "显  示", type: "normal", click: () => GlobalStatus.winMain.show()},
            {label: "隐  藏", type: "normal", click: () => GlobalStatus.winMain.hide()},
            {label: "退  出", type: "normal", click: () => this.core.closeWin(GlobalStatus.winMain.id)},
        ]);

        this.iconDict = {
            icon1: nativeImage.createFromPath(path.join(process.cwd(), "resources/assets", GlobalStatus.config.tray.icon)),
            icon2: nativeImage.createFromPath(path.join(process.cwd(), "resources/assets", GlobalStatus.config.tray.iconHide)),
        };

        this.tray = new Tray(this.iconDict.icon1);
        // 双击托盘图标时显示主窗口
        this.tray.on("double-click", () => {
            GlobalStatus.winMain.show();
        });
        this.tray.setContextMenu(contextMenu);
        this.tray.setToolTip(GlobalStatus.config.tray.tooltip);
        this.tray.setTitle(GlobalStatus.config.tray.title);
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
