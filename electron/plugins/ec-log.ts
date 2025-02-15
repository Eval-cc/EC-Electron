/**
 * @time   2024/10/30 16:45:18
 * @author Eval
 * @description 程序日志
 */

import log from "electron-log";
import {join as EC_Join} from "path";
import GlobalStatus from "../core/ec-global";

class EC_Logger {
    constructor() {
        if (!GlobalStatus.config.logConfig) {
            throw new Error("日志配置未设置");
        }
        // 修改自定义的日志输出路径
        log.transports.file.maxSize = GlobalStatus.config.logConfig.maxsize; // 文件最大不超过 10M
        // 输出格式
        log.transports.file.format = GlobalStatus.config.logConfig.format;
    }

    /**
     * 序列化传入的消息
     * @param args
     * @returns
     */
    private serialArg(args: Array<any>) {
        const msg = args.map((msg: any) => {
            if (typeof msg === "string") {
                return msg;
            } else if (typeof msg === "number") {
                return String(msg);
            } else {
                return JSON.stringify(msg);
            }
        });
        return msg.join(" ");
    }

    /**
     * 输出普通日志--保留日志文件
     * @param args
     */
    info(...args: Array<any>) {
        let date = new Date();
        let dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        // 自定义文件保存位置为安装目录下 \log\年-月-日.log
        log.transports.file.level = "debug";
        log.transports.file.resolvePathFn = () => EC_Join(process.cwd(), GlobalStatus.config.logConfig!.path, dateStr + "-info.log");
        log.info(this.serialArg(args));
    }

    /**
     * 输出警告日志
     * @param args
     */
    warn(...args: Array<any>) {
        let date = new Date();
        let dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        // 自定义文件保存位置为安装目录下 \log\年-月-日.log
        log.transports.file.level = "warn";
        log.transports.file.resolvePathFn = () => EC_Join(process.cwd(), GlobalStatus.config.logConfig!.path, dateStr + "-warn.log");
        log.warn(this.serialArg(args));
    }
    /**
     * 输出错误日志
     * @param args
     */
    error(...args: Array<any>) {
        let date = new Date();
        let dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        // 自定义文件保存位置为安装目录下 \log\年-月-日.log
        log.transports.file.level = "error";
        log.transports.file.resolvePathFn = () => EC_Join(process.cwd(), GlobalStatus.config.logConfig!.path, dateStr + "-error.log");
        log.error(this.serialArg(args));
    }
}

EC_Logger.toString = () => "[class EC_Logger]";
export default EC_Logger;
