<template>
    <div class="common-layout">
        <el-container>
            <el-aside style="width: auto">
                <AsideView :childCallback />
            </el-aside>
            <el-main>
                <template v-if="currMenu === 'home'">
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">按钮组</div>
                        <div class="ec-grid-item-body">
                            <div class="ec-grid-item">
                                <el-button type="primary" plain @click="openWin" :loading>新建窗口</el-button>
                            </div>
                            <div class="ec-grid-item">
                                <el-button type="primary" plain @click="Test" :loading>调用测试消息</el-button>
                            </div>
                            <div class="ec-grid-item">
                                <el-button type="success" plain @click="InvokerDll" :loading>调用测试DLL</el-button>
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
                    <!-- <div class="ec-grid-from">
                        <div class="ec-grid-lab">给所有的子窗体推送消息</div>
                        <div class="ec-grid-item-body">
                            <div class="notify ec-grid-item">
                                <el-input v-model="notifyMsg" placeholder="消息内容" clearable show-word-limit maxlength="20">
                                    <template #prepend>消息</template>
                                </el-input>
                                <el-button type="primary" plain @click="InvokerNotify" :loading>推送</el-button>
                            </div>
                        </div>
                    </div> -->
                </template>
                <template v-else-if="currMenu === 'setting'">
                    <div class="ec-grid-from">
                        <div class="ec-grid-lab">其他按钮</div>
                        <div class="ec-grid-item-body">
                            <div class="ec-grid-item">
                                <el-button type="primary" plain @click="childCallback('exit')" :loading>关闭程序</el-button>
                            </div>
                            <div class="ec-grid-item">
                                <el-button type="primary" plain @click="childCallback('restart')" :loading>重启程序</el-button>
                            </div>
                            <div class="ec-grid-item">
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
import utils from "@renderer/utils";
import {ref} from "vue";

import AsideView from "@renderer/components/Aside.vue";

// 变量声明
const notifyMsg = ref<string>("");
const currMenu = ref<string>("home");

const loading = ref<boolean>(false);



/**
 * 新建窗口
 */
const openWin = (): void => {
    loading.value = true;
    utils.Debouncing(() => {
        loading.value = false;
    }, 1);
    utils.ipc("openWin");
};

// 测试调用注入的消息
const Test = async (): Promise<void> => {
    utils.ipc("test").then((res) => {
        utils.message(res.msg);
    });
};

// 测试调用Dll
const InvokerDll = async (): Promise<void> => {
    for (let i = 0; i < 10; i++) {
        // 异步的提示, 不等待返回值
        utils.ipc("InvokerDll", [i ** 2, (i + 1) ** 2, i + 1 * 2]).then((res) => {
            utils.message(res.msg, res.success);
        });
    }
};

// 调用气泡消息
const InvokerNotify = () => {
    if (!notifyMsg.value.trim().length) return;
    loading.value = true;
    utils.Debouncing(() => {
        loading.value = false;
    }, 1);
    utils.ipc("nityfier", {message: notifyMsg.value.trim()});
};

// aside组件的回调
const childCallback = (data: any): void => {
    if (data === "restart") {
        utils.ipc("Restart");
    } else if (data === "exit") {
        utils.ipc("Exit");
    } else if (data === "update") {
        utils.ipc("CheckUpdate");
    } else {
        notifyMsg.value = "";
        currMenu.value = data;
    }
};
</script>

<style lang="less" scoped>
.el-container {
    height: 100vh;
    overflow: auto;
}
.el-main {
    padding: 0;
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
        flex: 0 0 30%;
        box-sizing: border-box;
        margin-bottom: 5px;
    }
}
</style>
