/**
 * @time   2024/07/24 10:35:39
 * @author Eval
 * @description 测试服务类
 */
import {Service} from "../core/service";
import {IPCResult} from "../core/IPCResult";
import EC_Logger from "../plugins/ec-log";
import {IPCModelTypeMain, IPCModelTypeRender} from "../core/models";
import GlobalStatus from "../core/global";
import {shell} from "electron";

import ECUpdate from "../plugins/ec-update";
import EC_DLL from "../plugins/ec-dll";

export default class Test extends Service {
    logger: EC_Logger;
    ecupdate?: ECUpdate;
    ec_dll!: EC_DLL;
    constructor() {
        super();
        this.logger = new EC_Logger();
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
        if (!args.data) {
            return IPCResult(false, "参数错误");
        }
        if (!this.ec_dll) {
            this.ec_dll = new EC_DLL();
        }
        return this.ec_dll.InvokerDll(args.data as any);
    }
    /**
     * 重启
     * @param _
     */
    Restart(_: IPCModelTypeMain) {
        // 仅正式环境能正常使用重启应用
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

    /**
     * 检查更新
     * @param _ 
     * @returns 
     */
    async CheckUpdate(_: IPCModelTypeMain): Promise<IPCModelTypeRender> {
        if (!this.ecupdate) {
            this.ecupdate = new (await import("../plugins/ec-update")).default();
        }
        return this.ecupdate.CheckUpdate();
    }

    /**
     * 手动下载更新
     * @param _ 
     */
    DownLoadUpdate(_: IPCModelTypeMain): void {
        this.ecupdate!.DownloadUpdate();
    }
}
