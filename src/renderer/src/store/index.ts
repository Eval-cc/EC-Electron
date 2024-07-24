import {createStore} from "vuex";
import {IPCModelTypeRender, IPCModelTypeMain} from "@renderer/Models/model";

const store = createStore({
    state() {
        return {
            win: null as any,
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
            // 监听来自主进程的消息
            value.electron.ipcRenderer.removeAllListeners();
            value.electron.ipcRenderer.on("message-from-main", (_: any, message: IPCModelTypeRender) => {
                console.log("收到主进程信息", message);
            });
            // 负责通过主进程在子进程之间通信
            value.electron.ipcRenderer.on("message-child-channel", (_: any, message: IPCModelTypeRender) => {
                console.log("收到其他子进程信息", message);
                if(message.data.type === "childID" && !this.childID){
                    this.childID = message.data.id;
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
            const res = await state.win.IPCcontrol.IPCcontrol(value);
            return res;
        },
    },
    getters: {},
});

export default store;
