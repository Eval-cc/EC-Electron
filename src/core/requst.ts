/**
 * @time   2024/04/18 15:40:29
 * @author Eval
 * @description 网络请求层
 */

import http from "http";
import https from "https";
import {IPCResult} from "./IPCResult";
import Logger from "./logger";

class Request {
    logger: Logger;
    constructor() {
        this.logger = new Logger();
    }

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
    async Get(url: string): Promise<any> {
        return await new Promise((resolve, reject) => {
            if (url.startsWith("https")) {
                // 发起 GET 请求
                const request = https.get(url, (response) => {
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
                    this.logger.error(`请求地址:${url} 出错,${error}`);
                    resolve(IPCResult(false, error.message));
                });
            } else {
                // 发起 GET 请求
                const request = http.get(url, (response) => {
                    let data = "";

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
                    this.logger.error(`请求地址:${url} 出错,${error}`);
                    resolve(IPCResult(false, error.message));
                });
            }
        });
    }
}
Request.toString = () => "[class Request]";
export default Request;
