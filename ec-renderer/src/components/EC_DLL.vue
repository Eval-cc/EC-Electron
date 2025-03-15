<!-- 
 * @time       2024/11/02 19:32:33
 * @author     Eval
 * @description 调用DLL示例
 -->

<template>
    <div class="call-dll">
        <div>
            <el-input v-model="dllFrom.dllName" placeholder="输入DLL的名称" clearable show-word-limit maxlength="50">
                <template #prepend>dll名称</template>
            </el-input>
        </div>
        <div>
            <el-input v-model="dllFrom.className" placeholder="输入DLL的命名空间/类名" clearable show-word-limit maxlength="50">
                <template #prepend>类名</template>
            </el-input>
        </div>
        <div>
            <el-input v-model="dllFrom.methodName" placeholder="输入方法名" clearable show-word-limit maxlength="50">
                <template #prepend>方法名</template>
            </el-input>
        </div>
        <div>
            <el-input v-model="dllFrom.returnType" placeholder="输入返回值类型" clearable show-word-limit maxlength="50">
                <template #prepend>返回值类型</template>
            </el-input>
        </div>
        <div>
            <el-input v-model="dllFrom.argsType" placeholder="参数类型" clearable show-word-limit maxlength="50">
                <template #prepend>参数类型</template>
            </el-input>
        </div>
        <div>
            <el-input v-model="dllFrom.args" placeholder="参数列表,逗号分隔" clearable show-word-limit maxlength="50">
                <template #prepend>参数</template>
            </el-input>
        </div>
        <div>
            <el-button type="primary" plain @click="InvokerDll">确认</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import utils from "@renderer/utils";
import {reactive} from "vue";

const dllFrom = reactive<{[key: string]: any}>({
    className: "Test.Add",
    methodName: "addNum_1",
    args: "1,2,3",
    dllName: "test",
    returnType: "int",
    argsType: "int,int",
});

// 测试调用Dll
const InvokerDll = async (): Promise<void> => {
    const data = {...dllFrom};
    data.args = data.args.split(",");
    utils.ipc("InvokerDll", JSON.parse(JSON.stringify(data))).then((res) => {
        utils.message(res.msg, res.success);
    });
};
</script>

<style lang="less" scoped>
.el-input {
    max-width: 500px;
}
</style>
