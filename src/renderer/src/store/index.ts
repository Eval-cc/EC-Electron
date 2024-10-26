import {createStore} from "vuex";
import {IPCModelTypeRender, IPCModelTypeMain} from "@renderer/Models/model";
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
                    utils.message(message.msg, message.data.type);
                } else if (message.data.type === "dialog") {
                    utils.messageBox(message.data.title, message.msg, message.data.type);
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
            value.electron.ipcRenderer.on("message-from-child", (_: any, message: IPCModelTypeRender) => {
                if (message.data.type === "winID") {
                    state.mainWin = {
                        winID: message.data.winID,
                    };
                } else if (message.data.type === "tip") {
                    utils.message(message.msg, message.data.type);
                } else if (message.data.type === "dialog") {
                    utils.messageBox(message.data.title, message.msg, message.data.type);
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
        async sendIPC({state}, value: IPCModelTypeMain): Promise<IPCModelTypeRender> {
            if (!state.win) {
                return {success: false, msg: "出错了,请重启!"};
            }
            value.win_type = state.win.win_type;
            value.winID = state.mainWin?.winID || null;
            const res = await state.win.IPCcontrol.IPCcontrol(value);
            return res;
        },
    },
    getters: {},
});

export default store;
