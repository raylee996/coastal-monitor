import dayjs from "dayjs";
import {YMDHms} from "../../helper";
import {getBehivorEchartsPieSimple} from "../../helper/echartsConfig";
import {
  statisticsCase,
  statisticsChargePerson,
  statisticsSource,
  statisticsTime,
  taskReviewList
} from "../../api/core/taskReview";
import {PageInfo} from "hooks/integrity/TableInterface";
import {getLabelTable} from "../label";

//任务来源统计
export async function statisticsSourceAsync(param:any){
  const dto: any = {
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  if (param.sourceDate === 'month') {
    dto.startTime = dayjs().subtract(1, 'M').format(YMDHms)
  } else {
    dto.startTime = dayjs().subtract(1, 'y').format(YMDHms)
  }

  const [vo] = await Promise.all([statisticsSource(dto)])
  const data = vo.map((ele: any) => {
    return {
      name: ele.label,
      value: Number(ele.num)
    }
  })

  return getBehivorEchartsPieSimple({

    seriesData: data
  });
}

//任务用时统计
export async function statisticsTimeAsync(param:any){
  const dto: any = {
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  if (param.timeDate === 'month') {
    dto.startTime = dayjs().subtract(1, 'M').format(YMDHms)
  } else {
    dto.startTime = dayjs().subtract(1, 'y').format(YMDHms)
  }

  const [vo] = await Promise.all([statisticsTime(dto)])
  const data = vo.map((ele: any) => {
    return {
      name: ele.label,
      value: Number(ele.num)
    }
  })

  return getBehivorEchartsPieSimple({
    seriesData: data
  });
}

//关联案件统计
export async function statisticsCaseAsync(param:any){
  const dto: any = {
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  if (param.caseDate === 'month') {
    dto.startTime = dayjs().subtract(1, 'M').format(YMDHms)
  } else {
    dto.startTime = dayjs().subtract(1, 'y').format(YMDHms)
  }

  const [vo] = await Promise.all([statisticsCase(dto)])
  //预案类型
  const planType: any = await getLabelTable({type: 8})
  const data = vo.map((ele: any) => {
    let name = ''
    for (let i = 0 ; i<planType.data.length; i++){
      if (ele.id===planType.data[i].id){
        name = planType.data[i].labelName
      }
    }
    return {
      name,
      value: Number(ele.num)
    }
  })
 
  return getBehivorEchartsPieSimple({
    seriesData: data
  });
}

//责任人排行
export async function statisticsChargePersonAsync(param:any){
  const dto: any = {
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  if (param.chargeManDate === 'month') {
    dto.startTime = dayjs().subtract(1, 'M').format(YMDHms)
  } else {
    dto.startTime = dayjs().subtract(1, 'y').format(YMDHms)
  }

  const [vo] = await Promise.all([statisticsChargePerson(dto)])
  return vo.map((ele: any) => {
    return {
      name: ele.label,
      value: Number(ele.num)
    }
  })
}

//传入秒，返回天，时，分, 如： 9天5时3分
function dateCalculation(second:any){
  if (second > 0) {
    let day = 0
    let hour = 0
    let minute: number

    minute = Math.floor(second / 60)
    if (parseInt(String(minute)) > 60) {
      hour = parseInt(String(minute / 60))
      minute %= 60 //算出有多分钟
    }
    if (parseInt(String(hour)) > 24) {
      day = parseInt(String(hour / 24))
      hour %= 24 //算出有多小时
    }

    if (day>0){
      return `${day}天 ${hour}时 ${minute}分`
    }
    if (day===0 && hour>0){
      return `${hour}时 ${minute}分`
    }
    if (day===0 && hour===0){
      return `${minute}分`
    }
  }else {
    return null
  }
}
//任务回顾列表
export async function taskReviewListAsync(pageInfo: PageInfo, params?: any){
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params,
  };
  let vo:any = await taskReviewList(dto)
  //预案类型
  const planType: any = await getLabelTable({type: 8})
  vo.records.forEach((item: any,index:number) => {
    item.index = (pageInfo.pageNumber - 1) * pageInfo.pageSize + index + 1
    // 开始时间，结束时间之差(秒)
    let seconds = dayjs(item.completeTaskTime).diff(item.createTime,'second')
    item.taskTime = dateCalculation(seconds) || '0分'
    //格式化案件类别relationCaseTypeName
    item.relationCaseTypeName = ''
    for (let i = 0 ; i<planType.data.length; i++){
      if (item.relationCaseTypeId===planType.data[i].id){
        item.relationCaseTypeName = planType.data[i].labelName
      }
    }
  })
  return {
    data: vo.records,
    total: vo.total,
  };
}
