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
import {IPCModelTypeMain} from "../core/models";

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
        const exePath = path.resolve(extraPath(), "ECDLL.exe");
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
}
