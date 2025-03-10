/**
 * @time   2024/07/24 10:35:39
 * @author Eval
 * @description 测试服务类
 */
import {Service} from "../core/ec-service";
import {IPCResult} from "../core/ec-IPCResult";
import GlobalStatus from "../core/ec-global";
import {shell} from "electron";

import ECUpdate from "../plugins/ec-update";
import EC_DLL from "../plugins/ec-dll";
import ECFileSystem from "../plugins/ec-fs";
import {ec_source_path} from "../plugins/ec-proce";
import EC_Cron from "../plugins/ec-cron";

import type {IPCModelTypeMain, IPCModelTypeRender, ECScheduledTask} from "../lib/ec-models";

export default class Test extends Service {
    ecupdate?: ECUpdate;
    ec_dll!: EC_DLL;

    timerTask: ECScheduledTask | null = null;
    ecFS!: ECFileSystem;
    eCron!: EC_Cron;
    constructor() {
        super();
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
        const win = GlobalStatus.core.GetWinByWinID(String(args.winID));
        if (!win) {
            throw new Error("未找到指定窗口:" + args.winID);
        }
        if (win.win_type === "child-win") {
            GlobalStatus.control.SendRenderMsg({success: true, msg: "已关闭子窗口调用新窗口功能"}, win);
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
            GlobalStatus.logger.error(`打开浏览器出错: ${error}`);
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
    DownLoadUpdate(Params: IPCModelTypeMain): void {
        const url = Params.data?.url;
        this.ecupdate!.DownloadUpdate(url);
    }

    /**
     * 测试读取ec文件方法
     * @param _
     * @returns
     */
    async readEC(_: IPCModelTypeMain): Promise<IPCModelTypeRender> {
        const ecFS = new ECFileSystem();
        try {
            const data = await ecFS.readEC_File({path: ec_source_path + "/timer.ec"});

            return IPCResult(true, "测试读取EC框架专属格式的文件", {data});
        } catch (error: any) {
            return IPCResult(false, "测试读取EC框架专属格式的文件失败", {error: error.message});
        }
    }

    /**
     * 测试文件系统读写
     * @param args
     * @returns
     */
    async writeEC(args: IPCModelTypeMain): Promise<IPCModelTypeRender> {
        const content = args.data?.content;
        if (!content) {
            return Promise.resolve(IPCResult(false, "参数错误"));
        }
        if (!this.ecFS) {
            this.ecFS = new ECFileSystem();
        }
        return this.ecFS.writeEC_File({path: ec_source_path + "/test.ec", content});
    }

    /**
     * 启动定时推送任务
     * @param _
     * @returns
     */
    starTimer(_: IPCModelTypeMain): IPCModelTypeRender {
        if (this.timerTask) {
            return IPCResult(false, "定时任务已启动");
        }
        if (!this.eCron) {
            this.eCron = new EC_Cron();
        }
        // 每秒执行一次定时任务
        if (!this.ecFS) {
            this.ecFS = new ECFileSystem();
        }
        this.timerTask = this.eCron.startCronJob("test", "*/1 * * * * *", () => {
            this.ecFS.writeEC_File({path: ec_source_path + "/timer.ec", content: `定时任务执行:执行时间:${new Date().toLocaleString()},任务内容:无\n`, options: {write: "a"}});
            GlobalStatus.control.SendRenderMsgToAll(IPCResult(true, `定时任务执行:执行时间:${new Date().toLocaleString()},任务内容:无`, {type: "ec-timer"}));
        });
        return IPCResult(true, "定时任务开始执行");
    }

    /**
     * 结束任务
     * @param _
     * @returns
     */
    stopTimer(_: IPCModelTypeMain): IPCModelTypeRender {
        if (!this.timerTask) {
            return IPCResult(false, "定时器未启动");
        }
        if (!this.eCron) {
            this.eCron = new EC_Cron();
        }
        this.eCron.stopCronJob(this.timerTask.name);
        clearInterval(Number(this.timerTask));
        this.timerTask = null;
        return IPCResult(true, "定时器已停止");
    }
}
