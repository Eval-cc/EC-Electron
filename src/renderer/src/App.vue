<script setup lang="ts">
import store from "./store";
import {onMounted, ref} from "vue";

const loading = ref(5);
const playAnmi = ref(false);
onMounted(() => {
    // 初始化IPC模块
    store.commit("initIPC", window);
    const interval = setInterval(() => {
        loading.value--;
        if (loading.value <= 3) {
            playAnmi.value = true;
        }
        if (loading.value <= 0) {
            clearInterval(interval);
        }
    }, 500);
});
</script>

<template>
    <template v-if="loading">
        <div class="ec-logo" :class="{'play-ani': playAnmi}">
            <img src="./assets/ec-logo.webp" alt="" />
        </div>
    </template>
    <router-view v-else />
</template>
