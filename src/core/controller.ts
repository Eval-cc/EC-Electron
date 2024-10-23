/**
 * @time   2024/04/15 19:55:32
 * @author Eval
 * @description 接受事件控制层
 */
import {ipcMain, shell, IpcMainInvokeEvent, BrowserWindow} from "electron";
import Core from "./core";
import Logger from "./logger";
import {IPCModelTypeMain, IPCModelTypeRender} from "./models";
import {IPCResult} from "./IPCResult";
import GlobalStatus from "./global";
import {Service} from "./service";

class Controller {
    core: Core;
    logger: Logger;
    constructor(core: Core) {
        this.core = core;
        this.logger = new Logger();
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
                if (this[data.fun]) {
                    // 返回处理结果
                    return this[data.fun](data);
                }
                try {
                    return Service.Invoke(data.fun, data);
                } catch (e: any) {
                    this.logger.error(`调用服务出错:${e.stack}`);
                    return IPCResult(false, "出错了");
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
        } catch (error) {
            this.logger.error("注册服务时出错:" + error);
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
     * 主动向子进程的也没推送消息
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
     * 打开新窗口
     * @param args
     */
    openWin = (args?: IPCModelTypeMain): void => {
        if (!args) return;
        if (args?.win_type === "child-win" && args.winID) {
            const win = this.core.GetWinByWinID(args.winID);
            win && this.SendRenderMsgChild(win, {success: true, msg: "已关闭子窗口调用新窗口功能"});
            return;
        }
        this.core.openWin(args?.data?.url);
    };

    /**
     * 使用浏览器打开网页
     * @param args
     */
    openUrl = (args: IPCModelTypeMain): IPCModelTypeRender => {
        if (args.data?.url) {
            shell.openExternal(args.data.url);
            return IPCResult(true, "正在打开浏览器...");
        }
        return IPCResult(false, "无法打开未知连接");
    };

    /**
     * 弹出气泡消息
     * @param args
     * @returns
     */
    nityfier = (args: IPCModelTypeMain): IPCModelTypeRender => {
        if (!args.data || !args.data.message) {
            return IPCResult(false, "未传入必要参数:消息内容");
        }
        const {message, callback} = args.data;
        this.core.show_notifier(message, callback);
        return IPCResult(true, "气泡已弹出");
    };

    /**
     *
     * @param args 监听 ACTION:CAPTURE_PAGE 事件，截图后转为 base64 向渲染进程传递
     * @returns
     */
    CAPTURE_PAGE = async (_: IPCModelTypeMain): Promise<IPCModelTypeRender> => {
        return {
            success: true,
            msg: "",
            data: await GlobalStatus.winMain.webContents.capturePage().then((page) => page.toDataURL()),
        };
    };

    /**
     * 重启
     * @param _
     */
    ReloadTool = (_: IPCModelTypeMain) => {
        this.core.reloadWin();
    };
}
Controller.toString = () => "[class Controller]";
export default Controller;
