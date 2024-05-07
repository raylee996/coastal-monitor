import { Config, get, post, requestDelete } from "helper/ajax";

/** mock */
export function querySearchAISList(dto: any) {
  return post("/graphql/wisdomSearch", dto, {
    isNotToken: true,
    isGraphql: true,
  });
}

/** 智搜搜索结果 */
export function querySisdomSearchApi(dto: any, config: Config) {
  return post("/search/smart/track/list", dto, { ...config, isFormUrlencoded: true });
}
/** 智搜身份证搜索结果 */
/* export function querySisdomSearchApiPerson(dto: any, config: Config) {
  return get("/search/perceptualGatePersonal/list", dto, { ...config });
} */

/** 智搜获取关联数据 */
export function getRelationResultApi(dto: any) {
  return get("/search/relateInfo/getRelationResult", dto);
}

/** 人脸比对 */
export function queryFaceCompareApi(dto: any) {
  return post("/recognition/face/faceCompare", dto);
}

/** 获取设备列表 */
export function queryDeviceApi(dto: any) {
  return post("/admin/device/listall", dto, { isCache: true });
}

/** 智搜轨迹信息列表导出 */
export function exportSearchApi(dto: any) {
  return post("/search/smart/track/export", dto, {
    isFormUrlencoded: true,
    isRequestFile: true,
  });
}

/** 智搜视频api */
export function querySearchVideoApi(dto: any) {
  return get("/search/fileInfo/getVideoList", dto, { isFormUrlencoded: false });
}

/** 批量删除感知源图片 */
export function batchDeleteImg(ids: any) {
  return requestDelete(`/search/fileInfo/batchDelete/${ids}`, null, { successText: '删除图片' })
}