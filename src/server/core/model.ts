import { PageInfo } from "hooks/integrity/TableInterface";
import {
  getModelDetail,
  getModelList,
  modelTaskAdd,
  modelTaskDelete,
  modelTaskEdit,
  updateModelStatusApi,
} from "../../api/model";
import _ from "lodash";
import { getLabelTable } from "../label";
import { getDictDataByType } from "../system";
import dayjs from "dayjs";
import {
  getBehavirecordCountByDate,
  getBehavirecordCountByEventType,
  getBehavirecordCountByTimeInterval,
  getBehavirecordList,
} from "../../api/search";
import { YMDHms } from "../../helper";
import {
  getBehivorEchartsLine,
  getBehivorEchartsPieSimple,
} from "../../helper/echartsConfig";
import { recordTargetDict, shipListTypeDict, Type } from "../../helper/dictionary";
import { message } from "antd";
import { getAreaListByIds } from "./controlManage";

//获取智慧建模列表
export async function getModelListAsync(pageInfo: PageInfo, params?: any) {
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
    conditionType: params.conditionType && params.conditionType.toString(),
  };
  let vo = await getModelList(dto);
  let riskTypeList = await getLabelTable({ type: 7 });

  let data = vo.records;
  for (let i = 0; i < data.length; i++) {
    //格式化回溯时长
    let str = data[i].backDuration.split("#");
    let day = Number(str[0]) > 0 ? str[0] + "天" : "";
    let hour = Number(str[1]) > 0 ? str[1] + "时" : "";
    let minute = Number(str[2]) > 0 ? str[2] + "分" : "";
    if (data[i].backDuration) {
      data[i].backDurationName = day + hour + minute;
    }

    //格式化预警条件
    let conditionType = data[i].conditionType;
    if (data[i].conditionType && conditionType.length > 0) {
      let conditionTypeArr = conditionType.split(";");
      let arr = [];
      for (let i = 0; i < conditionTypeArr.length; i++) {
        arr.push(conditionTypeArr[i].split(":")[1]);
      }
      data[i].conditionTypeName = arr.join(" , ");
    }

    //格式化风险类别
    let riskType = riskTypeList.data.filter((item: any) => {
      return item.id === data[i].riskTypeId;
    });
    data[i].riskTypeIdName = riskType.length > 0 && riskType[0].labelName;
  }

  return {
    data: data,
    total: vo.total,
  };
}

//新增模型
export async function modelTaskAddAsync(params: any) {
  let dto = { ...params };
  return await modelTaskAdd(dto);
}

//删除智慧建模
export async function modelTaskDeleteAsync(id: any) {
  await modelTaskDelete(id);
}

//获取智慧建模详情
export async function getModelDetailAsync(id: any) {
  let result = await getModelDetail(id);
  return {
    ...result,
    riskLevel: _.toNumber(result.riskLevel),
    status: _.toNumber(result.status),
    publicType: _.toNumber(result.publicType),
    day: (result.backDuration && result.backDuration.split("#")[0]) || 0,
    hour: (result.backDuration && result.backDuration.split("#")[1]) || 0,
    minute: (result.backDuration && result.backDuration.split("#")[2]) || 0,
  };
}

//编辑智慧建模
export async function modelTaskEditAsync(params: any) {
  return await modelTaskEdit(params);
}

// 模型列表中修改模型状态
export async function updateModelStatusAsync(params: any) {
  return await updateModelStatusApi(params);
}

//获取船型列表
export async function getShipTypeListAsync() {
  let [result] = await Promise.all([getDictDataByType("archive_ship_type")]);
  return result;
}
//获取船籍列表
export async function getShipRegistryListAsync() {
  let [result] = await Promise.all([getDictDataByType("sys_country")]);
  return result;
}

//获取风险类别下拉
export async function getRiskTypeList(): Promise<Type<any>[]> {
  const vo: any = await getLabelTable({ type: 7 });
  return vo.data.map((item: any) => ({ value: item.id, name: item.labelName }));
}
export async function getWarnList() {
  const vo: any = await getDictDataByType("model_type");
  return vo;
}

//按照需求，曾去地、或运算、与运算、船型、船籍不需要记录行为
export async function getWarnListSpecial() {
  const vo: any = await getDictDataByType("behaviour_type");
  return vo
  /* return vo.filter((item: any) => {
    return (
      item.name !== "曾去地" &&
      item.name !== "或运算" &&
      item.name !== "与运算" &&
      item.name !== "船型" &&
      item.name !== "船籍" &&
      item.name !== "线索目标"
    );
  }); */
}

// 智慧建模-行为记录-行为记录列表
export async function getWisdomRecordList(pageInfo: PageInfo, params: any) {
  const dto: any = {
    ...pageInfo,
    ...params,
  };
  if (params.datetime) {
    dto.startTime = dayjs(params.datetime[0]).format("YYYY-MM-DD HH:mm:ss");
  }
  if (params.datetime) {
    dto.endTime = dayjs(params.datetime[1]).format("YYYY-MM-DD HH:mm:ss");
  }

  if (params.eventType) {
    dto.eventType = params.eventType && params.eventType.toString();
  }

  if (params.focusType === -1) {
    _.unset(dto, "focusType");
  }

  _.unset(dto, "datetime");
  const vo = await getBehavirecordList(dto);
  vo.records.forEach((item: any, index: number) => {
    item.lonLatName = `${item.firstLat},${item.firstLng}`;
    item.src = item.picUrl1 && item.picUrl1.picUrl;
    item.video = item.videoUrl1 && item.videoUrl1.videoUrl;
    item.index = (pageInfo.pageNumber - 1) * pageInfo.pageSize + index + 1;
  });

  //格式化目标
  for (let i = 0; i < recordTargetDict.length; i++) {
    vo.records.forEach((item: any) => {
      if (item.codeType === recordTargetDict[i].value) {
        item.targetName = recordTargetDict[i].name + " : " + item.codeValue;
      }
    });
  }
  //格式化船舶分类
  for (let i = 0; i < shipListTypeDict.length; i++) {
    // focusType
    vo.records.forEach((item: any) => {
      if (item.focusType === shipListTypeDict[i].value) {
        item.focusTypeName = shipListTypeDict[i].name;
      }
    });
  }
  return {
    data: vo.records,
    total: vo.total,
  };
}

/** 智慧建模-行为记录-行为分类统计*/
export async function getWisdomActionlOptions(param: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1,
  };
  const dto: any = {
    endTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    ...pageInfo,
  };
  if (param.actionDate === "month") {
    dto.beginTime = dayjs().subtract(1, "M").format(YMDHms);
  } else {
    dto.beginTime = dayjs().subtract(1, "y").format(YMDHms);
  }

  const [vo] = await Promise.all([getBehavirecordCountByEventType(dto)]);
  const data = vo.map((ele: any) => {
    return {
      name: ele.labelName,
      value: Number(ele.itemNum),
    };
  });

  return getBehivorEchartsPieSimple({
    seriesData: data,
  });
}

/** 智慧建模-行为记录-触发时段统计*/
export async function getWisdomTriggerIntervalOptions(param: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1,
  };
  const dto: any = {
    endTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    ...pageInfo,
  };

  if (param.timeDate === "month") {
    dto.beginTime = dayjs().subtract(1, "M").format(YMDHms);
  } else {
    dto.beginTime = dayjs().subtract(1, "y").format(YMDHms);
  }

  return await getBehavirecordCountByTimeInterval(dto);
}

/** 智慧建模-行为记录-每日行为统计*/
export async function getWisdomCountByDateOptions(param: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1,
  };
  const dto: any = {
    beginTime: dayjs(param.dateRange[0]).format("YYYY-MM-DD") + ' 00:00:00',
    endTime: dayjs(param.dateRange[1]).format("YYYY-MM-DD") + ' 23:59:59',
    ...pageInfo,
  };

  const vo = await getBehavirecordCountByDate(dto);
  let dayArr: any = []; //日期
  let dataArr: any = []; //值

  vo.forEach((ele: any) => {
    dayArr.push(ele.labelName);
    dataArr.push(Number(ele.itemNum));
  });

  return getBehivorEchartsLine({
    xAxisData: dayArr,
    seriesData: dataArr,
  });
}

//判断必要条件是否填写完整
export function validateModelConditionComplete(flowGraphData: any) {
  //获取流程图的所有节点
  let cells = JSON.parse(flowGraphData).cells.filter((item: any) => {
    //过滤掉连线的节点
    return item.shape !== "edge";
  });

  //获取流程图线条，用于判断与运算和或运算是否有前置条件
  let lines = JSON.parse(flowGraphData).cells.filter((item: any) => {
    //过滤掉连线的节点
    return item.shape === "edge";
  });
  //获取线条的targetId
  let lineTargetIds = [];
  for (let i = 0; i < lines.length; i++) {
    lineTargetIds.push(lines[i].target.cell);
  }

  //获取与运算，或运算节点
  let specialNodes = cells.filter((item: any) => {
    return item.type === "orCount" || item.type === "withCount";
  });
  //与运算，或运算的节点id
  let specialNodesIds = [];
  for (let i = 0; i < specialNodes.length; i++) {
    specialNodesIds.push(specialNodes[i].id);
  }

  //与运算和或运算需要前置条件，根据线条的targetId，和与或运算的id对比，进行判断
  for (let i = 0; i < specialNodesIds.length; i++) {
    if (!lineTargetIds.includes(specialNodesIds[i])) {
      message.error("与、或运算需设定前置条件！");
      return false;
    }
  }

  let arr = [];
  for (let i = 0; i < cells.length; i++) {
    let conditionType = cells[i].data.eventName;
    let conditionData = cells[i].data;
    switch (conditionType) {
      case "超速":
        if (!conditionData.minSpeed) {
          arr.push('"超速" 的航速必填');
        }
        break;
      case "怠速":
        if (!conditionData.minSpeed) {
          arr.push('"怠速" 的航速必填');
        }
        break;
      case "越线":
        if (!conditionData.lineId || _.isEmpty(conditionData.lineId)) {
          arr.push('"越线" 的警戒线必填');
        }
        break;
      case "靠岸":
        if (!conditionData.minMinute) {
          arr.push('"靠岸" 的预到时长必填');
        }
        if (!conditionData.lineId || _.isEmpty(conditionData.lineId)) {
          arr.push('"靠岸" 的岸线必填');
        }
        break;
      case "进出区域":
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)) {
          arr.push('"进出区域" 的区域必填');
        }
        break;
      case "海面停泊":
        if (!conditionData.minMinute) {
          arr.push('"海面停泊" 的停泊时长必填');
        }
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)) {
          arr.push('"海面停泊" 的区域必填');
        }
        break;
      case "偏航":
        if (!conditionData.yawDistance) {
          arr.push('"偏航" 的偏航距离必填');
        }
        if (!conditionData.minDistance) {
          arr.push('"偏航" 的航道行驶距离必填');
        }
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)) {
          arr.push('"偏航" 的航道必填');
        }
        break;

      case "曾去地":
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)) {
          arr.push('"曾去地" 的曾去区域必填');
        }
        if (!conditionData.minMinute) {
          arr.push('"曾去地" 的曾去时间必填');
        }
        break;
      case "两船靠泊":
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)) {
          arr.push('"两船靠泊" 的靠泊区域必填');
        }
        break;
      case "并行行驶":
        if (!conditionData.minMinute) {
          arr.push('"并行行驶" 的并行时长必填');
        }
        /* if(!conditionData.minDistance || _.isEmpty(conditionData.minDistance)){
          arr.push('"并行行驶" 的两船距离必填');
        }
        if(!conditionData.maxDistance || _.isEmpty(conditionData.maxDistance)){
          arr.push('"并行行驶" 的两船距离必填');
        } */
        break;
      case "尾随行驶":
        if (!conditionData.minMinute) {
          arr.push('"尾随行驶" 的尾随时长必填');
        }
        /*  if(!conditionData.minDistance || _.isEmpty(conditionData.minDistance)){
           arr.push('"尾随行驶" 的两船距离必填');
         }
         if(!conditionData.maxDistance || _.isEmpty(conditionData.maxDistance)){
           arr.push('"尾随行驶" 的两船距离必填');
         } */
        break;
      case "船型":
        if (conditionData.shipType.length === 0) {
          arr.push('"船型" 的船型必填');
        }
        break;
      case "船籍":
        if (conditionData.shipRegistry.length === 0) {
          arr.push('"船籍" 的船籍必填');
        }
        break
    }
  }
  if (arr.length > 0) {
    let result = Array.from(new Set(arr)); //数组去重
    message.error({
      content: result.join(" ; "),
      duration: 6,
    });
    return false;
  } else {
    return true;
  }
}

//获取智慧建模区域
export async function getModelAreaById(id: any, signal?: AbortController) {
  const modelDetail = await getModelDetail(id, { signal });
  const json = JSON.parse(modelDetail.modelJson)
  const nodes = json.eventParams
  let ids: number[] = []
  nodes.forEach((item: any) => {
    if (item.attributeJson.areaId) {
      ids = ids.concat(item.attributeJson.areaId)
    }
    if (item.attributeJson.lineId) {
      ids = ids.concat(item.attributeJson.lineId)
    }
  })
  if (ids.length !== 0) {
    ids = _.uniq(ids)
    const idsStr = ids.toString()
    const allArea = await getAreaListByIds(idsStr)

    // 根据区域大小排序区域、避免大区域覆盖小区域从而无法点击小区域
    allArea.forEach(item => {
      const graphObj = JSON.parse(item.graph)
      item.graphObj = graphObj
      if (graphObj.geometry.type === 'Polygon') {
        item.layerType = 'Polygon'
        const [target] = graphObj.geometry.coordinates
        const pointList = target.map(([lng, lat]: any[]) => [lat, lng])
        const polygon = turf.polygon([pointList]);
        item.size = turf.area(polygon)
      } else if (graphObj.properties.subType === 'Circle') {
        item.layerType = 'Circle'
        item.size = 3.14 * graphObj.properties.radius * graphObj.properties.radius
      } else if (graphObj.properties.subType === 'Line') {
        item.layerType = 'Line'
        item.size = 1
      }
    })
    const areaList = allArea.sort((a, b) => b.size - a.size)

    areaList.forEach(item => {
      const node = nodes.find((node: any) => node.attributeJson.areaId?.includes(item.id) || node.attributeJson.lineId?.includes(item.id))
      item.node = node
    })

    return areaList
  } else {
    return []
  }
}