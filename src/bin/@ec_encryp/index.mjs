import fs from "fs-extra";
import path from "path";
import JavaScriptObfuscator from "javascript-obfuscator";

/**
 *  compact: 压缩输出的代码。
    controlFlowFlattening: 控制流扁平化，将代码的控制流程变得更难理解。
    controlFlowFlatteningThreshold: 控制流扁平化的阈值，该参数决定了进行控制流扁平化的概率。
    deadCodeInjection: 注入死代码，向代码中注入无效的代码块，增加阅读和理解的难度。
    deadCodeInjectionThreshold: 注入死代码的阈值，决定了进行死代码注入的概率。
    debugProtection: 调试保护，防止通过调试工具进行代码分析和调试。
    debugProtectionInterval: 调试保护间隔，控制调试保护的触发频率。
    disableConsoleOutput: 禁用控制台输出，阻止代码向控制台输出信息。
    domainLock: 域名锁定，限制代码在指定的域名下执行。
    forceTransformStrings: 强制转换字符串，强制对字符串进行转换，增加代码的混淆度。
    identifierNamesGenerator: 标识符命名生成器，指定生成标识符的命名方式，例如使用十六进制。
    identifiersDictionary: 标识符字典，指定用于生成标识符的字典。
    identifiersPrefix: 标识符前缀，添加到生成的标识符前面。
    ignoreRequireImports: 忽略 require 导入，不对 require 导入的代码进行混淆。
    inputFileName: 输入文件名，指定输入文件的名称。
    log: 是否记录日志。
    numbersToExpressions: 将数字转换为表达式。
    optionsPreset: 选项预设，默认为 'default'。
    renameGlobals: 重命名全局变量。
    renameProperties: 重命名属性名。
    renamePropertiesMode: 重命名属性名的模式，安全模式下不会更改类似于 eval 或者 Function 的属性名。
    reservedNames: 保留的名称列表，不会对这些名称进行混淆。
    reservedStrings: 保留的字符串列表，不会对这些字符串进行混淆。
    rotateStringArray: 旋转字符串数组，对字符串数组进行旋转，增加代码的混淆度。
    seed: 随机种子，用于生成随机数的种子。
    selfDefending: 自我防御，向代码中插入自我保护机制，防止代码被恶意修改。
    shuffleStringArray: 对字符串数组进行随机排序。
    simplify: 简化代码。
    sourceMap: 是否生成源映射。
    sourceMapBaseUrl: 源映射的基本 URL。
    sourceMapFileName: 源映射文件的名称。
    sourceMapMode: 源映射模式，指定源映射的生成方式。
    splitStrings: 分割字符串，将字符串拆分成多个部分。
    splitStringsChunkLength: 分割字符串的长度。
    stringArray: 使用字符串数组替换字符串。
    stringArrayIndexesType: 字符串数组的索引类型。
    stringArrayEncoding: 字符串数组的编码方式。 -- 支持 [none,base64,rc4]
    stringArrayIndexShift: 是否对字符串数组的索引进行移位。
    stringArrayWrappersCount: 字符串数组包装器的数量。
    stringArrayWrappersChainedCalls: 是否允许链式调用字符串数组包装器。
    stringArrayWrappersParametersMaxCount: 字符串数组包装器参数的最大数量。
    stringArrayWrappersType: 字符串数组包装器的类型。
    stringArrayThreshold: 字符串数组的阈值，决定了字符串数组替换的触发条件。
    target: 目标平台，例如 'browser'。
    transformObjectKeys: 转换对象键。
    unicodeEscapeSequence: 使用 Unicode 转义序列。
 */

// 指定目录路径
const directoryPath = process.cwd() + "/out";

// 遍历目录下的所有文件
const findDir = (dirPath) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error("读取文件失败:", err);
            return;
        }
        // 遍历每个文件
        files.forEach((file) => {
            const currPath = dirPath + "/" + file;
            if (fs.lstatSync(currPath).isDirectory()) {
                return findDir(currPath);
            }
            // 检查文件是否为 JavaScript 文件
            if (file.endsWith(".js")) {
                const filePath = path.join(dirPath, file);
                const fileInfo = fs.statSync(filePath);
                let stime = new Date().getTime();
                // 根据读取到的 fileInfo 输出 文件名称和大小(单位 kb)
                console.log(`文件就绪! 文件名称:[${file}] 大小:[${Math.max(Math.round(fileInfo.size / 1024), 1)} kb]`);
                // 读取文件内容
                try {
                    const fileData = fs.readFileSync(filePath, "utf8").toString();

                    // 混淆文件内容
                    const obfuscatedCode = JavaScriptObfuscator.obfuscate(fileData, {
                        // 设置混淆选项，根据需要进行调整
                        compact: true,
                        debugProtection: true,
                        controlFlowFlattening: true,
                        controlFlowFlatteningThreshold: 1,
                        numbersToExpressions: true,
                        simplify: true,
                        shuffleStringArray: true,
                        splitStrings: true,
                        stringArray: true,
                        selfDefending: true,
                        disableConsoleOutput: true,
                        stringArrayEncoding: ["none"], // 使用 rc4转为字节码之后,可能会造成卡顿. 慎用
                        stringArrayThreshold: 1,
                        unicodeEscapeSequence: true,
                    }).getObfuscatedCode();

                    // 将混淆后的代码写回文件
                    try {
                        fs.writeFileSync(filePath, obfuscatedCode, "utf8");
                        console.log(`编译完成:${file},耗时:${Math.round((new Date().getTime() - stime) / 1000).toFixed(2)} 秒`);
                    } catch (err) {
                        console.error("编译失败:", filePath, err);
                    }
                } catch (err) {
                    console.error("源文件加载失败:", err);
                    return;
                }
            }
        });
    });
};

findDir(directoryPath);
