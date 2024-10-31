/**
 * @time   2024/07/24 10:35:39
 * @author Eval
 * @description 测试服务类
 */
import {Service} from "../core/service";
import {IPCResult} from "../core/IPCResult";
import {exec} from "child_process";
import path from "path";
import {extraPath} from "../plugins/ec-proce";

import Logger from "../core/logger";
import {IPCModelTypeMain, IPCModelTypeRender} from "../core/models";
import GlobalStatus from "../core/global";
import {shell} from "electron";
import Koffi from "koffi";
import edgeJSInvokerDLL from "electron-edge-js";

export default class Test extends Service {
    logger: Logger;
    ecupdate?: any;
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
        const params = args.data as Array<number>; // 参数数组, (测试dll 接收的参数是 ,int a, int b,int c)
        if (!params) {
            return IPCResult(false, "参数错误");
        }
        const dllPath = path.resolve(extraPath, "test.dll");
        // 默认尝试读取C++ 类型的程序集
        try {
            const myLibrary = Koffi.load(dllPath); // 定义函数
            const addNum = myLibrary.func("__stdcall", "addNum", "int", ["int", "int", "int"]); // 定义函数

            // 调用函数
            const result = addNum(...params);
            return IPCResult(true, `通过Koffi调用 dll计算的结果是:${result}`);
        } catch {
            try {
                // 读取失败 尝试读取C#类型的程序集
                const AddNum = edgeJSInvokerDLL.func({
                    assemblyFile: dllPath,
                    typeName: "Test.Add",
                    methodName: "addNum",
                });
                return new Promise((resolve) => {
                    AddNum(params, (error: any, result: any) => {
                        if (error) {
                            this.logger.error(`调用 dll 出错: ${error}`);
                            resolve(IPCResult(false, `调用 dll 出错: ${error}`));
                        } else {
                            resolve(IPCResult(true, `通过edge调用 dll计算的结果是:${result}`));
                        }
                    });
                });
            } catch (error) {
                // 如果是其他类型的不规范接口, 那么就 通过中间程序来调用DLL
                const exePath = path.resolve(extraPath, "ec-dll.exe");
                const className = "Test.Add"; // 命名空间.类名 (没有命名空间的可忽略)
                const methodName = "addNum"; // 方法名
                // 构建命令行参数
                const command = `"${exePath}" "${dllPath}" ${className} ${methodName} ${params.join(" ")}`;
                // 执行中间程序来调用dll获取输出流
                return new Promise((resolve, reject) => {
                    exec(command, {encoding: "utf8"}, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            this.logger.error(`执行出错: ${error}`);
                            reject(IPCResult(false, `执行出错: ${error}`));
                        } else if (stderr) {
                            this.logger.error(`执行出错: ${stderr}`);
                            resolve(IPCResult(false, stderr));
                        } else {
                            resolve(IPCResult(true, `通过中间程序调用dll计算的结果是:${stdout.trim()}`));
                        }
                    });
                });
            }
        }
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
    Exit(args: IPCModelTypeMain) {
        GlobalStatus.core.closeWin(args.winID);
    }
    /**
     * 弹出气泡消息
     * @param args
     * @returns
     */
    nityfier(args: IPCModelTypeMain): IPCModelTypeRender {
        if (!args.data || !args.data.message) {
            return IPCResult(false, "未传入必要参数:消息内容");
        }
        const {message, callback} = args.data;
        GlobalStatus.core.show_notifier(message, callback);
        return IPCResult(true, "气泡已弹出");
    }

    /**
     * 打开新窗口
     * @param args
     */
    openWin(args?: IPCModelTypeMain): void {
        if (!args) return;
        if (args?.win_type === "child-win" && args.winID) {
            const win = GlobalStatus.core.GetWinByWinID(String(args.winID));
            win && GlobalStatus.control.SendRenderMsgChild(win, {success: true, msg: "已关闭子窗口调用新窗口功能"});
            return;
        }
        GlobalStatus.core.openWin(args?.data?.url);
    }

    /**
     * 使用浏览器打开网页
     * @param args IPCModelTypeMain
     * @returns IPCModelTypeRender
     */
    openUrl(args: IPCModelTypeMain): IPCModelTypeRender {
        // 检查是否传入了url参数
        const url = args.data?.url;
        if (!url) {
            return IPCResult(false, "无法打开未知连接,缺少URL参数");
        }

        // 尝试打开外部链接
        try {
            shell.openExternal(url);
            return IPCResult(true, "正在打开浏览器...");
        } catch (error: any) {
            this.logger.error(`打开浏览器出错: ${error}`);
            return IPCResult(false, `打开浏览器出错: ${error.message}`);
        }
    }

    /**
     *
     * @param args 监听 ACTION:CAPTURE_PAGE 事件，截图后转为 base64 向渲染进程传递
     * @returns
     */
    CAPTURE_PAGE(_: IPCModelTypeMain): IPCModelTypeRender {
        return IPCResult(
            true,
            "",
            GlobalStatus.winMain.webContents.capturePage().then((page) => page.toDataURL()),
        );
    }

    async CheckUpdate(_: IPCModelTypeMain): Promise<void> {
        if (!this.ecupdate) {
            this.ecupdate = new (await import("../plugins/ec-update")).default();
        }
        this.ecupdate.CheckUpdate();
    }

    DownLoadUpdate(_: IPCModelTypeMain): void {
        this.ecupdate.DownloadUpdate();
    }
}
