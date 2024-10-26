<!-- 
 * @time       2024/10/26 14:15:45
 * @author     Eval
 * @description Aside
 -->

<template>
    <div class="aside-container">
        <el-scrollbar>
            <el-menu default-active="2" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen" @close="handleClose">
                <template v-for="(menu, key) in menuList" :key="key">
                    <el-sub-menu :index="String(key)" v-if="menu.children">
                        <template #title>
                            <el-icon>
                                <component :is="menu.icon" />
                            </el-icon>
                            <span class="menu-name">{{ menu.menuname }}</span>
                        </template>
                        <el-menu-item-group v-for="(c_menu, c_key) in menu.children" :key="c_key" :title="c_menu.menuname">
                            <template #title>{{ c_menu.menuname }}</template>
                            <el-menu-item
                                v-for="(c_c_menu, c_c_key) in c_menu.children"
                                :key="c_c_key"
                                :index="String(key + 1) + '-' + String(c_c_key + c_key + key)"
                                @click="childCallback(c_c_menu.type)"
                            >
                                {{ c_c_menu.menuname }}
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-sub-menu>

                    <el-menu-item :index="String(key + 1)" v-else @click="childCallback(menu.type)">
                        <el-icon>
                            <component :is="menu.icon" />
                        </el-icon>
                        <template #title>{{ menu.menuname }}</template>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-scrollbar>
        <div class="aside-bar">
            <el-icon v-if="!isCollapse"><ArrowLeftBold @click="isCollapse = true" /></el-icon>
            <el-icon v-else><ArrowRightBold @click="isCollapse = false" /></el-icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
// 引入 icon-menu 图标
import {Menu as IconMenu, Setting, ArrowRightBold, ArrowLeftBold} from "@element-plus/icons-vue";
import {reactive, ref, markRaw} from "vue";

defineProps({
    childCallback: {
        type: Function,
        default: () => {},
    },
});

const isCollapse = ref(true);
const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
};

const menuList = reactive([
    {
        menuname: "主菜单",
        icon: markRaw(IconMenu),
        children: [
            {
                menuname: "主分类",
                children: [
                    {
                        menuname: "关闭程序",
                        type: "exit",
                    },
                    {
                        menuname: "重启程序",
                        type: "restart",
                    },
                ],
            },
        ],
    },
    {
        menuname: "设置",
        icon: markRaw(Setting),
        type: "setting",
    },
]);
</script>

<style lang="less" scoped>
.aside-container {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    height: 100%;
    align-items: center;
    transition: width 0.3s ease-in-out;
    width: var(--container-width);

    &:hover {
        .aside-bar {
            opacity: 1;
        }
    }
    // :deep(.el-scrollbar) {
    //     z-index: 9;
    //     background-color: white;
    // }

    .aside-bar {
        opacity: 0;
        padding: 5px;
        height: 20px !important;
        width: 20px !important;
        transition: opacity 0.3s ease-in-out;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translateX(-10px);
        &:hover {
            cursor: pointer;
            color: aqua;
        }
    }
}
</style>
