<template>
    <div class="common-layout">
        <el-container>
            <el-aside style="width: auto">
                <AsideView :childCallback />
            </el-aside>
            <el-main>
                <el-button type="primary" plain @click="openWin">新建窗口</el-button>
                <el-button type="primary" plain @click="Test">调用测试消息</el-button>
                <el-button type="success" plain @click="InvokerDll">调用测试DLL</el-button>
            </el-main>
        </el-container>
    </div>
</template>

<script lang="ts" setup>
import store from "@renderer/store/index";
import {IPCModelTypeRender} from "@renderer/models/model";
import utils from "@renderer/utils";
import {ref} from "vue";

import AsideView from "@renderer/components/Aside.vue";

const currMenu = ref("");
/**
 * 新建窗口
 */
const openWin = (): void => {
    store.dispatch("sendIPC", {fun: "openWin"});
};

const Test = async (): Promise<void> => {
    const res = (await store.dispatch("sendIPC", {fun: "test"})) as IPCModelTypeRender;
    utils.message(res.msg);
};

const InvokerDll = async (): Promise<void> => {
    for (let i = 0; i < 10; i++) {
        // 异步的提示, 不等待返回值
        store.dispatch("sendIPC", {fun: "InvokerDll", data: [i, i + 1, i + 1 * 2]}).then((res) => {
            utils.message(res.msg);
        });
    }
};

const childCallback = (data: any): void => {
    currMenu.value = data;
    if (data === "restart") {
        store.dispatch("sendIPC", {fun: "Restart"});
    } else if (data === "exit") {
        store.dispatch("sendIPC", {fun: "Exit"});
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
</style>
