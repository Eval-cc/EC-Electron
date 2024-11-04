import {resolve} from "path";
import {bytecodePlugin, defineConfig, externalizeDepsPlugin} from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    main: {
        /**
         * 有箭头函数需要转换的设置 transformArrowFunctions 为 false
         * 是否保留编译为字节码文件的 bundle 文件。removeBundleJS
         */
        plugins: [externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
    preload: {
        plugins: [externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
    renderer: {
        resolve: {
            alias: {
                "@renderer": resolve("src/renderer/src"),
            },
        },
        plugins: [vue(),externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
});
