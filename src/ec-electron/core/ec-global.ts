/**
 * @time   2024/04/24 17:16:42
 * @author Eval
 * @description 全局状态管理
 */
import crypto from "crypto";
import iconv from "iconv-lite";
import Controller from "./ec-controller";
import {dialog} from "electron";
import TrayMgr from "../plugins/ec-tray";
import fs from "fs-extra";
import {ECFrameworkModelType, IBrowserWindow, INotify} from "../lib/ec-models";
import Core from "./ec-core";
import {ec_config_path, ec_is_test, ec_source_path} from "../plugins/ec-proce";
import EC_Logger from "../plugins/ec-log";
import notifier from "node-notifier";
import {join as EC_Join} from "path";

class GlobalStatus {
    /**
     * 注入全局 controller
     */
    public static control: Controller;

    /** 注入全局 */
    public static core: Core;

    /** 主窗体 */
    public static winMain: IBrowserWindow;

    /** 以窗口的id作为键,存放所有的窗口对象 */
    public static ecWinList: {[key: string]: IBrowserWindow} = {};

    /** 日志对象 */
    public static logger: EC_Logger;

    /** 托盘 */
    private static __tray: TrayMgr;
    public static get tray(): TrayMgr {
        return GlobalStatus.__tray;
    }
    public static set tray(value: TrayMgr) {
        if (GlobalStatus.__tray) {
            throw new Error("重复设置托盘实例");
        }
        GlobalStatus.__tray = value;
    }

    /** 全局配置信息,禁止外部修改 */
    private static __config: ECFrameworkModelType = {};

    /** 全局配置信息 */
    public static get config(): ECFrameworkModelType {
        return GlobalStatus.__config;
    }
    public static set config(_: ECFrameworkModelType) {
        throw new Error("禁止修改全局配置信息");
    }

    /**
     * 初始化全局配置信息,已经保存当前的主窗体对象
     * @param win
     */
    public static loadConfig(win: IBrowserWindow, core: Core): void {
        const configPath = ec_config_path;
        if (!fs.pathExistsSync(configPath)) {
            dialog
                .showMessageBox({
                    type: "error",
                    title: "EC 框架错误",
                    message: "初始化框架配置失败",
                    detail: `EC框架异常,配置文件不存在,请检查配置文件路径是否正确: ${configPath}`,
                    buttons: ["退出"],
                })
                .then(() => {
                    GlobalStatus.core.closeWin(GlobalStatus.winMain.id);
                });
            throw new Error("框架配置文件不存在");
        }
        GlobalStatus.__config = fs.readJSONSync(configPath, "utf-8");
        // 生产环境下移除控制台配置信息
        if (!ec_is_test) {
            delete GlobalStatus.__config.dev_tool;
        }
        // 设置窗口类型
        win.win_type = "main";
        GlobalStatus.winMain = win;
        GlobalStatus.core = core;
        GlobalStatus.control = new Controller();
        // 保存窗口对象
        GlobalStatus.ecWinList[win.id] = win;
        GlobalStatus.logger = new EC_Logger();

        notifier.on("click", function (notifierObject, options, event) {
            console.log("点击", notifierObject, options, event);
            // Triggers if `wait: true` and user clicks notification
        });

        notifier.on("timeout", function (notifierObject, options) {
            console.log("超时", notifierObject, options);
            // Triggers if `wait: true` and notification closes
        });
    }

    /**
     * 字符串转MD5 密文
     * @param str 需要加密的字符串
     * @returns  将得到的md5数据返回
     */
    static StrToMD5 = (str: string) => {
        // 创建MD5哈希实例
        const md5 = crypto.createHash("md5");
        // 使用UTF-8编码将字符串转换为二进制数据，并计算其哈希值
        const hash = md5.update(str, "utf8").digest("hex");
        return hash;
    };

    /**
     * 字符串 转换为 gbk编码
     * @param 目标文本
     * @returns {gbk} 转义后的 gbk 编码
     */
    static zh_to_gbk = (str: string): string => {
        if (str === null || str === undefined) {
            return "";
        }
        try {
            let gbkBuffer_gbk = iconv.encode(str, "gbk");
            return gbkBuffer_gbk.toString("binary");
        } catch (e) {
            throw new Error("gbk编码转换失败");
        }
    };

    /**
     * 将 gbk编码 转换为 中文
     * @param gbkStr
     * @returns {str} 转义后的的字符串
     */
    static gbk_to_zh = (gbkStr: string): string => {
        if (gbkStr === null || gbkStr === undefined) {
            return "";
        }
        try {
            let gbkBuffer_zh = Buffer.from(gbkStr, "binary");
            return iconv.decode(gbkBuffer_zh, "gbk");
        } catch (e) {
            throw new Error("gbk编码转换失败");
        }
    };

    /**
     * 将 gbk2312编码 转换为 中文
     * @param  gbkStr
     * @returns {str} 转义后的的字符串
     */
    static gb2312_to_zh = (gbkStr: Buffer): string => {
        if (gbkStr === null || gbkStr === undefined) {
            return "";
        }
        try {
            return iconv.decode(gbkStr, "gb2312");
        } catch (e) {
            throw new Error("gb2312编码转换失败");
        }
    };

    /** 返回 uuid字符串 */
    static get uuid() {
        return crypto.randomUUID();
    }

    static set uuid(_: any) {
        throw new Error("禁止修改EC框架集成的 uuid 模块");
    }

    /**
     * 给托盘推送消息, 如果没有启用托盘插件则不生效
     * @param msg
     */
    static pushTrayMsg(msg: string) {
        if (!GlobalStatus.tray) return;
        GlobalStatus.tray.setMsg(msg);
    }

    /**
     * 触发气泡消息
     * @param options
     */
    static pushNotifyMsg = (options: INotify = {title: "气泡消息", message: ""}): void => {
        notifier.notify(
            {
                appID: "ec-eval-notify",
                ...options,
                icon: EC_Join(ec_source_path, "assets/icon.png"),
                sound: true, //仅限通知中心或 Windows Toasters
                wait: true, // 等待回调，直到用户针对通知采取行动，不适用于 Windows Toasters，因为它们总是等待或通知发送，因为它不支持等待选项
            },
            function (err, response, metadata) {
                if (err) {
                    console.error("通知发送失败:", err);
                } else {
                    console.log("通知响应:", response);
                    console.log("元数据:", metadata);
                }
            },
        );
    };
}

GlobalStatus.toString = () => "[class GlobalStatus]";
export default GlobalStatus;
