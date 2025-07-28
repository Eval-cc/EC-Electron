import {join, resolve} from "path";
import {readdirSync} from "fs";
import {bytecodePlugin, defineConfig, externalizeDepsPlugin} from "electron-vite";
import vue from "@vitejs/plugin-vue";

// 获取 src/preload 目录下所有 .ts 文件
const preloadDir = resolve(__dirname, "src/preload");
export default defineConfig({
    main: {
        root: join(__dirname, "../"), // 设置 renderer 的根目录
        resolve: {
            alias: {
                "@": resolve("./src/ec-electron"), // 确保路径一致
                "@resources": resolve("./resources"), // 确保路径一致
            },
        },
        plugins: [externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
    preload: {
        build: {
            lib: {
                entry: readdirSync(preloadDir)
                    .filter((file) => file.endsWith(".ts"))
                    .map((file) => resolve(preloadDir, file)),
            },
            outDir: join(__dirname, "out/preload"),
            rollupOptions: {
                output: {
                    entryFileNames: (chunkInfo) => {
                        return chunkInfo.name === "index" ? "index.js" : "[name].js";
                    },
                },
            },
        },
        plugins: [externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
    renderer: {
        root: join(__dirname, "src/renderer"), // 设置 renderer 的根目录
        build: {
            outDir: join(__dirname, "out/renderer"), // 指定 renderer 输出目录
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "src/renderer/index.html"),
                    child: resolve(__dirname, "src/renderer/child.html"),
                },
            },
            target: "esnext", // 确保目标是最新的 ES 版本，以便支持字节码打包
        },
        resolve: {
            alias: {
                "@": resolve("./"),
                "@renderer": resolve("src/renderer/src"),
            },
        },
        plugins: [vue(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
});
