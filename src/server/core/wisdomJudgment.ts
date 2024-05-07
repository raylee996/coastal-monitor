import {PageInfo} from "hooks/integrity/TableInterface";
import {
  analyzeModelAdd,
  analyzeModelDel,
  analyzeModelDetail,
  analyzeModelEdit,
  exportProcessData,
  getAnalyzeModelList, getJudgmentDetail,
  getJudgmentList, getProcessDataList,
  judgeResultList,
  judgeResultListRelation,
  judgmentAdd,
  judgmentEdit,
  judgmentTaskDelete,
  viewResultDetail
} from "../../api/core/wisdomJudgment";
import matching, {
  clueType, dataType, dataTypeNum,
  judgmentDataType,
  judgmentObjType,
  judgmentStatusDict,
  recordTargetDict
} from "../../helper/dictionary";
import {getDictDataByType} from "../system";
import dayjs from "dayjs";
import {message} from "antd";
import _, {parseInt} from "lodash";
import {getPointListAsync} from "../device";
import {getHistoryTrack} from "../../api/common";
import {downloadFile, YMDHm} from "../../helper";
import {queryCaseArchiveList} from "../dataCenter/caseArchive";

//获取研判列表
export async function getJudgmentListAsync(pageInfo: PageInfo,params:any){
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
    dataType: params.dataType && params.dataType.toString(),
    eventType: params.eventType && params.eventType.toString()
  };
  const vo = await getJudgmentList(dto)
  const data = vo.records;

  //任务状态格式化
  matching(data,judgmentStatusDict,'status','statusName')
  //研判对象格式化
  matching(data,judgmentObjType,'objType','objType')
  //关联案件格式化
  // const relationCase:any = await getDictDataByType('archive_case_source')
  const relationCase:any = await queryCaseArchiveList({pageNumber:1,pageSize:-1},{})
  if (relationCase && relationCase.data && relationCase.data.length>0){
    for (let i = 0; i<data.length; i++){
      for (let j = 0; j<relationCase.data.length; j++){
        if (data[i].caseId ===relationCase.data[j].id ){
          data[i].caseIdName = relationCase.data[j].caseName
        }
      }
    }
  }

  //数据类型格式化
  for (let i = 0 ; i<data.length; i++){
    let item = JSON.parse(data[i].dataType)
    for (let j = 0 ; j<judgmentDataType.length; j++){
      for (let k = 0; k<item.length; k++){
        if (item[k]===judgmentDataType[j].value){
          item[k] = judgmentDataType[j].name
        }
      }
    }
    data[i].dataType = item.join(', ')
  }
  //研判条件格式化
  for (let i = 0; i<data.length; i++){
    let conditionType = data[i].eventType;
    if (data[i].eventType && conditionType.length>0){
      let conditionTypeArr = conditionType.split(';')
      let arr = [];
      for (let i = 0; i<conditionTypeArr.length; i++){
        arr.push(conditionTypeArr[i].split(':')[1])
      }
      data[i].eventType = arr.join(' , ')
    }
  }

  //模型名称格式化
  const modeNames:any = await getAnalyzeModelListPages({pageNumber:10,pageSize:-1})
  for (let i = 0; i<data.length; i++){
    let modelId = data[i].modelId
    for (let j = 0; j<modeNames.data.length; j++){
      if (parseInt(modelId) === modeNames.data[j].id){
        data[i].modelIdName = modeNames.data[j].modelName
      }
    }
  }

  return {
    data: data,
    total: vo.total,
  };
}

//获取研判条件下拉
export async function getJudgmentConditionList(){
  const peopleCar:any = await getDictDataByType('analyze_pc_event_type')
  const shipDict:any = await getDictDataByType('analyze_ship_event_type')
  return _.uniqBy([...peopleCar, ...shipDict], 'name')
}

//删除研判列表
export async function judgmentTaskDeleteAsync(id:any){
  await judgmentTaskDelete(id)
}

//新增智能研判
export async function judgmentTaskAddAsync(dto:any,jsonData:any){
  let formData = dto
  if (formData.time){
    formData.beginTime = dayjs(dto.time[0]).format('YYYY-MM-DD HH:mm') || ''
    formData.endTime = dayjs(dto.time[1]).format('YYYY-MM-DD HH:mm') || ''
  }
  //dataType需要字符串
  formData.dataType = JSON.stringify(formData.dataType)
  formData.originalJson = jsonData
  if (formData.areaId){
    formData.areaId = formData.areaId.join(',')
  }

  //获取点位信息,并转成后端需要的格式
  if (formData.devices && formData.devices.length>0){
    const devicesList = await getPointListAsync() || []
    let arr = [];
    for (let i = 0; i<devicesList.length; i++){
      for (let j = 0; j<formData.devices.length; j++){
        if (devicesList[i].id === formData.devices[j]){
          arr.push({
            deviceCode: devicesList[i].deviceCode,
            type: devicesList[i].type,
            siteCode: devicesList[i].siteCode,
            deviceId: devicesList[i].id
          })
        }
      }
    }
    formData.devices = JSON.stringify(arr)
  }

  //判断是否有预警条件
  let isGraphDataEmpty = JSON.parse(jsonData).cells
  if (isGraphDataEmpty.length===0){
    message.warning('请在右侧添加预警条件')
    return false;
  }
  //判断必填项
  if (!validateConditionComplete(jsonData)){
    return false
  }
  //选择了模型，直接编辑模型
  if (formData.modelId){
    //获取模型列表，然后筛选出模型，把条件JSON保存进去
    const vo:any = await getAnalyzeModelListPages({pageNumber:10,pageSize:-1},{modelType:formData.objType})
    //当前选中的模型
    let currentModel = vo.data.filter((item:any)=>{
      return item.id === formData.modelId
    })
    currentModel[0].originalJson = jsonData
    //编辑模型，把json保存进去
    await analyzeModelEditAsync(currentModel[0])
  }else{
  //  未选择模型，默认新增添加新模型
    let modelName = '模型'+dayjs().format('YYYYMMDDHHmm')+_.random(10000);
    let modelType = formData.objType;
    let originalJson = jsonData
    await analyzeModelAddAsync({
      modelName,
      modelType,
      originalJson
    })
    //绑定新创建的模型id
    const vo:any = await getAnalyzeModelListPages({pageNumber:10,pageSize:-1})
    //当前选中的模型
    let currentModel = vo.data.filter((item:any)=>{
      return item.modelName === modelName
    })
    formData.modelId = currentModel[0].id
  }

  //新增研判
  let result = await judgmentAdd(formData)
  if (result==='添加成功'){
    message.success('添加成功')
    return true
  }
}

//判断必要条件是否填写完整
function validateConditionComplete(flowGraphData:any){
  //获取流程图的所有节点
  let cells = JSON.parse(flowGraphData).cells.filter((item:any)=>{
    //过滤掉连线的节点
    return item.shape !== 'edge'
  })

  //获取流程图线条，用于判断与运算和或运算是否有前置条件
  let lines = JSON.parse(flowGraphData).cells.filter((item:any)=>{
    return item.shape === 'edge'
  })
  //获取线条的targetId
  let lineTargetIds = []
  for (let i = 0; i<lines.length;i++){
    lineTargetIds.push(lines[i].target.cell)
  }

  //获取与运算，或运算节点
  let specialNodes = cells.filter((item:any)=>{
    return item.type === 'orCount' || item.type === 'withCount' || item.type === 'diffCount'
  })
  //与运算，或运算的节点id
  let specialNodesIds = []
  for (let i = 0; i<specialNodes.length; i++){
    specialNodesIds.push(specialNodes[i].id)
  }

  //与运算和或运算需要前置条件，根据线条的targetId，和与或运算的id对比，进行判断
  for (let i = 0; i<specialNodesIds.length; i++){
    if (!lineTargetIds.includes(specialNodesIds[i])){
      message.error('交、并、差集运算需设定前置条件！')
      return false;
    }
  }


  let arr = [];
  for (let i = 0 ; i<cells.length; i++){
    let conditionType = cells[i].data.eventName;
    let conditionData = cells[i].data;
    switch (conditionType){
      case '未开AIS':
        if (!conditionData.beginTime){
          arr.push(`"未开AIS" 的时间必填`)
        }
        break;
      case '超速':
        if (!conditionData.minSpeed){
          arr.push('"超速" 的航速必填')
        }
        if (!conditionData.beginTime){
          arr.push(`"超速" 的时间必填`)
        }
        break;
      case '怠速':
        if (!conditionData.minSpeed){
          arr.push('"怠速" 的航速必填')
        }
        if (!conditionData.beginTime){
          arr.push(`"怠速" 的时间必填`)
        }
        break;
      case '越线':
        if (!conditionData.lineId || _.isEmpty(conditionData.lineId)){
          arr.push('"越线" 的警戒线必填')
        }
        if (!conditionData.beginTime){
          arr.push(`"越线" 的时间必填`)
        }
        break;
      case '靠岸':
        if (!conditionData.lineId || _.isEmpty(conditionData.lineId)){
          arr.push('"靠岸" 的岸线必填')
        }
        if (!conditionData.minDistance){
          arr.push(`"靠岸" 的距离必填`)
        }
        if (!conditionData.beginTime){
          arr.push(`"靠岸" 的时间必填`)
        }
        break;
      case '进出区域':
        if (!conditionData.beginTime){
          arr.push(`"进出区域" 的时间必填`)
        }
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)){
          arr.push('"进出区域" 的区域必填')
        }
        break;
      case '海面停泊':
        if (!conditionData.beginTime){
          arr.push(`"海面停泊" 的时间必填`)
        }
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)){
          arr.push('"海面停泊" 的区域必填')
        }
        break;
      case '曾去地':
        if (!conditionData.beginTime){
          arr.push(`"曾去地" 的时间必填`)
        }
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)){
          arr.push('"曾去地" 的区域必填')
        }
        break;
      case '走走停停':
        if (!conditionData.runMinute1 || !conditionData.runMinute2 ){
          arr.push(`"走走停停" 的行走时长必填`)
        }
        if (!conditionData.stayMinute1 || !conditionData.stayMinute2 ){
          arr.push(`"走走停停" 的停留时长必填`)
        }
        if (!conditionData.circleNum){
          arr.push(`"走走停停" 的循环次数必填`)
        }
        if (!conditionData.beginTime){
          arr.push(`"走走停停" 的时间必填`)
        }
        break;
      case '折返分析':
        if (!conditionData.beginTime){
          arr.push(`"折返分析" 的时间必填`)
        }
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)){
          arr.push('"折返分析" 的区域必填')
        }
        break;
      case '往返分析':
        if (!conditionData.circleNum){
          arr.push(`"往返分析" 的往返次数必填`)
        }
        if (conditionData.circleAreaOne.length===0){
          arr.push(`"往返分析" 的往返区域1必填`)
        }
        if (conditionData.circleAreaTwo.length===0){
          arr.push(`"往返分析" 的往返区域2必填`)
        }
        if (!conditionData.beginTime){
          arr.push(`"折返分析" 的时间必填`)
        }
        break;
      case '两船靠泊':
        if (!conditionData.beginTime){
          arr.push(`"两船靠泊" 的时间必填`)
        }
        if (!conditionData.areaId || _.isEmpty(conditionData.areaId)){
          arr.push('"两船靠泊" 的区域必填')
        }
        break;
      case '并行行驶':
        if (!conditionData.minMinute){
          arr.push(`"并行行驶" 的并行时长必填`)
        }
        if (!conditionData.beginTime){
          arr.push(`"并行行驶" 的时间必填`)
        }
        break;
      case '尾随行驶':
        if (!conditionData.minMinute){
          arr.push(`"尾随行驶" 的尾随时长必填`)
        }
        if (!conditionData.beginTime){
          arr.push(`"尾随行驶" 的时间必填`)
        }
        break;
      case '碰撞分析':
        if (!conditionData.dataType){
          arr.push(`"碰撞分析" 的数据类型必填`)
        }
        if (!conditionData.devicesId || conditionData.devicesId.length===0){
          arr.push(`"碰撞分析" 的点位必填`)
        }
        break;
      case '伴随分析':
        if (conditionData.dataType==='01' && conditionData.knownType==='01' && !conditionData.faceId){
          arr.push(`"伴随分析" 的伴随人脸必填`)
        }
        if (conditionData.dataType==='02' && conditionData.knownType==='01' && !conditionData.licensePlate){
          arr.push(`"伴随分析" 的伴随车辆必填`)
        }
        if (conditionData.dataType==='03' && conditionData.knownType==='01' && !conditionData.codeValue){
          arr.push(`"伴随分析" 的伴随侦码必填`)
        }
        if (!conditionData.threshold){
          arr.push(`"伴随分析" 的伴随次数必填`)
        }
        if (!conditionData.minDeviceNum){
          arr.push(`"伴随分析" 的伴随点位数必填`)
        }
        if (!conditionData.minNum){
          arr.push(`"伴随分析" 的伴随间隔必填`)
        }
        break;
      case '昼伏夜出':
        if (!conditionData.devicesId || conditionData.devicesId.length===0){
          arr.push(`"昼伏夜出" 的点位必填`)
        }
        if (!conditionData.backDuration){
          arr.push(`"昼伏夜出" 的回溯时长必填`)
        }
        if (!conditionData.startHour || !conditionData.endHour){
          arr.push(`"昼伏夜出" 的昼伏时段必填`)
        }
        if (!conditionData.startHourTwo || !conditionData.endHourTwo){
          arr.push(`"昼伏夜出" 的夜出时段必填`)
        }
        if (!conditionData.threshold){
          arr.push(`"昼伏夜出" 的昼伏阈值必填`)
        }
        if (!conditionData.thresholdTwo){
          arr.push(`"昼伏夜出" 的夜出阈值必填`)
        }
        break;
      case '团伙分析':
        if (conditionData.faceDataList.length===0 && conditionData.dataType.includes('01')){
          arr.push(`"团伙分析" 的分析人脸必填`)
        }
        if (!conditionData.threshold){
          arr.push(`"团伙分析" 的共轨阈值必填`)
        }
        break;
      case '套牌车分析':
        if ((!conditionData.devicesId || conditionData.devicesId.length===0) && conditionData.analyzeType==='01'){
          arr.push(`"套牌车分析" 的点位必填`)
        }
        if (!conditionData.licensePlate && conditionData.analyzeType==='02'){
          arr.push(`"套牌车分析" 的分析车辆必填`)
        }
        if (!conditionData.backDuration){
          arr.push(`"套牌车分析" 的回溯时长必填`)
        }
        break;
      case '首次出现':
        if (!conditionData.devicesId || conditionData.devicesId.length===0){
          arr.push(`"首次出现" 的点位必填`)
        }
        if (!conditionData.backDuration){
          arr.push(`"首次出现" 的回溯时长必填`)
        }
        break;
      case '徘徊分析':
        if (conditionData.dataType && conditionData.dataType.length===0){
          arr.push(`"徘徊分析" 的数据类型必填`)
        }
        if (!conditionData.devicesId || conditionData.devicesId.length===0){
          arr.push(`"徘徊分析" 的点位必填`)
        }
        if (!conditionData.threshold){
          arr.push(`"徘徊分析" 的出现天数必填`)
        }
        if (!conditionData.dailyFrequency1 || !conditionData.dailyFrequency2){
          arr.push(`"徘徊分析" 的每天频次必填`)
        }
        break;
      case '常住人口':
        if (!conditionData.devicesId || conditionData.devicesId.length===0){
          arr.push(`"常住人口" 的点位必填`)
        }
        break;
      case '流动人口':
        if (!conditionData.devicesId || conditionData.devicesId.length===0){
          arr.push(`"流动人口" 的点位必填`)
        }
        break;
    }
  }
  if (arr.length>0){
    let result = Array.from(new Set(arr)) //数组去重
    message.error({
      content:result.join(' ; '),
      duration:6,
    })
    return false
  }else {
    return true
  }
}

//获取关联案件下拉
export async function getRelationCaseList(){
  // const vo:any = await getDictDataByType('archive_case_source')
  let arr = [];
  const res:any = await queryCaseArchiveList({pageNumber:1,pageSize:-1},{})
  if (res && res.data && res.data.length>0){
    for (let i = 0; i<res.data.length; i++){
      arr.push({
        name: res.data[i].caseName,
        value: res.data[i].id
      })
    }
  }
  return arr
}

//编辑研判
export async function judgmentEditAsync(params:any){
  return await judgmentEdit(params)
}

//获取模型列表(分页)
export async function getAnalyzeModelListPages(pageInfo: PageInfo,params?:any){
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
  };
  let vo = await getAnalyzeModelList(dto)
  const data = vo.records || [];
  matching(data,clueType,'modelType','modelTypeName')

  return {
    data: data,
    total: vo.total,
  };
}

//新增模型
export async function analyzeModelAddAsync(params:any){
  let dto = {...params}
  await analyzeModelAdd(dto)
}
//删除模型
export async function analyzeModelDelAsync(id:any){
  await analyzeModelDel(id)
}
//编辑模型
export async function analyzeModelEditAsync(params:any){
  return await analyzeModelEdit(params)
}

/*研判结果列表*/
export async function judgeResultListAsync(pageInfo: PageInfo,params?:any){
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
  };
  let vo = await judgeResultList(dto)

  return {
    data: vo.records,
    total: vo.total,
  };
}
//人车研判结果格式化
export async function peopleCarResultCardFormat(data:any){
  //格式化目标 车牌：粤B12456
  for (let i = 0; i<recordTargetDict.length; i++){
      if (data.codeType === recordTargetDict[i].value){
        data.target = recordTargetDict[i].name+ ":" + data.codeValue
        data.targetType = recordTargetDict[i].value
        data.targetValue = data.codeValue
      }
  }
  //获取人车条件字典
  const peopleCarDict:any = await getDictDataByType('analyze_pc_event_type')
  // 格式化事件类型
  let tags = (data.eventType && data.eventType.split(',')) || ''
  let eventTypeArr = [];
  for (let i = 0; i<tags.length; i++){
    for (let j = 0; j<peopleCarDict.length;j++){
      if (tags[i]===peopleCarDict[j].value){
        eventTypeArr.push(peopleCarDict[j].name)
      }
    }
  }
  data.eventTypeArr = eventTypeArr;
  return {
    ...data
  }
}
//船舶研判结果格式化
export async function shipResultCardFormat(data:any){
  //格式化目标 如 车牌：粤B12456
  for (let i = 0; i<recordTargetDict.length; i++){
    if (data.codeType === recordTargetDict[i].value){
      data.target = recordTargetDict[i].name+ ":" + data.codeValue
      data.targetType = recordTargetDict[i].value
      data.targetValue = data.codeValue
    }
  }
  //获取船舶条件字典
  const shipDict:any = await getDictDataByType('analyze_ship_event_type')
  // 格式化事件类型
  let tags = (data.eventType && data.eventType.split(',')) || ''
  let eventTypeArr = [];
  for (let i = 0; i<tags.length; i++){
    for (let j = 0; j<shipDict.length;j++){
      if (tags[i]===shipDict[j].value){
        eventTypeArr.push(shipDict[j].name)
      }
    }
  }
  data.eventTypeArr = eventTypeArr;
  return {
    ...data
  }
}

//获取人车条件字典
export async function getPeopleCarDict(){
  const peopleCarDict:any = await getDictDataByType('analyze_pc_event_type')
  return peopleCarDict
}
//获取船舶条件字典
export async function getShipDict(){
  const shipDict:any = await getDictDataByType('analyze_ship_event_type')
  return shipDict
}

//查看结果后，点击查看详情
export async function viewResultDetailAsync(param:any){
  return await viewResultDetail(param)
}

//人车结果关联信息列表
export async function judgeResultListRelationAsync(pageInfo:PageInfo,params:any){
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
  }
  if (!params.objType || !params.srcTagCode){
    return {
      data: [],
      total: 0,
    }
  }
  const vo: any = await judgeResultListRelation(dto)
  //格式化目标 如 车牌：粤B12456
  for (let j = 0; j<vo.records.length; j++){
    for (let i = 0; i<recordTargetDict.length; i++){
      if (parseInt(vo.records[j].codeType) === recordTargetDict[i].value){
        vo.records[j].target = recordTargetDict[i].name
        vo.records[j].targetType = recordTargetDict[i].value
        vo.records[j].targetValue = vo.records[j].tagCode
      }
    }
  }
  //格式化关联类型，关联说明
  let peopleCarDict = await getPeopleCarDict()
  let shipDict = await getShipDict()
  let dict = [...peopleCarDict,...shipDict]
  for (let i = 0; i<vo.records.length; i++){
    let relationTypeNames = []; //关联类型
    let relationDetailNames = []; //关联说明

    let relationType = vo.records[i].relationType.split(',') || ''
    let relationDetail = vo.records[i].relationDetail.split(',') || ''

    //转换关联类型
    for (let j = 0; j<relationType.length;j++){
      for (let k = 0; k<dict.length; k++){
        if (relationType[j]===0){
          relationTypeNames.push('拟合')
        }else{
          if (relationType[j] === dict[k].value){
            relationTypeNames.push( dict[k].name)
          }
        }
      }
    }
    //转换关联说明
    for (let j = 0; j<relationDetail.length;j++){
      let type = relationDetail[j].split('_')[0];
      let amount = relationDetail[j].split('_')[1];
      for (let k = 0; k<dict.length; k++){
        if (type === dict[k].value){
          relationDetailNames.push( dict[k].name + ":" + amount + "次" )
        }
      }
    }
    //转换行为
    let detailEventType = vo.records[i].detailEventType.split(',') || '';
    let detailEventTypeNames = []
    for (let i = 0; i<detailEventType.length; i++){
      let eventType = detailEventType[i].split('_')[1]
      for (let k = 0; k<dict.length; k++){
        if (dict[k].value === eventType){
          detailEventTypeNames.push(dict[k].name)
        }
      }
    }
    vo.records[i].relationTypeNames = relationTypeNames.join(',')
    vo.records[i].relationDetailNames = relationDetailNames.join(',')
    vo.records[i].detailEventTypeNames = detailEventTypeNames.join(',')
    /*archiveType转换*/
    switch (vo.records[i].archiveType) {
      case '0':
        vo.records[i].archiveType = 2;
        break
      case '1':
        vo.records[i].archiveType = 3;
        break
      case '3':
        vo.records[i].archiveType = 1;
        break
    }
  }
  return {
    data: vo.records,
    total: vo.total,
  }
}

//关联信息-轨迹信息
/*
*  {name:'人脸',value:0,faceId:''},
   {name:'车牌',value:1,licensePlate:''},
   {name:'IMSI',value:2,imsi:''},
   {name:'IMEI',value:3,imei:''},
   {name:'MAC',value:4},
   {name:'手机',value:5},
   {name:'MMSI',value:6,mmsi:''},
   {name:'雷达目标',value:7,uniqueId:''},
   {name:'目标ID',value:8},
* */
export async function getJudgeHistoryTrack(pageInfo: PageInfo, params: any){
  /*
  * obj:[{
  * targetType: 1
  * targetValue: 粤B123456
  * },{
  * targetType: 1
  * targetValue: 粤B123456
  * }]
  * */
  let obj = params.obj;
  let analyzeType:any = 0
  let faceId:any = []                //faceId,人脸数据，多个以逗号隔开
  let imei:any = []                //imei,侦码数据，多个以逗号隔开
  let imsi:any = []                  //imsi,侦码数据，多个以逗号隔开
  let licensePlate:any = []         //	licensePlate,车牌数据，多个以逗号隔开
  let mmsi:any = []                  //船舶唯一标识，多个以逗号隔开
  let uniqueId:any = []              //雷达目标唯一标识，多个以逗号隔开

  //自身轨迹,单个
  if (obj.length === 1 ){
    for (let i = 0; i<recordTargetDict.length; i++){
      if (obj[0].targetType === recordTargetDict[i].value){
        analyzeType = 0; //自身轨迹
      }
    }
    switch (obj[0].targetType){
      case 0:
        faceId.push(obj[0].targetValue)
        break;
      case 1:
        licensePlate.push(obj[0].targetValue)
        break;
      case 2:
        imsi.push(obj[0].targetValue)
        break;
      case 3:
        imei.push(obj[0].targetValue)
        break;
      case 6:
        mmsi.push(obj[0].targetValue)
        break;
      case 7:
        uniqueId.push(obj[0].targetValue)
        break;
    }
  }else{
    //两个组合轨迹
    let targetType = [obj[0].targetType,obj[1].targetType]
    //人人
    if (targetType[0]===0 && targetType[1] === 0){
        analyzeType = 1
        faceId.push(obj[0].targetValue)
        faceId.push(obj[1].targetValue)
    }
    //车车
    if (targetType[0]===1 && targetType[1] === 1){
      analyzeType = 2
      licensePlate.push(obj[0].targetValue)
      licensePlate.push(obj[1].targetValue)
    }
    //码码
    if (targetType[0]===2 && targetType[1] === 2){
      analyzeType = 3
      imsi.push(obj[0].targetValue)
      imsi.push(obj[1].targetValue)
    }
    //码码
    if (targetType[0]===3 && targetType[1] === 3){
      analyzeType = 3
      imei.push(obj[0].targetValue)
      imei.push(obj[1].targetValue)
    }
    //船船
    if (targetType[0]===6 && targetType[1] === 6){
      analyzeType = 4
      mmsi.push(obj[0].targetValue)
      mmsi.push(obj[1].targetValue)
    }
    //人车
    if (targetType.includes(0) && targetType.includes(1)){
      analyzeType = 5
      if (targetType[0].targetType===0){
        faceId.push(obj[0].targetValue)
        licensePlate.push(obj[1].targetValue)
      }else{
        faceId.push(obj[1].targetValue)
        licensePlate.push(obj[0].targetValue)
      }
    }
    //人船
    if (targetType.includes(0) && targetType.includes(6)){
      analyzeType = 6
      if (targetType[0].targetType===0){
        faceId.push(obj[0].targetValue)
        mmsi.push(obj[1].targetValue)
      }else{
        faceId.push(obj[1].targetValue)
        mmsi.push(obj[0].targetValue)
      }
    }
  }

  _.unset(params,'obj')
  const dto: any = {
    ...pageInfo,
    analyzeType,
    faceId:faceId.join(',') || null,
    licensePlate:licensePlate.join(',') || null,
    imsi:imsi.join(',') || null,
    imei:imei.join(',') || null,
    mmsi:mmsi.join(',') || null,
    uniqueId:uniqueId.join(',') || null,
  };
  if (params.time) {
    dto.beginTime = dayjs(params.time[0]).format(YMDHm)
    dto.endTime = dayjs(params.time[1]).format(YMDHm)
  }
  let vo:any = await getHistoryTrack(dto)

  const currentShip = {
    legendName: (obj[0].targetValue).toString(),
    latLngList: [] as any[]
  }
  const targetShip = {
    legendName: (obj[1] && obj[1].targetValue) || '',
    latLngList: [] as any[]
  }
  vo.content.forEach((ele: any,idx:number) => {
    ele.index = (pageInfo.pageNumber - 1) * pageInfo.pageSize + idx + 1
    if (currentShip.legendName === ele.content) {
      currentShip.latLngList.push({
        lng:ele.latitude,
        lat:ele.longitude,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading
      })
    } else {
      targetShip.latLngList.push({
        lng:ele.latitude,
        lat:ele.longitude,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading
      })
    }
  });

  let trackData = obj.length>1? [currentShip, targetShip] : [currentShip]
  return {
    data : vo.content,
    trackData,
    total: vo.total
  }
}

//获取智能研判详情
export async function analyzeModelDetailAsync(id:any){
  return await analyzeModelDetail(id)
}

//查看所有过程数据列表
export async function getProcessDataListAsync(pageInfo: PageInfo, params: any){
  if (!params.eventId || !params.objType){
    return {
      data:[],
      total:0
    }
  }
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
  };
  let vo:any = await getProcessDataList(dto)
  let data = vo.records
  matching(data,dataType,'codeType','codeTypeName')
  //index，前端自己造
  /**
   * 后端archiveType
   * 人员档案: archiveType:'0'
   * 车辆档案: archiveType:'1'
   * 手机档案: archiveType:'2'
   * 船舶档案: archiveType:'3'
   *
   * 前端archiveType
   * 1 船舶档案，
   * 2 人员档案，
   * 3 车辆档案
   * */
  if (vo.total>0){
    data.forEach((item:any,idx:number)=>{
      item.index = (pageInfo.pageNumber - 1) * pageInfo.pageSize + idx + 1
      /*archiveType转换*/
      switch (item.archiveType) {
        case '0':
          item.archiveType = 2;
          break
        case '1':
          item.archiveType = 3;
          break
        case '3':
          item.archiveType = 1;
          break
      }
    })
  }

  // 数据内容格式化: 1是雷达，2是ais。 tagContent:2_412465313,2_412465315,1_412465313,1_412465315
  if(vo.total>0){
    
    data.forEach((item:any) => {
      if(item.tagContent){
        let aisArr:string[] = []
        let radarArr:string[] = [];
        let tags = item.tagContent.split(',');
        tags.forEach((item:any)=>{
            if(item.startsWith('1')){
              aisArr.push(item.split('_')[1]) 
            }else{
              radarArr.push(item.split('_')[1])
            }
        })
        let aisStr = aisArr.length> 0? 'AIS:'+aisArr.join(',') : ''
        let radarStr = radarArr.length > 0? '雷达批号:'+radarArr.join(',') : ''
        item.dataContent = aisStr + radarStr
      }
    });
  }

  return{
    data:data,
    total:vo.total
  }
}

//过程数据中获取轨迹信息
export async function getTrackData(pageInfo: PageInfo, params: any){
  /*
  * obj:{
  * targetType: '1'
  * targetValue: 粤B123456
  * }
  * */
  let obj = params.obj;
  let analyzeType:any = 0
  let faceId:any = []                //faceId,人脸数据，多个以逗号隔开
  let imei:any = []                //imei,侦码数据，多个以逗号隔开
  let imsi:any = []                  //imsi,侦码数据，多个以逗号隔开
  let licensePlate:any = []         //	licensePlate,车牌数据，多个以逗号隔开
  let mmsi:any = []                  //船舶唯一标识，多个以逗号隔开
  let uniqueId:any = []              //雷达目标唯一标识，多个以逗号隔开

  /*
  { name: "人脸", value: '0' },
  { name: "车牌", value: '1' },
  { name: "IMSI", value: '2' },
  { name: "IMEI", value: '3' },
  { name: "MAC", value: '4' },
  { name: "手机", value: '5' },
  { name: "MMSI", value: '6' },
  { name: "雷达目标", value: '7' },
  { name: "目标ID", value: '8' },
  */
  switch (String(obj.targetType)){
    case '0':
      faceId.push(obj.targetValue)
      break;
    case '1':
      licensePlate.push(obj.targetValue)
      break;
    case '2':
      imsi.push(obj.targetValue)
      break;
    case '3':
      imei.push(obj.targetValue)
      break;
    case '6':
      mmsi.push(obj.targetValue)
      break;
    case '7':
      uniqueId.push(obj.targetValue)
      break;
  }
  const dto: any = {
    ...pageInfo,
    analyzeType,
    faceId:faceId.join(',') || null,
    licensePlate:licensePlate.join(',') || null,
    imsi:imsi.join(',') || null,
    imei:imei.join(',') || null,
    mmsi:mmsi.join(',') || null,
    uniqueId:uniqueId.join(',') || null,
  };
  if (params.time) {
    dto.beginTime = dayjs(params.time[0]).format(YMDHm)
    dto.endTime = dayjs(params.time[1]).format(YMDHm)
  }
  let vo:any = await getHistoryTrack(dto)
  const currentObj = {
    legendName: obj.targetValue,
    latLngList: [] as any[]
  }
  vo.content.forEach((ele: any,idx:number) => {
    // const [lng, lat] = ele.capAddress.split(',')
    const [lng, lat] = [ele.latitude, ele.longitude]
    ele.index = (pageInfo.pageNumber - 1) * pageInfo.pageSize + idx + 1
    currentObj.latLngList.push({
      lng,
      lat,
      time: ele.capTime,
      speed: Number(ele.speed),
      course: ele.course,
      heading: ele.trueHeading
    })
  });
  //行为翻译，后端返回的codeType是number类型
  matching(vo.content,dataTypeNum,'codeType','codeTypeName')
  return {
    trackData: [currentObj],
    data: vo.content
  }
}

/**导出过程数据*/

export async function exportProcessDataAsync(params:any,fileName?:string){
  let dto = {
    ...params
  }
  let vo = await exportProcessData(dto)
  downloadFile(vo.data, fileName || "过程数据");
}


/** 获取研判分析任务详细信息*/
export async function getJudgmentDetailAsync(id:any){
  let vo = await getJudgmentDetail(id)
  return vo
}
