/**
 * @time   2024/11/04 15:53:26
 * @author Eval
 * @description 文件管理插件
 */

import fs from "fs-extra";
import {IPCResult} from "../core/ec-IPCResult";
import type {ECReadFileModelType, ECWriteFileModelType, IPCModelTypeRender} from "../lib/ec-models";

/**
 * 校验文件操作
 * @param expectedExtension 文件类型 [json | ini | ec]
 * @returns
 */
function ValidateFile(expectedExtension: string) {
    return function (_: any, __: string, descriptor: PropertyDescriptor): void {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: ECReadFileModelType[] | ECWriteFileModelType[]) {
            // 检查文件后缀
            if (!args[0].path.endsWith(`.${expectedExtension}`)) {
                throw new Error(`文件后缀必须为.${expectedExtension}`);
            }
            const options = args[0] as ECWriteFileModelType;
            if (options.content) {
                // 索引 1 是其他参数
                const wirte: string = options.options?.write || "r";
                // 检查文件路径 -- 以及 是否强制写入
                if (!fs.existsSync(options.path)) {
                    if (wirte === "r") throw new Error(`不存在的路径：${options.path}`);
                    fs.createFileSync(options.path);
                }
            } else {
                if (!fs.existsSync(options.path)) {
                    throw new Error(`不存在的路径：${options.path}`);
                }
            }

            // 调用原始方法
            return originalMethod.apply(this, args);
        };
    };
}

class ECFileSystem {
    constructor() {}

    /**
     * 指定路径是否存在
     * @param filePath
     * @param iswrite 是否强制写入
     * @returns
     */
    fileExist(filePath: string, iswrite: boolean): boolean {
        const exist = fs.pathExistsSync(filePath);
        try {
            if (!exist && iswrite) {
                fs.ensureDirSync(filePath);
            }
        } catch (error: any) {
            throw new Error(`创建目录失败：${error.message}`);
        }
        return exist;
    }

    /**
     * 文件是否存在
     * @param filePath
     * @returns
     */
    existFile(filePath: string): boolean {
        return fs.pathExistsSync(filePath);
    }

    /**
     * 读取json文件
     * @param filePath 文件路径
     * @returns
     */
    @ValidateFile("json")
    readJson(options: ECReadFileModelType): IPCModelTypeRender {
        const data = fs.readJsonSync(options.path);
        return IPCResult(true, "读取文件成功", data);
    }

    /**
     * 保存json文件
     * @param filePath 文件路径
     * @param data 写入的数据
     * @returns
     */
    @ValidateFile("json")
    writeJson(options: ECWriteFileModelType): IPCModelTypeRender {
        try {
            fs.writeJsonSync(options.path, options.content, {spaces: options.options?.ident || 2});
            return IPCResult(true, "写入文件成功");
        } catch (error: any) {
            return IPCResult(false, `写入文件失败：${error.message}`);
        }
    }

    /**
     * 读取ini文件
     * @param filePath
     * @returns
     */
    @ValidateFile("ini")
    readConfigINI(options: ECReadFileModelType): IPCModelTypeRender {
        try {
            const data = fs.readFileSync(options.path, "utf-8");
            const configSplit = data.split("\n").filter((item) => item.trim());
            const configObj = {};
            configSplit.forEach((item, index) => {
                if (item.trim().length === 0) {
                    // 添加空行占位符
                    configObj["blank_line_" + index] = "";
                    return;
                }
                if (item.startsWith("#") || item.startsWith(";")) {
                    configObj["comment_" + index] = item.trim();
                    return;
                }
                const keyValue = item.split("=");
                configObj[keyValue[0].trim()] = keyValue[1].trim();
            });
            return IPCResult(true, "读取文件成功", {data});
        } catch (error: any) {
            return IPCResult(false, `读取文件失败：${error.message}`);
        }
    }

    /**
     * 写入ini文件
     * @param filePath
     * @param data
     * @returns
     */
    @ValidateFile("ini")
    writeConfigINI(options: ECWriteFileModelType): IPCModelTypeRender {
        try {
            const data = options.content;
            const filePath = options.path;
            const configArr: string[] = [];
            for (const key in data) {
                if (key.startsWith("comment_")) {
                    configArr.push(data[key]);
                } else if (key.startsWith("blank_line_")) {
                    configArr.push("");
                } else {
                    configArr.push(`${key}=${data[key]}`);
                }
            }
            const configStr = configArr.join("\n");
            fs.writeFileSync(filePath, configStr, "utf-8");
            return IPCResult(true, "写入文件成功");
        } catch (error: any) {
            return IPCResult(false, `写入文件失败：${error.message}`);
        }
    }

    /**
     * 读取受EC框架支持的文件
     * @param filePath
     * @returns
     */
    @ValidateFile("ec")
    readEC_File(options: ECReadFileModelType): Promise<IPCModelTypeRender> {
        try {
            return new Promise((resolve, reject) => {
                let content = "";
                const stream = fs.createReadStream(options.path);
                stream.on("data", (chunk) => {
                    content += chunk.toString("hex");
                });
                stream.on("end", () => {
                    const hexArr = content.match(/.{8}/g);
                    let data: string =
                        hexArr
                            ?.map((hex) => {
                                const charcode = parseInt(hex, 16) >> 1;
                                const str = String.fromCharCode(charcode);
                                return str;
                            })
                            .join("") || "";
                    resolve(IPCResult(true, "读取文件成功", {data}));
                });
                stream.on("error", (error) => {
                    reject(`读取文件失败：${error.message}`);
                });
            });
        } catch (error: any) {
            return Promise.resolve(IPCResult(false, `读取文件失败：${error.message}`));
        }
    }

    /**
     * 写入受EC框架支持的文件
     * @param filePath
     * @param data
     * @returns
     */
    @ValidateFile("ec")
    writeEC_File(options: ECWriteFileModelType): IPCModelTypeRender {
        try {
            if (options.options?.write === "a" || options.options?.write === "w") {
                const stream = fs.createWriteStream(options.path, {flags: options.options?.write || "w"});
                const data = options.content;
                const StringData = (typeof data === "string" ? data : JSON.stringify(data)).split("").map((char) => (char.charCodeAt(0) << 1).toString(16));
                StringData.forEach((item) => stream.write(Buffer.from(item.padStart(8, "0"), "hex")));
                stream.end();
            } else {
                return IPCResult(false, `写入文件失败：${options.options?.write} 选项无效`);
            }

            return IPCResult(true, "写入文件成功");
        } catch (error: any) {
            return IPCResult(false, `写入文件失败：${error.message}`);
        }
    }

    /**
     * 写入日志文件
     * @param options
     * @returns
     */
    @ValidateFile("log")
    writeLog_File(options: ECWriteFileModelType): IPCModelTypeRender {
        try {
            fs.writeFileSync(options.path, JSON.stringify(options.content), "utf-8");
            return IPCResult(true, "写入文件成功");
        } catch (error: any) {
            return IPCResult(false, `写入文件失败：${error.message}`);
        }
    }

    /**
     * 读取任何格式的文件
     * @param options
     * @returns
     */
    readFile(options: ECReadFileModelType): IPCModelTypeRender {
        if (!fs.existsSync(options.path)) {
            return IPCResult(false, "文件路径不存在");
        }
        try {
            const data = fs.readFileSync(options.path);
            return IPCResult(true, "读取文件成功", {data: data.toString()});
        } catch (error: any) {
            return IPCResult(false, `读取文件失败：${error.message}`, {message: error.stack});
        }
    }

    /**
     * 写入其他格式的文件
     * @param options
     * @returns
     */
    writeFile(options: ECWriteFileModelType): IPCModelTypeRender {
        if (!fs.existsSync(options.path)) {
            return IPCResult(false, "文件路径不存在");
        }
        try {
            fs.writeFileSync(options.path, options.content.toString(), "utf-8");
            return IPCResult(true, "写入文件成功");
        } catch (error: any) {
            return IPCResult(false, `写入文件失败：${error.message}`, {message: error.stack});
        }
    }
}

ECFileSystem.toString = () => "[class ECFileSystem]";
export default ECFileSystem;
