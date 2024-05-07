import { sendCameraControl } from "api/device"
import { addPreset, delPreset, editPreset, getCameraPTZ, getPlaceDefaultPreset, getPresetList, setDefaultPreset } from "api/preset"
import { stopCameraLockAsync } from "./ship"

// 预置位-新增
export async function addPresetData(params: any, videoInfo: any, channel: string) {

  const ptz = await getCameraPTZData(videoInfo, channel)

  const dto = {
    ...params,
    pan: ptz.pan,
    tilt: ptz.tilt,
    zoom: ptz.zoom,
  }

  await addPreset(dto)

}

// 预置位-保存当前ptz
export async function savePresetData(params: any, videoInfo: any, channel: string) {

  const ptz = await getCameraPTZData(videoInfo, channel)

  const dto = {
    id: params.id,
    pan: ptz.pan,
    tilt: ptz.tilt,
    zoom: ptz.zoom,
  }

  await editPreset(dto, { successText: '保存预置位' })

}

// 预置位-编辑名称
export async function editPresetName(id: any, name: string) {

  const dto = {
    id,
    presetName: name
  }

  await editPreset(dto, { successText: '编辑预置位' })

}

// 预置位-删除
export async function delPresetData(id: number) {

  const dto = {
    id
  }

  await delPreset(dto)

}

// 预置位-查询所有
export async function getAllPreset(deviceCode: string, placeId?: number) {

  const dto = {
    deviceCode,
    pageSize: -1,
    pageNumber: 1
  }

  const vo = await getPresetList(dto)

  if (placeId) {
    const defDto = {
      areaId: placeId,
      deviceCodes: deviceCode
    }
    const list = await getPlaceDefaultPreset(defDto)
    if (list.length !== 0) {
      const [defaultPreset] = list
      const target = vo.find((ele: any) => ele.id === defaultPreset.id)
      if (target) {
        target.isPlaceDefaultPreset = true
      }
    }
  }

  return vo

}

// 预置位-查询所有
export async function getCameraPTZData(params: any, channel: string) {
  // const channelList = videoInfo.channelNo.split(';').map((item: any) => {
  //   const [channel, type] = item.split(',')
  //   return { channel, type }
  // })

  // const targetChannel = channelList.find((item: any) => Number(item.type) === lightType)
  let targetChannel: any

  if (params.deviceChannelList) {
    const target = params.deviceChannelList.find((item: any) => {
      if (channel) {
        return item.channelNo === channel
      } else {
        return item.vadioType === 1
      }
    })

    if (target) {
      targetChannel = {
        channel: target.channelNo,
        type: target.vadioType
      }
    }

  } else {
    const channelList = params.channelNo.split(';').map((item: any) => {
      const [channel, type] = item.split(',')
      return { channel, type }
    })

    targetChannel = channelList.find((item: any) => {
      if (channel) {
        return item.channel === channel
      } else {
        return item.type === '1'
      }
    })
  }

  const dto = {
    deviceCode: params.deviceCode,
    channel: targetChannel.channel
  }

  const vo = await getCameraPTZ(dto)

  return vo

}

// 重点场所-预置位配置
export async function setDefaultPresetByPlaceId(placeId: number, presetId: number, device: any) {
  const dto = {
    areaId: placeId,
    presetId: presetId,
    deviceCode: device.deviceCode
  }
  const vo = await setDefaultPreset(dto)
  return vo
}

// 实时监控-重点场所-获取默认预置位
export async function getDefaultPresetByPlaceId(placeId: number, deviceList: any[], signal?: AbortController) {

  const deviceCodes = deviceList.map(item => item.deviceCode)
  const deviceCodesStr = deviceCodes.toString()

  const dto = {
    areaId: placeId,
    deviceCodes: deviceCodesStr
  }

  const vo = await getPlaceDefaultPreset(dto, { signal })

  for (let i = 0; i < vo.length; i++) {
    const item = vo[i];
    const targetDevice = deviceList.find(ele => ele.deviceCode === item.deviceCode)
    if (targetDevice) {
      // 默认可见光
      const targetChannel = targetDevice.channelList.find((ele: any) => ele.type === 1)
      if (targetChannel) {
        try {
          const ctrDto = {
            channel: targetChannel.channel,
            deviceCode: targetDevice.deviceCode,
            controlType: 6,
            ptzVo: {
              pan: item.pan,
              tilt: item.tilt,
              zoom: item.zoom
            }
          }
          const vo = await sendCameraControl(ctrDto, { signal })
          const clearLockDto = {
            lockId: vo.lockId,
            deviceCode: targetDevice.deviceCode,
          }
          await stopCameraLockAsync(clearLockDto)
        } catch (error) {
          console.warn('设置预置位', error)
        }
      }
    }
  }

}