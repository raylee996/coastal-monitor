import {
  queryEntryExitStatisticsApi,
  queryPortApi,
  querySailorInfoApi,
  queryThermalMapApi,
} from "api/core/entryExitRecords";
import { getRelationResultApi } from "api/core/wisdomSearch";
import { getStatisticsPlaceNameForMap } from "api/statistics";
import dayjs from "dayjs";
import matching, { isEntryPortDict, Type } from "helper/dictionary";
import { getEchartsStackedLine } from "helper/echartsConfig";
import { PageInfo } from "hooks/integrity/TableInterface";
import { getDictDataByType } from "server/system";
import { YMDHms } from "../../helper";
import { Moment } from "moment";
import _ from "lodash";

// 获取进出港信息列表 场所类型 1-港口 2-区域 这里传入 placeType=1 只查询港口
export async function getEntryExitPortList(pageInfo: PageInfo, params: any, signal?: AbortController) {
  const { datetime, ..._params } = params
  const dto = {
    ...pageInfo,
    ..._params,
  };
  if (datetime) {
    const [startDatetime, endDatetime]: [Moment, Moment] = datetime;
    dto.beginTime = startDatetime.format(YMDHms)
    dto.endTime = endDatetime.format(YMDHms)
  }
  const res = await queryPortApi(dto, { signal })
  const archiveShipType = await getDictDataByType("archive_ship_type")
  matching(res?.page?.records, archiveShipType, "shipType");
  matching(res?.page?.records, isEntryPortDict, "isEntry");
  return {
    data: res?.page?.records || [],
    total: res?.page?.total || 0,
  };
}

// 进出港今日统计
export async function queryEntryExitStatisticsDay(dto: any) {
  const res = await queryEntryExitStatisticsApi(dto);
  return res;
}

/** 获取进出港24小时数据 */
export async function getEntryExitPortThermalMap(param: any) {
  const newDto = {
    ...param,
  };
  const res = await queryThermalMapApi(newDto);

  const hourArr = res?.length ? res.map((item: any) => item.chartTime) : [];
  const entryData = res?.length ? res.map((item: any) => item.entry) : [];
  const exitData = res?.length ? res.map((item: any) => item.exit) : [];

  const options = getEchartsStackedLine({
    legendData: ["进港", "出港"],
    xAxisData: hourArr,
    series: [{
      name: '进港',
      type: 'line',
      stack: 'Total',
      symbol: 'none', //去除拐点
      smooth: true, //平滑曲线
      data: entryData,
      itemStyle: {
        normal: {
          areaStyle: { type: 'default' },
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
            [
              { offset: 0, color: '#0052fa' },
              { offset: 0.5, color: 'rgba(0,82,250,0.3)' },
              { offset: 1, color: 'rgba(0,82,250,0.1)' },
            ]
          )
        }
      }
    },
    {
      name: '出港',
      type: 'line',
      stack: 'Total',
      symbol: 'none',
      smooth: true,
      data: exitData,
      itemStyle: {
        normal: {
          areaStyle: { type: 'default' },
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(82,255,245, 1)",
            },
            {
              offset: 0.5,
              color: "rgba(82,255,245, 0.4)",
            },
            {
              offset: 1,
              color: "rgba(82,255,245, 1)",
            },
          ])
        }
      }
    }]
  });

  return options;
}

// 获取进出港列表
export async function getAllEntryExitPort(params: any) {
  const dto = {
    isRecognition: '1',
    ...params
  }

  const vo = await getStatisticsPlaceNameForMap(dto);

  if (_.isEmpty(vo)) {
    return []
  } else {
    const result: Type<string>[] = []
    _.forIn(vo, (val, key) => {
      result.push({
        value: key,
        name: val
      })
    })
    return result
  }
}

// 获取关联人脸/关联车辆
export async function getRelativeFaceCarList(dto: any) {
  const target = ["0", "1"];
  const { capTime, ...params } = dto;
  // 进出港记录的时间前后延伸半小时
  if (capTime) {
    params.startTime = dayjs(capTime)
      .subtract(30, "minute")
      .format("YYYY-MM-DD HH:mm:ss");
    params.endTime = dayjs(capTime)
      .add(30, "minute")
      .format("YYYY-MM-DD HH:mm:ss");
  }
  const [faceList, carList] = await Promise.all(
    target.map((item) => {
      return getRelationResultApi({
        ...params,
        tagCodeType: item,
      });
    })
  );
  return {
    face: (faceList || []).map((item: any) => {
      item && checkFaceFlag(item);
      return {
        ...item,
      };
    }),
    car: carList || [],
  };
}

// 获取船员信息
export async function getSailorInfoList(dto: any) {
  const vo = await querySailorInfoApi(dto);
  return (vo || []).map((item: any) => {
    const { standFace } = item;
    standFace && checkFaceFlag(standFace);
    return item;
  });
}

function checkFaceFlag(item: any) {
  item.iconList = [];
  // 是否戴眼镜、帽子、口罩
  item.glass && item.iconList.push("yanjing");
  item.hat && item.iconList.push("maozi");
  item.mask && item.iconList.push("kouzhao");
  // 性别
  item.gender === 1 && item.iconList.push("nan");
  item.gender === 2 && item.iconList.push("nv");
  // 年龄段 暂无
  // ...
  return item;
}


// 进出港数量统计
export async function getEntryExitStatistics(placeId: any, type: number) {
  const dto = {
    placeId: placeId,
    type: type
  }
  const vo = await queryEntryExitStatisticsApi(dto);

  let entry = 0
  let exit = 0

  vo.forEach((item: any) => {
    entry += item.entry
    exit += item.exit
  })

  return { entry, exit };
}