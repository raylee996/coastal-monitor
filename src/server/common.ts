import {
  deleteFileApi,
  doAllApi,
  exportFile,
  getDictType,
  getDictTypeData,
  getSysAreaList,
  graphqlCommon,
  uploadBusinessImageVideoApi,
  uploadFile,
  uploadFileAvatar,
  uploadFileFaceid,
} from "api/common";
import { getFileInfoPage } from "api/search";
import common, { showMessage } from "helper/common";
import { PageInfo } from "hooks/integrity/TableInterface";
import _, { isNull } from "lodash";
import { getDictDataByType } from "./system";
import matching, { shipListTypeDict } from "../helper/dictionary";
import { getHistoryPlayUrl } from "api/video";
import { HuaweiCloudProps } from "component/VideoSimple";

/**
 * 导出
 * @param params {Object} 导出参数
 * @property url {String} 导出API地址
 * @property extra {Object} 导出的参数
 * @property conf {Object} 导出的参数
 * @param conf {Object} 其它参数
 */
export async function doExportFile(params: any, conf?: any) {
  const dto = {
    url: params.url,
    extra: params.extra,
  };

  const res = await exportFile(dto, conf);
  return {
    data: res.data,
  };
}

/**
 * 导入
 * @param api {Function} 导入api
 * @param params {Object} 导出参数
 */
export async function doImportFile(api: Function, params: any) {
  if (_.isNull(params)) {
    showMessage({ msg: "请至少选择一个文件", type: "error" });
    return;
  }
  return await api(params);
}

/**
 * 获取字典类型数据
 * @param pageInfo
 * @param params
 */
export async function doGetDictType(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };
  const vo = await getDictType(dto);
  let arr: any = [];
  if (vo.records.length !== 0) {
    vo.records.forEach((element: any) => {
      arr.push({
        name: element.dictName,
        value: element.dictType,
        id: element.dictId,
      });
    });
  }
  return {
    data: arr,
    orginalData: vo.records,
  };
}

/**
 * 获取字典子类型数据
 * @param params
 */
export async function doGetDictTypeData(params?: any) {
  let pageInfo: PageInfo = {
    pageNumber: 1,
    pageSize: -1,
  };
  const dto = {
    ...pageInfo,
    ...params,
  };
  const vo = await getDictTypeData(dto);
  let arr: any = [];
  if (vo.records.length !== 0) {
    vo.records.forEach((element: any) => {
      arr.push({
        id: element.dictCode,
        name: element.dictLabel, // 子级dictLabel
        label: element.dictLabel, // 子级dictLabel
        value: element.dictValue, // 子级dictCode
        dictType: element.dictType, // 父级dictType
      });
    });
  }

  return {
    data: arr,
  };
}

/**
 * 上传文件
 * @returns
 * @param fileList
 */
export async function doUploadFile(fileList: any) {
  if (isNull(fileList)) {
    common.showMessage({ msg: "请至少选择一个文件", type: "error" });
    return { path: [] };
  }

  let formData = new FormData();

  if (fileList.constructor.name.toLowerCase() === "file") {
    formData.append("file", fileList);
  } else {
    fileList.forEach((element: any) => {
      formData.append("file", element);
    });
  }
  formData.append("isFace", '0');

  const dto = {
    file: formData,
  };

  const vo = await uploadFile(dto);
  return {
    path: vo,
  };
}

/**
 * 上传文件，返回faceId
 * @returns
 * @param fileList
 */
export async function doUploadFileFaceid(fileList: any) {
  if (isNull(fileList)) {
    common.showMessage({ msg: "请至少选择一个文件", type: "error" });
    return { path: [] };
  }

  let formData = new FormData();

  if (fileList.constructor.name.toLowerCase() === "file") {
    formData.append("file", fileList);
  } else {
    fileList.forEach((element: any) => {
      formData.append("file", element);
    });
  }
  // 人脸不可用 临时使用
  // formData.append("isFace", '1');

  const dto = {
    file: formData,
  };

  const vo = await uploadFileFaceid(dto).catch(() => {
    return {
      code: 0,
      path: {}
    };
  });
  return {
    path: vo,
  };
}
/**
 * 上传头像
 * @returns
 * @param fileList
 */
export async function doUploadFileAvatar(fileList: any) {
  if (isNull(fileList)) {
    common.showMessage({ msg: "请至少选择一个文件", type: "error" });
    return { path: [] };
  }

  let formData = new FormData();

  if (fileList.constructor.name.toLowerCase() === "file") {
    formData.append("avatarfile", fileList);
  } else {
    fileList.forEach((element: any) => {
      formData.append("avatarfile", element);
    });
  }

  const dto = {
    avatarfile: formData,
  };

  const vo = await uploadFileAvatar(dto);

  return {
    path: {
      url: vo.imgUrl
    },
  };
}

/**
 * 上传人脸
 * @returns
 * @param fileList
 */
export async function uploadFaceImg(fileList: any) {

  const result = {
    path: []
  }

  if (_.isEmpty(fileList)) {
    common.showMessage({ msg: "请至少选择一个文件", type: "error" })
  } else {
    const formData = new FormData()
    formData.append("isFace", '1');
    if (fileList.constructor.name.toLowerCase() === "file") {
      formData.append("file", fileList)
    } else {
      fileList.forEach((element: any) => {
        formData.append("file", element)
      })
    }
    const dto = {
      file: formData
    }
    const vo = await uploadFile(dto);
    result.path = vo
  }

  return result
}

/**
 * 获取城市数据
 * @param params {Object} 导出参数
 * @property url {String} 导出API地址
 * @property extra {Object} 导出的参数
 * @property conf {Object} 导出的参数
 */
export async function doGetSysAreaList(params: any) {
  const dto = {
    ...params,
  };

  const res = await getSysAreaList(dto);
  return {
    data: res,
  };
}

export async function doGetImgList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
                imgList(pageInfo: $pageInfo){
                            id
                        imgPath
                        }
                    }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlCommon(dto);
  return {
    data: res.data.data.imgList,
    total: 50,
  };
}

/**
 * 万能请求
 * @param pageInfo
 * @param params {Object} 请求参数对象
 * @param extra
 * @property url {String} API地址
 * @property extra {Object} 参数
 * @property conf {Object} conf配置信息
 */
export async function doAll(pageInfo: PageInfo, params: any, extra?: any) {
  const dto = {
    params: {
      ...pageInfo,
      ...params,
    },
    extra: { ...extra },
  };
  const res = await doAllApi(dto);
  //船舶列表需要格式化船型，船舶分类; 勿删-------
  if (extra.url === '/archive/ship/list') {
    const [archiveShipType] = await Promise.all([
      getDictDataByType("archive_ship_type"),
    ]);
    matching(res.records, archiveShipType, "shipType");
    matching(res.records, shipListTypeDict, "focusType");
  }
  return {
    data: res.records,
    total: res.total,
  };
}

/**
 * 请求图片/视频
 * @param pageInfo
 * @param params {Object} 请求参数对象
 */
export async function getImageVideoPage(pageInfo: PageInfo, params: any) {

  const { type, ...para } = params;

  const dto = {
    ...pageInfo,
    ...para,
  }

  const res = await getFileInfoPage(dto);

  const data = res?.records || [];

  const result = _.filter(data, item => (type === "image" ? ["01"] : ["02", "03"]).includes(item.fileType))

  return {
    data: result,
    total: res?.total || 0,
  };
}

/**
 * 文件上传请求，并写入与业务相关的上传记录（指定存储方式 storageType：1-本地 2-minio 3-fastdfs）
 * @property file {FormData} FormData 装载的文件
 * @property businessId string 业务id
 * @property businessType string 业务类型 01-布控预警 02-区域布控 03-建模预警 04-场所布防 05-视频预警 06-进出港 07-手动控制 08-视频联动 09-建档 10-案件档案
 * @param params
 */
export async function uploadBusinessImageVideo(params: any) {
  const { file, ...para } = params;
  if (isNull(file)) {
    common.showMessage({ msg: "请至少选择一个文件", type: "error" });
    return { path: [] };
  }
  let formData = new FormData();
  if (file.constructor.name.toLowerCase() === "file") {
    formData.append("file", file);
  } else {
    file.forEach((element: any) => {
      formData.append("file", element);
    });
  }
  const dto = {
    file: formData,
    params: {
      storageType: "1",
      ...para,
    },
  };
  const vo = await uploadBusinessImageVideoApi(dto);
  return {
    path: vo,
  };
}

/**
 * 删除文件
 * @param id {string} 文件id
 */
export async function deleteFile(id: string) {
  return await deleteFileApi(id);
}

/**
 * 上传人脸返回路径与人脸id
 * @param fileList input[type=file]的files属性（文件列表）
 * @returns data: { id: number, url: string }
 */
export async function uploadFaceAction(fileList: any) {

  const formData = new FormData()
  // 暂时没有人脸服务, isFace 传 0
  formData.append("isFace", '0')

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList.item(i);
    formData.append("file", file)
  }

  const dto = {
    file: formData
  }

  const vo = await uploadFileFaceid(dto)
  return {
    id: vo?.faceInfo?.faceId as number,
    url: vo.url as string
  }

}

/** 03的视频片段信息取请求华为云视频 */
/** 获取设备历史视频播放地址 */
export async function getHaiweiyunCameraHistory(params: HuaweiCloudProps, segment: { beginTime: string, endTime: string }, signal: AbortController) {

  const dto = {
    deviceCode: params.deviceCode,
    channel: params.deviceChannelCode,
    startTime: segment.beginTime,
    endTime: segment.endTime
  }

  const vo = await getHistoryPlayUrl(dto, { signal })

  return vo
}

/** 获取设备厂商字典数据 */
export async function getProviderTypeDict() {

  const dict = await getDictDataByType('provider_type')

  return dict
}


/** 获取设备历史视频播放信息 */
export async function getHistoryVideoInfo(
  params: {
    deviceCode: string
    channel: string
    startTime: string
    endTime: string
  },
  signal?: AbortController
) {

  const dto = {
    ...params
  }

  const vo = await getHistoryPlayUrl(dto, { signal })

  return vo
}