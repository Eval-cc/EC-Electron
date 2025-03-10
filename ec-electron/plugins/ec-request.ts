/**
 * @time   2024/04/18 15:40:29
 * @author Eval
 * @description 网络请求层
 */

import http from "http";
import https from "https";
import {IPCResult} from "../core/ec-IPCResult";
import GlobalStatus from "../core/ec-global";
import fs from "fs-extra";
import {IPCModelTypeRender} from "../lib/ec-models";

class Request {
    constructor() {}

    /**
     * 根据不同的请求协议返回对应的请求头
     * @param url
     * @returns
     */
    GetRequest = (url: String): typeof http | typeof https => {
        if (url.startsWith("https")) {
            return https;
        }
        return http;
    };

    /**
     * 发起Get请求
     * @param url
     */
    async Get(url: string): Promise<IPCModelTypeRender> {
        return await new Promise((resolve, reject) => {
            const request = this.GetRequest(url).get(url, (response) => {
                let data = "";

                // 如果是重定向
                if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400) {
                    const redirectUrl = response.headers.location;
                    if (redirectUrl) {
                        // 递归调用 Get方法 处理新的 URL
                        this.Get(redirectUrl).then(resolve).catch(reject);
                        return;
                    }
                }
                // 接收响应数据
                response.on("data", (chunk) => {
                    data += chunk;
                });

                // 响应结束，处理数据
                response.on("end", () => {
                    resolve(IPCResult(true, "", {data}));
                });
            });

            // 请求错误处理
            request.on("error", (error) => {
                GlobalStatus.logger.error(`请求地址:${url} 出错,${error}`);
                resolve(IPCResult(false, error.message));
            });
        });
    }

    /**
     * 发起下载资源的请求
     * @param url 下载的地址
     * @param savePath  需要写入的文件名, 而不是目录名称
     */
    async download(url: string, savePath: string): Promise<any> {
        return await new Promise((resolve, reject) => {
            const request = this.GetRequest(url)
                .get(url, (response) => {
                    // 检查请求是否成功
                    if (response.statusCode === 200) {
                        const fileStream = fs.createWriteStream(savePath);
                        // 将响应流管道传递给文件写入流
                        response.pipe(fileStream);

                        // 文件写入完成后，关闭流
                        fileStream.on("finish", () => {
                            fileStream.close();
                        });
                        resolve(IPCResult(true, ""));
                    } else {
                        GlobalStatus.logger.error(`请求失败，状态码: ${response.statusCode}, 状态信息: ${response.statusMessage}`);
                        reject(`请求失败，状态码: ${response.statusCode}, 状态信息: ${response.statusMessage}`);
                    }
                })
                .on("error", (err) => {
                    GlobalStatus.logger.error(`请求地址:${url} 出错,${err}`);
                    reject(err);
                });

            // 请求错误处理
            request.on("error", (error) => {
                GlobalStatus.logger.error(`请求地址:${url} 出错,${error}`);
                resolve(IPCResult(false, error.message));
            });
        });
    }
}
Request.toString = () => "[class Request]";
export default Request;
