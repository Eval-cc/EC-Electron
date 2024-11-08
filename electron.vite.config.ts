import path, {resolve} from "path";
import {bytecodePlugin, defineConfig, externalizeDepsPlugin} from "electron-vite";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron";

export default defineConfig({
    main: {
        /**
         * 有箭头函数需要转换的设置 transformArrowFunctions 为 false
         * 是否保留编译为字节码文件的 bundle 文件。removeBundleJS
         */
        plugins: [externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
    preload: {
        plugins: [
            electron([
                {
                    entry: path.join(__dirname, "src/preload/child-preload.ts"),
                    onstart({reload}) {
                        reload();
                    },
                    vite: {
                        build: {
                            outDir: path.join(__dirname, "out/preload"),
                            rollupOptions: {
                                output: {
                                    inlineDynamicImports: true,
                                },
                            },
                            target: "esnext", // 确保目标是最新的 ES 版本，以便支持字节码打包
                        },
                    },
                },
            ]),
            externalizeDepsPlugin(),
            bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true}),
        ],
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
