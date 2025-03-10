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
        plugins: [
            electron([
                {
                    entry: path.join(__dirname, "ec-electron/main/index.ts"),
                    onstart({reload}) {
                        reload();
                    },
                    vite: {
                        build: {
                            outDir: path.join(__dirname, "out/main"),
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
        build: {
            rollupOptions: {
                input: "./ec-electron/main/index.ts", // 确保这里指定了正确的入口文件路径
                external: [],
            },
        },
        // root: "./electron",
        // resolve: {
        //     alias: {
        //         "/@": path.resolve(__dirname, "electron"), // 确保别名指向项目根目录
        //     },
        // },
    },
    preload: {
        plugins: [
            electron([
                {
                    entry: path.join(__dirname, "ec-electron/preload/child-preload.ts"),
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
                {
                    entry: path.join(__dirname, "ec-electron/preload/index.ts"),
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
        build: {
            rollupOptions: {
                input: "./ec-electron/preload/child-preload.ts", // 确保这里指定了正确的入口文件路径
            },
        },
    },
    renderer: {
        root: "./ec-renderer",
        resolve: {
            alias: {
                "@renderer": resolve("ec-renderer/src"),
            },
        },
        build: {
            outDir: path.resolve(__dirname, "out", "ec-renderer"), // 输出目录
            rollupOptions: {
                input: {
                    index: resolve(__dirname, "ec-renderer", "index.html"),
                },
                output: {
                    // 使用 fileName 而不是 name
                    entryFileNames: "index.html", // 设置输出文件名
                    chunkFileNames: "[name]-[hash].js", // 如果有 chunk 文件
                    assetFileNames: "[name]-[hash][extname]", // 设置其他静态资源文件的输出格式
                },
            },
        },
        plugins: [vue(), externalizeDepsPlugin(), bytecodePlugin({transformArrowFunctions: false, removeBundleJS: true})],
    },
});
