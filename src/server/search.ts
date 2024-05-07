import { getHistoryTrack } from "api/common";
import { addLabelUseResponse, editLabel, delLabel, getLabelList, graphqlLabel } from "api/label";
import {
  getRelationResult, getCollectCountByDate, getCollectGetNearNums, getHotGraph, getWaterList, getWatergetListByLabelType,
  getWatercountByDirection,
  getWatercountByMmsi,
  findAllDevices,
  delShipList
} from "api/search";
import dayjs, { Dayjs } from "dayjs";
import { datetimeSort, YMDHm } from "helper";
import common from "helper/common";
import matching, { matchingByConvert } from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import { getDictDataByType } from "./system";
import { Moment } from "moment";
import { YMDHms } from "../helper";
import { getTrackReview } from "api/ship";

export async function getLabelSelectList() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
          selectList(pageInfo: $pageInfo){
              id
              name
              value
            } 
        }`,
    variables: {
    },
  };
  const res = await graphqlLabel(dto);

  let dict: any[] = [];
  res.data.data.selectList.forEach((item: any) => {
    dict.push({ name: item.name, value: item.value });
  });
  return dict
  // return {
  //   data: res.data.data.selectList,
  //   total: 50,
  // };
}


/**获取标签列表 */
export async function getLabelTable(params: any) {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: params.type
  };
  const res = await getLabelList(dto);
  return {
    data: res.records,
    total: res.total,
  };
}

/**获取标签下拉数据 */
export async function getLabelSelect(params: any) {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: params.type
  };
  const res = await getLabelList(dto);

  let arr: any = []
  if (params.isFilter) {
    res.records.forEach((item: any, index: number) => {
      if (item.isAuto === "0") {
        arr.push({
          name: item.labelName,
          value: item.id
        })
      }
    });

  } else {
    res.records.forEach((item: any, index: number) => {
      arr.push({
        name: item.labelName,
        value: item.id
      })
    });
  }
  return arr
}



/**新增标签 */
export async function doAddLabel(params: any) {
  const dto = {
    ...params
  };

  // const vo = await addLabel(dto);
  const result = await addLabelUseResponse(dto);
  return result
}

/**修改标签 */
export async function doEditLabel(params: any) {
  const dto = {
    ...params
  };

  const vo = await editLabel(dto);
  return vo
}


/**删除标签 */
export async function doDelLabel(params: any) {
  const dto = {
    ...params
  };

  const vo = await delLabel(dto);
  return vo
}
export async function doDelShipList(params: any) {
  const dto = {
    ...params
  };

  const vo = await delShipList(dto);
  return vo
}



/**获取关联数据信息 */
export async function doGetRelationResult(pageInfo: PageInfo, params: any) {
  const dto: any = {
    ...pageInfo,
    ...params
  };
  let vo: any = []
  let voTotal: any = 0
  if (!common.isNull(dto.codeValue)) {
    vo = await getRelationResult(dto);
    voTotal = vo.total
  }

  return {
    data: vo,
    total: voTotal
  }
}

/**获取关联数据信息 */
export async function doGetHistoryTrack(pageInfo: PageInfo, params: any) {
  const dto: any = {
    aisDateType: 1,
    ...pageInfo,
    ...params
  };

  if (params.time) {
    dto.startTime = dayjs(params.time[0]).format(YMDHm)
    dto.endTime = dayjs(params.time[1]).format(YMDHm)
  }


  const [vo, targetDataTypeDict, clueCodeDict] = await Promise.all([
    getHistoryTrack(dto),
    getDictDataByType("target_data_type"),
    getDictDataByType("clue_code_type"),
  ]);

  // readDict(vo.content, "codeType", targetDataTypeDict);
  matchingByConvert(vo.content, targetDataTypeDict, "codeType", 'codeTypeName', 'number')
  // readDict(vo.content, "codeType", clueCodeDict);
  console.debug(clueCodeDict)

  let newLonLat: any = vo?.content
    ?.map((item: any) => {
      const {
        capAddress,
        trueHeading,
        codeType,
        capTime,
        trackStatus,
        ...obj
      } = item;
      const lngLat = capAddress.split(",").map(Number);
      return {
        lng: lngLat[0],
        lat: lngLat[1],
        heading: trueHeading,
        datetime: dayjs(capTime).format("YYYY-MM-DD HH:mm:ss"),
        ...obj,
      };
    })
    .sort((a: { datetime: number }, b: { datetime: number }) => {
      return dayjs(a.datetime).isAfter(dayjs(b.datetime)) ? 1 : -1;
    });

  return {
    data: vo.content,
    newData: newLonLat,
    total: vo.total
  }
}

/** 数据统计---采集数据统计*/
export async function getCollectCountOptions(params: any, signal?: AbortController) {
  const dto: any = {
    ...params
  }

  const vo = await getCollectCountByDate(dto, { signal })

  const list: { date: string, value: number }[] = []

  for (let i in vo) {
    list.push({
      date: i,
      value: vo[i]
    })
  }

  datetimeSort(list, 'date')

  const xAxisData = list.map(item => item.date)
  const seriesData = list.map(item => item.value)

  return [xAxisData, seriesData]
}
/** 数据统计---采集数据统计--数量统计*/
export async function getCollectNearNums(params: any) {


  const dto: any = {
    ...params
  }

  const vo = await getCollectGetNearNums(dto)
  return vo
}

/** 数据统计---船舶热力图*/
export async function getHotGraphData(params: any) {
  const dto: any = {
    type: params.type,
    dataType: params.dataType
  }

  if (params.dateRange) {
    const [begin, end] = params.dateRange as [Dayjs, Dayjs]
    dto.beginTime = begin.format(YMDHm)
    dto.endTime = end.format(YMDHm)
  }

  if (params.deviceList) {
    dto.deviceCodes = params.deviceList.toString()
  }

  const vo = await getHotGraph(dto)
  return vo
}

// 水域卡口列表
export async function getWatersLists(pageInfo: any, params: any) {
  const { dateTimeRange, ..._params } = params

  const dto: any = {
    ...pageInfo,
    ..._params
  }
  if (dateTimeRange) {
    const [beginTime, endTime]: [Moment, Moment] = dateTimeRange;
    dto.beginTime = beginTime.format(YMDHms)
    dto.endTime = endTime.format(YMDHms)
  }
  const vo = await getWaterList(dto)
  const waterAreaDict = await getDictDataByType("water_area_direction_type", "string");
  const shipTypeDict = await getDictDataByType("archive_ship_type")
  matching(vo.records, waterAreaDict, "direction");
  matching(vo.records, shipTypeDict, "shipType");
  return {
    data: vo.records,
    total: vo.total
  }
}

//切换水域卡口，调用切换视频接口
export async function findAllDevicesAsync(params: any) {
  let dto = {
    ...params
  }
  let vo = await findAllDevices(dto)
  return vo
}


export async function getWaterstypes() {


  const dto: any = {
    labelType: 9,
    subType: 2
  }
  let arr: any = []
  const vo = await getWatergetListByLabelType(dto)
  vo.forEach((item: any, index: number) => {
    arr.push({
      label: item.name,
      value: item.id
    })
  });
  return arr
}
export async function getWaterByDirection(params: any) {

  const dto: any = {
    ...params
  }
  const vo = await getWatercountByDirection(dto)
  return vo
}
export async function getWaterscountByMmsi(params: any) {

  const dto: any = {
    ...params
  }
  const vo = await getWatercountByMmsi(dto)
  return vo
}

export async function getHotMapData(params: any, signal: AbortController) {
  const [begin, end] = params.range

  const dto: any = {
    beginTime: begin.format(YMDHms),
    endTime: end.format(YMDHms),
    dataType: params.dataType,
    deviceCodes: ''
  }

  if (params.deviceList) {
    dto.deviceCodes = params.deviceList.join(',')
  }

  if (params.dataType === 0) {
    dto.dataType = '1,2'
  }

  const trackData = await getTrackReview(dto, { signal })

  return trackData
}