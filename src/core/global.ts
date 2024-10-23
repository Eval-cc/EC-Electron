/**
 * @time   2024/04/24 17:16:42
 * @author Eval
 * @description 全局静态状态管理
 */
import crypto from "crypto";
import iconv from "iconv-lite";
import Controller from "./controller";
import {BrowserWindow} from "electron";
import TrayMgr from "./tray";

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
        try {
            let gbkBuffer_gbk = iconv.encode(String(str || "null"), "gbk");
            return gbkBuffer_gbk.toString("binary");
        } catch (e) {
            return String(e);
        }
    };

    /**
     * 将 gbk编码 转换为 中文, 从数据库中读取出来的数据要经过转换, 否则是乱码
     * @param gbkStr
     * @returns {str} 转义后的的字符串
     */
    static gbk_to_zh = (gbkStr: string): string => {
        try {
            let gbkBuffer_zh = Buffer.from(gbkStr || "null", "binary");
            return iconv.decode(gbkBuffer_zh, "gbk");
        } catch (e) {
            return String(e);
        }
    };

    /**
     * 将 gbk编码 转换为 中文, 从数据库中读取出来的数据要经过转换, 否则是乱码
     * @param  gbkStr
     * @returns {str} 转义后的的字符串
     */
    static gb2312_to_zh = (gbkStr: Buffer): string => {
        try {
            return iconv.decode(gbkStr, "gb2312");
        } catch (e) {
            return String(e);
        }
    };
}

GlobalStatus.toString = () => "[class GlobalStatus]";
export default GlobalStatus;
