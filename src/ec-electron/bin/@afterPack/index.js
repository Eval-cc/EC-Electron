/**
 * 打包之后运行的钩子函数
 */
const fs = require("fs-extra");
const path = require("path");

exports.default = function (context) {
    const localeDir = context.appOutDir + "/locales/";

    fs.readdir(localeDir, function (err, files) {
        if (!(files && files.length)) return;
        for (let i = 0, len = files.length; i < len; i++) {
            // zh 开头的都不删
            if (!files[i].startsWith("zh")) {
                fs.unlinkSync(localeDir + files[i]);
            }
        }
    });
    // 得到Package.json文件路径
    const packageJsonPath = path.join(context.appOutDir, "resources", "app", "package.json");
    if (fs.existsSync(packageJsonPath)) {
        const jsonData = fs.readJsonSync(packageJsonPath);
        jsonData.dependencies = {
            node_xxx1: "9.9.9.9",
            node_xxx2: "9.9.9.9",
            node_xxx3: "9.9.9.9",
            node_xxx4: "9.9.9.9",
            node_xxx5: "9.9.9.9",
        }; // 删除使用到的模块信息
        fs.writeJSONSync(packageJsonPath, jsonData, {spaces: 4}); // 写入package.json文件
    }
};
