/**
 * @time   2024/04/16 13:43:38
 * @author Eval
 * @description 渲染工具类
 */
import {ElMessage, ElLoading, ElMessageBox} from "element-plus";
import type {MessageHandler, MessageOptions} from "element-plus";
import {MsgBoxType, MsgBoxPromptType, LoadingType, IPCModelTypeRender} from "@renderer/models";
import store from "@renderer/store";

class Utils {
    private debounTime: any; // 防抖定时器
    constructor() {}

    /**
     * 调用主进程方法
     * @param method 主进程方法名
     * @param args 参数对象
     * @returns
     */
    ipc = (method: string, args?: any): Promise<IPCModelTypeRender> => {
        return store.dispatch("EC_Main_IPC_Send", {fun: method, data: args}) as Promise<IPCModelTypeRender>;
    };

    /**
     * 开窗弹出消息
     * @param msg
     * @param options
     * @returns
     */
    message = (msg: string, options?: MessageOptions | boolean): MessageHandler => {
        if (typeof options === "boolean") {
            return ElMessage({message: msg, type: options ? "success" : "warning", grouping: true, showClose: true, duration: 2000});
        }
        const grouping = options?.grouping ? options.grouping : true;
        const showClose = options?.showClose ? options.showClose : true;
        const duration = options?.duration ? options.duration : 2000;
        const type = options?.type ? options.type : "success";

        return ElMessage({message: msg, type, grouping, showClose, duration});
    };

    /**
     * 关闭指定的实例开窗消息
     * @param vm
     */
    closeMsgByVM(vm: MessageHandler) {
        vm.close();
    }

    /**
     * 关闭所有的弹窗消息
     */
    closeMsgAll() {
        ElMessage.closeAll();
    }

    /**
     * 显示加载遮罩
     * @param text
     * @param options
     * @param timeout  延时自动关闭/秒
     */
    loading(
        text: string,
        options: Partial<
            Omit<import("element-plus").LoadingOptionsResolved, "target" | "parent"> & {
                target: string | HTMLElement;
                body: boolean;
            }
        > = {},
        timeout: LoadingType | null = null,
    ): any {
        const background = options.background ? options.background : "rgba(0, 0, 0, 0.7)";
        const lock = options.lock ? options.lock : true;
        const fullscreen = options.fullscreen ? options.fullscreen : true;
        const win = ElLoading.service({
            lock,
            text,
            fullscreen,
            background,
        });
        win["active"] = true;
        if (timeout?.stamp) {
            setTimeout(() => {
                // 如果还没有被关闭的话,那么就执行
                if (win["active"]) {
                    timeout.calback && timeout?.calback();
                    this.closeLoading(win);
                }
            }, timeout.stamp * 1000);
        }
        return win;
    }

    /**
     * 关闭loading框
     * @param vm
     */
    closeLoading(vm: any) {
        // 切换状态 为死亡的节点
        if (!vm) return;
        vm["active"] = false;
        vm.close();
    }

    /**
     * 消息弹窗
     * @param title  标题
     * @param content 内容
     * @param options 参数  {confirm:()=>{确认}},{cancel:()=>{取消}}
     */
    messageBox = (title: string = "标题", content: string = "弹窗内容", options: MsgBoxType = {}) => {
        const confirmText = options.confirmText || "确认";
        const cancelText = options.cancelText || "关闭";
        ElMessageBox.confirm(content, title, {
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            draggable: true,
            ...options,
        })
            .then(() => {
                options.ipc && this.ipc(options.ipc, {...options});
                options.confirm && options.confirm();
            })
            .catch(() => {
                options.cancel && options.cancel();
            });
    };

    /**
     * 消息弹窗--可输入
     * @param title  标题
     * @param content 内容
     * @param options 参数  confirm() 确认时调用,cancel点击取消时调用,identity 参数标识符(可选)
     */
    messageBoxPrompt = (title: string | null = "提示", content: string | null = "请输入", options: MsgBoxPromptType = {}) => {
        ElMessageBox.prompt(content as string, title as string, {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            inputPattern: options.reg ? new RegExp(options.reg) : new RegExp("[\\s\\S]*"),
            inputErrorMessage: "不合法的值",
            draggable: true,
        })
            .then(({value}) => {
                // 如果没有输入内容且传递的有默认值,那么使用默认值作为回调数据
                if (!value && options.default) {
                    value = options.default;
                }
                if (!Number.isNaN(Number(value))) {
                    // 限制最大值不能低于最小值
                    if (options.min && options.max && Number(options.min) >= Number(options.max)) {
                        options.max = options.min + 1;
                    }
                    if (options.min && Number(value) < Number(options.min)) {
                        value = String(options.min);
                    }
                    if (options.max && Number(value) > Number(options.max)) {
                        value = String(options.max);
                    }
                }
                options.confirm &&
                    options.confirm({
                        identity: options?.identity || "none",
                        value,
                    });
            })
            .catch(() => {
                options.cancel && options.cancel();
            });
    };

    /**
     * 复制文本
     * @param msg
     * @returns
     */
    copyText = async (msg: string) => {
        return await new Promise((resolve, rejects) => {
            navigator.clipboard
                .writeText(msg)
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    rejects(false);
                });
        });
    };

    /**
     * 事件防抖
     * @param callback
     * @param stamp  防抖的间隔,默认 0.5秒 ,
     * @returns
     */
    Debouncing = (callback: Function, stamp: number = 0.5) => {
        if (stamp >= 100) {
            this.message(`请注意,当前传入的定时器执行时间是${stamp}秒`, {type: "warning"});
        }
        if (!callback) return;
        // 清除防抖定时器
        if (this.debounTime) {
            clearTimeout(this.debounTime);
        }
        this.debounTime = setTimeout(() => {
            callback && callback();
        }, stamp * 1000);
    };

    /**
     * 生成uuid
     * @returns
     */
    get uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * 生成随机字符串
     * @param length  字符串的长度
     * @returns
     */
    GetRandStr = (length: number) => {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    /**
     * 返回指定格式的时间字符串
     * @param date  需要格式化的时间
     * @param end_1 年月日的分隔符,默认 /
     * @param end_2 时分秒的分隔符,默认 :
     * @param */
    GetDateFormat = (date: Date, end_1: string = "/", end_2: string = ":") => {
        if (!date) return "";
        if (typeof date == "string") {
            date = new Date(date);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        const second = String(date.getSeconds()).padStart(2, "0");

        return `${[year, month, day].join(end_1)} ${[hour, minute, second].join(end_2)}`;
    };
}
Utils.toString = () => "[class Utils]";
export default new Utils();
