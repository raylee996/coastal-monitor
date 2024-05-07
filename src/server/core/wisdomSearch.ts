import { getHistoryTrack } from "api/common";
import {
  exportSearchApi,
  getRelationResultApi,
  queryDeviceApi,
  queryFaceCompareApi,
  querySearchAISList,
  querySearchVideoApi,
  querySisdomSearchApi
} from "api/core/wisdomSearch";
import dayjs from "dayjs";
// import { codeTypeToKey } from "features/Core/components/WisdomSearch/OverallSituation/components/OverallSituationItem";
import { downloadFile, YMDHms } from "helper";
import matching, {
  dataTypeNum,
  genderDict,
  readDictByConvert,
  recordTargetDict,
  shipStatusDict,
  WisdomSearchRadarTrackStatusDict,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import { getDictDataByType } from "server/system";
import { dataFormat } from "./wisdomCommand";

export async function getAISSearchList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      getList(pageInfo: $pageInfo){
        id,
        mmis,
        shipName,
        shipType,
        speed,
        course,
        heading,
        status,
        lat,
        lng,
        createTime,
      } 
    }`,
    variables: {
      pageInfo,
    },
  };
  const res = await querySearchAISList(dto);
  return {
    data: res.data.data.getList.map(
      (item: { [x: string]: any; lat: any; lng: any }) => {
        let { lat, lng, ...obj } = item;
        obj.lngLat = `${lng},${lat}`;
        return obj;
      }
    ),
    total: 100,
  };
}

export async function getAllSisdomSearchList(pageInfo: PageInfo, params: any, signal?: AbortController) {

  const { wearGlasses, wearMask, wearHat, ...othParams } = params

  const dto = handleParams(othParams, pageInfo);

  if (wearGlasses && wearGlasses !== -1) {
    dto.wearGlasses = wearGlasses
  }

  if (wearMask && wearMask !== -1) {
    dto.wearMask = wearMask
  }

  if (wearHat && wearHat !== -1) {
    dto.wearHat = wearHat
  }

  const [
    res,
    shipTypeDict,
    shipStatusDict,
    carTypeDict,
    carPlateColorDict,
    carColorDict
  ] = await Promise.all([
    querySisdomSearchApi(dto, { signal }),
    getDictDataByType("archive_ship_type"),
    getDictDataByType("nav_status"),
    getDictDataByType("archive_car_type"),
    getDictDataByType("archive_plate_color"),
    getDictDataByType("archive_car_color"),
  ]);
  res?.content?.map((item: any) => {
    item.shipName = item.cn_name || item.en_name
    item.trackStatusStr = item.trackStatus + "";
    return item;
  });
  if (res?.content) {
    matching(res.content, shipTypeDict, "ship_type");
    // 雷达转换点迹类型 trackStatus:0是采集的点。。1外推的点。2：起批前的类型
    if (params.codeType === 7) {
      matching(res.content, WisdomSearchRadarTrackStatusDict, "trackStatus");
    }
    // 航行状态
    else {
      matching(res.content, shipStatusDict, "trackStatusStr");
    }
    res.content.map((item: any) => {
      // 车型
      readDictByConvert(item, "vehicleType", carTypeDict);
      // 车牌颜色
      readDictByConvert(item, "plateColor", carPlateColorDict);
      // 车身颜色
      readDictByConvert(item, "vehicleColor", carColorDict);

      // 性别
      readDictByConvert(item, "gender", genderDict);
      return item;
    });
  }
  let arr: any = res.content.map((item: any, index: any) => {
    return {
      index: (pageInfo.pageNumber - 1) * pageInfo.pageSize + index + 1,
      ...item
    }
  })
  return {
    data: arr.map((item: any) => {
      item.LatLng =
        item.capAddress.split(",")?.length === 2
          ? item.capAddress
          : [item.latitude, item.longitude].filter((v) => v).join(",");
      item.key = _.uniqueId('radar')
      item.id = _.uniqueId('uniqueId')
      return item;
    }),
    total: res.total,
  };
}

// 智搜身份证搜索
export async function getAllSisdomSearchListPerson(pageInfo: PageInfo, params: any, signal?: AbortController) {

  const { wearGlasses, wearMask, wearHat, ...othParams } = params

  const dto = handleParams(othParams, pageInfo);

  if (wearGlasses && wearGlasses !== -1) {
    dto.wearGlasses = wearGlasses
  }

  if (wearMask && wearMask !== -1) {
    dto.wearMask = wearMask
  }

  if (wearHat && wearHat !== -1) {
    dto.wearHat = wearHat
  }
  const res = await querySisdomSearchApi(dto, { signal })
  res?.content?.map((item: any) => {
    item.shipName = item.cn_name || item.en_name
    item.trackStatusStr = item.trackStatus + "";
    return item;
  });
  if (res?.content) {
    res.content.map((item: any) => {
      // 性别
      readDictByConvert(item, "sex", genderDict);
      if (item.contrastResult) {
        item.contrastResult = item.contrastResult === 1 ? '成功' : '失败'
      }
      return item;
    });
  }
  let arr: any = res.content.map((item: any, index: any) => {
    return {
      index: (pageInfo.pageNumber - 1) * pageInfo.pageSize + index + 1,
      ...item
    }
  })
  return {
    data: arr,
    total: res.total,
  };
}


// 感知源--图片数据搜索
export async function getAllSisdomSearchListImags(
  pageInfo: PageInfo,
  params: any
) {
  const dto = handleParams(params, pageInfo);
  const [res, shipTypeDict, carTypeDict] = await Promise.all([
    querySisdomSearchApi(dto, { signal: params.signal }),
    getDictDataByType("archive_ship_type"),
    getDictDataByType("archive_car_type"),
  ]);
  const devices = await queryDeviceDict({ deviceType: 1 })

  if (res?.content) {
    matching(
      res.content,
      shipStatusDict.map((item) => {
        return {
          ...item,
          name: item.name + "",
        };
      }),
      "shipStatus"
    );
    matching(res.content, shipTypeDict, "shipType");
    matching(res.content, carTypeDict, "car_type");
    matching(res.content, recordTargetDict, "codeType");

  }

  for (let i = 0; i < res.content.length; i++) {
    for (let j = 0; j < devices.length; j++) {
      if (res.content[i].deviceCode === devices[j].deviceCode) {
        res.content[i].deviceName = devices[j].name
        res.content[i].capAddress = devices[j].siteName
      }
    }
  }

  return {
    data: res.content,
    total: res.total,
  };
}
/** 智搜获取关联数据 */
export async function getRelationResultList(params: any) {
  // 获取数据类型  0.人脸 1.车辆 2.IMSI 3.IMEI 4.MAC 5.手机 6.MMSI 7.雷达批号 8.目标ID
  const dto = {
    size: 10,
    ...params
  }
  const vo = await getRelationResultApi(dto);
  return vo;
}

/** 人脸比对 */
export async function queryFaceCompare(params: any) {
  const res = await queryFaceCompareApi(params);
  return res;
}

/** 获取设备 */
export async function queryDeviceDict(params: any) {
  const res = await queryDeviceApi(params);
  let deviceDict = await getDictDataByType("device_type")
  matching(res, deviceDict, "deviceType");
  return res;
}

/** 智搜导出 */
export async function exportSearchTrack(params: any, text: string) {
  const dto = handleParams(params);
  const vo = await exportSearchApi(dto);
  downloadFile(vo.data, text || "智搜列表");
}

function handleParams(params: any, pageInfo?: PageInfo) {
  // 获取数据类型 -1 全局 0 人脸 1 车牌 2 IMSI 3 IMEI 4 MAC 5 手机 6 AIS 7 RADAR  datetime,
  const { faceId, datetime, areaJsonList, pointJsonList, ...para } = params;
  // 时间处理
  if (datetime?.length) {
    para.beginTime = dayjs(datetime[0]).format("YYYY-MM-DD HH:mm:ss");
    para.endTime = dayjs(datetime[1]).format("YYYY-MM-DD HH:mm:ss");
  }
  // 雷达页面时用户可能填写雷达批号或目标id
  para.codeType === 7 &&
    para?.searchCondition?.substring(0, 1) === "F" &&
    (para.codeType = 8);
  // 点位设备选择
  pointJsonList && (para.deviceCodes = pointJsonList.join(","));

  const dto = {
    // 区域图形
    graph: areaJsonList ? (
      !_.isString(areaJsonList) ? JSON.stringify(areaJsonList) : areaJsonList
    ) : "",
    ...para,
  };
  // 是否需要分页参数
  if (pageInfo) {
    dto.current = pageInfo.pageNumber;
    // 接口暂不支持-1查所有, -1转换为100000
    dto.size = pageInfo.pageSize === -1 ? 100000 : pageInfo.pageSize;
  }
  // 人脸id暂时写死
  faceId?.length && (dto.faceId = "63b936885ab54631a25d818405bd5073");
  return dto;
}

/** 获取智搜视频 */
export async function querySearchVideoList(pageInfo: PageInfo, params: any) {
  // console.log(pageInfo, params);
  const dto = {
    ...pageInfo,
    ...params,
  };
  const { datetime, pointJsonList, ...para } = dto;
  // 时间处理
  if (datetime?.length) {
    para.startTime = dayjs(datetime[0]).format("YYYY-MM-DD HH:mm:ss");
    para.endTime = dayjs(datetime[1]).format("YYYY-MM-DD HH:mm:ss");
  }
  // 点位设备选择
  pointJsonList && (para.deviceCode = pointJsonList.join(","));
  // 请求视频数据
  const res = await querySearchVideoApi(para);
  const warnList = await getDictDataByType("warn_type")
  res.records.forEach((item: any) => {
    if (item.codeType === 9) {
      matching(res.records, warnList, "codeValue");
    }
  })

  return {
    data: res?.records || [],
    total: res?.total,
  };
}

/** 智搜获取多条轨迹信息 */
export async function queryWisdomSearchTracking(
  codeType: number,
  targetList: any[],
  datetime?: string[]
) {
  let codeValueList: string[] = []

  const dto: any = {
    aisDateType: 1, // aisDateType指定获取轨迹数据类型 0mmsi 1融合 2雷达
    pageNumber: 1,
    pageSize: 9999
  }

  if (datetime) {
    const [sTime, eTime] = datetime
    dto.beginTime = dayjs(sTime).format(YMDHms)
    dto.endTime = dayjs(eTime).format(YMDHms)
  }

  if (targetList.length === 1) {
    const [target] = targetList
    if (codeType === 6 && target.codeType === 6) {
      dto.mmsi = target.content || target.codeValue
      codeValueList = [dto.mmsi]
    }
    if (codeType === 7 && target.codeType === 7) {
      dto.uniqueId = target.content || target.codeValue
      codeValueList = [dto.uniqueId]
    }
    if (codeType === 8) {
      dto.targetId = target.target_id || target.targetId || target.fusionId
      codeValueList = [dto.targetId]
    }
  } else {
    const list = targetList.map(ele => ele.target_id || ele.targetId)
    codeValueList = list
    dto.targetId = list.join(',')
  }

  const vo = await getHistoryTrack(dto)

  if (vo?.content?.length) {
    matching(vo.content, dataTypeNum, "codeType");


    const data = [...dataFormat(vo.content, codeValueList)];

    // 处理table数组
    let tableData: any[] = []
    codeValueList.forEach((item, codeIndex) => {

      const currentList = _.filter(vo.content, ele => {
        if (codeValueList.length === 1) {
          if (codeType === 6) {
            return ele.content === item
          } else if (codeType === 7) {
            return ele.content === item
          } else {
            return ele.targetId === item
          }
        } else {
          return ele.targetId === item
        }
      })

      const data = currentList.map((item: any, index: number) => {

        const id = _.uniqueId()

        const LatLng = item.capAddress.split(",")?.length === 2 ? item.capAddress : [item.latitude, item.longitude].filter((v) => v).join(",");

        return {
          ...item,
          index: index + 1,
          codeIndex,
          LatLng,
          id
        };
      })

      tableData = [...tableData, ...data]
    })


    return {
      trackData: data,
      tableData: tableData
    };
  } else {

    return {
      trackData: [],
      tableData: []
    };
  }


}
