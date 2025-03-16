<template>
    <div class="common-layout">
        <el-container>
            <el-aside style="width: auto">
                <EC_AsideView :childCallback />
            </el-aside>
            <el-main>
                <template v-if="currMenu === 'home'">
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">按钮组</div>
                        <div class="ec-grid-item-body">
                            <div class="notify ec-grid-item">
                                <el-button type="primary" plain @click="openWin" :loading>新建窗口</el-button>
                            </div>
                            <div class="notify ec-grid-item">
                                <el-button type="primary" plain @click="Test" :loading>调用测试消息</el-button>
                                <!-- <el-button type="primary" plain @click="Test_1" :loading>调用测试消息</el-button> -->
                            </div>
                        </div>
                    </div>
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">调用DLL示例</div>
                        <div class="ec-grid-item-body">
                            <div class="ec-grid-item">
                                <EC_DLL />
                            </div>
                        </div>
                    </div>
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">文件拖拽示例</div>
                        <div class="ec-grid-item-body">
                            <div class="ec-grid-item">
                                <EC_DragFile />
                            </div>
                        </div>
                    </div>
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">气泡消息</div>
                        <div class="ec-grid-item-body">
                            <div class="notify ec-grid-item">
                                <el-input v-model="notifyMsg" placeholder="输入消息" clearable show-word-limit maxlength="50">
                                    <template #prepend>EC气泡</template>
                                </el-input>
                                <el-button type="primary" plain @click="InvokerNotify" :loading>测试气泡消息</el-button>
                            </div>
                        </div>
                    </div>
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">一言接口</div>
                        <div class="ec-grid-item-body">
                            <div class="ec-grid-item">
                                <EC_EWord />
                            </div>
                        </div>
                    </div>
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">定时消息</div>
                        <div class="ec-grid-item-body">
                            <div class="ec-grid-item">
                                <EC_Timer />
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else-if="currMenu === 'setting'">
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">其他按钮</div>
                        <div class="ec-grid-item-body">
                            <div class="notify ec-grid-item">
                                <el-button type="primary" plain @click="childCallback('exit')" :loading>关闭程序</el-button>
                            </div>
                            <div class="notify ec-grid-item">
                                <el-button type="primary" plain @click="childCallback('restart')" :loading>重启程序</el-button>
                            </div>
                            <div class="notify ec-grid-item">
                                <el-button type="primary" plain @click="childCallback('update')" :loading>检查更新</el-button>
                            </div>
                        </div>
                    </div>
                </template>
            </el-main>
        </el-container>
    </div>
</template>

<script lang="ts" setup>
import utils from "../../utils";
import {ref} from "vue";

import EC_AsideView from "../../components/EC_Aside.vue";
import EC_DLL from "../../components/EC_DLL.vue";
import EC_DragFile from "../../components/EC_DragFile.vue";
import EC_EWord from "../../components/EC_EWord.vue";
import EC_Timer from "../../components/EC_Timer.vue";

// 变量声明
const notifyMsg = ref<string>("");
const currMenu = ref<string>("home");

const loading = ref<boolean>(false);

/**
 * 新建窗口
 */
const openWin = (): void => {
    loading.value = true;
    utils.Debouncing(
        "new-win",
        () => {
            loading.value = false;
        },
        1,
    );
    utils.ipc("openWin");
};

// 测试调用注入的消息
const Test = async (): Promise<void> => {
    utils.ipc("test").then((res) => {
        utils.message(res.msg);
    });
};
// 调用气泡消息
const InvokerNotify = () => {
    if (!notifyMsg.value.trim().length) return;
    loading.value = true;
    utils.Debouncing(
        "notify",
        () => {
            loading.value = false;
        },
        1,
    );
    utils.ipc("nityfier", {message: notifyMsg.value.trim()});
};

// aside组件的回调
const childCallback = (data: string): void => {
    if (data === "restart") {
        utils.ipc("Restart");
    } else if (data === "exit") {
        utils.ipc("Exit");
    } else if (data === "update") {
        utils.ipc("CheckUpdate").then((res) => {
            utils.message(res.msg, res.success);
        });
    } else {
        notifyMsg.value = "";
        currMenu.value = data;
    }
};
</script>

<style lang="less" scoped>
.el-container {
    height: 100vh;
    overflow: hidden;
    user-select: none;
}
.el-main {
    padding: 0;
    height: 100%;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-button,
    &::-webkit-scrollbar-thumb {
        background-image: linear-gradient(to bottom, #438285, #54b7bb);
        &:hover {
            cursor: n-resize;
        }
    }
}

.ec-grid-from {
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    margin: 5px 5px 10px 5px;
    position: relative;
    padding: 10px 2px 5px 2px;
    &:hover {
        border: 1px solid rgba(0, 223, 167);
        .ec-grid-lab {
            color: teal;
        }
    }
    .ec-grid-lab {
        background-color: white;
        position: absolute;
        top: -5px;
        left: 10px;
        z-index: 9;
        font-size: 13px;
        font-family: cursive;
        font-weight: bold;
        user-select: none;
        cursor: pointer;
    }
    .ec-grid-item-body {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .notify {
        display: flex;
        flex: 1 !important;
        justify-content: space-evenly;
    }
    .ec-grid-item {
        flex: 0 0 100%;
        box-sizing: border-box;
        margin-bottom: 5px;
        & > div {
            // flex: 0 0 40%;
            text-align: center;
            & :last-child {
                margin: 2px 0;
            }
        }
    }
}
</style>
