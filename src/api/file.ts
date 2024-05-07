import { post } from "helper/ajax";

/** 上传文件 */
export function uploadFileFormData(dto: FormData) {
    return post("/file/upload", dto, { isUploadFile: true });
}