import { graphqlPlace, getPlacesList, removePlaceData, addPlacesList, eidtPlacesList, getPlaceListDetail, getPlacePersonList, placesPersonAdd, placesPersonEdit, placesPersonGetInfo, placeDelPerson, getPlacesCaseList, placeAddCase, placeRemoveCase, getPlacesAllDevices, placeAddDevice, placeDelDevice, getControlInfoByIdV2, getPlacePort, getTrackList, getFocusAreaWarn, getLabelByPlaceId, addPlaceCtrl, updatePlaceCtrl } from "api/place";
import { getAlarmDayStatistics, getAlarmHourStatistics, getShipsStatistics, getAlarmLevelStatistics, getAlarmWarnTypeStatsStatistics } from "api/statistics";
import { getShipWarnLevelOptions, YMDHms } from "helper";
import { carDescTypeDict, getDictName, matchingByConvert, matchingByKeyArray, personTypeDict, positionStatusDict, readDictByConvert, sexDict, Type } from "helper/dictionary";
import { getBehivorEchartsLine, getEchartsPieSimple, getEchartsStackedLine, getShipType } from "helper/echartsConfig";
import moment, { Moment } from "moment";
import { getDictDataByType } from "./system";
import { PageInfo } from "hooks/integrity/TableInterface";
import matching, {
  riskLevelOptions
} from "helper/dictionary";
import { getDeviceAll, getDevicesList } from "api/device";
import _ from "lodash";
import { getShipWarnList } from "api/ship";
import dayjs, { Dayjs } from "dayjs";
import { addControl, updateControl } from "api/core/controlManage";
import common from "helper/common";
import { getShipListTable } from "./ship";
import { queryThermalMapApi } from "api/core/entryExitRecords";
import { getLabelList, getPlaceLabel } from "api/label";
import { queryDeviceDict } from "./core/wisdomSearch";
/**场所列表 */
export async function getPlaceList() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
            list(pageInfo: $pageInfo){
              id
              placeName 
              placeType
              riskLevel 
              placeArea 
              placeAddress 
              equipmentNum 
              caseNum 
              lastCaseTitle
            } 
        }`,
    variables: {
    },
  };

  const res = await graphqlPlace(dto);
  return {
    data: res.data.data.list,
    total: 50,
  };
}
/**场所列表 */
export async function getQueryPlaceList(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };
  const data = await getPlacesList(dto);
  matching(data.records, riskLevelOptions, "level");
  data.records = data.records.map((item: any, index: number) => {
    return {
      ...item,
      index: (pageInfo.pageNumber - 1) * pageInfo.pageSize + index + 1 //列表序号
    }
  })
  return {
    data: data.records,
    total: data.total,
  };
}

// 场所列表-新增
export async function doEditPlacesListData(params: any) {
  const { placeAreaMap, ...para } = params
  let dto = {
    ...para,
    graph: JSON.stringify(placeAreaMap),
  }

  let deviceAll = await getDeviceAllAsync() || [];

  let panoramaList: any = null
  // 全景摄像头
  if (dto.allViewCameraId) {
    panoramaList = deviceAll.filter((item: any) => {
      return item.value === dto.allViewCameraId
    })
  }

  let detailList: any = null
  // 细节摄像头
  if (dto.detailViewCameraId) {
    detailList = deviceAll.filter((item: any) => {
      return item.value === dto.detailViewCameraId
    })
  }

  if (panoramaList && panoramaList.length > 0) {
    dto.panoramaList = [{
      deviceId: panoramaList[0].id,
      deviceCode: panoramaList[0].deviceCode,
      workType: 3
    }];
  }

  if (detailList && detailList.length > 0) {
    dto.detailList = [{
      deviceId: detailList[0].id,
      deviceCode: detailList[0].deviceCode,
      workTye: 4
    }]
  }



  // 省市区下拉的值，若操作则反回数组，否则反回最后地区字符
  /* if (params.areas) {
    if (params.areas.constructor.name.toLowerCase() === "string") {
      dto.areaCode = params.areas
    } else {
      dto.areaCode = params.areas[2]
    }
  } else {
    dto.areaCode = ''
  } */

  const addDto = {
    ...dto,
    isAuto: 1
  }

  const vo: any = dto.id ? await eidtPlacesList(dto) : await addPlacesList(addDto)
  return vo;
}

// 场所列表-删除
export async function deletePlaceList(params: any) {

  const vo = await removePlaceData(params)

  return vo;
}
// 场所列表-id详情
export async function getPlaceListDetailinfos(params: any) {
  const vo = await getPlaceListDetail(params)

  if (vo?.panoramaList?.length) {
    vo.allViewCameraId = vo.panoramaList[0].deviceId
  }

  if (vo?.detailList?.length) {
    vo.detailViewCameraId = vo.detailList[0].deviceId
  }

  // 回显图形
  if (vo?.graph) {
    vo.placeAreaMap = JSON.parse(vo.graph)
  }

  return vo;
}

// 场所列表-id详情
export async function getPlaceFormData(id: number, signal: AbortController) {

  const dto = {
    id
  }

  const vo = await getPlaceListDetail(dto, { signal })

  // 回显图形
  if (vo?.graph) {
    vo.placeAreaMap = JSON.parse(vo.graph)
  }

  return vo;
}

// 重点场所-新增-获取所以摄像头设备
export async function getDeviceAllAsync() {
  const dto = {
    current: 1,
    size: -1
  }
  const vo = await getDeviceAll(dto);
  let res = vo.map((item: any) => {
    return {
      name: item.name,
      value: item.id,
      ...item
    }
  })
  return res

}


/**设备列表 */
export async function getEquipmentList() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      equimentList(pageInfo: $pageInfo){
              id
              equiName
              equiType
              address
              nodes {
                id
                equiName
              }
            } 
        }`,
    variables: {
    },
  };

  const res = await graphqlPlace(dto);
  return {
    data: res.data.equimentList,
    total: 50,
  };
}



/**车牌列表 */
export async function getCarNumList() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      carNumList(pageInfo: $pageInfo){
              id
              name
              type             
            } 
        }`,
    variables: {
    },
  };

  const res = await graphqlPlace(dto);

  return {
    data: res.data.data.carNumList,
    total: 50,
  };
}


/**侦码列表 */
export async function getDetectiveCodeList() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      detectiveCodeList(pageInfo: $pageInfo){
              id
              name
              type             
            } 
        }`,
    variables: {
    },
  };

  const res = await graphqlPlace(dto);

  return {
    data: res.data.data.detectiveCodeList,
    total: 50,
  };
}




/** 重点场所-数据信息-进出港数据-船型统计*/
export async function getShipTypeOptions(param: any) {
  const dto: any = {
    // endWarnTime: moment().format(YMDHms)
    ...param
  }

  /* if (param === 'today') {
    dto.startWarnTime = moment().subtract(0, 'day').format(YMDHms)
  } else if (param === 'week') {
    dto.startWarnTime = moment().subtract(7, 'day').format(YMDHms)
  } else if (param === 'month') {
    dto.startWarnTime = moment().subtract(1, 'M').format(YMDHms)
  } */

  //const [vo, levelDict] = await Promise.all([getShipsStatistics(dto), getDictDataByType('risk_level')])
  const vo = await getShipsStatistics(dto)
  const data = vo.map((ele: any) => {
    // const name = getDictName(levelDict, ele.dataItem)
    return {
      name: ele.labelName,
      value: Number(ele.itemNum)
    }
  })
  const options = getShipType(data)

  return options;
}


/** 重点场所-数据信息-进出港数据-近1天热力图*/
export async function getThermodynamicOptions(param: string) {

  const dto = {
    placeId: param,
    type: 1
  }

  const vo = await queryThermalMapApi(dto);

  let hourArr: string[] = []
  let inData: number[] = []
  let outData: number[] = []

  vo.forEach((item: any) => {
    hourArr.push(item.time)
    inData.push(item.entry)
    outData.push(item.exit)
  })

  const options = getEchartsStackedLine({
    legendData: ["进港", "出港"],
    xAxisData: hourArr,
    series: [{
      name: '进港',
      type: 'line',
      stack: 'Total',
      symbol: 'none', //去除拐点
      smooth: true, //平滑曲线
      data: inData,
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
      data: outData,
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
  })

  return options;
}

/** 重点场所-场所布防-每日预警统计*/
export async function getDailyWarningOptions(param: any) {
  const dto: any = {
    endWarnTime: moment().set('h', 23).set('m', 59).set('s', 59).format(YMDHms),
    areaId: param.id
  }


  if (param.time === undefined || param.time?.length === 0) {
    dto.startWarnTime = dayjs().subtract(7, 'day').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.startWarnTime = dayjs(param.time[0]).set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
    dto.endWarnTime = dayjs(param.time[1]).set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  const [vo] = await Promise.all([getAlarmDayStatistics(dto)])

  let timeArr = []
  let valArr = []
  if (vo.length !== 0) {
    for (let i = 0; i < vo.length; i++) {
      timeArr.push(dayjs(vo[i].dataItem).format('MM-DD'))
      valArr.push(Number(vo[i].count))
    }
  }

  // const options = getEchartsStackedLine({
  //   title: {
  //     text: ''
  //   },
  //   legendData: ["每日"],
  //   xAxisData: timeArr,
  //   series: [{
  //     name: '每日',
  //     type: 'line',
  //     stack: 'Total',
  //     data: valArr
  //   }
  //   ]
  // })

  const options: any = getBehivorEchartsLine({
    xAxisData: timeArr,
    seriesData: valArr
  })

  return options;
}


/** 重点场所-数据信息-进出港数据-船型统计*/
export async function getInOutPortQuantity(param: string) {
  const dto: any = {
    endWarnTime: moment().format(YMDHms)
  }

  if (param === 'today') {
    dto.startWarnTime = moment().subtract(0, 'day').format(YMDHms)
  } else if (param === 'week') {
    dto.startWarnTime = moment().subtract(7, 'day').format(YMDHms)
  } else if (param === 'month') {
    dto.startWarnTime = moment().subtract(1, 'M').format(YMDHms)
  }

  // const res = await getLabelList(dto);
  const res = { in: Math.floor(Math.random() * 300 + 1), out: Math.floor(Math.random() * 300 + 1) }
  return {
    data: res,
  };
}



/** 船舶档案-预警信息-风险等级统计*/
export async function getRiskLevelOptions(param: any) {
  const dto: any = {
    endWarnTime: moment().format(YMDHms),
    areaId: param.id
  }
  if (param.time === 'month') {
    dto.startWarnTime = moment().subtract(1, 'M').format(YMDHms)
  } else {
    dto.startWarnTime = moment().subtract(1, 'y').format(YMDHms)
  }

  const [vo, levelDict] = await Promise.all([getAlarmLevelStatistics(dto), getDictDataByType('risk_level')])

  const data: any = []
  vo.forEach((ele: any) => {
    const name = getDictName(levelDict, ele.dataItem)
    if (name) {
      data.push({
        name,
        value: Number(ele.count)
      })
    }
  })
  const options = getShipWarnLevelOptions(data)
  return options;
}


/** 重点场-场所布防-预警行为统计*/
export async function getWarningActionOptions(param: any) {

  const dto: any = {
    endWarnTime: moment().format(YMDHms),
    areaId: param.id
  }

  if (param.time === 'month') {
    dto.startWarnTime = moment().subtract(1, 'M').format(YMDHms)
  } else {
    dto.startWarnTime = moment().subtract(1, 'y').format(YMDHms)
  }

  const [vo, levelDict] = await Promise.all([getAlarmWarnTypeStatsStatistics(dto), getDictDataByType('warn_type')])

  const data = vo.map((ele: any) => {
    const name = getDictName(levelDict, ele.dataItem)
    return {
      name,
      value: Number(ele.count)
    }
  })
  // 字典中没有的，需要过滤掉
  let seriesData = data.filter((item: any) => item.name !== '')

  // 需要只展示数量最多的5个，并且倒序排，剩下的归类为其他
  let newDataList = _.sortBy(seriesData, function (item) {
    return -item.value
  })
  if (newDataList.length > 5) {//前面5个正常显示，其余的归来为其他
    let beforeFive = _.slice(newDataList, 0, 5)
    let restData = _.slice(newDataList, 5)
    let otherTotal = 0;
    for (let i = 0; i < restData.length; i++) {
      otherTotal += restData[i].value
    }
    seriesData = [...beforeFive, { name: '其他', value: otherTotal }]
  }

  const options = getEchartsPieSimple({
    seriesData: seriesData
  })

  return options;
}



/** 重点场-场所布防-预警时间段统计*/
export async function getWarningTimeOptions(param: any) {

  const dto: any = {
    endWarnTime: moment().format(YMDHms),
    areaId: param.id
  }
  if (param.time === 'month') {
    dto.startWarnTime = moment().subtract(1, 'M').format(YMDHms)
  } else {
    dto.startWarnTime = moment().subtract(1, 'y').format(YMDHms)
  }

  const [vo] = await Promise.all([getAlarmHourStatistics(dto)])

  const dataArr: any[] = [
    { name: "00:00 - 06:00", total: 0 },
    { name: "06:00 - 12:00", total: 0 },
    { name: "12:00 - 18:00", total: 0 },
    { name: "18:00 - 23:59", total: 0 }
  ]

  const totalList: number[] = []

  vo.forEach((element: any) => {
    const idx = Number(element.dataItem) - 1
    dataArr[idx].total += Number(element.count)
    totalList.push(element.count)
  });

  const maxTotal = _.max(totalList) || 100

  let result: any[] = []
  dataArr.forEach((item: any) => {
    let str: any = { total: item.total, name: item.name, wd: (item.total / maxTotal) * 100 }
    result.push(str)
  })

  return result
}


/** 重点场所-详情-场所信息-工作人员列表 */
export async function doGetPlacePersonList(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };
  const data = await getPlacePersonList(dto);
  matching(data.records, riskLevelOptions, "level");
  matching(data.records, positionStatusDict, "status");
  matching(data.records, sexDict, "gender");

  data.records.forEach((item: any) => {
    item.actionBy = item.updateBy || item.createBy
    item.actionTime = item.updateTime || item.createTime
  })

  return {
    data: data.records,
    total: data.total,
  };
}


/** 重点场所-详情-场所信息-工作人员新增、编辑 */
export async function doEditPlaceStaff(params: any) {
  let dto = {
    ...params,
  }

  let vo: any = null
  if (params.type !== 1) {
    // 编辑
    delete dto.type
    vo = await placesPersonEdit(dto)
  } else {
    // 新增
    delete dto.type
    vo = await placesPersonAdd(dto)
  }

  return vo
}


/** 重点场所-详情-场所信息-获取工作人员信息 */
export async function doGetPlaceStaff(params: any) {
  let dto = {
    id: params,
  }
  let vo: any = await placesPersonGetInfo(dto)
  return vo
}


/** 重点场所-详情-场所信息-删除工作人员 */
export async function doDelPlaceStaff(params: any) {
  let vo: any = await placeDelPerson(params)
  return vo
}

/** 重点场所-详情-场所信息-获取重点场所涉案信息列表 */
export async function doGetPlaceCaseList(pageInfo: PageInfo, params: any) {

  let dto = {
    ...pageInfo,
    ...params,
    focusPlaceId: params.focusPlaceId
  }
  let vo: any = await getPlacesCaseList(dto)
  return {
    data: vo.records,
    total: vo.total
  }
}


/** 重点场所-详情-场所信息-涉案信息新增 */
export async function doAddPlaceCase(params: any) {

  let dto = {
    ...params,
  }

  await placeAddCase(dto)
}

/** 重点场所-详情-场所信息-取消关联涉案信息 */
export async function doRemovePlaceCase(params: any) {
  let dto = {
    caseBaseId: params.caseBaseId,
    focusPlaceId: params.focusPlaceId
  }
  await placeRemoveCase(dto)
}

/** 重点场所-详情-场所信息-获取重点场所信息所有设备列表 */
export async function doGetPlacesAllDevices(params: any) {

  let dto = {
    ...params,
    focusPlaceId: params.focusPlaceId
  }

  if (params.deviceType) {
    dto.deviceType = params.deviceType
  }

  const [vo, deviceTypeDict] = await Promise.all([getPlacesAllDevices(dto), getDictDataByType('device_type')])

  matchingByConvert(vo, deviceTypeDict, 'type', 'typeName', 'number')

  // 根据设备名称分组的数据
  let newVo = _.groupBy(vo, function (n) {
    return n.typeName
  })
  // console.log(newVo)

  let newArr: any = []
  if (Object.keys(newVo).length !== 0) {
    for (const nItem in newVo) {
      newArr.push({
        name: nItem,
        cameraType: newVo[nItem][0].cameraType,
        node: newVo[nItem]
      })
    }
  }


  return {
    data: vo,
    dataGroupBy: newArr
  }
}

/** 重点场所-详情-场所信息-获取所有设备列表 */
export async function doGetAllDevicesList(pageInfo: PageInfo, params: any) {

  let dto = {
    ...pageInfo,
    ...params
  }

  const [vo, deviceTypeDict] = await Promise.all([getDevicesList(dto), getDictDataByType('device_type')])

  vo?.records.map((item: any) => {
    item.deviceType && (item.deviceTypeNum = item.deviceType + "")
    item && matching([item], deviceTypeDict, "deviceTypeNum");
    return item
  });

  return {
    data: vo.records,
    total: vo.total
  }
}

// 获取重点场所关联的设备
export async function doDevicesByPlaceId(params: any) {

  let dto = {
    pageSize: -1,
    pageNumber: 1,
    ...params
  }

  const [vo] = await Promise.all([getDevicesList(dto)])
  let arr = [];
  if (vo && vo.records && vo.records.length > 0) {
    for (let i = 0; i < vo.records.length; i++) {
      arr.push({
        name: vo.records[i].deviceName,
        value: vo.records[i].id
      })
    }
  }
  return arr
}


/** 重点场所-详情-场所信息-新增设备 */
export async function doPlaceAddDevice(params: any) {
  let dto: any = []

  let result: any = {}
  if (params.deviceId.length === 0) {
    common.showMessage({ msg: "请至少选择一个设备", type: "error" });
    result = { code: 0, msg: '请至少选择一个设备' }
  } else {
    params.selectedRows.forEach((element: any, index: number) => {
      dto.push({
        ...params,
        deviceId: element.id, // 设备ID
        deviceCode: element.deviceCode, // 设备CODE
      })
    });
    const vo = await placeAddDevice(dto)
    if (vo.includes('成功')) {
      result = { code: 200, msg: '' }
    }
  }
  return result
}

/** 重点场所-详情-场所信息-新增设备 */
export async function addPlaceDeviceList(placeId: number, deviceList: any[]) {
  let dto = deviceList.map(item => {
    return {
      focusPlaceId: placeId,
      deviceId: item.id, // 设备ID
      deviceCode: item.deviceCode, // 设备CODE
    }
  })
  await placeAddDevice(dto)
}

/** 重点场所-详情-场所信息-删除设备 */
export async function doPlaceDelDevice(params: any) {
  let dto = {
    ...params
  }

  await placeDelDevice(dto)
}


/** 重点场所-详情-场所信息 */
export async function doGetPlaceInfo(params: any) {

  const [vo, levelDict] = await Promise.all([
    getPlaceListDetail(params),
    getDictDataByType('risk_level')
  ])

  readDictByConvert(vo, "level", levelDict, "levelName", 'number');
  // readDictByConvert(vo, "isRecognition", discriminateDict, "isRecognitionName", 'number');

  /*   data: [
      { name: '开启', value: 1 },
      { name: '关闭', value: 2 }
  ] */
  if (vo.isRecognition === 1) {
    vo.isRecognitionName = '开启'
  } else if (vo.isRecognition === 2) {
    vo.isRecognitionName = '关闭'
  }


  return {
    data: vo,
    dataDetail: [
      {
        label: '场所类型',
        value: vo.labelName
      },
      {
        label: '进出港识别',
        value: vo.isRecognitionName
      },
      {
        label: '场所图标',
        value: Number(vo.icon)
      },
      {
        label: '场所说明',
        value: vo.comment
      },
      {
        label: '场所地区',
        value: vo.areaFullName
      },
    ]
  };
}



/** 重点场所-预警信息表格数据 */
export async function getPlaceWarnTable(pageInfo: PageInfo, params: any) {
  const _params = _.omit(params, "dateTimeRange");
  const dto: any = {
    ...pageInfo,
    ..._params,
  };

  if (params.dateTimeRange) {
    const [startDatetime, endDatetime]: [Moment, Moment] = params.dateTimeRange;
    dto.startWarnTime = startDatetime.format(YMDHms)
    dto.endWarnTime = endDatetime.format(YMDHms)
  }

  if (params.warnTypes) {
    dto.warnTypes = params.warnTypes.toString();
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

  const data: any = vo.records.map((ele: any) => {
    if (ele.longitude || ele.latitude) {
      ele.longitudeLatitude = `${ele.longitude}/${ele.latitude}`;
    } else {
      ele.longitudeLatitude = "";
    }
    return ele;
  });

  let levels: any = levelDict.map((it: any) => { return { name: it.name, value: Number(it.value) } })
  matching(data, monitorDict, "monitorType");
  matching(data, levels, "riskLevel");

  // 转换warnType
  matchingByKeyArray({
    original: data,
    originalKey: "warnType",
    originalSplitStr: ";",
    target: modelDict,
  });



  matching(data, deviceDict, "deviceType");
  return {
    data,
    total: vo.total,
  };
}



/** 获取重点场所布防列表 */
export async function doGetPlaceDeployList(params: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1
  }

  const dto = {
    ...pageInfo,
    areaId: params.id,//重点场所ID 
  };

  const res = await getControlInfoByIdV2(dto)

  return {
    data: res !== null ? res : {},
    total: res !== null ? res : {},
  };
}
export async function getPlaceDeploy(placeId: any) {

  const dto = {
    areaId: placeId, //重点场所ID 
    controlCategory: 3, //根据场所id查询的时候, controlCategory需要指定为3
  };

  const vo = await getControlInfoByIdV2(dto)

  return vo
}

/** 新增重点场所布防 */
export async function addPlaceDeploy(params: any) {

  let dto: any = {
    areaId: params.id, //重点场所ID 
    controlCategory: 3, //布控类型
  };

  // 船舶布控信息
  if (params.shipConditionJson) {
    dto.shipConditionJson = params.shipConditionJson
  }

  // 人员布控信息：人员，车辆，电话
  if (params.personCtrlJson) {
    dto.personCtrlJson = params.personCtrlJson
  }

  if (!params.itemId) {
    await addControl(dto)
  }
  else {
    dto.id = params.itemId
    await updateControl(dto)
  }

  return {
    data: []
  };
}


/** 态势感知-船舶来源 */
export async function getPlacePortList(): Promise<Type<any>[]> {

  const dto = {
    placeType: 1,
    selfLabelType: 4,
    pageNumber: 1,
    pageSize: -1
  };

  const vo = await getPlacePort(dto)

  const dict = vo.map((ele: any) => ({ name: ele.name, value: ele.selfLabelIds }))

  return dict;
}

/** 重点场所-详情-数据信息-船舶数据，车辆数据，人脸数据 */
export async function doGetGetTrackList(pageInfo: PageInfo, params: any) {

  const { datetime, deviceCodes, ...para } = params || {}

  let dto = {
    ...pageInfo,
    ...para
  }

  // 时间
  if (datetime) {
    dto.beginTime = dayjs(datetime[0]).format(YMDHms)
    dto.endTime = dayjs(datetime[1]).format(YMDHms)
  }

  if (deviceCodes) {
    dto.deviceCodes = deviceCodes.toString()
  }

  const [vo, carTypeDict, carColorDict, carMakeDict, carPlateColorDict, shipNavStatus] = await Promise.all([
    getTrackList(dto),
    getDictDataByType("archive_car_type"),
    getDictDataByType("archive_car_color"),
    getDictDataByType("archive_car_make"),
    getDictDataByType("archive_plate_color"),
    getDictDataByType("nav_status"),
  ])

  vo.content.map((item: any) => {
    readDictByConvert(item, "vehicleType", carTypeDict);
    readDictByConvert(item, "carColor", carColorDict);
    readDictByConvert(item, "carMake", carMakeDict);
    readDictByConvert(item, "plateColor", carPlateColorDict);
    readDictByConvert(item, "type", carDescTypeDict);
    readDictByConvert(item, "shipStatus", shipNavStatus);
    readDictByConvert(item, "personType", personTypeDict);
    return item;
  });

  // 车照片
  let carPathArr: any = vo.platePath ? vo.platePath.split(",") : [];
  vo.platePath = [];
  if (carPathArr.length !== 0) {
    carPathArr.forEach((element: any, index: number) => {
      vo.platePath.push({
        name: vo.id,
        id: vo.id,
        path: element,
      });
    });
  }



  return {
    data: vo.content,
    total: vo.total
  }
}

/** 重点场所-详情-数据信息-图片数据 */
export async function getPlaceImgTable(pageInfo: PageInfo, params: any) {
  const { datetime, deviceCodes, ...othParams } = params

  let dto = {
    ...pageInfo,
    ...othParams
  }

  // 时间
  if (datetime) {
    dto.beginTime = dayjs(datetime[0]).format(YMDHms)
    dto.endTime = dayjs(datetime[1]).format(YMDHms)
  }

  if (deviceCodes) {
    dto.deviceCodes = deviceCodes.join(',')
  }

  const vo = await getTrackList(dto)

  const devices = await queryDeviceDict({ deviceType: 1 })

  for (let i = 0; i < vo.content.length; i++) {
    for (let j = 0; j < devices.length; j++) {
      if (vo.content[i].deviceCode === devices[j].deviceCode) {
        vo.content[i].deviceName = devices[j].name
        vo.content[i].capAddress = devices[j].siteName
      }
    }
  }

  return {
    data: vo.content,
    total: vo.total,
  };
}

// 重点场所
export async function getMonitorTypeDict() {
  let vo = await getDictDataByType("monitor_type")
  return vo
}

/** 重点场所-场所布防-预警信息 */
export async function getFocusAreaWarnList(pageInfo: PageInfo, params: any) {
  const _params = _.omit(params, "dateTimeRange");
  const dto: any = {
    ...pageInfo,
    ..._params,
  };

  if (params.dateTimeRange) {
    const [startDatetime, endDatetime]: [Moment, Moment] = params.dateTimeRange;
    dto.startWarnTime = startDatetime.format(YMDHms)
    dto.endWarnTime = endDatetime.format(YMDHms)
  }

  if (params.warnTypes && params.warnTypes.length > 0) {
    dto.warnTypes = params.warnTypes.toString();
  }

  params.warnTypes && (dto.warnTypes = params.warnTypes.toString())

  if (params.monitorType && params.monitorType.length > 0) {
    dto.monitorTypes = params.monitorType.toString();
  }
  _.unset(dto, 'monitorType')
  const [vo, monitorDict, levelDict, warnTypeDict, deviceDict] = await Promise.all(
    [
      getFocusAreaWarn(dto),
      getDictDataByType("monitor_type"),
      getDictDataByType("risk_level", 'number'),
      // getDictDataByType("model_type"),
      getDictDataByType("warn_type"),
      getDictDataByType("device_type", 'number'),
    ]
  );

  const data: any = vo.records.map((ele: any, index: number) => {
    if (ele.longitude || ele.latitude) {
      ele.longitudeLatitude = `${ele.longitude}/${ele.latitude}`;
    } else {
      ele.longitudeLatitude = "";
    }
    ele.index = (pageInfo.pageNumber - 1) * pageInfo.pageSize + index + 1;
    return ele;
  });

  matching(data, monitorDict, "monitorType");
  matching(data, levelDict, "riskLevel");

  // 转换warnType
  matchingByKeyArray({
    original: data,
    originalKey: "warnType",
    originalSplitStr: ";",
    target: warnTypeDict,
  });


  matching(data, deviceDict, "deviceType");
  return {
    data,
    total: vo.total,
  };

}

// 用场所id查关联的标签id
export async function getPlaceQueryShipList(pageInfo: PageInfo, params: any) {

  const { focusPlaceId, datetime, ...othParams } = params

  const labelIds = await getLabelByPlaceId({ placeId: focusPlaceId })

  if (!labelIds) {
    return {
      data: [],
      total: 0
    }
  } else {

    const dto = {
      ...othParams,
      labelIds
    }

    if (datetime) {
      const [begin, end]: [Dayjs, Dayjs] = datetime
      _.set(dto, 'beginTimes', begin.format(YMDHms))
      _.set(dto, 'endTimes', end.format(YMDHms))
    }

    const vo = await getShipListTable(pageInfo, dto)
    return vo
  }

}

// 重点场所-新增布控
export async function addPlaceCtrlTarget(params: any) {

  const dto = {
    controlCategory: 3,
    ...params
  }

  await addPlaceCtrl(dto)
}

// 重点场所-新增布控
export async function updatePlaceCtrlTarget(params: any) {

  const dto = {
    controlCategory: 3,
    ...params
  }

  await updatePlaceCtrl(dto)
}

/** 重点场所-所有标签 */
export async function getPlaceLabelAll() {
  // const dto = {
  //   type: 9,
  //   pageNumber: 1,
  //   pageSize: -1
  // }
  const vo = await getPlaceLabel()
  return vo
}

/** 重点场所-详情 */
export async function getPlaceInfoById(id: number, signal?: AbortController) {
  const vo = await getPlaceListDetail(id, { signal })
  return vo
}

/** 重点场所-根据类型获取相关点位 */
export async function getPlaceDeviceDictByType(id: number, type: number, signal?: AbortController) {
  const dto = {
    focusPlaceId: id,
    deviceType: type
  }
  const vo = await getPlacesAllDevices(dto, { signal })

  const result = vo.map((item: any) => ({ ...item, value: item.id, label: item.name, lat: item.latitude, lng: item.longitude }))

  return result
}


/** 重点场所-详情 */
export async function getPlaceLabelOptions(signal?: AbortController) {
  const dto = {
    current: 1,
    size: -1,
    type: 9
  }
  const vo = await getLabelList(dto, { signal })
  const result: any[] = vo.records.map((item: any) => ({ ...item, label: item.labelName, value: item.id }))
  return result
}

/** 场所列表-根据标签id */
export async function getPlaceOptionsByLabel(labelId: number, signal?: AbortController) {
  const dto = {
    current: 1,
    size: -1,
    labelId
  }
  const vo = await getPlacesList(dto, { signal });
  const result: any[] = vo.records.map((item: any) => ({ ...item, label: item.name, value: item.id }))
  return result
}