import {
  addCar,
  delCar,
  editCar,
  getCarCaseList,
  getCarInfo,
  getCarList,
  getCarWarnListV2,
  getCarTypeCount,
} from "api/car";
import { matchingRails, submitFollowTask } from "api/ship";
import dayjs, { Dayjs } from "dayjs";
import { YMDHms } from "helper";
import common from "helper/common";
import matching, {
  carDescTypeDict,
  readDictByConvert,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import { getDictDataByType } from "./system";

// 车辆档案信息
export async function getCarArchiveData(id: any, params?: any) {
  let dto = params ? params : { id };
  if(id.licensePlate){
    dto = {...id}
  }
  const [vo, carTypeDict, carColorDict, carMakeDict, carPlateColorDict] =
    await Promise.all([
      getCarInfo(dto),
      getDictDataByType("archive_car_type"),
      getDictDataByType("archive_car_color"),
      getDictDataByType("archive_car_make"),
      getDictDataByType("archive_plate_color"),
    ]);

  if (!vo) return;

  readDictByConvert(vo, "carType", carTypeDict, "carTypeName");
  readDictByConvert(vo, "carColor", carColorDict, "carColorName");
  readDictByConvert(vo, "carMake", carMakeDict, "carMakeName");
  readDictByConvert(vo, "plateColor",carPlateColorDict, "plateColorName");
  readDictByConvert(vo, "type", carDescTypeDict, "typeName");

  vo.plateColor = `${vo.plateColor || ''}`;
  vo.carType = `${vo.carType || ''}`;
  vo.carColor = `${vo.carColor || ''}`;
  vo.carMake = `${vo.carMake || ''}`;
  vo.carImgPath = vo.platePath;
  let facePathArr: any = vo.platePath ? vo.platePath.split(",") : [];
  vo.platePath = [];
  if (facePathArr.length !== 0) {
    facePathArr.forEach((element: any, index: number) => {
      vo.platePath.push({
        name: vo.id,
        id: vo.id,
        path: element,
      });
    });
  }

  return vo;
}

// 车辆档案-伴随信息-提交任务
export async function addFollowTask(params: any) {
  const { queryDateRange, ...otherParams } = params;

  const [startTime, endTime] = queryDateRange as [Dayjs, Dayjs];

  const dto: any = {
    // archiveId: params.shipData.id,
    archiveType: 1, // 0:人员  1:车辆  2:手机  3:船舶
    startTime: startTime.format(YMDHms),
    endTime: endTime.format(YMDHms),
    levelNum: 1,
    srcCode: otherParams.licensePlate,
    srcCodeType: 1, //0.人脸  1.车辆   2.IMSI   3.IMEI  4.MAC  5.手机   6.MMSI   7.雷达批号   8.目标ID
    tagCodeType: 1,
  };

  const vo = await submitFollowTask(dto);

  return { ...vo, ...dto };
}

// 车辆档案-伴随信息-轨迹信息
export async function getCarAdjointTrack(
  srcData: any,
  tagData: any,
  queryParams: any
) {
  const [startTime, endTime] = queryParams.datetime;

  const dto: any = {
    current: 1,
    size: 9999,
    coincidence: queryParams.coincidence, //是否融合:true或false
    // analyzeType: 2,
    analyzeType: 4,
    beginTime: startTime.format(YMDHms),
    // beginTime: dayjs('2022-11-01 00:00:00').format(YMDHms),
    endTime: endTime.format(YMDHms),
    licensePlate: `${tagData.srcCode},${tagData.tagCode}`,
    // mmsi: '98769275,32234195'
  };

  const codeTypeDict = await getDictDataByType("target_data_type", "number");
  const vo = await matchingRails(dto);

  matching(vo.content, codeTypeDict, "codeType");

  const currentShip = {
    legendName: tagData.srcCode,
    // legendName: '98769275',
    latLngList: [] as any[],
  };
  const targetShip = {
    legendName: tagData.tagCode,
    // legendName: '32234195',
    latLngList: [] as any[],
  };

  vo.content.forEach((ele: any, idx: number) => {
    const [lng, lat] = ele.capAddress.split(",");
    ele.ordinal = idx + 1;
    if (currentShip.legendName === ele.content) {
      currentShip.latLngList.push({
        lng,
        lat,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading,
      });
    } else {
      targetShip.latLngList.push({
        lng,
        lat,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading,
      });
    }
  });

  return [vo.content, [currentShip, targetShip]];
}

/** 获取车辆档案列表 */
export async function doGetCarList(pageInfo: PageInfo, params: any, signal?: AbortController) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const [res, carTypeDict] = await Promise.all([
    getCarList(dto, { signal }),
    getDictDataByType("archive_car_type"),
  ]);

  matching(res.records, carDescTypeDict, "type");
  matching(res.records, carTypeDict, "carType"); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name

  return {
    data: res.records,
    total: res.total,
  };
}

/** 新增、编辑车辆 */
export async function doAddEditCar(params: any) {
  //标签
  params.labelIds = common.arrayToString(params.labelIds);

  let paramsFacePath = _.cloneDeep(params.platePath);
  params.platePath = common.getImgPathStr({
    data: paramsFacePath,
    valise: "path",
  });

  const dto = {
    ...params,
  };

  let vo: any = null;
  if (params.id === undefined) {
    vo = await addCar(dto);
  } else {
    vo = await editCar(dto);
  }

  return vo;
}

// 删除车辆档案
export async function doDelCar(params: any) {
  const vo = await delCar({ id: params });
  return vo;
}

/** 获取车辆档案涉案列表 */
export async function doGetCarCaseList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  if (common.isNull(dto.licensePlate)) {
    return {
      data: [],
      total: 0,
    };
  }

  const [res] = await Promise.all([getCarCaseList(dto)]);

  return {
    data: res.records,
    total: res.total,
  };
}

/** 获取车辆档案-预警信息列表 */
export async function doGetCarWarnListV2(pageInfo: PageInfo, params: any) {
  const dto: any = {
    ...pageInfo,
    contentType: 1,
    warnContent: params.warnContent,
  };

  // 预警时间
  if (params.warnTime) {
    dto.startWarnTime = dayjs(params.warnTime[0]).format(YMDHms);
    dto.endWarnTime = dayjs(params.warnTime[1]).format(YMDHms);
  }

  const [res, targetDataTypeDict] = await Promise.all([
    getCarWarnListV2(dto),
    getDictDataByType("target_data_type"),
  ]);

  matching(res.records, targetDataTypeDict, "contentType");

  res.records.forEach((element: any) => {
    element.longitudeLatitude = `${element.longitude}/${element.latitude}`;
  });

  return {
    data: res.records,
    total: res.total,
  };
}

export async function getCarsTypes(params: any) {
  let dto = {
    ...params,
  };

  let vo: any = []
  vo = await getCarTypeCount(dto);
  vo && vo.forEach((ele: any) => {
    if (ele.keyName === '重点车辆') {
      ele.bgClass = 'btnImgCarTypeImportant'
    } else if (ele.keyName === '关注车辆') {
      ele.bgClass = 'btnImgCarTypeFocus'
    } else if (ele.keyName === '一般车辆') {
      ele.bgClass = 'btnImgCarTypeCommon'
    }
  })
  return {
    data: vo
  }
}

export async function getPlateColor() {
  return await getDictDataByType("archive_plate_color")
}

export async function getCarColor() {
  return await getDictDataByType("archive_car_color")
}

export async function getCarMake() {
  return await getDictDataByType("archive_car_make")
}

export async function getCarType() {
  return await getDictDataByType("archive_car_type")
}