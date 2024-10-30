import fs from "fs";

// 获取到当前目录下面的 out目录并清空
const outDir = `${process.cwd()}/out`;
fs.rmdirSync(outDir, {recursive: true});
console.log("out目录清空成功!");
// 获取到当前目录下面的 dist目录并清空
const distDir = `${process.cwd()}/dist`;
fs.rmdirSync(distDir, {recursive: true});
console.log("dist目录清空成功!");