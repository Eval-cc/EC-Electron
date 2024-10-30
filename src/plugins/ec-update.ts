/**
 * @time   2024/10/30 13:03:59
 * @author Eval
 * @description 更新插件
 */

import {autoUpdater, UpdateInfo} from "electron-updater";
import GlobalStatus from "../core/global";
import {IPCResult} from "../core/IPCResult";
import {app} from "electron";
import Logger from "../core/logger";

class ECUpdate {
    logger: Logger;
    constructor() {
        this.logger = new Logger();
        this.logger.debug("ECUpdate 更新插件初始化");
        this.initialize();
    }

    /** 初始化更新检测 */
    private initialize() {
        if (!GlobalStatus.config.update || !GlobalStatus.config.update.url) {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "无法启动更新,未找到更新服务器地址"));
            return;
        }
        // 设置更新服务器 URL
        autoUpdater.setFeedURL({
            provider: "generic" /** 设置 provider 为 'generic' */,
            url: GlobalStatus.config.update.url,
        });
        //自动下载更新
        autoUpdater.autoDownload = GlobalStatus.config.update.autoDownload;
        //退出时自动安装更新
        autoUpdater.autoInstallOnAppQuit = GlobalStatus.config.update.autoInstallOnAppQuit;

        // 监听更新事件
        autoUpdater.on("checking-for-update", () => {
            GlobalStatus.control.SendRenderMsg(IPCResult(true, "正在检查更新..."));
        });

        autoUpdater.on("update-available", (info: UpdateInfo) => {
            GlobalStatus.control.SendRenderMsg(
                IPCResult(
                    true,
                    `<pre>
                    有新版本发布了
                    版本号:v${info.version}
                    发布时间:${info.releaseDate}
                    资源包大小:${Math.round(Number(info.files[0].size) / 1024)}kb
                    </pre>`.replace(/\t| /g, ""),
                    {
                        type: "dialog",
                        title: "更新提示",
                        options: {dangerouslyUseHTMLString: true, type: "success", "show-close": false, closeOnClickModal: false, closeOnPressEscape: false, ipc: "DownLoadUpdate"},
                    },
                ),
            );
        });

        autoUpdater.on("update-not-available", () => {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "没有可用的更新"));
        });

        autoUpdater.on("error", (error) => {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, `自动更新出错:${error}`));
        });

        autoUpdater.on("download-progress", (progressObj) => {
            const {percent} = progressObj;
            GlobalStatus.control.SendRenderMsg(IPCResult(true, `下载进度: ${percent.toFixed(2)}%`));
        });

        autoUpdater.on("update-downloaded", () => {
            GlobalStatus.control.SendRenderMsg(IPCResult(true, `更新下载完成。正在安装...`));
            this.InstallUpdate();
        });
    }

    /** 自动检查更新 */
    AutoCheckUpdate() {
        if (!app.isPackaged) {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "开发环境无法检查更新,请先打包"));
            return;
        }
        autoUpdater.checkForUpdatesAndNotify(); // 检查更新并弹出通知
    }

    /** 手动检查更新 */
    CheckUpdate() {
        if (!app.isPackaged) {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "开发环境无法检查更新,请先打包"));
            return;
        }
        autoUpdater.checkForUpdates();
    }

    /** 下载更新 */
    DownloadUpdate() {
        // 下载逻辑在事件中处理
    }

    /** 安装更新 */
    InstallUpdate() {
        autoUpdater.quitAndInstall(); // 退出并安装更新
    }
}

ECUpdate.toString = () => "[class ECUpdate]";
export default ECUpdate;