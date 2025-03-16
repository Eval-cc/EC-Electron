import {resolve} from "path";
import {bytecodePlugin, defineConfig, externalizeDepsPlugin} from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    main: {
        resolve: {
            alias: {
                "@": resolve("./"), // 确保路径一致
            },
        },
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
        plugins: [vue(), externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
});
