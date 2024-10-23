/**
 * @time   2024/04/16 12:36:21
 * @author Eval
 * @description 模型层
 */
import {IpcMainInvokeEvent as IpcMainInvokeEventType} from "electron";

/**
 * IPC通信模型--返回给渲染进程
 */
export interface IPCModelTypeRender {
    success: boolean;
    msg: string; // 返回的消息
    data?: any; // 传递的参数
}

/**
 * IPC通信模型--主进程
 */
export interface IPCModelTypeMain {
    fun: string; // 控制器函数名
    data?: {
        IpcMainInvokeEvent?: IpcMainInvokeEventType;
        [key: string]: string | number | boolean | any;
    };
    win_type: string; // 当前发送消息的窗体类型
    winID: string; // 窗口ID,  没有ID的视为主窗体
}
