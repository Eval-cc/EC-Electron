/**
 * @time   2024/10/30 13:03:59
 * @author Eval
 * @description 更新插件,框架自带的更新插件, 仅支持热更新
 */

// import {autoUpdater, UpdateInfo} from "electron-updater";
import GlobalStatus from "../core/ec-global";
import {IPCResult, IPResultDialog} from "../core/ec-IPCResult";
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
            GlobalStatus.control.SendRenderMsg(IPCResult(false, "开发环境无法检查更新"));
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
                .Get(EC_Join(GlobalStatus.config.update.url, GlobalStatus.config.update.api))
                .then((res) => {
                    if (res.success) {
                        // 获取本地版本号
                        const localPath = EC_Join(ec_source_path, "version", "version.json");
                        if (!fs.pathExistsSync(localPath)) {
                            fs.writeJSONSync(localPath, {version: "1.0.0"});
                        }

                        let localVersion = fs.readJSONSync(localPath);
                        const cloudeVer = res.data?.data ? JSON.parse(res.data.data) : {version: "1.0.0"};
                        if (cloudeVer.version !== localVersion.version) {
                            GlobalStatus.control.SendRenderMsg(
                                IPResultDialog(true, "有可用的更新", {
                                    dangerouslyUseHTMLString: true,
                                    type: "success",
                                    "show-close": false,
                                    closeOnClickModal: false,
                                    closeOnPressEscape: false,
                                    ipc: "DownLoadUpdate",
                                    content: `有新版本发布了<br>版本号:v${cloudeVer.version}<br>发布时间:${cloudeVer.time},<br>更新内容:${cloudeVer.notes.join("\n")}`,
                                    ipc_params: {url: cloudeVer.url, version: cloudeVer},
                                }),
                            );
                            resolve(IPCResult(true, "新版本发布了"));
                        } else {
                            resolve(IPCResult(true, "当前已经是最新版本"));
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
    async DownloadUpdate({url, version}: {url: string; version: any}): Promise<IPCModelTypeRender> {
        if (!url || !version) {
            return IPCResult(false, "下载更新失败,url或version参数为空");
        }
        const savePath = EC_Join(ec_source_path, GlobalStatus.config.update?.savePath as string);
        // 目录不存在就新建一个
        if (!fs.pathExistsSync(savePath)) {
            fs.ensureDirSync(savePath);
        }
        const file_path = EC_Join(savePath, GlobalStatus.config.update?.upgradeName as string) + ".zip";
        // 删除之前的资源包
        if (fs.existsSync(file_path)) {
            fs.removeSync(file_path);
        }
        return await this.ecRequest.download(url, file_path, (cbk) => {
            if (cbk.type === "progress") {
                GlobalStatus.control.SendRenderMsg(IPCResult(true, `下载进度: ${cbk.data.toFixed(2)}%`, {type: "process"}));
            } else if (cbk.type === "end") {
                GlobalStatus.control.SendRenderMsg(IPCResult(true, `下载完成,开始安装...`));
                const install = this.InstallUpdate();
                if (install.success) {
                    // 写入本地文件
                    const localPath = EC_Join(ec_source_path, "version", "version.json");
                    version.time = new Date().toLocaleString();
                    fs.writeJSONSync(localPath, version);
                }
                GlobalStatus.control.SendRenderMsg(install);
            }
        });
    }

    /** 安装更新 */
    InstallUpdate(): IPCModelTypeRender {
        const {savePath, upgradeName} = GlobalStatus.config.update!;
        if (!savePath || !upgradeName) {
            return IPCResult(false, "安装更新包失败,框架的配置文件,update.savePath或update.upgradeName参数为空");
        }
        const zip_path = EC_Join(ec_source_path, savePath as string, upgradeName as string) + ".zip";
        if (!fs.existsSync(zip_path)) {
            return IPCResult(false, "无法安装更新包,资源包不存在");
        }
        const install_path = EC_Join(ec_source_path, "app");
        try {
            // 安装之前,把之前的渲染进程 Out/目录删除, 避免更新次数多了之后, 文件占用体积大
            fs.renameSync(EC_Join(install_path, "out"), EC_Join(install_path, "out_bak"));
            const zip = new AdmZip(zip_path);
            // 解压文件到指定路径
            zip.extractAllTo(install_path, /*overwrite*/ true);
            setTimeout(() => {
                // 删除更新压缩包
                fs.remove(zip_path);
                // 删除旧out包
                fs.remove(EC_Join(install_path, "out_bak"));
            }, 1000);
        } catch (e: any) {
            // 安装失败了, 把之前的渲染进程 Out/目录还原回来
            if (fs.pathExistsSync(EC_Join(install_path, "out_bak"))) {
                fs.renameSync(EC_Join(install_path, "out_bak"), EC_Join(install_path, "out"));
            }
            return IPCResult(false, `安装更新包失败: ${e.message}`);
        }
        return IPCResult(true, "安装更新包结束...");
    }
}

ECUpdate.toString = () => "[class ECUpdate]";
export default ECUpdate;
