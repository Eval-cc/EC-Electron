/**
 * @time   2024/10/31 13:44:18
 * @author Eval
 * @description EC 框架调用DLL插件
 */
import Koffi from "koffi";
import edgeJSInvokerDLL from "electron-edge-js";
import {exec} from "child_process";
import {extraPath} from "../plugins/ec-proce";
import {resolve as EC_PathResolve} from "path";
import EC_Logger from "./ec-log";
import {IPCResult} from "../core/IPCResult";
import {ECDllModelType} from "../core/models";
import {existsSync} from "fs-extra";

class EC_DLL {
    private logger: EC_Logger;
    constructor() {
        this.logger = new EC_Logger();
    }

    /**
     * 调用DLL
     * @param params
     * @returns
     */
    InvokerDll(params: ECDllModelType) {
        const dll_name = params.dllName;
        const dllPath = EC_PathResolve(extraPath, dll_name.endsWith(".dll") ? dll_name : `${dll_name}.dll`);
        if (!existsSync(dllPath)) {
            // 判断DLL是否存在
            return IPCResult(false, `${dll_name} 不存在!`);
        }

        // 尝试加载DLL
        const tryLoadDll = (loadFunction: Function) => {
            try {
                return loadFunction(dllPath, params);
            } catch (error) {
                return null;
            }
        };

        // 默认尝试读取C++ 类型的程序集
        return tryLoadDll(this.Koffi) || tryLoadDll(this.EdgeJS) || this.Abnormal(dllPath, params);
    }

    /**
     * 调用c/c++ DLL
     * @param dllPath
     * @param params
     * @returns
     */
    private Koffi(dllPath: string, params: ECDllModelType) {
        const myLibrary = Koffi.load(dllPath); // 定义函数
        const methodName = params.methodName; // 方法名
        const returnType = params.returnType; // 返回值类型
        const argsType = params.argsType; // 参数类型
        const args = params.args; // 参数列表
        /**
         * 
        //     const myLibrary = Koffi.load(dllPath); // 定义函数
        //     const call = myLibrary.func("__stdcall", "hello", "int", ["int", "int", "int"]); // 定义函数
        //     调用函数
        //     const result = addNum(...params);
         */
        const call = myLibrary.func("__stdcall", methodName, returnType, argsType); // 定义函数

        // 调用函数
        const result = call(args);
        return IPCResult(true, `Koffi调用:${result}`);
    }

    /**
     * 调用 C# DLL
     * @param dllPath
     * @param params
     * @returns
     */
    private EdgeJS(dllPath: string, params: ECDllModelType) {
        const typeName = params.className; // 命名空间.类名 (没有命名空间的可忽略)
        const methodName = params.methodName; // 方法名
        const args = params.args; // 参数列表
        // 读取失败 尝试读取C#类型的程序集
        const call = edgeJSInvokerDLL.func({
            assemblyFile: dllPath,
            typeName,
            methodName,
        });
        return new Promise((resolve) => {
            call(args, (error: any, result: any) => {
                if (error) {
                    this.logger.error(`调用 dll 出错: ${error}`);
                    resolve(IPCResult(false, `调用 dll 出错: ${error}`));
                } else {
                    resolve(IPCResult(true, `edge调用:${result}`));
                }
            });
        });
    }

    /**
     * 中间程序 调用 DLL
     * @param dllPath
     * @param params
     * @returns
     */
    private Abnormal(dllPath: string, params: ECDllModelType) {
        // 如果是其他类型的不规范接口, 那么就 通过中间程序来调用DLL
        const exePath = EC_PathResolve(extraPath, "ec-dll.exe");
        const className = params.className; // 命名空间.类名 (没有命名空间的可忽略)
        const methodName = params.methodName; // 方法名
        const args = params.args; // 参数列表
        // 构建命令行参数
        const command = `"${exePath}" "${dllPath}" ${className} ${methodName} ${args.join(" ")}`;
        // 执行中间程序来调用dll获取输出流
        return new Promise((resolve, _) => {
            exec(command, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    this.logger.error(`执行出错: ${error}`);
                    resolve(IPCResult(false, `执行出错: ${error}`));
                } else if (stderr) {
                    this.logger.error(`执行出错: ${stderr}`);
                    const hex = stderr.trim();
                    // 将十六进制字符串分割成字节对并转换为 Uint8Array
                    const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)));
                    // 使用 TextDecoder 解码为字符串
                    const decoder = new TextDecoder("utf-8");

                    resolve(IPCResult(false, decoder.decode(bytes)));
                } else {
                    const hex = stdout.trim();
                    // 将十六进制字符串分割成字节对并转换为 Uint8Array
                    const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)));
                    // 使用 TextDecoder 解码为字符串
                    const decoder = new TextDecoder("utf-8");
                    // 将字节转换为字符串
                    resolve(IPCResult(true, `中间程序调用:${decoder.decode(bytes) || "无返回值"}`));
                }
            });
        });
    }
}

EC_DLL.toString = () => "[class EC_DLL]";
export default EC_DLL;
