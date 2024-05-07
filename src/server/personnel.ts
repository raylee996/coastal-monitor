import { message } from "antd";
import { getHistoryTrackApi } from "api/dataCenter/shipSailing";
import {
  addPerson,
  addPersonBank,
  addPersonCar,
  addPersonHouse,
  addPersonSocial,
  addPersonVirtual,
  delPerson,
  delPersonBank,
  delPersonCar,
  delPersonHouse,
  delPersonSocial,
  delPersonVirtual,
  editPerson,
  editPersonBank,
  editPersonCar,
  editPersonHouse,
  editPersonSocial,
  editPersonVirtual,
  getPersonBankInfo,
  getPersonBankList,
  getPersonCarInfo,
  getPersonCarList,
  getPersonCaseList,
  getPersonHouseInfo,
  getPersonHouseList,
  getPersonInfo,
  getPersonList,
  getPersonSocialInfo,
  getPersonSocialList,
  getPersonVirtualInfo,
  getPersonVirtualList,
  getPersonTypeCount,
} from "api/personnel";
import { getDeviceCollectionFaceList } from "api/recognition";
import { getFileInfoPage } from "api/search";
import {
  addShipSailor,
  delShipSailor,
  editShipSailor,
  getShipSailor,
  getShipSailorDetail,
  getShipWarnList,
  matchingRails,
  submitFollowTask,
} from "api/ship";
import { getAlarmDayStatistics, getAlarmHourStatistics, getAlarmLevelStatistics } from "api/statistics";
import { graphqlUser } from "api/user";
import dayjs, { Dayjs } from "dayjs";
import { getShipWarnDateOptions, getShipWarnLevelOptions, YMD, YMDHms } from "helper";
import common from "helper/common";
import matching, {
  getDictName,
  houseTypeDict,
  personTypeDict,
  positionStatusDict,
  readDict,
  recordTargetDict,
} from "helper/dictionary";
import { getNoDataEchartsOption } from "helper/echartsConfig";
import { DayjsRange } from "hooks/hooks";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import { getPointListAsync } from "./device";
import { getDictDataByType } from "./system";

// 伴随人脸
export async function getAccompanyFace(params: any) {
  console.log(params);

  const dto = {
    query: `query ($pageInfo: PageInfo){
      table(pageInfo: $pageInfo){
                id
                name
                src
            } 
        }`,
    variables: {
      pageInfo: {
        pageSize: 10,
        pageNumber: 1,
      },
    },
  };

  const res = await graphqlUser(dto);
  const vo: any = [];
  let double: any = [];
  res.data.data.table.forEach((ele: any) => {
    const item = {
      cardMark: ele.name,
      cardTitle: ele.id,
      cardImgSrc: ele.src,
    };
    if (double.length < 2) {
      double.push(item);
    } else {
      const _double = _.cloneDeep(double);
      vo.push(_double);
      double = [item];
    }
  });
  return vo;
}

/* 对接 */

/** 获取人员档案列表 */
export async function doGetPersonList(pageInfo: PageInfo, params: any, signal?: AbortController) {
  let dto: any = {
    ...pageInfo,
    ...params,
  };

  delete dto.facePath

  if (params.facePath && params.facePath.length !== 0) {
    let myImg = params.facePath[0]
    if (myImg.faceInfo) {
      dto.faceid = myImg.faceInfo.faceId
    }
  }

  const [res, userSexDict] = await Promise.all([
    getPersonList(dto, { signal }),
    getDictDataByType("sys_user_sex"),
  ]);

  matching(res.records, personTypeDict, "personType");
  matching(res.records, userSexDict, "gender"); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name
  matching(res.records, personTypeDict, "personType"); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name

  return {
    data: res.records,
    total: res.total,
  };
}

/** 新增、编辑人员 */
export async function doAddEditPerson(params: any) {
  //标签的处理，结果："1,2,3..."
  params.labelIds = common.arrayToString(params.labelIds);

  //省市区
  params.censusRegion = common.arrayToString(params.censusRegion);

  let paramsFacePath = _.cloneDeep(params.facePathList);

  params.facePath = common.getImgPathStr({
    data: paramsFacePath,
    valise: "path",
  });

  params.faceid = common.getImgPathStr({
    data: paramsFacePath,
    valise: "id",
  });

  const dto = {
    ...params,
  };

  let vo: any = null;
  if (params.id === undefined) {
    vo = await addPerson(dto);
  } else {
    vo = await editPerson(dto);
  }

  return vo;
}

// 获取个人档案详情
export async function doGetPersonInfo(params: any) {
  const [vo, userSexDict, nationDict] = await Promise.all([
    getPersonInfo(params),
    getDictDataByType("sys_user_sex"),
    getDictDataByType("sys_nation")
  ]);

  readDict(vo, "gender", userSexDict); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name
  readDict(vo, "personType", personTypeDict); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name
  readDict(vo, "nationCode", nationDict); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name

  if (vo && !common.isNull(vo.censusRegion)) {
    vo.censusRegion = vo.censusRegion.split(",");
  }

  let facePathArr: any = vo.facePath ? vo.facePath.split(",") : [];
  let faceIdArr: any = vo.faceid ? vo.faceid.split(",") : [];
  vo.facePathList = [];
  if (facePathArr.length === faceIdArr.length) {
    facePathArr.forEach((element: any, index: number) => {
      vo.facePathList?.push({
        name: faceIdArr[index],
        id: faceIdArr[index],
        path: element,
      });
    });
  }

  return vo;
}

// 删除个人档案
export async function doDelPerson(params: any) {
  const vo = await delPerson(params);
  return vo;
}

/** 获取人员档案涉案列表 */
export async function doGetPersonCaseList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const [res] = await Promise.all([getPersonCaseList(dto)]);

  return {
    data: res.records,
    total: res.total,
  };
}

/** 个人档案 - 社保信息列表 */
export async function doGetPersonSocialList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const [res] = await Promise.all([getPersonSocialList(dto)]);

  return {
    data: res.records,
    total: res.total,
  };
}

/** 个人档案 - 个人社保详情 */
export async function doGetPersonSocialInfo(params: any) {
  let dto = {
    id: params,
  };
  const [vo] = await Promise.all([getPersonSocialInfo(dto)]);
  return vo;
}

/** 个人档案 - 新增、编辑社保信息 */
export async function doAddEditPersonSocial(params: any) {
  const dto = {
    ...params,
  };

  let vo: any = null;
  if (params.id === undefined) {
    vo = await addPersonSocial(dto);
  } else {
    vo = await editPersonSocial(dto);
  }

  return vo;
}

/** 个人档案 -删除社保信息 */
export async function doDelPersonSocial(params: any) {
  const vo = await delPersonSocial(params);
  return vo;
}

/** 个人档案 - 个人银行信息列表 */
export async function doGetPersonBankList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const [res] = await Promise.all([getPersonBankList(dto)]);

  return {
    data: res.records,
    total: res.total,
  };
}

/** 个人档案 - 个人社保详情 */
export async function doGetPersonBankInfo(params: any) {
  let dto = {
    id: params,
  };
  const [vo] = await Promise.all([getPersonBankInfo(dto)]);
  return vo;
}

/** 个人档案 - 新增、编辑个人银行信息 */
export async function doAddEditPersonBank(params: any) {
  const dto = {
    ...params,
  };

  let vo: any = null;
  if (params.id === undefined) {
    vo = await addPersonBank(dto);
  } else {
    vo = await editPersonBank(dto);
  }

  return vo;
}

/** 个人档案 -删除个人银行 */
export async function doDelPersonBank(params: any) {
  const vo = await delPersonBank(params);
  return vo;
}

/** 个人档案 - 个人房产信息列表 */
export async function doGetPersonHouseList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const [res] = await Promise.all([getPersonHouseList(dto)]);

  matching(res.records, houseTypeDict, "houseType"); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name
  return {
    data: res.records,
    total: res.total,
  };
}

/** 个人档案 - 个人房产详情 */
export async function doGetPersonHouseInfo(params: any) {
  let dto = {
    id: params,
  };
  const [vo] = await Promise.all([getPersonHouseInfo(dto)]);
  return vo;
}

/** 个人档案 - 新增、编辑个人房产信息 */
export async function doAddEditPersonHouse(params: any) {
  const dto = {
    ...params,
  };

  let vo: any = null;
  if (params.id === undefined) {
    vo = await addPersonHouse(dto);
  } else {
    vo = await editPersonHouse(dto);
  }

  return vo;
}

/** 个人档案 -删除个人房产 */
export async function doDelPersonHouse(params: any) {
  const vo = await delPersonHouse(params);
  return vo;
}

/** 个人档案 - 个人车辆信息列表 */
export async function doGetPersonCarList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const [res, carType] = await Promise.all([
    getPersonCarList(dto),
    getDictDataByType("archive_car_type"),
  ]);

  matching(res.records, carType, "carType");

  return {
    data: res.records,
    total: res.total,
  };
}

/** 个人档案 - 个人车辆详情 */
export async function doGetPersonCarInfo(params: any) {
  let dto = {
    id: params,
  };
  const [vo] = await Promise.all([getPersonCarInfo(dto)]);
  return vo;
}

/** 个人档案 - 新增、编辑个人车辆信息 */
export async function doAddEditPersonCar(params: any) {
  const dto = {
    ...params,
  };

  let vo: any = null;
  if (params.id === undefined) {
    vo = await addPersonCar(dto);
  } else {
    vo = await editPersonCar(dto);
  }

  return vo;
}

/** 个人档案 -删除个人车辆 */
export async function doDelPersonCar(params: any) {
  const vo = await delPersonCar(params);
  return vo;
}

/** 个人档案 - 个人虚拟信息列表 */
export async function doGetPersonVirtualList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const [res] = await Promise.all([getPersonVirtualList(dto)]);
  let virtualType = await getDictDataByType("virtual_type")

  matching(res.records, virtualType, "type");
  // getDictDataByType("virtual_type")

  return {
    data: res.records,
    total: res.total,
  };
}

/** 个人档案 - 个人虚拟详情 */
export async function doGetPersonVirtualInfo(params: any) {
  let dto = {
    id: params,
  };
  const [vo] = await Promise.all([getPersonVirtualInfo(dto)]);
  return vo;
}

/** 个人档案 - 新增、编辑个人虚拟信息 */
export async function doAddEditPersonVirtual(params: any) {
  const dto = {
    ...params,
  };

  let vo: any = null;
  if (params.id === undefined) {
    vo = await addPersonVirtual(dto);
  } else {
    vo = await editPersonVirtual(dto);
  }

  return vo;
}

/** 个人档案 -删除个人虚拟 */
export async function doDelPersonVirtual(params: any) {
  const vo = await delPersonVirtual(params);
  return vo;
}

/** 个人档案 - 获取船员列表 */
export async function doGetPersonShipSailorList(
  pageInfo: PageInfo,
  params: any
) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const res = await getShipSailor(dto);
  matching(res.records, positionStatusDict, "status"); // 在职状态

  return {
    data: res.records,
    total: res.total,
  };
}

/** 个人档案 - 获取船员详细信息 */
export async function doGetPersonShipSailorInfo(params: any) {
  const dto = {
    id: params,
  };

  const vo = await getShipSailorDetail(dto);

  if (common.isNull(vo.imgPath)) {
    vo.imgPath = [];
  } else {
    vo.imgPath = vo.imgPath.split(",");
  }

  return vo;
}

/** 个人档案 - 新增/编辑船员信息 */
export async function doAddEditPersonShipSailor(params: any) {
  const dto = {
    ...params,
  };
  let vo: any = {};

  if (!params.id) {
    if (!dto.shipId) {
      message.error(`请选择船舶!`);
      return null;
    }
    vo = await addShipSailor(dto);
  } else {
    vo = await editShipSailor(dto);
  }
  return vo;
}

/** 个人档案 - 删除船员 */
export async function doDelPersonShipSailor(params: any) {
  const dto = {
    id: params,
  };

  const vo = await delShipSailor(dto);
  return vo;
}

// 个人档案-个人信息-人脸库
export async function doGetPersonFaceGallery(pageInfo: PageInfo, params: any) {
  let dto: any = {
    ...pageInfo,
    archiveId: params.id, // 档案ID，本ID为船舶ID
    archiveType: 0, //档案类型 0:人员 1:车辆 2:手机 3:船舶
    fileType: "01", // 文件类型
  };

  if (params.searchTime) {
    dto.beginTime = dayjs(params.searchTime[0]).format(YMDHms);
    dto.endTime = dayjs(params.searchTime[1]).format(YMDHms);
  }

  if (params.deviceCode) {
    dto.deviceCode = params.deviceCode.join(",");
  }

  const vo = await getFileInfoPage(dto);

  return {
    data: vo.records,
    total: vo.total,
  };
}

/** 获取人脸对比列表 */
export async function doGetFaceList(pageInfo: PageInfo, params: any) {
  let dto: any = {
    ...pageInfo,
    archiveId: params.archiveId
  };

  if (params.searchTime) {
    dto.beginTime = dayjs(params.searchTime[0]).format(YMDHms);
    dto.endTime = dayjs(params.searchTime[1]).format(YMDHms);
  }

  let deviceList = await getPointListAsync()
  let deviceCodeList = []
  if(deviceList.length>0 && params.deviceCode && params.deviceCode.length>0){
    for(let i = 0; i<params.deviceCode.length; i++){
      for(let j = 0; j<deviceList.length; j++){
        if(params.deviceCode[i] === deviceList[j].id){
          deviceCodeList.push(deviceList[j].deviceCode)
        }
      }
    }
  }
  if (deviceCodeList.length>0) {
    dto.deviceCode = deviceCodeList.join(",");
  }

  const [res] = await Promise.all([getDeviceCollectionFaceList(dto)]);

  // 获取点位列表
  const deviceNameList = await getPointListAsync({})
  let deviceNameDict = deviceNameList.map((item:any)=>{
    return {
      name: item.name,
      value: item.deviceCode
    }
  })

  if (res.records && res.records.length !== 0) {
    res.records.forEach((ele: any) => {
      ele.cap_time = dayjs(ele.cap_time).format('YYYY-MM-DD HH:mm:ss')
    })
  }
  matching(res.records, deviceNameDict, "device_code","device_code");

  return {
    data: res.records,
    total: res.total,
  };
}

// 人员档案-伴随信息-提交任务
export async function addFollowTask(params: any) {
  const { queryDateRange, ...otherParams } = params;

  const [startTimeMoment, endTimeMoment] = queryDateRange as [Dayjs, Dayjs];

  const dto: any = {
    ...otherParams,
    archiveType: 0, //0:人员  1:车辆  2:手机  3:船舶
    startTime: startTimeMoment.format(YMDHms),
    endTime: endTimeMoment.format(YMDHms),
    levelNum: 1,
  };

  const vo = await submitFollowTask(dto);

  return { ...vo, ...dto };
}

const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";

/** 人员档案-轨迹信息-历史轨迹 请求所有轨迹 */
export async function queryHistoricalTrajectory(params: any) {
  const { returnTime, customTime, data, ...obj } = params;
  const page = {
    pageNumber: 1,
    pageSize: returnTime === "lastFive" ? 5 : 1000000,
  };
  if (customTime) {
    obj.beginTime = dayjs(customTime[0]).format(dateTimeFormat);
    obj.endTime = dayjs(customTime[1]).format(dateTimeFormat);
  }
  const res = await Promise.all(
    data.map((item: any) => getHistoryTrackApi({ ...page, ...obj, ...item }))
  );

  const content = res?.map((item) => item.content);

  const tableData = content?.flat() || [];

  console.log(content, "Promise.all content");

  matching(tableData, recordTargetDict, "codeType");

  return {
    data: tableData,
    tarckData: content
      ?.filter((item) => item?.length)
      .map((ele: any) => {
        return {
          legendName: ele[0]?.codeType,
          latLngList: ele?.map((item: any) => {
            // const [lng, lat] = item.capAddress.split(",");
            return {
              lng:item.longitude,
              lat: item.latitude,
              datetime: item.capTime,
              speed: Number(item.speed),
              course: item.course,
              heading: item.trueHeading,
            };
          }),
        };
      }),
    total: content?.length || 0,
  };
}


// 人员档案-伴随信息-轨迹信息
export async function getAdjointTrack(srcData: any, tagData: any, queryParams: any) {
  const [startTime, endTime] = queryParams.datetime

  const dto: any = {
    current: 1,
    size: 9999,
    coincidence: queryParams.coincidence, //是否融合:true或false
    // analyzeType: 4,
    beginTime: startTime.format(YMDHms),
    // beginTime: dayjs('2022-11-01 00:00:00').format(YMDHms),
    endTime: endTime.format(YMDHms),
  }


  if (tagData.srcCodeType === 0 && tagData.tagCodeType === 0) {
    dto.faceId = `${tagData.srcCode},${tagData.tagCode}`
    dto.analyzeType = 1
  } else if (tagData.srcCodeType === 1 && tagData.tagCodeType === 1) {
    dto.licensePlate = `${tagData.srcCode},${tagData.tagCode}`
    dto.analyzeType = 2
  } else if (tagData.srcCodeType === 6 && tagData.tagCodeType === 6) {
    dto.mmsi = `${tagData.srcCode},${tagData.tagCode}`
    dto.analyzeType = 4
  }

  // dto.mmsi = '98769275,32234195'

  const codeTypeDict = await getDictDataByType('target_data_type', 'number')
  const vo = await matchingRails(dto)

  matching(vo.content, codeTypeDict, 'codeType')

  const currentShip = {
    legendName: tagData.srcCode,
    // legendName: '98769275',
    latLngList: [] as any[]
  }
  const targetShip = {
    legendName: tagData.tagCode,
    // legendName: '32234195',
    latLngList: [] as any[]
  }

  vo.content.forEach((ele: any, idx: number) => {
    const [lng, lat] = ele.capAddress.split(',')
    ele.ordinal = idx + 1
    if (currentShip.legendName === ele.content) {
      currentShip.latLngList.push({
        lng,
        lat,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading
      })
    } else {
      targetShip.latLngList.push({
        lng,
        lat,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading
      })
    }
  });

  return [vo.content, [currentShip, targetShip]]
}


/** 个人档案-预警信息-风险等级统计*/
export async function getPersonRiskLevelOptions(param: string, dataInfo: any) {
  const dto: any = {
    endWarnTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms),
    contentType: 0,
    warnContent: dataInfo.faceId
  }

  if (param === 'month') {
    dto.startWarnTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.startWarnTime = dayjs().subtract(1, 'y').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  }

  const [vo, levelDict] = await Promise.all([getAlarmLevelStatistics(dto), getDictDataByType('risk_level')])

  let options: any = getNoDataEchartsOption()

  if (vo.length !== 0) {
    const data = vo.filter((e: any) => e.dataItem !== '0').map((ele: any) => {
      const name = getDictName(levelDict, ele.dataItem)
      return {
        name,
        value: Number(ele.count)
      }
    })
    options = getShipWarnLevelOptions(data)
  }
  return options;
}

/** 个人档案-预警信息-每日预警统计*/
export async function getPersonAlarmHourData(param: string, dataInfo: any) {
  const dto: any = {
    endWarnTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms),
    contentType: 0,
    warnContent: dataInfo.faceId
  }

  if (param === 'month') {
    dto.startWarnTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.startWarnTime = dayjs().subtract(1, 'y').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  }

  const vo = await getAlarmHourStatistics(dto)

  return vo;
}

/** 个人档案-预警信息-每日预警统计*/
export async function getPersonWarnDateOptions(params: DayjsRange, dataInfo: any) {
  const [startMoment, endMoment] = params || [null, null]

  const dto: any = {
    startWarnTime: startMoment?.format(YMD),
    endWarnTime: endMoment?.format(YMD),
    contentType: 0,
    codeValue: dataInfo.faceId
  }

  const vo = await getAlarmDayStatistics(dto)

  vo.forEach((ele: any) => {
    ele.dataItem = dayjs(ele.dataItem).format('MM-DD')
  })

  let options: any = getNoDataEchartsOption()

  if (vo.length !== 0) {
    const xAxisData = vo.map((ele: any) => ele.dataItem)
    const seriesData = vo.map((ele: any) => ele.count)
    options = getShipWarnDateOptions(xAxisData, seriesData)
  }
  return options;
}


/** 获取个人档案-预警信息表格数据 */
export async function doGetPersonWarnTable(pageInfo: PageInfo, params: any) {
  const { dateTimeRange } = params

  const dto: any = {
    ...pageInfo,
    warnContent: params.faceid,// 人脸ID
  };

  if (dateTimeRange) {
    dto.startWarnTime = dayjs(dateTimeRange[0]).format(YMDHms)
    dto.endWarnTime = dayjs(dateTimeRange[1]).format(YMDHms)
  }

  if (params.warnTypes) {
    dto.contentType = params.warnTypes.toString();
  }

  const [vo, monitorDict, levelDict, modelDict, deviceDict] = await Promise.all(
    [
      getShipWarnList(dto),
      getDictDataByType("monitor_type"),
      getDictDataByType("risk_level"),
      getDictDataByType("model_type"),
      getDictDataByType("device_type"),
    ]
  );

  const data = vo.records.map((ele: any) => {
    if (ele.longitude || ele.latitude) {
      ele.longitudeLatitude = `${ele.longitude}/${ele.latitude}`;
    } else {
      ele.longitudeLatitude = "";
    }
    return ele;
  });

  matching(data, monitorDict, "monitorType");
  matching(data, levelDict, "riskLevel");
  matching(data, modelDict, "warnType");
  matching(data, deviceDict, "deviceType");

  return {
    data,
    total: vo.total,
  };
}

export async function getPersonTypes(params: any) {
  let dto = {
    ...params
  }
  let vo = await getPersonTypeCount(dto)

  vo && vo.forEach((ele: any) => {
    if (ele.keyName === '重点人员') {
      ele.bgClass = 'btnImgPersonTypeImportant'
    } else if (ele.keyName === '关注人员') {
      ele.bgClass = 'btnImgPersonTypeFocus'
    } else if (ele.keyName === '一般人员') {
      ele.bgClass = 'btnImgPersonTypeCommon'
    }
  })

  return {
    data: vo
  }
}