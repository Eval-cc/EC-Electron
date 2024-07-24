/**
 * @time   2024/04/18 15:40:29
 * @author Eval
 * @description 网络请求层
 */

import http from "http";
import {IPCResult} from "./IPCResult";
import Logger from "./logger";

class Request {
    logger: Logger;
    constructor() {
        this.logger = new Logger();
    }

    /**
     * 发起Get请求
     * @param url
     */
    async Get(url: string): Promise<any> {
        return await new Promise((resolve, reject) => {
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
                reject(IPCResult(false, error.message));
            });
        });
    }
}
Request.toString = () => "[class Request]";
export default Request;
