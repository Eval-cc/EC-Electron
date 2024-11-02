/**
 * @time   2024/04/24 17:16:42
 * @author Eval
 * @description 全局状态管理
 */
import crypto from "crypto";
import iconv from "iconv-lite";
import Controller from "../core/controller";
import {BrowserWindow, dialog} from "electron";
import TrayMgr from "../plugins/ec-tray";
import fs from "fs-extra";
import {ECFrameworkModelType} from "../core/models";
import Core from "./core";
import {ec_config_path, ec_is_test} from "../plugins/ec-proce";

class GlobalStatus {
    /**
     * 注入全局 controller
     */
    public static control: Controller;

    /** 注入全局 */
    public static core: Core;

    /** 主窗体 */
    public static winMain: BrowserWindow;

    /** 子窗口,以窗口的id作为键 */
    public static childWin: {[key: string]: BrowserWindow} = {};

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
    public static loadConfig(win: BrowserWindow, core: Core): void {
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
        win["win_type"] = "main";
        GlobalStatus.winMain = win;
        GlobalStatus.core = core;
        GlobalStatus.control = new Controller();
        // 保存窗口对象
        GlobalStatus.childWin[win.id] = win;
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
}

GlobalStatus.toString = () => "[class GlobalStatus]";
export default GlobalStatus;
