/**
 * @time   2024/04/16 16:04:37
 * @author Eval
 * @description 模型类型
 */

/**
 * 消息类型
 */
type MessageType = "success" | "error" | "info" | "warning";

/**
 * IPC通信模型--返回给渲染进程
 */
export interface IPCModelTypeRender {
    success: boolean;
    /** 返回的消息 */
    msg: string;
    /** 传递的参数 */
    data?: any;
}

/**
 * IPC通信模型--主进程
 */
export interface IPCModelTypeMain {
    /** 控制器函数名 */
    fun: string;
    /** 传递的参数 */
    data?: any;
    win_type: string; // 当前发送消息的窗体类型
    winID: string; // 窗口ID,  没有ID的视为主窗体
}

// 弹窗类型
export interface MsgBoxType {
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
    /** 开窗是否用html渲染 */
    dangerouslyUseHTMLString?: boolean;
    /** 消息类型 */
    type?: MessageType;
    /** MessageBox 是否显示右上角关闭按钮 */
    "show-close"?: boolean;
    /**是否可通过点击遮罩层关闭 MessageBox */
    closeOnClickModal?: boolean;
    /** 是否可通过按下 ESC 键关闭 MessageBox */
    closeOnPressEscape?: boolean;
    /** 是否有需要执行的ipc回调 */
    ipc?: string
}
// 弹窗类型
export interface MsgBoxPromptType {
    /** 文字是否居中 */
    center?: boolean;
    /** 是否可拖动 */
    draggable?: boolean;
    /** 确认时的回调函数 */
    confirm?: Function;
    /** 关闭时的回调函数 */
    cancel?: Function;
    /** 调用时传递的参数,用于返回给调用者区分操作 */
    identity?: any;
    /** 正则匹配 */
    reg?: string;
    /** 最小值--仅输入的是纯数字才生效 */
    min?: number;
    /** 最大值--仅输入的是纯数字才生效 */
    max?: number;
    /** 弹窗的默认值,由调用处传递 */
    default?: string;
}

// 加载ui延时参数类型
export interface LoadingType {
    /** 超时时间,单位/秒,  超过时间之后自动关闭loading状态 */
    stamp: number;
    /** 关闭loading状态的时候执行的回调函数 */
    calback?: Function;
}
/**
 * 路由模型
 */
export interface RouterType {
    /** 路由地址 */
    path: string;
    /** 路由名字 */
    name: string;
    /** 路由类型 */
    type: string;
}
