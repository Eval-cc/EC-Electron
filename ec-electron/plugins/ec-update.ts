/**
 * @time   2024/10/30 13:03:59
 * @author Eval
 * @description 更新插件,框架自带的更新插件, 仅支持热更新
 */

// import {autoUpdater, UpdateInfo} from "electron-updater";
import GlobalStatus from "../core/ec-global";
import {IPCResult} from "../core/ec-IPCResult";
import {IPCModelTypeRender} from "../lib/ec-models";
import {ec_source_path} from "./ec-proce";
import ECRequest from "./ec-request";
import {join as EC_Join} from "path";
import fs from "fs-extra";
import AdmZip from "adm-zip";

// class ECUpdate {
//     dev_upgrade: boolean = false; // 是否运行开发环境更新
//     constructor() {
//         GlobalStatus.logger.info("ECUpdate 更新插件初始化");
//         this.initialize();
//     }

//     /** 初始化更新检测 */
//     private initialize() {
//         if (!GlobalStatus.config.update || !GlobalStatus.config.update.url) {
//             GlobalStatus.control.SendRenderMsg(IPCResult(false, "无法启动更新,未找到更新服务器地址"));
//             return;
//         }
//         // 设置更新服务器 URL
//         autoUpdater.setFeedURL({
//             provider: "generic" /** 设置 provider 为 'generic' */,
//             url: GlobalStatus.config.update.url,
//         });
//         //自动下载更新
//         autoUpdater.autoDownload = GlobalStatus.config.update.autoDownload;
//         autoUpdater.forceDevUpdateConfig = true; // 强制开发环境更新
//         //退出时自动安装更新
//         autoUpdater.autoInstallOnAppQuit = GlobalStatus.config.update.autoInstallOnAppQuit;

//         // autoUpdater.updateConfigPath = "123"; // 设置更新配置文件路径
//         // 监听更新事件
//         autoUpdater.on("checking-for-update", () => {
//             GlobalStatus.control.SendRenderMsg(IPCResult(true, "正在检查更新...", {type: "loading"}));
//         });

//         autoUpdater.on("update-available", (info: UpdateInfo) => {
//             GlobalStatus.control.SendRenderMsg(
//                 IPCResult(
//                     true,
//                     `<pre>
//                     有新版本发布了
//                     版本号:v${info.version}
//                     发布时间:${info.releaseDate}
//                     资源包大小:${Math.round(Number(info.files[0].size) / 1024)}kb
//                     </pre>`.replace(/\t| /g, ""),
//                     {
//                         type: "dialog",
//                         title: "更新提示",
//                         options: {dangerouslyUseHTMLString: true, type: "success", "show-close": false, closeOnClickModal: false, closeOnPressEscape: false, ipc: "DownLoadUpdate"},
//                     },
//                 ),
//             );
//         });

//         autoUpdater.on("update-not-available", () => {
//             GlobalStatus.control.SendRenderMsg(IPCResult(false, "没有可用的更新"));
//         });

//         autoUpdater.on("error", (error) => {
//             GlobalStatus.control.SendRenderMsg(IPCResult(false, `更新出错:${error}`, {type: "dialog"}));
//         });

//         autoUpdater.on("download-progress", (progressObj) => {
//             const {percent} = progressObj;
//             GlobalStatus.control.SendRenderMsg(IPCResult(true, `下载进度: ${percent.toFixed(2)}%`));
//         });

//         autoUpdater.on("update-downloaded", () => {
//             GlobalStatus.control.SendRenderMsg(IPCResult(true, `更新下载完成。正在安装...`));
//             this.InstallUpdate();
//         });
//     }

//     /** 自动检查更新 */
//     AutoCheckUpdate() {
//         if (!app.isPackaged && !this.dev_upgrade) {
//             GlobalStatus.control.SendRenderMsg(IPCResult(false, "开发环境无法检查更新,请先打包"));
//             return;
//         }
//         autoUpdater.checkForUpdatesAndNotify(); // 检查更新并弹出通知
//     }

//     /** 手动检查更新 */
//     CheckUpdate(): Promise<IPCModelTypeRender> {
//         // 检查是否已检测到可用更新
//         return new Promise((resolve, reject) => {
//             autoUpdater
//                 .checkForUpdates()
//                 .then((updateInfo) => {
//                     if (updateInfo && updateInfo.updateInfo && updateInfo.updateInfo.version) {
//                         resolve(
//                             IPCResult(true, "有可用的更新", {
//                                 type: "dialog",
//                                 title: "更新提示",
//                                 options: {dangerouslyUseHTMLString: true, type: "success", "show-close": false, closeOnClickModal: false, closeOnPressEscape: false, ipc: "DownLoadUpdate"},
//                             }),
//                         );
//                     } else {
//                         resolve(IPCResult(false, "没有可用的更新"));
//                     }
//                 })
//                 .catch((error) => {
//                     reject(IPCResult(false, `检查更新失败: ${error}`));
//                 });
//         });
//     }

//     /** 下载更新 */
//     DownloadUpdate() {
//         // 检查是否已检测到可用更新
//         autoUpdater
//             .checkForUpdates()
//             .then((updateInfo) => {
//                 if (updateInfo && updateInfo.updateInfo && updateInfo.updateInfo.version) {
//                     GlobalStatus.control.SendRenderMsg(IPCResult(true, "开始下载更新..."));
//                     autoUpdater.downloadUpdate(); // 手动开始下载
//                 } else {
//                     GlobalStatus.control.SendRenderMsg(IPCResult(false, "没有可用的更新进行下载"));
//                     GlobalStatus.logger.info("没有可用的更新进行下载");
//                 }
//             })
//             .catch((error) => {
//                 GlobalStatus.control.SendRenderMsg(IPCResult(false, `检查更新失败: ${error}`));
//                 GlobalStatus.logger.error(`检查更新失败: ${error}`);
//             });
//     }

//     /** 安装更新 */
//     InstallUpdate() {
//         autoUpdater.quitAndInstall(); // 退出并安装更新
//     }
// }

class ECUpdate {
    dev_upgrade: boolean = false; // 是否允许开发环境执行更新
    ecRequest: ECRequest;
    constructor() {
        GlobalStatus.logger.info("ECUpdate 更新插件初始化");
        this.ecRequest = new ECRequest();
        this.initialize();
    }

    /** 初始化更新检测 */
    private initialize() {
        if (!GlobalStatus.config.update || !GlobalStatus.config.update.url) {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "无法启动更新,未找到更新服务器地址"));
            return;
        }
    }

    /** 自动检查更新 */
    AutoCheckUpdate() {
        if (!this.dev_upgrade) {
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "开发环境无法检查更新,请先打包"));
            return;
        }
        this.AutoCheckUpdate();
    }

    /** 手动检查更新 */
    CheckUpdate(): Promise<IPCModelTypeRender> {
        return new Promise((resolve) => {
            if (!GlobalStatus.config.update || !GlobalStatus.config.update.url) {
                IPCResult(false, "无法启动更新,未找到更新服务器地址");
                return;
            }
            this.ecRequest
                .Get(EC_Join(GlobalStatus.config.update.url, "as_assets.json"))
                .then((res) => {
                    if (res.success) {
                        // 获取本地版本号
                        const localPath = EC_Join(ec_source_path, "version", "version.json");
                        if (!fs.pathExistsSync(localPath)) {
                            fs.ensureFileSync(localPath);
                        }
                        let localVersion = fs.readFileSync(localPath).toString() as unknown as {[key: string]: any};
                        if (localVersion.trim().length === 0) {
                            localVersion = {version: "1.0.0"};
                        }
                        if (!localVersion || !localVersion.version) {
                            localVersion.version = "1.0.0";
                        }
                        const cloudeVer = res.data?.data ? JSON.parse(res.data.data) : {version: "1.0.0"};
                        if (cloudeVer.version !== localVersion.version) {
                            GlobalStatus.control.SendRenderMsg(
                                IPCResult(true, "有可用的更新", {
                                    type: "dialog",
                                    title: "新版本发布了",
                                    options: {
                                        dangerouslyUseHTMLString: true,
                                        type: "success",
                                        "show-close": false,
                                        closeOnClickModal: false,
                                        closeOnPressEscape: false,
                                        ipc: "DownLoadUpdate",
                                        content: `有新版本发布了<br>版本号:v${cloudeVer.version}<br>发布时间:${cloudeVer.releaseDate},<br>更新内容:${cloudeVer.description}`,
                                    },
                                }),
                            );
                            resolve(IPCResult(true, "新版本发布了"));
                        } else {
                            resolve(IPCResult(false, "没有可用的更新"));
                        }
                    } else {
                        GlobalStatus.logger.error(`获取版本号失败: ${JSON.stringify(res)}`);
                        resolve(IPCResult(false, "获取版本号失败"));
                    }
                })
                .catch((error) => {
                    GlobalStatus.logger.error(`检查更新失败: ${error.stack}`);
                    resolve(IPCResult(false, `检查更新失败: ${error.message}`));
                });
        });
    }

    /** 下载更新 */
    async DownloadUpdate(url: string): Promise<IPCModelTypeRender> {
        const savePath = EC_Join(ec_source_path, GlobalStatus.config.update?.savePath as string);
        // 目录不存在就新建一个
        if (!fs.pathExistsSync(savePath)) {
            fs.ensureDirSync(savePath);
        }
        const file_path = EC_Join(savePath, GlobalStatus.config.update?.upgradeName as string);
        // 删除之前的资源包
        if (fs.existsSync(file_path)) {
            fs.removeSync(file_path);
        }
        return await this.ecRequest.download(url, file_path);
    }

    /** 安装更新 */
    InstallUpdate(): IPCModelTypeRender {
        const savePath = EC_Join(ec_source_path, GlobalStatus.config.update?.savePath as string);
        if (!fs.pathExistsSync(savePath)) {
            return IPCResult(false, "无法安装更新,资源包包路径不存在");
        }
        const zip_path = EC_Join(savePath, GlobalStatus.config.update?.upgradeName as string);

        const zip = new AdmZip(zip_path);
        // 解压文件到指定路径
        zip.extractAllTo(savePath, /*overwrite*/ true);
        setTimeout(() => {
            // 删除更新压缩包
            fs.removeSync(zip_path);
        }, 1000);
        return IPCResult(true, "开始安装更新...");
    }
}

ECUpdate.toString = () => "[class ECUpdate]";
export default ECUpdate;
