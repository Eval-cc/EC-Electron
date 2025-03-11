/**
 * @time   2024/04/18 11:18:59
 * @author Eval
 * @description IPC通信响应
 */

import {IPCModelTypeRender} from "../lib/ec-models";
interface MsgBoxType {
    /** 覆盖原本的文字,一般由主进程进行传递 */
    content?: string;
    /** 文字是否居中 */
    center?: boolean;
    /** 是否可拖动 */
    draggable?: boolean;
    /** 确认时的回调函数 */
    confirm?: Function;
    /** 关闭时的回调函数 */
    cancel?: Function;
    /** 确认按钮的文本,默认:确认 */
    confirmText?: string;
    /** 关闭按钮的文本,默认:关闭 */
    cancelText?: string;
    /** 消息类型 */
    type?: "success" | "warning" | "info" | "error";
    /** 开窗是否用html渲染 */
    dangerouslyUseHTMLString?: boolean;
    /** MessageBox 是否显示右上角关闭按钮 */
    "show-close"?: boolean;
    /**是否可通过点击遮罩层关闭 MessageBox */
    closeOnClickModal?: boolean;
    /** 是否可通过按下 ESC 键关闭 MessageBox */
    closeOnPressEscape?: boolean;
    /** 是否有需要执行的ipc回调 */
    ipc?: string;
    /** ipc回调的参数 */
    ipc_params?: {[key: string]: any};
}

export const IPCResult = (success: boolean, msg: string, data: IPCModelTypeRender["data"] = {type: "tip"}): IPCModelTypeRender => {
    return {success, msg, data};
};

export const IPResultDialog = (success: boolean, title: string, options: MsgBoxType = {}): IPCModelTypeRender => {
    return {
        success,
        msg: title,
        data: {
            type: "dialog",
            title,
            options,
        },
    };
};
