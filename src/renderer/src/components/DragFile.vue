<!-- 
 * @time       2024/11/02 20:19:03
 * @author     Eval
 * @description 文件拖拽示例
 -->

<template>
    <div class="upload-demo">
        <el-upload
            drag
            :show-file-list="false"
            v-model:file-list="fileList"
            multiple
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :limit="3"
            :on-exceed="handleExceed"
            :auto-upload="false"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽 或者 <em>点击</em></div>
        </el-upload>
        <ul class="el-upload__list" v-if="fileList.length">
            <li v-for="(file, index) in fileList" :key="index" class="el-upload__list-item">
                <div v-if="file.raw?.type.startsWith('image/') && file.url">
                    <el-image
                        style="width: 40px; height: 40px"
                        :src="file.url"
                        :zoom-rate="1.2"
                        :max-scale="7"
                        :min-scale="0.2"
                        :preview-src-list="
                            fileList
                                .filter((item) => item.raw?.type.startsWith('image/')) // 先筛选出图片文件
                                .map((item) => item.url)
                        "
                        :initial-index="4"
                        fit="cover"
                    />
                </div>
                <div class="file-name">
                    <span> 文件名: {{ file.name }} </span>
                    <span> 路径: {{ file.raw?.path }} </span>
                </div>
                <div class="close" @click="rmFile(index)">
                    <el-icon><Close /> </el-icon>
                </div>
            </li>
        </ul>
        <el-empty description="没有上传文件" v-else />
    </div>
</template>

<script lang="ts" setup>
import {UploadFilled, Close} from "@element-plus/icons-vue";
import {ref} from "vue";

import type {UploadProps, UploadUserFile} from "element-plus";
import utils from "@renderer/utils";

const fileList = ref<UploadUserFile[]>([]);

/**
 * 	文件列表移除文件时的钩子
 * @param file
 * @param uploadFiles
 */
const handleRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
    console.log(file, uploadFiles);
};

/**
 * 点击文件列表中已上传的文件时的钩子
 * @param uploadFile
 */
const handlePreview: UploadProps["onPreview"] = (uploadFile) => {
    console.log(uploadFile);
};

/**
 * 当超出限制时，执行的钩子函数
 * @param files
 * @param uploadFiles
 */
const handleExceed: UploadProps["onExceed"] = (files, uploadFiles) => {
    console.log(files, uploadFiles);
    utils.message("文件数量超出限制");
};

/**
 * 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
 * @param uploadFile
 * @param uploadFiles
 */
const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
    // 检查文件类型
    if (uploadFile.raw?.type.startsWith("image/")) {
        utils.ipc("ImageToBase64", {path: uploadFile.raw?.path}).then((res) => {
            fileList.value.find((item) => item.uid === uploadFile.uid)!.url = res.data.url;
        });
    }
    console.log(uploadFile, uploadFiles);
};

/**
 * 手动移除
 * @param index
 */
const rmFile = (index: number) => {
    fileList.value.splice(index, 1);
};
</script>

<style lang="less" scoped>
.upload-demo {
    display: flex;
    & > div:first-child {
        flex: 1;
        max-width: 50%;
        min-width: 50%;
    }
    .el-upload__list {
        padding: 0 10px;
        .el-upload__list-item {
            font-size: 12px;
            word-break: break-all;
            text-align: left;
            width: 100%;
            display: inline-block;
            display: flex;
            border: 1px solid teal;
            border-radius: 3px;
            margin: 5px 0;
            .file-name {
                display: flex;
                justify-content: space-between;
                flex-direction: column;
                align-items: center;
                margin-bottom: 5px;
                flex: 1;
                user-select: none;
                padding: 3px 5px;
                span {
                    display: inline-block;
                    width: 100%;
                }
                span:nth-child(1) {
                    font-weight: bold;
                }
            }

            .close {
                cursor: pointer;
                color: #999;
                margin-top: 5px;
                font-size: 18px;

                &:hover {
                    color: red;
                }
            }

            &:hover {
                background-color: #f5f5f5;
                color: teal;
            }
        }
    }
    .el-empty {
        padding: 0 !important;
        flex: 1;
    }
}
</style>
