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
    RegisterService = async () => {
        try {
            [await import("../services/test")].forEach((model) => new model.default());
        } catch (error: any) {
            this.logger.error("注册服务时出错:" + error);
            throw new Error("注册服务时出错:" + error.stack);
        }
    };

    /**
     * 主动向页面推送消息
     * @param msg 消息体
     * @param channel 消息通道,-默认主推主进程
     */
    SendRenderMsg = (msg: IPCModelTypeRender, channel: string = "message-from-main") => {
        // 如果没有指定类型,那么默认就是普通的弹窗消息
        if (!msg.data) {
            msg.data = {};
        }
        if (!msg.data?.type) {
            msg.data["type"] = "tip";
        }
        GlobalStatus.winMain.webContents.send(channel, msg);
    };

    /**
     * 主动向子进程推送消息
     * @param msg
     */
    SendRenderMsgChild = (win: BrowserWindow, msg: IPCModelTypeRender) => {
        // 如果没有指定类型,那么默认就是普通的弹窗消息
        if (!msg.data) {
            msg.data = {};
        }
        if (!msg.data?.type) {
            msg.data["type"] = "tip";
        }
        win.webContents.send("message-from-child", msg);
    };

    /**
     * 给所有的窗体推送消息
     * @param msg
     */
    SendRenderMsgToAll = (msg: IPCModelTypeRender) => {
        // 如果没有指定类型,那么默认就是普通的弹窗消息
        if (!msg.data) {
            msg.data = {};
        }
        if (!msg.data?.type) {
            msg.data["type"] = "tip";
        }
        GlobalStatus.winMain.webContents.send("message-from-main", msg);
        Object.values(GlobalStatus.childWin).forEach((win) => {
            win.webContents.send("message-from-child", msg);
        });
    };
}

Controller.toString = () => "[class Controller]";
export default Controller;
