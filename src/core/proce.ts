/**
 * @time   2024/04/22 09:35:18
 * @author Eval
 * @description 环境管理
 */

import {is} from "@electron-toolkit/utils";
import path from "path";

/** 返回当前的运行环境是不是测试环境 */
export const isDev = (): boolean => {
    return is.dev && process.env["ELECTRON_RENDERER_URL"] != null;
};

/** 返回转换图标的脚本程序路径 */
export const ScriptPath = ():string => {
    // 默认使用生产环境的路径
    let script_path = path.join(process.cwd(), "resources/extraResources/script.exe");
    if (isDev()) {
        // 测试环境需要在套一级build目录
        script_path = path.join(process.cwd(), "build/extraResources/script.exe");
    }
    return script_path;
};


/** 返回部署远程的服务端资源部位置 */
export const ServerPath = ():string => {
    // 默认使用生产环境的路径
    let script_path = path.join(process.cwd(), "resources/extraResources/server.exe");
    if (isDev()) {
        // 测试环境需要在套一级build目录
        script_path = path.join(process.cwd(), "build/extraResources/server.exe");
    }
    return script_path;
};
