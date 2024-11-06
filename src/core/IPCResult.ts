/**
 * @time   2024/04/18 11:18:59
 * @author Eval
 * @description IPC通信响应
 */

import {IPCModelTypeRender} from "../core/models";
export const IPCResult = (success: boolean, msg: string, data: IPCModelTypeRender["data"] = {type: "tip"}): IPCModelTypeRender => {
    return {success, msg, data};
};
