<template>
    <div class="form">
        <div class="container">
            <el-button type="primary" plain @click="openWin">新建窗口</el-button>
            <el-button type="primary" plain @click="Test">调用测试</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import store from "@renderer/store/index";
import {IPCModelTypeRender} from "@renderer/Models/model";
import Utils from "@renderer/utils"

/**
 * 新建窗口
 */
const openWin = (): void => {
    store.dispatch("sendIPC", {fun: "openWin"});
};

const Test = async (): Promise<void> => {
    const res = (await store.dispatch("sendIPC", {fun: "test"})) as IPCModelTypeRender;
    Utils.message(res.msg)
};

</script>

<style lang="less" scoped></style>
