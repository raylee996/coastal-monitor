import matching, { deviceStatues, Type } from 'helper/dictionary';
import { delTTSContent, exportDeviceTable, exportException, getDeviceAll, getDeviceAreaRelation, getDeviceOnlineCount, getDevicesList, getExceptionLogs, getExceptionTypes, getPointList, getSendedMicroPhoneList, graphqlDevice, itcJobAdd, itcJobList, queryTTSContentList, sendCameraControl, sendCameraControlUseRes, stopMicroPhone, ttsContentAdd, ttsContentEdit } from "api/device";
import { PageInfo } from 'hooks/integrity/TableInterface';
import { downloadFile, YMDHms } from 'helper';
import _ from 'lodash';
import { FormInstance } from 'antd';
import { getDictDataByType } from './system';
import { getIconByDeviceType } from 'helper/mapIcon';
import { CameraOptionType, SteeringType } from 'component/SteeringWheel';
import { cameraPlayerPicture, getVideoSrcByDeviceCode, getVideoUrlByDeviceCode } from 'api/ship';
import { checkHistoryPlay, getHistoryPlayUrl, pauseHistoryPlay, queryGbRecordApi, resumeHistoryPlay, seekHistoryPlay, setSpeedByHistoryPlay, stopHistoryPlay } from 'api/video';
import dayjs from 'dayjs';
import { getPlacesAllDevices } from 'api/place';
import { stopCameraLockAsync } from './ship';
import { getDeviceVideoUrl } from 'api/situation';


export async function getAllDeviceList() {
  const dto = {
    query: `{
      allTable {
        id
        name
        url
      }
    }`,
  };
  const res = await graphqlDevice(dto);
  return res.data.data.allTable;
}


// 获取点位列表
/*export async function getPointlist(typeList?: any[]) {

  const dto = {
    query: `query ($pageInfo: PageInfo){
      table(pageInfo: $pageInfo){
        id
        name
        type
        lng
        lat
      }
    }`,
    variables: {
      pageInfo: {
        pageNumber: 1,
        pageSize: 20
      },
    }
  };
  const res = await graphqlPoint(dto);

  const result = res.data.data.table.map((val: any) => ({ ...val, label: val.name, value: val.id, type: String(val.type) }))

  matching(result, pointTypeDict, 'type')

  return result
}*/

//获取点位信息
export async function getPointListAsync(params?: any) {
  const dto = {
    current: -1,
    size: 10,
    ...params,
  };
  let vo = await getPointList(dto)
  return vo.map((val: any) => ({ ...val, label: val.name, value: val.id, type: String(val.type), lat: val.latitude, lng: val.longitude }))
}

export async function getExceptionTypeDict() {
  const vo = await getExceptionTypes();
  const typeDict: Type<number>[] = []
  _.forIn(vo, function (value, key) {
    typeDict.push({
      name: value,
      value: Number(key),
    })
  });
  return typeDict
}

export async function getExceptionList(pageInfo: PageInfo, params: any) {

  const { datetimeRange, ...otherParams } = params;

  const dto = {
    ...pageInfo,
    ...otherParams
  }

  if (datetimeRange) {
    const [begin, end] = datetimeRange;
    dto.beginTime = begin.format(YMDHms);
    dto.endTime = end.format(YMDHms);
  }

  const vo = await getExceptionLogs(dto);
  const types = await getExceptionTypeDict()
  matching(vo.records, types, 'exception_type')
  console.log(types)
  console.log(vo.records)
  return {
    data: vo.records,
    total: vo.total
  };
}

export async function exportExceptionFile(form: FormInstance) {

  const params = form.getFieldsValue()

  const { datetimeRange, ...otherParams } = params;

  const dto = {
    ...otherParams
  }

  if (datetimeRange) {
    const [begin, end] = datetimeRange;
    dto.beginTime = begin.format(YMDHms);
    dto.endTime = end.format(YMDHms);
  }

  const vo = await exportException(dto);
  downloadFile(vo.data, '异常日志')
}

// 设备信息-列表-地图展示使用
export async function getDeviceAllData(deviceTypes: any, signal: AbortController): Promise<any[]> {
  const dto = {
    deviceTypes,
    current: 1,
    size: -1
  }
  const vo = await getDeviceAll(dto, { signal });

  const dict = await getDictDataByType("device_type")

  matching(vo, dict, 'deviceType')
  matching(vo, deviceStatues, 'status')

  vo.forEach((ele: any) => {
    const lIcon = getIconByDeviceType(ele.deviceType)
    ele.latLng = [ele.latitude, ele.longitude]
    ele.lIcon = lIcon
  });

  return vo;
}




/** 获取所有设备类型 */
export async function doGetDeviceType() {
  const vo = await getDictDataByType('device_type')
  return vo
}


/** 设备信息-设备分类统计-态势感知-感知设备使用 */
export async function getDeviceTypeCount(source: string[], signal?: AbortController) {

  if (source.length) {
    const dto = {
      deviceSource: source.length === 1 ? Number(source[0]) : undefined
    }

    const vo = await getDeviceOnlineCount(dto, { signal })
    const deviceDict = await getDictDataByType('device_type', 'auto', signal)

    const deviceList = vo.map((item: any) => {
      const result = deviceDict.find(ele => ele.value === item.deviceType)
      if (_.isUndefined(result)) {
        console.warn('在字典数据中找不到对应的类型值', deviceDict, item)
      }
      return {
        name: result ? result.name : item.labelName,
        value: result ? result.value : item.deviceType,
        count: item.itemNum
      }
    })

    return deviceList
  } else {
    return []
  }

}

/** 态势感知-基础设备-感知设备使用 */
export async function getAllDeviceType(): Promise<Type<any>[]> {
  const vo = await getDeviceOnlineCount(null)

  const deviceDict = vo.map((item: any) => {
    return {
      name: item.labelName,
      value: item.deviceType
    }
  })

  return deviceDict
}


export interface CameraDeviceInfo {
  id: string
  deviceName: string
  deviceCode: string
  deviceSource: number
  channelList: {
    channel: string
    channelNo: string
    type: number
  }[]
}

/** 实时监控-设备列表 */
export async function getAllCamera(params?: any, signal?: AbortController): Promise<CameraDeviceInfo[]> {

  if (params?.placeId) {
    const dto = {
      focusPlaceId: params.placeId,
      deviceType: 1,
      current: 1,
      size: -1
    }

    params.text && _.set(dto, 'deviceNameOrCode', params.text)
    params.type && _.set(dto, 'cameraType', params.type)
    !_.isUndefined(params.source) && _.set(dto, 'deviceSource', params.source)


    const vo = await getPlacesAllDevices(dto, { signal })

    if (vo) {
      const result = vo.map((item: any) => {
        const channelList = item.deviceChannelList.map((ele: any) => ({
          channel: ele.channelNo,
          type: Number(ele.vadioType),
          name: Number(ele.vadioType) === 1 ? '可见光' : '红外'
        }))
        return {
          ...item,
          deviceName: item.name,
          id: _.uniqueId(),
          channelList
        }
      })
      return result
    } else {
      return []
    }
  } else {
    const dto = {
      deviceType: 1,
      orderType: 1,
      current: 1,
      size: -1
    }

    if (params) {
      params.text && _.set(dto, 'deviceNameOrCode', params.text)
      params.type && _.set(dto, 'cameraType', params.type)
      !_.isUndefined(params.source) && _.set(dto, 'deviceSource', params.source)
    }

    const vo = await getDevicesList(dto, { signal })

    const result = vo.records.map((item: any) => {
      let channelList: any[] = []
      if (item.channelNo) {
        channelList = item.channelNo.split(';').map((item: any) => {
          const [channel, type] = item.split(',')
          return {
            channel,
            type: Number(type),
            name: Number(type) === 1 ? '可见光' : '红外'
          }
        })
      }
      return {
        ...item,
        channelList
      }
    })

    return result
  }
}

export async function getAllCameraDevice(signal: AbortController) {

  const dto = {
    deviceType: 1,
    current: 1,
    size: -1
  }

  const vo = await getDevicesList(dto, { signal })

  const result = vo.records.map((item: any) => {
    let channelList: any[] = []
    if (item.channelNo) {
      channelList = item.channelNo.split(';').map((item: any) => {
        const [channel, type] = item.split(',')
        return {
          channel,
          type: Number(type)
        }
      })
    }
    return {
      ...item,
      channelList
    }
  })

  return result
}

/** 获取所有光电设备根据重点场所 */
export async function getAllCameraByPlaceId(placeId: number, signal?: AbortController) {

  let dto = {
    focusPlaceId: placeId,
    deviceType: 1,
    current: 1,
    size: -1
  }

  const vo = await getPlacesAllDevices(dto, { signal })

  return vo || []
}

/** 实时监控-设备字典列表 */
export async function getAllCameraDict() {

  const dto = {
    type: 1,
    deviceSource: 0,
    current: 1,
    size: -1
  }

  const vo = await getDevicesList(dto)

  const dict = vo.records.map((item: any) => ({
    name: item.deviceName,
    value: item.deviceCode
  }))

  return dict
}

/** 获取设备播放地址 */
export async function getCameraUrl(params: CameraDeviceInfo, channel: string, signal: AbortController) {

  const targetChannel = params.channelList.find(ele => ele.channel === channel)

  if (targetChannel) {
    const dto = {
      deviceCode: params.deviceCode,
      channel: targetChannel.channel
    }

    const vo = await getVideoUrlByDeviceCode(dto, { signal })

    return vo.vedioUrl
  } else {
    return ''
  }
}

/** 获取播放地址 */
export async function getCameraDeviceUrl(deviceCode: string, channel: string, signal: AbortController) {

  const dto = {
    deviceCode: deviceCode,
    channel: channel
  }

  const vo = await getVideoUrlByDeviceCode(dto, { signal })

  return vo.vedioUrl
}

/** 获取设备播放地址 */
export async function getUrlByCodeAndChannel(deviceCode: string, channel: string, signal: AbortController) {
  const dto = {
    deviceCode,
    channel
  }
  const vo = await getVideoUrlByDeviceCode(dto, { signal })
  return vo.vedioUrl
}

export async function getVideoHistoryUrl(device: any, segment: { beginTime: string, endTime: string }, channel: string, signal: AbortController) {

  if (channel) {
    const dto = {
      deviceCode: device.deviceCode,
      channel: channel,
      startTime: segment.beginTime,
      endTime: segment.endTime
    }
    const vo = await getHistoryPlayUrl(dto, { signal })

    return vo
  }

}
// 数据中心历史视频
export async function getVideoHistoryDataCenter(device: any, channel: string, beginTime: string, endTime: string, signal?: AbortController) {

  if (channel) {
    const dto = {
      deviceCode: device,
      channel: channel,
      startTime: beginTime,
      endTime: endTime
    }
    const vo = await getHistoryPlayUrl(dto, { signal })

    return vo
  }

}


/** 暂停历史视频流推送*/
export async function pauseCameraHistoryStream(stream: string) {
  await pauseHistoryPlay(stream)
}

/** 检查历史视频流推送*/
export async function checkCameraHistoryStream(stream: string) {
  const vo = await checkHistoryPlay(stream)
  return vo.isExist
}

/** 暂停历史视频流推送*/
export async function stopCameraHistoryStream(params: any) {
  let dto: any = { ...params }
  await stopHistoryPlay(dto)
}

/** 复播历史视频流推送*/
export async function resumeCameraHistoryStream(stream: string) {
  await resumeHistoryPlay(stream)
}

/** 设置历史视频流推送播放倍数*/
export async function speedHistoryStream(params: any, signal?: AbortController) {

  let dto: any = { ...params }

  await setSpeedByHistoryPlay(dto, { signal })

}

/** 设置历史视频流推送播放快进快退*/
export async function seekHistoryStream(params: any) {

  const dto = {
    stream: params.stream,
    time: params.time
  }

  await seekHistoryPlay(dto)

}

/** 获取历史视频 */
export async function queryGbRecord(params: any, signal: AbortController) {
  const { deviceCode, deviceChannelCode, ...para } = params
  const res = await queryGbRecordApi({ deviceCode, deviceChannelCode }, para, { signal })
  return {
    lastTime: res?.lastTime ? dayjs(res?.lastTime).format(YMDHms) : '',
    timeList: (res?.recordList || []).sort((a: { startTime: number; }, b: { startTime: number; }) => a.startTime - b.startTime).map((item: any) => {
      return { ...item, beginTime: item.startTime }
    })
  }
}

/** 光电设备-方向控制-开始 */
export async function cameraControl(param: SteeringType, device: CameraDeviceInfo, lockId: string, channel: string, step?: number) {

  const targetChannel = device.channelList.find(ele => ele.channel === channel || ele.channelNo === channel)

  if (targetChannel) {
    const dto: any = {
      channel: targetChannel.channel || targetChannel.channelNo,
      deviceCode: device.deviceCode,
      lockId,
      controlType: 4,
      step: step || 20,
      startFlag: true
    }

    switch (param) {
      case SteeringType.top:
        dto.direction = 1
        break;
      case SteeringType.bottom:
        dto.direction = 2
        break;
      case SteeringType.left:
        dto.direction = 3
        break;
      case SteeringType.right:
        dto.direction = 4
        break;
      case SteeringType.topLeft:
        dto.direction = 5
        break;
      case SteeringType.topRight:
        dto.direction = 6
        break;
      case SteeringType.bottomLeft:
        dto.direction = 7
        break;
      case SteeringType.bottomRight:
        dto.direction = 8
        break;
      default:
        break;
    }

    const res = await sendCameraControlUseRes(dto)

    if (Number(res.data.code) === 200) {
      const vo = res.data.data
      return vo ? vo.lockId : ''
    } else {
      throw new Error(res.data.msg)
    }
  } else {
    return ''
  }
}

/** 光电设备-方向控制-停止 */
export async function stopCameraControl(device: CameraDeviceInfo, lockId: string, channel: string) {

  const targetChannel = device.channelList.find(ele => ele.channel === channel || ele.channelNo === channel)

  if (targetChannel) {
    const dto: any = {
      channel: targetChannel.channel || targetChannel.channelNo,
      deviceCode: device.deviceCode,
      lockId,
      controlType: 4,
      startFlag: false,
      direction: 1
    }

    const res = await sendCameraControlUseRes(dto)

    if (Number(res.data.code) === 200) {
      const vo = res.data.data
      return vo ? vo.lockId : ''
    } else {
      throw new Error(res.data.msg)
    }
  } else {
    return ''
  }
}

/** 光电设备-拍照 */
export async function cameraPicture(deviceCode: string, channel: string) {
  const dto: any = {
    channel: channel,
    deviceCode: deviceCode
  }

  return await cameraPlayerPicture(dto)
}

/** 光电设备-可见光红外切换 */
export async function cameraLight(device: CameraDeviceInfo, visibleLight: number) {

  const dto: any = {
    deviceCode: device.deviceCode,
    visibleLight
  }

  const vo = await getVideoSrcByDeviceCode(dto)

  return vo
}

/** 光电设备-变倍、聚焦、光圈、设置预置位 */
export async function cameraOption(device: CameraDeviceInfo, params: any, channel: string) {

  if (channel) {
    const dto: any = {
      ...params,
      step: 50,
      channel: channel,
      deviceCode: device.deviceCode,
    }

    const vo = await sendCameraControl(dto)

    await stopCameraLockAsync({
      lockId: vo.lockId,
      deviceCode: device.deviceCode
    })

  }
}

/** 光电设备-镜头控制 */
export async function sendCameraOption(type: CameraOptionType, device: CameraDeviceInfo, lockId: string, channel: string, startFlag: boolean, step?: number) {
  const dto: any = {
    lockId,
    step: step || 20,
    channel: channel,
    deviceCode: device.deviceCode,
    startFlag
  }

  switch (type) {
    case CameraOptionType.zoomIn:
      dto.controlType = 1
      dto.cmd = 2
      break;
    case CameraOptionType.zoomOut:
      dto.controlType = 1
      dto.cmd = 1
      break;
    case CameraOptionType.focusIn:
      dto.controlType = 2
      dto.cmd = 2
      break;
    case CameraOptionType.focusOut:
      dto.controlType = 2
      dto.cmd = 1
      break;
    case CameraOptionType.apertureIn:
      dto.controlType = 3
      dto.cmd = 2
      break;
    case CameraOptionType.apertureOut:
      dto.controlType = 3
      dto.cmd = 1
      break;
    default:
      break;
  }

  if (dto.controlType) {
    const vo = await sendCameraControl(dto)
    return vo && vo.lockId ? vo.lockId : lockId
  } else {
    return lockId
  }
}

/** 光电设备-释放资源 */
export async function unCameraLock(deviceCode: string, lockId: string) {

  const dto = {
    lockId: lockId,
    deviceCode: deviceCode
  }

  await stopCameraLockAsync(dto)
}

export async function getDeviceDictByDeviceTypes(deviceTypes: string[]) {
  const dto = {
    deviceTypes,
    current: 1,
    size: -1
  }

  const vo = await getDeviceAll(dto)

  const dict = vo.map((item: any) => {
    return {
      name: item.name,
      value: item.deviceCode
    }
  })

  return dict
}

export async function getAISDeviceDict() {

  const vo = await getDeviceDictByDeviceTypes(['4'])

  return vo
}

export async function getRadarDeviceDict() {

  const vo = await getDeviceDictByDeviceTypes(['5', '6'])

  return vo
}

export async function getAISAndRadarDeviceDict() {

  const vo = await getDeviceDictByDeviceTypes(['4', '5', '6'])

  return vo
}

export async function getDeviceDictByDataType(dataType?: number) {

  if (_.isUndefined(dataType)) {
    return []
  } else {
    let dto: any

    switch (dataType) {
      case 0: // 全部
        dto = ['4', '5', '6']
        break;
      case 1: // AIS
        dto = ['4']
        break;
      case 2: // 雷达
        dto = ['5', '6']
        break;
      default:
        break;
    }

    const vo = await getDeviceDictByDeviceTypes(dto)

    return vo
  }


}

export async function getVideoDeviceDict() {

  const vo = await getDeviceDictByDeviceTypes(['1'])

  return vo
}

/** 获取红外全景设备列表 */
export async function getInfraredPanorama() {
  return [{
    name: '测试1',
    value: 1
  }, {
    name: '测试2',
    value: 2
  }];
}


// 设备管理-导出
export async function exportDeviceTableFile(form: FormInstance) {
  const params = form.getFieldsValue();

  const dto = {
    ...params,
  };

  const vo = await exportDeviceTable(dto);
  downloadFile(vo.data, "设备管理表格");
}

// 查询设备关联区域记录列表-分页
export async function getDeviceAreaRelationTable(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params
  }

  const vo = await getDeviceAreaRelation(dto)

  return {
    data: vo.records,
    total: vo.total
  };
}

/** 获取人车可布控所有设备 */
export async function getAllDevice(signal?: AbortController) {

  const dto = {
    current: 1,
    size: -1,
    businessFunction: '3,4' // 业务功能 1-视频 2-雷视联动 3-人脸识别 4-车辆识别 5-船舶结构化 6-视频告警 以半角逗号隔开
  }

  const vo = await getDevicesList(dto, { signal })
  const deviceDict = await getDictDataByType('device_type', 'number')

  matching(vo.records, deviceDict, 'deviceType')

  return vo.records
}

/** 获取指定id的设备列表 */
export async function getDeviceByCodes(codes: string, signal?: AbortController) {

  const dto = {
    deviceCode: codes,
    current: 1,
    size: -1
  }

  const vo = await getDeviceAll(dto, { signal })
  const deviceDict = await getDictDataByType('device_type', 'number')
  matching(vo, deviceDict, 'deviceType')

  return vo
}


// tts内容新增
export async function ttsContentAddAsync(params: any) {
  let dto = {
    ...params
  }
  return await ttsContentAdd(dto)
}

// tts内容编辑
export async function ttsContentEditAsync(params: any) {
  let dto = {
    ...params
  }

  return await ttsContentEdit(dto)
}

// 广播内容库列表
export async function queryTTSContentListAsync(pageInfo: PageInfo, params: any) {
  let dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params
  }
  let vo = await queryTTSContentList(dto)
  return {
    data: vo.records,
    total: vo.total,
  };
}

// 删除广播内容
export async function delTTSContentAsync(id: any) {
  await delTTSContent(id)
}

// 下发广播
export async function itcJobAddAsync(params: any) {
  let dto = {
    ...params
  }
  return await itcJobAdd(dto)
}

// 已下发的麦克风列表
export async function getSendedMicroPhoneListAsync() {
  let vo = await getSendedMicroPhoneList()
  return vo
}
// 停止已下发的麦克风
export async function stopMicroPhoneAsync(taskId: string) {
  await stopMicroPhone(taskId)
}

// 下发记录
export async function itcJobListAsync(pageInfo: PageInfo, params: any) {
  let dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params
  }
  let vo = await itcJobList(dto)
  let data = vo.records.map((item: any) => {
    return {
      ...item,
      isMicroPhone: item.content === '下发麦克风' ? true : false
    }
  })
  return {
    data,
    total: vo.total,
  };
}

/**
 * 获取视频播放地址
 * @param deviceCode 设备编码
 * @param channel 通道编码
 * @param signal 取消请求控制器
 * @returns 
 */
export async function getVideoUrlByLevel(deviceCode: string, channel: string, level: number, signal?: AbortController) {

  const dto = {
    deviceCode,
    channel,
    streamLevel: level
  }

  const vo = await getDeviceVideoUrl(dto, { signal })

  let url = ''
  if (document.location.protocol === 'http:') {
    url = vo.ws_flv
  } else {
    url = vo.wss_flv
  }

  return {
    url,
    stream: vo.stream
  }
}

/**
 * 获取设备来源的选项
 * @param signal AbortController
 */
export async function getDeviceSourceOptions(signal?: AbortController) {
  const vo = await getDictDataByType('device_source', 'auto', signal)
  const opts = vo.map(item => ({ ...item, label: item.name }))
  return opts
}