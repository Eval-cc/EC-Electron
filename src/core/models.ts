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

/**
 * 全局配置的类型声明
 */
export interface ECFrameworkModelType {
    /** 应用名称 */
    app_name?: string;
    /** 托盘的类型声明 */
    tray?: {
        /** 是否激活托盘图标 */
        active: boolean;
        /** 托盘图标标题 */
        title: string;
        /** 托盘正常状态图标路径 */
        icon: string;
        /** 托盘隐藏状态图标路径 */
        iconHide: string;
        /** 托盘图标悬停提示 */
        tooltip: string;
    };
    /**
     * 日志配置
     * @property path 日志文件路径
     * @property maxsize 单个日志文件最大大小
     * @property format 日志内容的输出格式
     */
    logConfig?: {
        path: string;
        maxsize: number;
        format: string;
    };
}
