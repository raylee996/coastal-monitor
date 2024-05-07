import { exportFile } from "api/common";
import {
  addArea,
  addControl,
  cancel,
  cancelControl,
  continueControl,
  delArea,
  deleteControl,
  editArea,
  getAreaData,
  getAreaListAll,
  getControlInfoList,
  getControlList,
  getAreaInfoById,
  updateControl,
} from "api/core/controlManage";
import { getControlInfoByIdV2 } from "api/place";
import dayjs from "dayjs";
import { YMD, YMDHms } from "helper";
import matching, {
  AlarmConditionDict,
  ControlLevelDict,
  ControlStatusDict,
  graphicalTypeDict,
  Type,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import moment from "moment";
import { getDictDataByType } from "server/system";

export async function getAllControlList(pageInfo: PageInfo, params: any) {

  let createTimeStart
  let createTimeEnd
  if (params.createTime) {
    createTimeStart = dayjs(params.createTime[0]).format(YMD) + ' 00:00:00'
    createTimeEnd = dayjs(params.createTime[1]).format(YMD) + ' 23:59:59'
  }
  _.unset(params, 'createTime')
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
    createTimeStart,
    createTimeEnd
  };
  const res = await getControlList(dto);
  const publicWayDict = await getDictDataByType("public_type")
  if (res?.records) {
    matching(res.records, ControlStatusDict, "controlStatus");
    matching(res.records, ControlLevelDict, "controlLevel");
    for (let i = 0; i < res.records.length; i++) {
      for (let j = 0; j < publicWayDict.length; j++) {
        if (res.records[i].publicWay === Number(publicWayDict[j].value)) {
          res.records[i].publicWayName = publicWayDict[j].name
        }
      }
    }
    res.records &&
      res.records.map((item: any) => {
        matching(
          [item.shipConditionJson],
          AlarmConditionDict,
          "alarmCondition"
        );

        item.areaId = [item?.areaId];
        item.shipConditionJson.alarmConditionShipFaceIds =
          item?.shipConditionJson?.alarmConditionShipFaceIds?.split(",");

        return item;
      });
  }
  return {
    data: res.records,
    total: res.total,
  };
}

export async function addControlItem(
  result: any,
  flowGraphData: any,
  key: string,
  isAdd: boolean
) {
  const { approveDeptId, approvePersonId, areaId, ...obj } =
    result;
  let dto = {
    ...obj,
  };
  // 拼装审批信息json
  dto.approvalJson = {
    approveDeptId: _.last(approveDeptId),
    approvePersonId,
  };
  // 信息json
  dto.areaId = _.last(areaId)
  // 处理船舶信息
  let shipObj = [];
  if (key === "ship") {
    shipObj = flowGraphData.map(
      (item: { [x: string]: any; controlScope: any }) => {
        let { controlScope, alarmCondition, speed } = item.shipConditionJson;
        let obj: { [key: string]: any } = {};
        obj.shipConditionJson =
          controlScope === "0"
            ? { controlScope, alarmCondition, speed }
            : item.shipConditionJson;

        obj.shipConditionJson.alarmConditionShipFaceIds &&
          (obj.shipConditionJson.alarmConditionShipFaceIds =
            obj.shipConditionJson?.alarmConditionShipFaceIds
              ?.map((v: any) => v.path)
              .join(","));

        return obj;
      }
    );
  }
  shipObj.map((item: any) => {
    dto = { ...dto, ...item };
    return item;
  });

  console.log(dto, "dto");

  const res = isAdd ? await addControl(dto) : await updateControl(dto);
  return res;
}

// export async function updataControlItem(
//   result: any,
//   flowGraphData: any,
//   key: string
// ) {
//   enum ObjectKeys {
//     ship = "shipConditionJson",
//     people = "personCtrlJson",
//     phone = "phoneConditionDto",
//     car = "carConditionDto",
//   }
//   let dto = {
//     ...result,
//   };
//   let shipObj = [];
//   if (key === "ship") {
//     shipObj = flowGraphData.map(
//       (item: { [x: string]: any; controlScope: any }) => {
//         let { controlScope, alarmCondition } = item.ship;
//         let obj: { [key: string]: any } = {};
//         obj[ObjectKeys["ship"]] =
//           controlScope === 0 ? { controlScope, alarmCondition } : item.ship;
//         return obj;
//       }
//     );
//   }
//   shipObj.map((item: any) => {
//     dto = { id: 0, ...dto, ...item };
//     return item;
//   });
//   const res = await updateControl(dto);
//   return res;
// }

export async function continueControlItem(dto: any) {
  const { approveDeptId, ...params } = dto
  params.approveDeptId = _.last(approveDeptId)
  return await continueControl(params);
}

export async function cancelControlItem(dto: any) {
  const { approveDeptId, ...params } = dto
  params.approveDeptId = _.last(approveDeptId)
  return await cancelControl(params);
}

export async function cancelItem(dto: any) {
  return await cancel(dto);
}

export async function deleteControlItem(dto: any) {
  return await deleteControl(dto);
}

export async function exportAllControl(dto: any) {
  const { pageNumber, pageSize, createTime, ...obj } = dto;
  let params: { [key: string]: any } = {};
  Object.keys(obj).map((item) => {
    obj[item] && (params[item] = obj[item]);
    return item;
  });
  if (createTime) {
    createTime[0] &&
      (params.createTimeStart = moment(createTime[0]).format("YYYY-MM-DD"));
    createTime[1] &&
      (params.createTimeEnd = moment(createTime[1]).format("YYYY-MM-DD"));
  }

  return await exportFile(
    {
      url: "/alarm/controlInfo/exportControlInfoExcel",
      extra: params,
    },
    { method: "get" }
  );
}

export async function getAllAreaList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...params,
  };
  const res = await getAreaListAll(dto);
  matching(res, graphicalTypeDict, "type");
  return {
    data: res,
    total: 0,
  };
}

// 查询所有区域数据用于select展示
export async function getAreaList(params: any): Promise<Type<string>[]> {
  let dto = {
    ...params,
  };
  const res = await getAreaListAll(dto);
  return res.map((item: { name: any; id: any }) => {
    let obj: Type<string> = {
      name: item.name,
      value: item.id,
    };
    return obj;
  });
}

export async function addAreaServe(params: any) {
  const dto = {
    ...params,
  };
  return await addArea(dto);
}

/** 人车布控选择区域中的新增区域 */
export async function addCtrAreaData(name: string, deviceCodeList: string[], graph?: any) {

  const dto: any = {
    name,
    controlTypeId: '2' // 1船舶布控 2人车布控
  }

  if (graph) {
    if (graph?.geometry.type === 'Polygon') {
      dto.type = '4'
    } else if (graph?.properties.subType === 'Circle') {
      dto.type = '2'
    }
    dto.graph = JSON.stringify(graph)
  }

  if (deviceCodeList.length) {
    dto.deviceCodes = deviceCodeList.join(',')
  }

  return await addArea(dto);
}

/** 人车布控选择区域中的编辑区域 */
export async function editCtrAreaData(id: number, name: string, deviceCodeList: string[], graph?: any) {

  const dto: any = {
    id,
    name,
    controlTypeId: '2' // 1船舶布控 2人车布控
  };

  if (graph) {
    if (graph?.geometry.type === 'Polygon') {
      dto.type = '4'
    } else if (graph?.properties.subType === 'Circle') {
      dto.type = '2'
    }
    dto.graph = JSON.stringify(graph)
  }

  if (deviceCodeList.length) {
    dto.deviceCodes = deviceCodeList.join(',')
  }

  return await editArea(dto);
}

export async function editAreaServe(params: any) {
  const dto = {
    ...params,
  };
  return await editArea(dto);
}

export async function deleteAreaServe(id: any) {
  return await delArea(id);
}

// 获取区域表格分页数据
export async function getAreaTable(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };
  const data = await getAreaData(dto);
  return {
    data: data.records,
    total: data.total,
  };
}
//获取区域表格选中的数据
export async function getSelectedAreaTable() {
  let dto = {
    pageSize: -1,
    pageNumber: 1,
  };
  const data = await getAreaData(dto);
  return {
    data: data.records,
  };
}

// 获取区域单条数据
export async function getAreaOne(params: any) {
  const data = await getAreaInfoById(params.id);
  return data?.graph ? JSON.parse(data.graph) : null;
}

export async function getAreaTwo(params: any) {
  const data = await getAreaInfoById(params.id);
  return {
    graph: data?.graph ? JSON.parse(data.graph) : null,
    type: data?.type
  }
}

export async function getAreaDataById(id: number) {
  const vo = await getAreaInfoById(id);
  return vo;
}

// 获取指定ids的区域数据
export async function getAreaListByIds(ids: string): Promise<any[]> {
  let dto = {
    ids,
    pageSize: -1,
    pageNumber: 1,
  };
  const data = await getAreaData(dto);
  return data.records;
}

// 布控区域-地图展示
export async function getControAll() {
  const dto = {
    controlStatus: 3, // 1:待审批,2:已撤回,3:已布控,4:已撤控,5:已驳回
  };
  const vo = await getControlList(dto);
  return vo;
}

/** 布控管理-人员布控-布控区域下拉 */
export async function doGetAreainfoList(params?: any) {
  let tempArr: any[] = [];
  // 查询区域记录列表
  const voArea = await getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '2,3,4', ...params })
  // const voArea = await getStatisticsAreainfoList(dto);
  voArea.data.forEach((element2: any) => {
    tempArr.push({
      value: element2.id,
      name: element2.name,
    });
  });

  return {
    data: tempArr,
  };
}

// 布控区域-人员布控列表
export async function doGetControlInfoList(pageInfo: PageInfo, params: any) {
  const dto: any = {
    ...pageInfo,
    ...params,
    controlCategory: 2, //布控类型(1: 船舶布控, 2:人车布控, 3: 场所布控, 4:智慧建模, 5: 视频布控)
    controlName: params.controlName,
  };

  if (params.createTime) {
    dto.createTimeStart = dayjs(params.createTime[0]).format(YMDHms);
    dto.createTimeEnd = dayjs(params.createTime[1]).format(YMDHms);
  }

  _.unset(dto, 'createTime')

  const vo = await getControlInfoList(dto);
  const publicWayDict = await getDictDataByType("public_type")

  matching(vo.records, ControlStatusDict, "controlStatus");
  for (let i = 0; i < vo.records.length; i++) {
    for (let j = 0; j < publicWayDict.length; j++) {
      if (vo.records[i].publicWay === Number(publicWayDict[j].value)) {
        vo.records[i].publicWayName = publicWayDict[j].name
      }
    }
  }
  return {
    data: vo.records,
    total: vo.total,
  };
}

// 布控区域-新增人员布控
export async function doAddControlPerson(params: any) {
  const { approveDeptId, approvePersonId, areaId, ...otherParams } = params;

  // let areaDeviceCodes = areaIdAreaDeviceCodes.deviceCodeList || []
  // let areaId = areaIdAreaDeviceCodes.ids

  const _areaId = Array.isArray(areaId) ? areaId[0] : areaId

  const areaInfo = await getAreaInfoById(_areaId)

  const dto = {
    ...otherParams,
    areaId: _areaId,
    areaDeviceCodes: areaInfo.deviceCodes,
    approvalJson: {
      approveDeptId: _.last(approveDeptId),
      approvePersonId,
    },
    controlCategory: 2,
  };

  if (params.id) {
    await updateControl(dto);
  } else {
    await addControl(dto);
  }
}

/** 获取布控详情 */
export async function getControlData(id: any, signal?: AbortController) {
  const dto = {
    id,
  };
  const vo = await getControlInfoByIdV2(dto, { signal });
  // 获取所有区域的列表
  const allAreaList = await getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '2,3,4' })
  // 判断所有区域中是否包含当前区域。有些区域被删除了，所以报错。
  let hasAreaIdInAllAreaList = allAreaList.data.some((item: any) => item.id === vo.areaId)

  const result = {
    ...vo,
    ...vo.approvalJson,
    controlLevel: String(vo.controlLevel),
    publicWay: String(vo.publicWay),
    isOpenSms: String(vo.isOpenSms),
    areaId: hasAreaIdInAllAreaList ? [vo.areaId] : null,
    areaIdAreaDeviceCodes: {
      ids: hasAreaIdInAllAreaList ? [vo.areaId] : null,
      deviceCodeList: vo.areaDeviceCodes ? vo.areaDeviceCodes.split(',') : []
    }
  };
  return result;
}

// 获取人车布控使用的区域表格分页数据
export async function getAreaOptionsAndRecords(signal?: AbortController) {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    // type: '2,3,4',
    controlTypeId: '2'  // 1船舶布控 2人车布控
  }

  const data = await getAreaData(dto, { signal });

  const options = data.records.map((item: any) => ({ label: item.name, value: item.id }))

  return [options, data.records]
}