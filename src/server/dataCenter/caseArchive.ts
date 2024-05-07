import { getSysAreaList } from "api/common";
import { analyzeTaskList } from "api/core/wisdomJudgment";
import {
  addCaseArchive,
  addCaseProgress,
  addCaseSuspects,
  addCaseThing,
  delCaseArchive,
  delCaseSuspects,
  delCaseThing,
  editCaseArchive,
  editCaseProgress,
  editCaseThing,
  getCaseArchive,
  getCaseSuspects,
  getCaseThing,
  queryCaseArchive,
  queryCaseProgress,
  queryCaseThing,
  qureyCaseProgressTimeLine,
  qureyCaseSuspects,
  qureyLegalCaseRelation,
  updateCaseUrls,
} from "api/dataCenter/caseArchive";
import dayjs from "dayjs";
import { YMDHms } from "helper";
import { changeDatePicker } from "helper/common";
import matching, {
  caseMarkDict,
  caseProgressTypeDict,
  caseRelationGoodsDict,
  judgmentStatusDict,
  sexDict,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import { arrayToTree } from "performant-array-to-tree";
import { getLabelSelect, getLabelTable } from "server/label";
import { getDictDataByType } from "server/system";

/** ------- 案件管理serve ------- */

// 获取案件列表
export async function queryCaseArchiveList(pageInfo: PageInfo, params: any) {
  const { createTime, ...paramsObj } = params;
  changeDatePicker(
    createTime,
    paramsObj,
    {
      startTime: "startTime",
      endTime: "endTime",
    },
    "YYYY-MM-DD HH:mm:ss"
  );
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...paramsObj,
  };
  const [res, caseSourceDict] = await Promise.all([
    queryCaseArchive(dto),
    getDictDataByType("archive_case_source"),
  ]);
  if (res?.records) {
    matching(res.records, caseSourceDict, "caseSource");
    matching(res.records, caseMarkDict, "caseMark");
  }
  res?.records?.map((item: any) => {
    const { happenTimeStart, happenTimeEnd } = item;
    item.happenTime = `${happenTimeStart || ""}${happenTimeStart && happenTimeEnd ? "至" : ""
      }${happenTimeEnd || ""}`;
    return item;
  });
  // 案件类别列表
  const caseType: any = await (await getLabelTable({ type: 8 })).data || []
  for (let i = 0; i < res.records.length; i++) {
    for (let j = 0; j < caseType.length; j++) {
      if (res.records[i].labelId === caseType[j].id) {
        res.records[i].labelName = caseType[j].labelName
      }
    }
  }

  return {
    data: res.records,
    total: res.total,
  };
}

// 新增/编辑案件
export async function addEditAreaServeItem(dto: any) {
  let {
    id,
    happenTime,
    happenRegion,
    registerRegion,
    happenDimen,
    imgUrls,
    videoUrls,
    ...params
  } = dto;
  // 处理发案时间
  changeDatePicker(
    happenTime,
    params,
    {
      startTime: "happenTimeStart",
      endTime: "happenTimeEnd",
    },
    "YYYY-MM-DD HH:mm:ss"
  );
  // 处理图片与视频url
  imgUrls?.length && (params.imgUrls = imgUrls.map((item: { path: any }) => item.path || item).join(","));
  videoUrls?.length && (params.videoUrls = videoUrls.map((item: { path: any }) => item.path || item).join(","));
  // 经纬度
  if (happenDimen?.length) {
    params.happenPrec = happenDimen[0].lng + "";
    params.happenDimen = happenDimen[0].lat + "";
  }
  // 解构省市区
  const [happenProvince, happenCity, happenRegions] = happenRegion || [];
  const [registerProvince, registerCity, registerRegions] = registerRegion || [];
  // 赋值省市区
  params = {
    happenProvince,
    happenCity,
    happenRegion: happenRegions ? happenRegions : '',
    registerProvince,
    registerCity,
    registerRegion: registerRegions ? registerRegions : '',
    ...params,
  };
  return await (id ? editCaseArchive({ id, ...params }) : addCaseArchive(params));
}

// 删除案件
export async function deleteCaseArchive(id: any) {
  return await delCaseArchive({ id });
}

/** ------- 案件信息serve ------- */

// 查询单条案件信息
export async function getCaseArchiveDetail(dto: any) {
  const [result, caseSourceDict, labelIdDict] = await Promise.all([
    getCaseArchive(dto),
    getDictDataByType("archive_case_source"),
    getLabelSelect({ type: 8 }),
  ]);

  let {
    happenTimeStart,
    happenTimeEnd,
    happenPrec,
    happenDimen,
    imgUrls,
    videoUrls,
    ...obj
  } = result;
  // key转name
  obj?.caseSource && matching([obj], caseSourceDict, "caseSource");
  obj?.caseMark && matching([obj], caseMarkDict, "caseMark");
  obj?.labelId && matching([obj], labelIdDict, "labelId");
  // 处理时间
  obj.happenTime =
    happenTimeStart || happenTimeEnd
      ? [
        happenTimeStart ? dayjs(happenTimeStart) : undefined,
        happenTimeEnd ? dayjs(happenTimeEnd) : undefined,
      ]
      : undefined;
  obj.happenTimeStr =
    happenTimeStart || happenTimeEnd
      ? [
        happenTimeStart
          ? dayjs(happenTimeStart).format("YYYY-MM-DD HH:mm:ss")
          : "",
        happenTimeEnd
          ? dayjs(happenTimeEnd).format("YYYY-MM-DD HH:mm:ss")
          : "",
      ]
        .filter((item) => item)
        .join("至")
      : "";
  // 处理经纬度
  obj.happenDimen =
    happenPrec && happenDimen
      ? [{ lng: Number(happenPrec), lat: Number(happenDimen) }]
      : [{ lng: "", lat: "" }];
  obj.happenDimenName = [happenPrec, happenDimen]
    .filter((item) => item)
    .join(",");
  // 处理图片与视频url
  imgUrls && (obj.imgUrls = imgUrls.split(","));
  videoUrls && (obj.videoUrls = videoUrls.split(","));
  // 处理地址
  obj.happenRegion = result.happenRegion ?
    [result.happenProvince, result.happenCity, result.happenRegion] :
    result.happenCity ? [result.happenProvince, result.happenCity] : []
  obj.registerRegion = result.registerRegion ?
    [result.registerProvince, result.registerCity, result.registerRegion] :
    result.registerCity ? [result.registerProvince, result.registerCity] : []

  return obj;
}

// 获取涉案物品列表
export async function queryCaseThingList(pageInfo: PageInfo, params: any) {
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
  };
  const res = await queryCaseThing(dto);
  // key转name
  res?.records && matching(res.records, caseRelationGoodsDict, "nature");
  return {
    data: res.records.map((item: any) => {
      const { quantity, quantityUnit, weight, weightUnit, worth, urls } = item;
      item.quantityName = quantity ? quantity + quantityUnit : "";
      item.weightName = weight ? weight + weightUnit : "";
      item.worthName = worth ? worth + "元" : "";
      item.urlsArray = urls ? urls.split(",") : [];
      return item;
    }),
    total: res.total,
  };
}

// 新增/编辑涉案物品
export async function addEditCaseThingItem(params: any) {
  const { quantityArray, weightArray, urlsArray, ...para } = params;
  const [quantity, quantityUnit] = quantityArray || [undefined, undefined];
  const [weight, weightUnit] = weightArray || [undefined, undefined];
  const dto = {
    quantity: quantity ? quantity + "" : undefined,
    quantityUnit,
    weight: weight ? weight + "" : undefined,
    weightUnit,
    urls: urlsArray?.map((item: any) => item.path).join(","),
    ...para,
  };
  console.log(dto, "dto");
  return params?.id ? await editCaseThing(dto) : addCaseThing(dto);
}

// 删除涉案物品
export async function deleteCaseThing(id: any) {
  return await delCaseThing({ id });
}

// 查询单条涉案物品
export async function getCaseThingDetail(id: any) {
  const res = await getCaseThing({ id });
  const { quantity, quantityUnit, weight, weightUnit, urls, ...para } = res;
  para.quantityArray = [quantity ? Number(quantity) : null, quantityUnit];
  para.weightArray = [weight ? Number(weight) : null, weightUnit];
  // 处理图片与视频url
  urls && (para.urlsArray = urls.split(","));
  return para;
}

/** ------- 案件进展 ------- */

// 查询案件进展时间线
export async function qureyCaseProgressTimeLineList(params: any) {
  const dto = {
    ...params,
  };
  const res = await qureyCaseProgressTimeLine(dto);
  let result: { data: any[]; activeId?: number; activeParentKey?: string } = {
    data: res,
  };
  if (
    res?.length &&
    res[0].children?.length &&
    res[0].children[0].children?.length
  ) {
    const obj = res[0].children[0];
    // 选中progressId时需要展开其父级月份
    result.activeParentKey = obj.key;
    // 默认选中的进展为第一项
    result.activeId = obj.children[0].progressId;
  }
  return result;
}

// 查询单条案件进展内容
export async function queryCaseProgressDetail(id: any) {
  const res = await queryCaseProgress({ id });
  if (res?.caseProgress) {
    matching([res?.caseProgress || []], caseProgressTypeDict, "type");
  }
  res?.caseClueList.map((item: any) => {
    item.image = item.imgUrls.split(",").filter((v: string) => v)
    return item;
  });
  return res;
}

// 新增/编辑案件进展
export async function addEditCaseProgressItem(params: any) {
  const dto = {
    ...params,
  };
  const { id, clueEvidenceList, ...obj } = dto;
  const para = {
    caseProgress: { ...obj, ...(id ? { id } : {}) },
    caseClueList: clueEvidenceList?.map((item: any) => {
      const { id, image, ...obj } = item;
      image && (obj.imgUrls = image.map((v: any) => {
        const path = Object.prototype.toString.call(v) === '[object Object]' ? v.path : v
        return path
      }).join(","));
      return obj;
    }),
  };
  return id ? await editCaseProgress(para) : await addCaseProgress(para);
}

/** ------- 涉案人员 ------- */

// 获取涉案人员列表
export async function qureyCaseSuspectsList(pageInfo: PageInfo, params: any) {
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
  };
  const res = await qureyCaseSuspects(dto);
  if (res?.records) {
    matching(res.records, sexDict, "gender");
  }
  res?.records?.map((item: any) => {
    const { facePath, updateBy, createBy, updateTime, createTime } = item;
    item.facePathArray = facePath ? facePath.split(",") : [];
    item.handleName = updateBy || createBy || "";
    item.handleTime = updateTime || createTime || "";
    return item;
  });
  return {
    data: res.records,
    total: res.total,
  };
}

// 涉案人员关系图谱
export async function getLegalCaseRelation(dto: any) {
  const { time, suspectIds, ...para } = dto
  const timeNumTodayjs: { [key: number]: any[] } = {
    0: [7, 'day'],
    1: [1, 'month'],
    2: [3, 'month'],
    3: [6, 'month'],
  }
  const dayjsObj = timeNumTodayjs[time]
  const params = {
    ...para,
    beginTime: dayjs().subtract(dayjsObj[0], dayjsObj[1]).format(YMDHms),
    endTime: dayjs().format(YMDHms),
    suspectIds: suspectIds.join(",")
  }

  const data = await qureyLegalCaseRelation(params)

  return {
    data
  }

}


// 查询单条涉案人员
export async function getCaseSuspectsDetail(id: any) {
  return await getCaseSuspects({ id });
}

// 新增涉案人员
export async function addCaseSuspectsItem(params: any) {
  const dto = params?.peroson.map((item: any) => {
    return {
      caseId: params?.caseId,
      personId: item,
    };
  });
  return await addCaseSuspects(dto);
}

// 删除涉案人员
export async function deleteCaseSuspects(id: any) {
  return await delCaseSuspects(id);
}

export async function getAreaList() {
  const dto: any = {
    pageNumber: 1,
    pageSize: -1,
  };
  const vo = await getSysAreaList(dto);

  vo.forEach((ele: any) => {
    ele.value = ele.code;
    ele.label = ele.name;
    ele.parentId = ele.parentCode;
  });
  const tree = arrayToTree(vo, {
    id: "code",
    rootParentIds: { "0": true },
    dataField: null,
  });

  return tree;
}

/** 查看结果 */
export async function qureyAnalyzeTaskList(params: any) {
  const dto = {
    pageNumber: 1,
    pageSize: -1,
    ...params,
  };
  const res = await analyzeTaskList(dto);
  if (res?.records) {
    matching(res.records, judgmentStatusDict, "status");
  }
  return res.records;
}

/** 更新视图信息 */
export async function updateCaseMediumUrls(params: any) {
  return await updateCaseUrls(params);
}
