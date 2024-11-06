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
            // 事件池
            ECEVent: {} as Record<string, Function[]>,
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
                } else if (message.data.type === "ec-timer") {
                    // 调用 emit 方法
                    utils.emit("ec-timer", {msg: message.msg, data: message.data});
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
                } else if (message.data.type === "ec-timer") {
                    utils.emit("ec-timer", message);
                }
            });
        },

        /**
         * 追加事件
         * @param state
         * @param value
         */
        addListener(state, {name, fn}: {name: string; fn: Function}) {
            if (!state.ECEVent[name]) {
                state.ECEVent[name] = [];
            }
            state.ECEVent[name].push(fn);
        },

        /**
         * 移除事件
         * @param state
         * @param value
         */
        removeListener(state, {name}: {name: string}) {
            delete state.ECEVent[name];
        },

        /**
         * 触发事件
         * @param state
         * @param value
         */
        triggerListener(state, {name, data}: {name: string; data: any}) {
            const fn = state.ECEVent[name];
            if (fn) {
                fn.forEach((fun) => {
                    fun.call(this, data);
                });
            }
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

        /**
         * 开始监听事件
         * @param param0
         * @param value
         */
        ec_on({commit}, value: any) {
            commit("addListener", {name: value.name, fn: value.fn});
        },

        /**
         * 移除监听
         * @param param0
         * @param value
         */
        ec_off({commit}, value: any) {
            commit("removeListener", {name: value.name});
        },

        /**
         * 触发事件
         * @param param0
         * @param param1
         */
        ec_emit({commit}, {name, data}) {
            commit("triggerListener", {name, data});
        },
    },
    getters: {},
});

export default store;
