/**
 * @time   2024/04/16 12:36:21
 * @author Eval
 * @description 模型层
 */
import type {IpcMainInvokeEvent as IpcMainInvokeEventType} from "electron";
import type {ScheduledTask} from "node-cron";

/**
 * IPC通信模型--返回给渲染进程
 */
export interface IPCModelTypeRender {
    // 窗口ID
    winID?: number;
    /** 返回类型 */
    success: boolean;
    /** 返回的消息 */
    msg: string;
    /** 传递的参数 */
    data?: {
        type?: "tip" | "ec-timer" | "dialog" | "loading" | "winID";
        [key: string]: any; // 允许任意其他属性
    };
}

/**
 * IPC通信模型--主进程
 */
export interface IPCModelTypeMain {
    /** 控制器函数名 */
    fun: string;
    /** 通信主体 */
    data?: {
        IpcMainInvokeEvent?: IpcMainInvokeEventType;
        [key: string]: string | number | boolean | any;
    };
    /** 当前发送消息的窗体类型  [main | child-win] */
    win_type: string;
    /** 窗口ID */
    winID: number;
}

/**
 * 全局配置的类型声明
 */
export interface ECFrameworkModelType {
    /** 应用名称 */
    app_name?: string;
    /** 是否开机自启动 */
    auto_launch?: {
        /** 是否激活开机自启动 */
        active: boolean;
        /** 开机自启动是否显示窗口 */
        isHidden: boolean;
    };
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
    /**
     * 更新插件的地址
     * @property url 更新插件的地址
     * @property autoDownload 是否自动下载更新
     * @property autoInstallOnAppQuit 是否在应用退出时自动安装更新
     */
    update?: {
        url: string;
        /** 是否自动下载更新 */
        autoDownload: boolean;
        /** 是否在应用退出时自动安装更新 */
        autoInstallOnAppQuit: boolean;
    };
    /**
     * 控制台配置--生产环境下无效
     * @property active 是否激活控制台
     * @property cmd 控制台快捷键
     */
    dev_tool?: {
        /** 是否在启动的时候激活控制台 */
        active: true;
        /** 激活/关闭 控制台的快捷键 */
        cmd: "CommandOrControl+Shift+F10";
    };
}

/**
 * DLL插件类型声明
 * @params dllName 动态链接库名称
 * @params className 类名 -- 需要调用的类名
 * @params methodName 方法名 -- 需要调用的方法名
 * @params returnType 返回值类型 -- C++ 程序集使用  ["int", "string", "bool", "double", "float", "char", "long", "short"]
 * @params argsType 参数类型 -- C++ 程序集使用  ["int", "string", "bool", "double", "float", "char", "long", "short"]
 * @params args 参数列表 -- [1, "hello", true, 3.14, 2.5, "c", 10, 10000]
 * @example
 */
export interface ECDllModelType {
    /** 动态链接库名称 */
    dllName: string;
    /** 类名 */
    className: string;
    /** 方法名 */
    methodName: string;
    /** 返回值类型 */
    returnType: string;
    /** 参数类型 */
    argsType: string[];
    /** 参数列表 */
    args: any[];
}

/**
 * 读取方法的类型声明
 */
export interface ECReadFileModelType {
    /** 读取文件的路径 */
    path: string;
}

/**
 * 写入方法的类型声明
 */
export interface ECWriteFileModelType {
    /** 需要写入的内容 */
    content: Object;
    /** 写入文件的路径 */
    path: string;
    /** 配置参数 */
    options?: {
        /** r:只读, w:可读可写, a:追加 */
        write: "r" | "w" | "a";
    };
}

/**
 * EC框架 定时任务的类型声明
 */
export interface ECScheduledTask extends ScheduledTask {
    /**
     * 任务名称
     */
    name: string;
}