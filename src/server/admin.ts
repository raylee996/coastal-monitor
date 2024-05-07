import { addVedioTConfig, delVedioTConfig, editVedioTConfig, getVedioTConfigInfo, getVedioTConfigList, getLoginSrcData, getLoginCAData, getLogVerify } from "api/admin"
import { getDevicesList } from "api/device"
import { getLabelList } from "api/label"
import { YMDHms } from "helper"
import { Type } from "helper/dictionary"
import { DayjsPair } from "hooks/hooks"
import { addMyNoteItem } from "./system"

export interface VedioTConfigInfo {
  id: number | string
  /** 分屏类型 */
  splitType: string
  /** 间隔时间 */
  ttl: number
  /** 名称 */
  groupName: string
  /** 设备数量 */
  deviceNum: number
  /** 设备列表 */
  deviceInfoList: {
    /** 设备名称 */
    name: string
    /** 设备编码 */
    deviceCode: string
    /** 通道列表 */
    deviceChannelList: {
      channelNo: string
      channelType: number
    }
  }[]
}
/** 获取巡设置列表 */
export async function getVedioTConfigData(signal?: AbortController): Promise<VedioTConfigInfo[]> {

  const dto: any = {
    allItem: true,
    current: 1,
    size: -1
  }

  const vo = await getVedioTConfigList(dto, { signal })

  return vo.records
}

/** 删除巡设置 */
export async function delVedioTConfigData(params: any) {

  const ids = params.id

  await delVedioTConfig(ids)
}
/** 登录srcData */
export async function getLoginSrc(params: any) {

  const user = {
    dnCert: params
  }

  return await getLoginSrcData(user)
}
export async function getLogsVerify(params: any) {
  return await getLogVerify(params)
}
export async function getLoginCA(params: any) {

  const user = {
    "dnCert": params.dnCert,
    "password": params.password,
    "signData": params.signData,
    "username": params.username
  }

  return await getLoginCAData(user)
}

/** 新增巡设置 */
export async function addVedioTConfigData(params: any) {

  const { deviceCodeList, ...othParams } = params

  const dto: any = {
    ...othParams
  }

  const deviceCodes = deviceCodeList.map((item: string) => ({ deviceCode: item }))

  dto.deviceCodes = JSON.stringify(deviceCodes)

  await addVedioTConfig(dto)
}

/** 编辑巡设置 */
export async function editVedioTConfigData(params: any) {

  const { id, deviceCodeList, ...othParams } = params

  const dto: any = {
    id,
    ...othParams
  }

  if (id !== -1) {
    const deviceCodes = deviceCodeList.map((item: string) => ({ deviceCode: item }))
    dto.deviceCodes = JSON.stringify(deviceCodes)
    dto.id = id
  }

  await editVedioTConfig(dto)
}

/** 获取删除巡设置信息 */
export async function getVedioTConfigInfoData(id: any) {

  const vo = await getVedioTConfigInfo(id)

  const deviceCodes = JSON.parse(vo.deviceCodes)

  const result = {
    ...vo,
    deviceCodeList: deviceCodes.map((item: any) => item.deviceCode)
  }

  return result
}

/** 获取个人工作台-我的便签-分类管理数据 */
export async function getWorkbenchTypeDict() {

  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: 11
  }

  const vo = await getLabelList(dto);

  const result: Type<number>[] = vo.records.map((item: any) => {
    return {
      name: item.labelName,
      value: item.id
    }
  })

  return result
}

/** 历史视频-新增标签 */
export async function addHistoryVideoNote(params: any) {

  const result = await getDevicesList({
    pageNumber: 1,
    pageSize: 1,
    deviceNameOrCode: params.deviceCode
  })

  const [deviceInfo] = result.records

  if (deviceInfo) {
    const [sTime, eTime]: DayjsPair = params.range
    const content = {
      sTime: sTime.format(YMDHms),
      eTime: eTime.format(YMDHms),
      info: deviceInfo
    }

    const dto = {
      noteTitle: '历史视频',
      noteType: 4,
      noteTypeId: params.noteTypeId,
      noteDesc: params.noteDesc,
      noteContent: JSON.stringify(content)
    }

    await addMyNoteItem(dto)

  } else {
    console.warn('查询不到设备详情')
  }
}