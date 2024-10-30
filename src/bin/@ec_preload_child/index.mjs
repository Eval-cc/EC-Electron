/**
 * @time   2024/09/29 01:50:17
 * @author Eval
 * @description 处理预加载脚本
 */

import ts from "typescript";
import fs from "fs-extra";
import path from "path";

function compileTypeScript() {
    const tsFilePath = path.join(process.cwd(), "src/preload/child-preload.ts");
    const outDir = path.join(process.cwd(), "out/preload-child");
    const tsFile = fs.readFileSync(tsFilePath, "utf8");

    // 创建输出目录（如果不存在）
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }

    // 编译选项
    const compilerOptions = {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES6,
        outDir,
    };
    const result = ts.transpileModule(tsFile, {compilerOptions});

    const fileName = path.basename(tsFilePath, ".ts") + ".js";
    const outputFilePath = path.join(outDir, fileName);
    fs.writeFileSync(outputFilePath, result.outputText);
    console.log("编译预加载脚本完成,输出目录:" + outputFilePath);
}

compileTypeScript();
