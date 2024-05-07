import { getHistoryTrack } from "api/common";
import {
  addCommanderCommandApi,
  addCommandProcessApi,
  deleteCommanderCommandApi,
  queryCommandAnalyseBehaviorApi,
  queryCommandCaseApi,
  queryCommandDetailApi,
  queryCommanderCommandApi,
  queryCommandPlayTaskApi,
  queryCommandProcessApi,
  queryUserInfo,
  updateCommanderCommandApi,
} from "api/core/wisdomCommand";
import dayjs from "dayjs";
import matching, {
  opinionTypeDict,
  riskLevelOptions,
  TaskTypeDict,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";

// 获取智慧指挥任务列表
export async function queryCommanderCommandList(
  pageInfo: PageInfo,
  params: any
) {
  console.log(pageInfo, params);
  const dto = {
    ...pageInfo,
    ...params,
  };
  const res = await queryCommanderCommandApi(dto);
  return {
    data: (res?.records || []).map((item: any) => {
      const { targetCode } = item;
      targetCode && (item.targetCodeName = targetCode.split(",").join("/"));
      return item;
    }),
    total: res?.total,
  };
}

// 根据id查任务详情
export async function queryCommanderCommandDetail(id: number) {
  const res = await queryCommandDetailApi({ id });
  const { latitude, longitude, ...data } = res || {};
  // 回显处理经纬度
  latitude && longitude && (data.latLng = [{ lat: latitude, lng: longitude }]);
  // 根据责任人查责任部门
  if (data?.chargePersonId) {
    const userRes = await getUserInfo({ userId: data.chargePersonId });
    data.chargeDepartmentPersonnel = {
      personnel: data.chargePersonId,
      department: userRes?.deptId,
    };
  }
  return data;
}

// 新增-编辑智慧指挥任务
export async function addEditCommanderCommand(dto: any) {
  const { id, latLng, chargeDepartmentPersonnel, ...params } = dto;
  // 处理经纬度
  if (latLng?.length) {
    latLng[0].lat && (params.latitude = Number(latLng[0].lat));
    latLng[0].lng && (params.longitude = Number(latLng[0].lng));
  }
  // 处理责任部门与责任人，只上传责任人
  chargeDepartmentPersonnel &&
    (params.chargePersonId = chargeDepartmentPersonnel.personnel);
  return await (id
    ? updateCommanderCommandApi({ id, ...params })
    : addCommanderCommandApi(params));
}

// 删除智慧指挥任务
export async function deleteCommanderCommand(id: number) {
  return await deleteCommanderCommandApi(id);
}

// 查当前用户或其他用户的所属部门
export async function getUserInfo(dto: any) {
  const res = await queryUserInfo(dto);
  return res?.user;
}

// 查询反馈列表
export async function queryCommandProcessList(params: any) {
  const res = await queryCommandProcessApi(params);
  res && matching(res, TaskTypeDict, "typeId");
  return res;
}

// 提交反馈
export async function addCommandProcess(params: any) {
  const res = await addCommandProcessApi(params);
  return res;
}

// 查询涉案列表
export async function queryCommandCase(params: any) {
  const res = await queryCommandCaseApi(params);
  return res;
}

// 行为分析历史数据
export async function queryCommandAnalyseBehavior(params: any) {
  const res = await queryCommandAnalyseBehaviorApi(params);
  return res;
}

// const lonLatList = [
//   { latitude: 22.453224, longitude: 113.8673224 },
//   { latitude: 22.46302, longitude: 113.86733 },
// ];
// 任务回放
export async function queryCommandPlayTask(params: any) {
  const res = await queryCommandPlayTaskApi(params);
  const { behaviourDtoList } = res;
  if (behaviourDtoList?.length) {
    matching(behaviourDtoList, riskLevelOptions, "riskLevel");
    behaviourDtoList.map((item: any, index: number) => {
      // 调试给添加经纬度
      // item.latitude = lonLatList[index].latitude;
      // item.longitude = lonLatList[index].longitude;
      // item.speed = 10;
      // 组装经纬度
      item.lonLat = [item.longitude || "", item.latitude || ""]
        .filter((v) => v)
        .join(",");
      // key转换value
      matching([item.dealRecord], opinionTypeDict, "opinionType");
      return item;
    });
  }
  return res;
}

// const targetIdTest = [
//   "412480388",
//   "412888862",
//   "412480387",
//   "412888863",
//   "1_15_1673830822",
//   "4_18_1676013126",
//   "8_33_1676454978",
// ];

/** 任务回放中获取所有跟踪目标轨迹 */
export async function queryTrackTargetTracking(
  targetId: string[],
  timeArr: string[]
) {
  // 调试使用
  // const aisList = targetIdTest.filter((item) => /^\d{9}$/.test(item));
  // const radarList = targetIdTest.filter(
  //   (item) => item?.split("_")?.length === 3
  // );
  const aisList = targetId.filter((item) => /^\d{9}$/.test(item));
  const radarList = targetId.filter((item) => item?.split("_")?.length === 3);
  // 获取时间对象
  const [beginTime, endTime] = timeArr;
  const time = { beginTime, endTime };
  const [aisRes, radarRes] = await Promise.all([
    getHistoryTrack({ mmsi: aisList.join(","), aisDateType: 0, ...time }), // aisDateType指定获取轨迹数据类型 0mmsi 1融合 2雷达
    getHistoryTrack({ uniqueId: radarList.join(","), aisDateType: 2, ...time }),
  ]);
  console.log(aisRes, radarRes, "aisTracking, radarTracking");
  const res = [
    ...dataFormat(aisRes?.content || [], aisList),
    ...dataFormat(radarRes?.content || [], radarList),
  ];
  return res;
}

export function dataFormat(data: any[], targetList: string[]) {
  const codeToTargetType: { [key: number]: string } = {
    0: 'face',
    1: 'car',
    6: 'ship',
    7: 'radar',
  }
  const result = targetList.map((item) => {

    const group = _.filter(data, ele => ele.content === item || ele.targetId === item)

    const latLngList = group.map(item => {
      const {
        capAddress,
        trueHeading,
        codeType,
        capTime,
        trackStatus,
        ...obj
      } = item;
      const lngLat = capAddress.split(",").map(Number) || [];

      return {
        lng: obj.longitude ? obj.longitude : lngLat[0],
        lat: obj.latitude ? obj.latitude : lngLat[1],
        heading: trueHeading ? Number(trueHeading || 0) : obj.course,
        time: dayjs(capTime).format("YYYY-MM-DD HH:mm:ss"),
        ...obj,
      };
    })

    const _latLngList = latLngList.sort((a: { time: number }, b: { time: number }) => {
      return dayjs(a.time).isAfter(dayjs(b.time)) ? 1 : -1;
    })

    return {
      legendName: item,
      latLngList: _latLngList,
      targetType: data?.length ? codeToTargetType[data[0].codeType || 6] : 'ship'
    };
  });
  return result
}
