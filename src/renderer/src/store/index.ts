import {createStore} from "vuex";
import {IPCModelTypeRender, IPCModelTypeMain} from "@renderer/models";
import utils from "@renderer/utils";

const store = createStore({
    state() {
        return {
            win: null as any,
            // 主进程窗体对象
            mainWin: null as any,
            childID: "" as string,
        };
    },
    mutations: {
        /**
         * 初始化IPC事件监听,开始接收主进程发送的信息
         * @param state
         * @param value
         */
        async initIPC(state, value: any) {
            state.win = value;
            store.commit("initChildIPC", value);
            // 监听来自主进程的消息
            value.electron.ipcRenderer.removeAllListeners();
            value.electron.ipcRenderer.on("message-from-main", (_: any, message: IPCModelTypeRender) => {
                // console.log("收到主进程信息", message);
                if (message.data.type === "winID") {
                    state.mainWin = {
                        winID: message.data.winID,
                    };
                } else if (message.data.type === "tip") {
                    utils.message(message.msg, message.success);
                } else if (message.data.type === "dialog") {
                    utils.messageBox(message.data.title, message.msg, message.data.options);
                } else if (message.data.type === "loading") {
                    utils.loading(message.msg, {}, {stamp: message.data.stamp || 2});
                }
            });
        },

        /**
         * 初始化子进程IPC
         * @param state
         * @param value
         */
        async initChildIPC(state, value: any) {
            if (value.win_type == "main") return;
            state.win = value;
            value.electron.ipcRenderer.removeAllListeners();
            value.electron.ipcRenderer.on("message-from-child", (_: any, message: IPCModelTypeRender) => {
                if (message.data.type === "winID") {
                    state.mainWin = {
                        winID: message.data.winID,
                    };
                } else if (message.data.type === "tip") {
                    utils.message(message.msg, message.success);
                } else if (message.data.type === "dialog") {
                    utils.messageBox(message.data.title, message.msg, message.data.options);
                } else if (message.data.type === "loading") {
                    utils.loading(message.msg, {}, {stamp: message.data.stamp || 2});
                }
            });
        },
    },
    actions: {
        /**
         * 发送消息 给主进程
         * @param param0
         * @param value
         * @returns
         */
        async EC_Main_IPC_Send({state}, value: IPCModelTypeMain): Promise<IPCModelTypeRender> {
            if (!state.win) {
                return {success: false, msg: "出错了,请重启!"};
            }
            value.win_type = state.win.win_type;
            value.winID = state.mainWin?.winID || null;
            try {
                if (state.win.win_type == "main") {
                    return await state.win.IPCcontrol.IPCcontrol(value);
                }

                return await state.win.IPCcontrolChild.IPCcontrolChild(value);
            } catch (e: any) {
                console.error(value);
                if (String(e).includes("Error: An object could not be cloned.")) {
                    return {success: false, msg: "无法传递对象,请检查数据类型![不可克隆的对象]"};
                }
                return {success: false, msg: "出错了,请重启!"};
            }
        },
    },
    getters: {},
});

export default store;
