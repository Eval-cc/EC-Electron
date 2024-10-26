/**
 * @time   2024/07/24 10:35:39
 * @author Eval
 * @description 测试服务类
 */
import {Service} from "../core/service";
import {IPCResult} from "../core/IPCResult";
import {exec} from "child_process";
import path from "path";
import {extraPath} from "../core/proce";

import Logger from "../core/logger";
import {IPCModelTypeMain, IPCModelTypeRender} from "../core/models";
import GlobalStatus from "../core/global";
import {shell} from "electron";

export default class Test extends Service {
    logger: Logger;
    constructor() {
        super();
        this.logger = new Logger();
    }

    test() {
        return IPCResult(true, "我是测试注入的方法");
    }

    /**
     * 测试调用dll获取计算结果
     * @param args
     * @returns
     */
    InvokerDll(args: IPCModelTypeMain) {
        // 程序和 DLL 的路径
        const exePath = path.resolve(extraPath(), "ec-dll.exe");
        const dllPath = path.resolve(extraPath(), "test.dll");
        const className = "Test.Add"; // 命名空间.类名 (没有命名空间的可忽略)
        const methodName = "addNum"; // 方法名
        const params = args.data as Array<number>; // 参数数组, (测试dll 接收的参数是 ,int a, int b,int c)
        // 构建命令行参数
        const command = `"${exePath}" "${dllPath}" ${className} ${methodName} ${params.join(" ")}`;

        // 执行程序来调用dll获取返回值
        return new Promise((resolve, reject) => {
            exec(command, {encoding: "utf8"}, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    this.logger.error(`执行出错: ${error}`);
                    reject(IPCResult(false, `执行出错: ${error}`));
                } else if (stderr) {
                    this.logger.error(`执行出错: ${stderr}`);
                    resolve(IPCResult(false, stderr));
                    return;
                } else {
                    resolve(IPCResult(true, `通过调用dll计算的结果是:${stdout.trim()}`));
                }
            });
        });
    }
    /**
     * 重启
     * @param _
     */
    Restart(_: IPCModelTypeMain) {
        GlobalStatus.core.reloadWin();
    }

    /**
     * 退出
     * @param _
     */
    Exit(_: IPCModelTypeMain) {
        GlobalStatus.core.closeWin(GlobalStatus.winMain.id);
    }
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
        GlobalStatus.core.show_notifier(message, callback);
        return IPCResult(true, "气泡已弹出");
    };

    /**
     * 打开新窗口
     * @param args
     */
    openWin = (args?: IPCModelTypeMain): void => {
        if (!args) return;
        if (args?.win_type === "child-win" && args.winID) {
            const win = GlobalStatus.core.GetWinByWinID(args.winID);
            win && GlobalStatus.control.SendRenderMsgChild(win, {success: true, msg: "已关闭子窗口调用新窗口功能"});
            return;
        }
        GlobalStatus.core.openWin(args?.data?.url);
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
}
