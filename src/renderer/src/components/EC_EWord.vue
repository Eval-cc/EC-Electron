<!-- 
 * @time       2024/11/04 14:13:52
 * @author     Eval
 * @description 调用外部接口
 -->

<template>
    <div class="e-word">
        <el-descriptions title="返回消息">
            <el-descriptions-item label="作者">{{ Edata.from }}</el-descriptions-item>
            <el-descriptions-item label="编号">{{ Edata.created_at }}</el-descriptions-item>
            <el-descriptions-item label="来源">{{ Edata.creator }}</el-descriptions-item>
            <el-descriptions-item label="描述"> <el-alert type="success" :description="Edata.hitokoto" :closable="false" /> </el-descriptions-item>
        </el-descriptions>
        <el-button type="primary" plain @click="Refresh" :loading="loading">刷新</el-button>
    </div>
</template>

<script lang="ts" setup>
import utils from "../utils";
import {onMounted, reactive, ref} from "vue";

const Edata = reactive< {[key: string]: any}>({});
const loading = ref<boolean>(false);

const Refresh = () => {
    loading.value = true;
    fetch("https://v1.hitokoto.cn/")
        .then((response) => {
            // 检查状态码是否为 200（成功）
            if (response.ok) {
                // 状态码为 200-299 范围内的请求被认为是成功的
                response.json().then((data) => {
                    Object.assign(Edata, data);
                    // 调用动画函数
                    utils.animateNumber(Edata, "created_at", Edata.created_at, 1500);
                    setTimeout(() => {
                        loading.value = false;
                    }, 2000);
                });
            } else {
                utils.message(`请求失败，状态码: ${response.status}`, false);
            }
        })
        .catch((error) => {
            utils.message(error, false);
        });
};
onMounted(Refresh);
</script>

<style lang="less" scoped></style>
