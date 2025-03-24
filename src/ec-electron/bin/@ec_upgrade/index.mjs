/**
 * @time   2024/07/24 12:27:42
 * @author Eval
 * @description 主进程窗口事件
 */
import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";

class Upgrade {
    get setup() {
        const rootPath = path.join(process.cwd(), "out");

        const confJsonPath = path.join(process.cwd(), "package.json");
        if (!fs.pathExistsSync(confJsonPath)) {
            throw new Error("package.json文件不存在, 路径:" + confJsonPath);
        }
        const confJson = fs.readJsonSync(confJsonPath);
        if (!confJson.version) {
            throw new Error("package.json文件中没有 version 字段.");
        }
        // 输出增量更新包的路径
        const releasePath = path.join(process.cwd(), "release", "wgt");
        if (!fs.pathExistsSync(releasePath)) {
            fs.mkdirpSync(releasePath, {recursive: true});
        }
        const confFile = path.join(process.cwd(), "src", "ec-electron", "bin", "ec.config.json");
        if (!fs.pathExistsSync(confFile)) {
            throw new Error("配置文件不存在, confFile:" + confFile);
        }
        // 创建一个新的临时目录来包裹原目录内容
        const tempDir = path.join(process.cwd(), "temp_out");
        // 清空或创建临时目录
        fs.emptyDirSync(tempDir);
        // 需要复制的子目录列表
        const subDirsToCopy = ["main", "preload", "renderer"];
        // 复制指定的子目录到临时目录
        subDirsToCopy.forEach((subDir) => {
            const subDirPath = path.join(rootPath, subDir);
            if (fs.pathExistsSync(subDirPath)) {
                // 复制当前子目录到临时目录
                fs.copySync(subDirPath, path.join(tempDir, subDir));
            } else {
                console.warn(`子目录 ${subDir} 不存在, 跳过复制.`);
            }
        });
        // 创建一个 AdmZip 实例
        const zip = new AdmZip();
        // 使用 .addLocalFolder 方法将临时目录添加到 zip 文件
        zip.addLocalFolder(tempDir);
        // 获取输出 zip 文件的路径
        const outputZipPath = path.join(releasePath, `${confFile?.update?.upgradeName || "ECUpgrade"}_${confJson.version}.zip`);
        // 写入压缩文件
        zip.writeZip(outputZipPath);
        // 删除临时目录
        fs.removeSync(tempDir);
        console.log("生成增量更新资源包完成:", outputZipPath);
    }
}

export default new Upgrade().setup;
