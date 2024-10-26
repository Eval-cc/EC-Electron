/**
 * @time   2024/04/24 17:16:42
 * @author Eval
 * @description 全局静态状态管理
 */
import crypto from "crypto";
import iconv from "iconv-lite";
import Controller from "../core/controller";
import {BrowserWindow} from "electron";
import TrayMgr from "../core/tray";
import fs from "fs-extra";
import path from "path";
import {ECFrameworkModelType} from "../core/models";

class GlobalStatus {
    /**
     * 注入全局 controller
     */
    public static control: Controller;

    /**
     * 保存主窗体对象
     */
    public static winMain: BrowserWindow;

    /** 保存子窗口对象,以子窗口的id作为键 */
    public static childWin: {[key: string]: BrowserWindow} = {};

    /** 托盘 */
    public static tray: TrayMgr;

    /** 全局配置信息,禁止外部修改 */
    private static __config: ECFrameworkModelType = {};

    /** 全局配置信息 */
    public static get config(): ECFrameworkModelType {
        return GlobalStatus.__config;
    }
    /**
     * 初始化全局配置信息,已经保存当前的主窗体对象
     * @param win
     */
    public static loadConfig(win: BrowserWindow): void {
        // 设置窗口类型
        win["win_type"] = "main";
        GlobalStatus.winMain = win;
        // 保存窗口对象
        GlobalStatus.childWin[win.id] = win;
        const configPath = path.join(process.cwd(), "src/bin/ec.config.json");
        if (!fs.pathExistsSync(configPath)) {
            fs.outputJSONSync(
                configPath,
                {
                    app_name: "EC框架 @Eval",
                    tray: {
                        active: true,
                        title: "EC-Electron EC框架",
                        icon: "icon.png",
                        iconHide: "none.png",
                        tooltip: "EC框架 @Eval",
                    },
                    logConfig: {
                        path: "./ec-logs",
                        maxsize: 10485760,
                        format: "[{h}:{i}:{s}] [{level}]{scope} {text}",
                    },
                },
                {spaces: 4, EOL: "\r\n", encoding: "utf-8"},
            );
        }
        GlobalStatus.__config = fs.readJSONSync(configPath, "utf-8");
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
     * 将中文转换为 gbk编码, 例如游戏角色的名称必须要转,否则无法识别
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
     * 将 gbk编码 转换为 中文, 从数据库中读取出来的数据要经过转换, 否则是乱码
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
     * 将 gbk编码 转换为 中文, 从数据库中读取出来的数据要经过转换, 否则是乱码
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
}

GlobalStatus.toString = () => "[class GlobalStatus]";
export default GlobalStatus;
