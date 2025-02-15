/**
 * @time   2024/04/15 19:55:32
 * @author Eval
 * @description 接受事件控制层
 */
import {ipcMain, IpcMainInvokeEvent, BrowserWindow} from "electron";
import {IPCModelTypeMain, IPCModelTypeRender} from "../lib/ec-models";
import {IPCResult} from "./ec-IPCResult";
import GlobalStatus from "./ec-global";
import {Service} from "./ec-service";
import fs from "fs-extra";
import ecModules from "../lib/ec-modules";

class Controller {
    constructor() {
        // 把controller注入到全局-避免主线程重复监听事件抛出异常
        if (GlobalStatus.control) return;
        GlobalStatus.control = this;
        try {
            ipcMain.handle("handleIPC", async (event: IpcMainInvokeEvent, args: IPCModelTypeMain): Promise<IPCModelTypeRender> => {
                // 处理接收到的参数
                const data: IPCModelTypeMain = {...args} as IPCModelTypeMain;
                if (!data.data) {
                    data.data = {
                        IpcMainInvokeEvent: event, // 将当前监听的 ipc 事件传过去
                    };
                }
                try {
                    const result = await Service.Invoke(data.fun, data);
                    if (result) return result;
                    return IPCResult(false, "无返回值");
                } catch (e: any) {
                    GlobalStatus.logger.error(`调用服务出错:${e.stack}`);
                    return IPCResult(false, e.message);
                }
            });
        } catch (error: any) {
            GlobalStatus.logger.error("监听handleIPC事件出错:" + error.stack);
        }
        // 注册服务
        this.RegisterService();
    }
    /**
     * 注册服务
     */
    RegisterService() {
        ecModules();
        const pluginsPath = `${process.cwd()}/plugins`;
        if (fs.pathExistsSync(pluginsPath)) {
            // 动态注册插件服务
            fs.readdir(pluginsPath, (error: any, files: string[]) => {
                if (error) throw new Error(error.stack);
                files
                    .filter((file) => file.endsWith(".js"))
                    .forEach((file: string) => {
                        try {
                            require(`${process.cwd()}/plugins/${file}`).install(GlobalStatus);
                        } catch (error: any) {
                            GlobalStatus.logger.error(`注册插件服务出错:${error.stack}`);
                        }
                    });
            });
        }
    }

    /**
     * 主动向页面推送消息
     * @param msg 消息体
     * @param win 需要给哪个窗口推送消息, 默认是主窗口
     */
    SendRenderMsg = (msg: IPCModelTypeRender, win: BrowserWindow = GlobalStatus.winMain) => {
        // 如果没有指定类型,那么默认就是普通的弹窗消息
        if (!msg.data) {
            msg.data = {};
        }
        if (!msg.data?.type) {
            msg.data["type"] = "tip";
        }
        msg.winID = win.id;
        if (win["win_type"] === "main") {
            win.webContents.send("ec-channel-message", msg);
        } else {
            win.webContents.send("ec-channel-message-child", msg);
        }
    };

    /**
     * 主动向子进程推送消息
     * @param win 目前子窗体
     * @param options 消息体
     */
    SendRenderMsgChild = (win: BrowserWindow, options: IPCModelTypeRender) => {
        // 如果没有指定类型,那么默认就是普通的弹窗消息
        if (!options.data) {
            options.data = {};
        }
        if (!options.data?.type) {
            options.data["type"] = "tip";
        }
        options.winID = win.id;
        win.webContents.send("ec-channel-message-child", options);
    };

    /**
     * 给所有的窗体推送消息
     * @param options
     */
    SendRenderMsgToAll = (options: IPCModelTypeRender) => {
        // 如果没有指定类型,那么默认就是普通的弹窗消息
        if (!options.data) {
            options.data = {};
        }
        if (!options.data?.type) {
            options.data["type"] = "tip";
        }
        Object.values(GlobalStatus.ecWinList).forEach((win) => {
            options.winID = win.id;
            if ((win["win_type"] = "main")) {
                win.webContents.send("ec-channel-message", options);
            } else {
                win.webContents.send("ec-channel-message-child", options);
            }
        });
    };
}

Controller.toString = () => "[class Controller]";
export default Controller;
