import {
  getWarningApi,
  getWarningDetailApi,
  getWarningV3Api,
  getWarningVudioListApi,
  graphqlWarning,
  handleBehaviorApi,
  handleWarningResult,
} from "api/core/earlyWarning";
import dayjs from "dayjs";
import matching, {
  getDictName,
  opinionTypeDict,
  warnStatusDict,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import { getDictDataByType } from "server/system";

export async function getAllWarningList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
              getWarning(pageInfo: $pageInfo){
                id
                monitorName
                alarmDateTime
                alarmContent
                alarmType
                alarmTimes
                status
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlWarning(dto);
  return {
    data: res.data.data.getWarning,
    total: 100,
  };
}

export async function getWarningList(pageInfo: PageInfo, dto: any, signal?: AbortController) {
  const { datetime, warnTypes, ...para } = dto
  // 时间处理
  if (datetime?.length) {
    para.startWarnTime = dayjs(datetime[0]).format("YYYY-MM-DD HH:mm:ss");
    para.endWarnTime = dayjs(datetime[1]).format("YYYY-MM-DD HH:mm:ss");
  }

  const res = await getWarningApi({
    ...pageInfo,
    ...{ ...para, warnTypes: warnTypes?.join(",") },
  }, { signal })

  const [monitorDict, shipTypeDict] = await Promise.all([
    getDictDataByType("warn_type"),
    getDictDataByType("archive_ship_type")
  ]);

  if (res?.records) {
    matching(res.records, warnStatusDict, "status");
    matching(res.records, shipTypeDict, "shipType");
    res.records.map((item: any) => {
      item?.dealRecord &&
        matching([item.dealRecord], opinionTypeDict, "opinionType");
      // 反序列化
      item?.relationInfo && (item.relationInfoJson = JSON.parse(item.relationInfo));
      // 转换特殊warnType 通过分号分割的多个类型
      item?.warnType &&
        (item.warnTypeName = item?.warnType
          ?.split(";")
          .map((v: any) => {
            // return getDictName(monitorDict, v)
            const name = getDictName(monitorDict, v)
            return name === '进出区域' ?
              `${name}${item.relationInfoJson?.entryFlag ? `-${item.relationInfoJson?.entryFlag === '1' ? '进' : '出'}区域` : ''}`
              : (name === '越线' ?
                `${name}${item.relationInfoJson?.crossType ? `-${item.relationInfoJson?.crossType === '3' ? 'A到B' : 'B到A'}` : ''}`
                : name);
          }).filter((v: string) => v).join("、"));
      return item;
    });
  }

  return {
    data: res.records,
    total: res.total,
  };
}

export async function getWarningDetail(pageInfo: PageInfo, dto: any) {
  const res = await getWarningDetailApi(dto);
  return res.data;
}

export async function getWarningVudioList(dto: any) {
  const res = await getWarningVudioListApi(dto);
  const result = res.length ? _.chunk(res, 5) : [];
  return result;
}

export async function handlerWarningResult(dto: any) {
  const res = await handleWarningResult(dto);
  return res;
}

// 预警行为记录列表
export async function handleBehaviorList(dto: any, signal?: AbortController) {
  const res = await handleBehaviorApi(dto, { signal });
  return res;
}

export async function getWarningV3List(pageInfo: PageInfo, dto: any, signal?: AbortController) {
  
  const res = await getWarningV3Api({
    ...pageInfo,
    ...{ ...dto, warnTypes: dto?.warnTypes?.join(",") },
  }, { signal })

  const monitorDict = await getDictDataByType("warn_type")

  // const [res, monitorDict] = await Promise.all([
  //   getWarningV3Api({
  //     ...pageInfo,
  //     ...{ ...dto, warnTypes: dto?.warnTypes?.join(",") },
  //   }),
  //   getDictDataByType("warn_type"),
  // ]);

  if (res?.records) {
    matching(res.records, warnStatusDict, "status");
    res.records.map((item: any) => {
      item?.dealRecord &&
        matching([item.dealRecord], opinionTypeDict, "opinionType");
      // 反序列化
      item?.relationInfo && (item.relationInfoJson = JSON.parse(item.relationInfo));
      // 转换特殊warnType 通过分号分割的多个类型
      item?.warnType &&
        (item.warnTypeName = item?.warnType
          ?.split(";")
          .map((v: any) => {
            const name = getDictName(monitorDict, v)
            return name === '进出区域' ?
              `${name}${item.relationInfoJson?.entryFlag ? `-${item.relationInfoJson?.entryFlag === '1' ? '进' : '出'}区域` : ''}`
              : (name === '越线' ?
                `${name}${item.relationInfoJson?.crossType ? `-${item.relationInfoJson?.crossType === '3' ? 'A到B' : 'B到A'}` : ''}`
                : name);
          }).filter((v: string) => v).join("、"));
      return item;
    });
  }

  return {
    data: res.records,
    total: res.total,
  };
}
