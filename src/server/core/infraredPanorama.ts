import {
  addDevicePanoramaApi,
  delDevicePanoramaApi,
  editDevicePanoramaApi,
  queryDevicePanoramaApi,
  queryHistoryDataApi,
} from "api/core/infraredPanorama";
import { queryDeviceApi } from "api/core/wisdomSearch";
import { addDeviceInitialPositionApi, editDeviceInitialPositionApi, queryDeviceInitialPositionApi } from "api/device";

/** 获取历史的全景图片 */
export async function queryHistoryData(dto: any) {
  const res = await queryHistoryDataApi({
    ...dto,
    codeType: "11",
    fileType: "01",
  });
  return res;
}

/** 单个设备关联的所有联动配置对象 */
export async function queryAreaListByPanoramaId(dto: any) {
  const res = await queryDevicePanoramaApi(dto);
  return res;
}

/** 新增/修改单个联动配置对象的信息-修改联动摄像头-修改PTZ */
export async function addEditDevicePanorama(params: any) {
  const { id, ...para } = params;
  const res = id
    ? await editDevicePanoramaApi(params)
    : await addDevicePanoramaApi(para);
  return res;
}

/** 删除单个设备下的联动配置对象 */
export async function delDevicePanorama(id: any) {
  const res = await delDevicePanoramaApi(id);
  return res;
}

/** 1.获取所有红外全景设备deviceTypes-7 2.获取所有可联动联动摄像头 */
export async function queryDevice(dto: any) {
  const res = await queryDeviceApi(dto);
  return res;
}

/** 获取红外全景设备框选四个设置的初始位置  */
export async function queryDeviceInitialPosition(deviceId: number) {
  const res = await queryDeviceInitialPositionApi(deviceId);
  return res;
}

/** 新增红外全景设备框选四个设置的初始位置  */
export async function addDeviceInitialPosition(dto: any) {
  const res = await addDeviceInitialPositionApi(dto);
  return res;
}

/** 编辑红外全景设备框选四个设置的初始位置  */
export async function editDeviceInitialPosition(dto: any) {
  const res = await editDeviceInitialPositionApi(dto);
  return res;
}