import { Config, get, post, requestDelete } from "helper/ajax";

/**
 * API:导出
 * @param dto 参数
 * @param conf 配置信息，如：{ isRequestFile: true}
 * @returns
 */
export function exportFile(dto: any, conf?: any) {
  if (!conf?.method || conf?.method === "post") {
    return post(dto.url, dto.extra, { isRequestFile: true, ...conf });
  } else {
    return get(dto.url, dto.extra, { isRequestFile: true, ...conf });
  }
}

/**
 * API:导入
 * @param dto 参数
 * @param conf 配置信息，如：{ isRequestFile: true}
 * @returns
 */
export function importFile(dto: any, conf?: any) {
  return post(dto.url, dto.extra, { ...conf });
}

/**
 * API:获取字典类型数据
 * @param dto 参数
 * @returns
 */
export function getDictType(dto: any) {
  return get("/system/dict/type/list", dto, { isCache: true });
}

/**
 * API:获取字典类型子数据
 * @param dto 参数
 * @returns
 */
export function getDictTypeData(dto: any) {
  return get("/system/dict/data/list", dto, { isCache: true });
}

/**
 * 上传文件
 * @param dto
 * @property file {FormData} FormData 装载的文件
 * @returns
 */
export function uploadFile(dto: any) {
  return post("/file/upload", dto.file, { isUploadFile: true });
}
export function uploadFileAvatar(dto: any) {
  return post("system/user/profile/avatar", dto.avatarfile, {
    isUploadFile: true,
  });
}

/**
 * API:获取城市数据
 * @param dto 参数
 * @returns
 */
export function getSysAreaList(dto: any) {
  return get("/admin/sysarea/list", dto);
}

/**
 * 获取MOCK接口
 * @param dto
 * @returns
 */
export function graphqlCommon(dto: any) {
  return post("/graphql/Common", dto, { isNotToken: true, isGraphql: true });
}

/**
 * API:万能接口
 * @param dto 参数
 * @param conf 配置信息，如：{ isRequestFile: true}
 * @returns
 */
export function doAllApi(dto: any, conf?: any) {
  if (!dto.extra.method || dto.extra.method === "post") {
    return post(dto.extra.url, dto.params, conf);
  } else {
    return get(dto.extra.url, dto.params, conf);
  }
}

/**
 * 文件上传请求，并写入与业务相关的上传记录（指定存储方式 storageType：1-本地 2-minio 3-fastdfs）
 * @param dto
 * @property file {FormData} FormData 装载的文件
 * @property businessId string 业务id
 * @property businessType string 业务类型 01-布控预警 02-区域布控 03-建模预警 04-场所布防 05-视频预警 06-进出港 07-手动控制 08-视频联动 09-建档 10-案件档案
 */
export function uploadBusinessImageVideoApi(dto: any) {
  return post("/file/businessFile/uploadAndRecord", dto, {
    isUploadFileWithParames: true,
    successText: "文件上传",
  });
}

/**
 * 删除文件
 * @param dto
 * @property id {string} 文件id
 */

// 删除涉案人员
export function deleteFileApi(id: any) {
  return requestDelete(
    `/search/fileInfo/deleteFile/${id}`,
    {},
    {
      successText: "删除文件",
    }
  );
}


//历史轨迹接口
export function getHistoryTrack(dto: any,config?: Config) {
  return post("/search/smart/historyTrack/list", dto, {
    isFormUrlencoded: true,
    ...config
  });
}


/**
 * 上传文件
 * @param dto
 * @property file {FormData} FormData 装载的文件
 * @returns
 */
export function uploadFileFaceid(dto: any) {
  return post("/file/upload", dto.file, { isUploadFile: true });
}