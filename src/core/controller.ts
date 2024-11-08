/**
 * @time   2024/04/15 19:55:32
 * @author Eval
 * @description 接受事件控制层
 */
import {ipcMain, IpcMainInvokeEvent, BrowserWindow} from "electron";
import EC_Logger from "../plugins/ec-log";
import {IPCModelTypeMain, IPCModelTypeRender} from "../core/models";
import {IPCResult} from "../core/IPCResult";
import GlobalStatus from "../core/global";
import {Service} from "../core/service";
import fs from "fs-extra";

class Controller {
    logger: EC_Logger;
    constructor() {
        this.logger = new EC_Logger();
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
                    this.logger.error(`调用服务出错:${e.stack}`);
                    return IPCResult(false, e.message);
                }
            });
        } catch (error: any) {
            this.logger.error("监听handleIPC事件出错:" + error.stack);
        }
        // 注册服务
        this.RegisterService();
    }
    /**
     * 注册服务
     */
    RegisterService() {
        try {
            import("../services/test").then((model) => new model.default());
        } catch (error: any) {
            this.logger.error("注册服务时出错:" + error);
            throw new Error("注册服务时出错:" + error.stack);
        }
        // 动态注册插件服务
        fs.readdir(`${process.cwd()}/plugins`, (error: any, files: string[]) => {
            if (error) throw new Error(error.stack);
            files.forEach((file: string) => {
                if (file.endsWith(".js")) {
                    try {
                        require(`${process.cwd()}/plugins/${file}`).install(GlobalStatus);
                    } catch (error: any) {
                        this.logger.error(`注册插件服务出错:${error.stack}`);
                    }
                }
            });
        });
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
