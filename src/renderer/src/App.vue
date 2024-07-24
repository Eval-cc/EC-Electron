<script setup lang="ts">
import store from "./store";
import {onMounted} from "vue";

onMounted(() => {
    // 初始化IPC模块
    store.commit("initIPC", window);
});
</script>

<template>
    <router-view></router-view>
</template>
