<template>
    <div class="form">
        <div class="container">
            <el-button type="primary" plain @click="openWin">新建窗口</el-button>
            <el-button type="primary" plain @click="Test">调用测试消息</el-button>
            <el-button type="primary" plain @click="InvokerDll">调用测试DLL</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import store from "@renderer/store/index";
import {IPCModelTypeRender} from "@renderer/Models/model";
import utils from "@renderer/utils";

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
</script>

<style lang="less" scoped></style>
