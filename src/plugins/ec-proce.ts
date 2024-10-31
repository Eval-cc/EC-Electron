/**
 * @time   2024/04/22 09:35:18
 * @author Eval
 * @description 环境管理
 */

import {is} from "@electron-toolkit/utils";
import path from "path";

/** 返回当前框架的运行环境是不是测试环境 */
export const ec_is_test = is.dev && process.env["ELECTRON_RENDERER_URL"] != null;

/** 返回框架额外资源的路径 */
export const extraPath = path.join(process.cwd(), ec_is_test ? "build/extraResources" : "resources/extraResources");

/** 返回框架配置文件路径 */
export const ec_config_path = path.join(process.cwd(), ec_is_test ? "src/bin/ec.config.json" : "resources/ec.config.json");
