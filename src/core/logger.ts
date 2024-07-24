/**
 * @time   2024/04/15 19:23:33
 * @author Eval
 * @description 程序日志
 */
import log from "electron-log";
import path from "path";

class Logger {
    constructor() {
        // 修改自定义的日志输出路径
        log.transports.file.level = "debug";
        log.transports.file.maxSize = 10024300; // 文件最大不超过 10M
        // 输出格式
        log.transports.file.format = "[{h}:{i}:{s}] [{level}]{scope} {text}";
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
    debug(...args: Array<any>) {
        let date = new Date();
        let dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        // 自定义文件保存位置为安装目录下 \log\年-月-日.log
        log.transports.file.resolvePathFn = () => path.join(process.cwd(), "Log\\" + dateStr + "-info.log");
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
        log.transports.file.resolvePathFn = () => path.join(process.cwd(), "Log\\" + dateStr + "-warn.log");
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
        log.transports.file.resolvePathFn = () => path.join(process.cwd(), "Log\\" + dateStr + "-error.log");
        log.error(this.serialArg(args));
    }
}

Logger.toString = () => "[class Logger]";
export default Logger;
