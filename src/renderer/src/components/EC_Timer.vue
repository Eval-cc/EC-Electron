<!-- 
 * @time       2024/11/05 11:07:14
 * @author     Eval
 * @description 接收主进程定时任务推送的消息
 -->

<template>
    <div class="form">
        <div>
            <el-button type="success" plain @click="starTimer">启动定时接收主进程推送消息</el-button>
            <el-button type="danger" plain @click="stopTimer">关闭定时接收主进程推送消息</el-button>
            <el-button type="primary" plain @click="readEcFile">读取文件内容</el-button>
            <el-button type="danger" plain @click="msgList.splice(0, msgList.length)">清空消息</el-button>
            <div class="msg-list">
                <ul ref="messageList">
                    <template v-for="(item, index) in msgList.slice(-10)" :key="index">
                        <li class="prompt">
                            <span class="command">Eval@localhost:~$</span> 输出主进程定时任务消息
                            <span class="index">行:{{ Math.max(msgList.length - 10, 0) + index + 1 }}</span>
                        </li>
                        <li class="output">
                            {{ item.msg }}
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {IPCModelTypeRender} from "../models";
import utils from "../utils";
import {nextTick, onMounted, reactive, ref} from "vue";

const msgList = reactive<IPCModelTypeRender[]>([]);
const messageList = ref<HTMLUListElement>();

onMounted(() => {
    // 任务开始之后, 开始定时接收主进程推送消息
    utils.on("ec-timer", (data: IPCModelTypeRender) => {
        msgList.push(data);
        nextTick(() => {
            if (messageList.value?.scrollHeight) {
                messageList.value!.scrollTop = messageList.value.scrollHeight;
            }
        });
    });
});

onbeforeunload = () => {
    // 页面关闭时, 关闭定时接收主进程推送消息
    utils.off("ec-timer");
};

const starTimer = () => {
    utils.ipc("starTimer").then((res) => {
        utils.message(res.msg, res.success);
    });
};

const stopTimer = () => {
    utils.ipc("stopTimer").then((res) => {
        utils.message(res.msg, res.success);
    });
};

const readEcFile = () => {
    const layer = utils.loading("读取文件内容中...");
    msgList.splice(0, msgList.length);
    setTimeout(() => {
        utils.ipc("readEC").then(async (res) => {
            utils.closeLoading(layer);
            if (!res.success) {
                utils.message(res.msg, res.success);
                return;
            }
            for (let [_, item] of res.data.data.split("\n").filter(Boolean).entries()) {
                msgList.push({success: true, msg: item});
            }
            utils.message(`读取文件内容完成,共:${msgList.length}行`, true);
            messageList.value!.scrollTop = messageList.value!.scrollHeight;
        });
    }, 500);
};
</script>

<style lang="less" scoped>
ul {
    list-style-type: none; /* 去掉默认的列表符号 */
    padding: 0;
    margin: 0;
    height: 240px; /* 限制最大高度 */
    overflow-y: auto; /* 超过部分滚动 */
    background-color: #000; /* 黑色背景 */
    color: #00ff00; /* 绿色字体 */
    font-family: "Courier New", monospace; /* 等宽字体 */
    text-align: left; /* 左对齐 */
    font-size: 14px; /* 字体大小 */
    font-family: cursive;

    /* 滚动条样式 */
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #555;
        border-radius: 4px;
    }
    li {
        padding: 2px;
        white-space: pre-wrap; /* 保留空格和换行 */
        word-wrap: break-word; /* 处理长单词自动换行 */
    }
    .prompt {
        color: #808080; /* 灰色提示符 */
        font-weight: bold;
        border-bottom: 1px solid #00000000; /* 鼠标悬停时添加下划线 */

        &:hover {
            border-bottom: 1px solid #808080; /* 鼠标悬停时添加下划线 */
            cursor: pointer;
            .index {
                display: inline-block;
            }
        }
        .command {
            color: #ffcc00ab; /* 命令部分黄色 */
            &:before {
                content: ">"; /* 添加命令提示符 */
                margin-right: 10px;
            }
        }
        .index {
            display: none;
            color: white;
            float: right;
        }
    }

    .output {
        color: #00ff00c0; /* 命令输出绿色 */
        &:before {
            content: ">>>"; /* 添加命令提示符 */
            margin-right: 10px;
        }
        /* 通过悬停 .output 来显示 .prompt 内的 .index */
        &:hover ~ .prompt .index {
            display: inline-block; /* 悬停时显示 .index */
        }
    }
}
</style>
