import {IPCModelTypeMain, IPCModelTypeRender} from "../models";
import utils from "../utils";
import {defineStore} from "pinia";

export const useECStore = defineStore("ec-store", {
    state: () => ({
        /** 主进程窗体对象 */
        mainWin: null as any,
        /** 事件池 */
        ECEVent: {} as Record<string, Function[]>,
    }),
    getters: {},
    actions: {
        /**
         * 初始化IPC事件监听,开始接收主进程发送的信息
         * @param value
         */
        async initIPC(value: any) {
            this.mainWin = value;
            if (this.mainWin.win_type == "main") {
                this.mainWin.electron.ipcRenderer.removeAllListeners();
                this.mainWin.electron.ipcRenderer.on("ec-channel-message", this.handlerECMessage);
            } else {
                this.mainWin.electron.ipcRenderer.removeAllListeners();
                this.mainWin.electron.ipcRenderer.on("ec-channel-message-child", this.handlerECMessage);
            }
        },

        handlerECMessage(_: any, message: IPCModelTypeRender) {
            if (message.data.type === "winID") {
                this.mainWin.winID = message.winID;
            } else if (message.data.type === "tip") {
                // 主进程推送的消息事件
                utils.message(message.msg, message.success);
            } else if (message.data.type === "dialog") {
                // 主进程推送的开窗事件
                utils.messageBox(message.data.title, message.msg, message.data.options);
            } else if (message.data.type === "loading") {
                // 主进程推送的loading事件
                utils.loading(message.msg, {}, {stamp: message.data.stamp || 2});
            } else if (String(message.data.type).startsWith("ec-")) {
                // 接收主进程推送的专属事件
                utils.emit(message.data.type, message);
            } else if (message.data.type === "progress") {
                console.log(message.data);
            }
        },

        /**
         * 追加事件
         * @param value
         */
        addListener({name, fn}: {name: string; fn: Function}) {
            if (!this.ECEVent[name]) {
                this.ECEVent[name] = [];
            }
            this.ECEVent[name].push(fn);
        },

        /**
         * 移除事件
         * @param value
         */
        removeListener({name}: {name: string}) {
            delete this.ECEVent[name];
        },

        /**
         * 触发事件
         * @param value
         */
        triggerListener({name, data}: {name: string; data: any}) {
            const fn = this.ECEVent[name];
            if (fn) {
                fn.forEach((fun) => {
                    fun.call(this, data);
                });
            }
        },
        /**
         * 发送消息 给主进程
         * @param options
         * @returns
         */
        async EC_Main_IPC_Send(options: IPCModelTypeMain): Promise<IPCModelTypeRender> {
            if (!this.mainWin) {
                return {success: false, msg: "出错了,请重启!"};
            }
            options.win_type = this.mainWin.win_type;
            options.winID = this.mainWin.winID || null;
            try {
                if (this.mainWin.win_type == "main") {
                    return await this.mainWin.IPCcontrol.IPCcontrol(options);
                }

                return await this.mainWin.IPCcontrolChild.IPCcontrolChild(options);
            } catch (e: any) {
                console.error(options);
                if (String(e).includes("Error: An object could not be cloned.")) {
                    return {success: false, msg: "无法传递对象,请检查数据类型![不可克隆的对象]"};
                }
                return {success: false, msg: "出错了,请重启!"};
            }
        },
    },
});
