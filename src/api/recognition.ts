// 人脸API
import { get } from "helper/ajax"


// 获取人脸对比
export function getFaceList(dto: any) {
    return get('/recognition/face/faceList', dto)
}

// 获取人脸库
export function getDeviceCollectionFaceList(dto: any) {
    return get('/search/deviceCollection/faceList', dto)
}


