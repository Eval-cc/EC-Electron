import fs from "fs-extra";

// 获取到当前目录下面的 out目录并清空
const outDir = `${process.cwd()}/out`;
fs.existsSync(outDir) && fs.rmdirSync(outDir, {recursive: true});
console.log("out目录清空成功!");
// 获取到当前目录下面的 dist目录并清空
const distDir = `${process.cwd()}/dist`;

fs.existsSync(distDir) && fs.rmdirSync(distDir, {recursive: true});
console.log("dist目录清空成功!");
