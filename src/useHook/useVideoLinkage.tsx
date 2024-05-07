import { message } from "antd";
import { useAppDispatch, useAppSelector } from "app/hooks";
import VideoLink from "component/VideoLink";
import VideoControl from "component/VideoLink/VideoControl";
import windowUI from "component/WindowUI";
import _ from "lodash";
import { useCallback, useState, useEffect } from "react";
import { getRealtimeVideoUrlAsync } from "server/ship";
import { controlWinPositionInfo, selectedKey, selectVideoLinkDeviceList, setDeviceList, setSelectedKey, winPositionInfo } from "slice/videoLinkSlice";

interface Props {
  targetType: 'ais' | 'radar'
  lat?: number
  lng?: number
  mmsi?: string       //ais船舶mmsi
  uniqueId?: string   //雷达批号
  fusionId?: string  	//融合ID
  station?: string //ais才有station
}

// 视频联动
const useVideoLinkage = () => {
  console.debug('useVideoLinkage')
  const dispatch = useAppDispatch()
  const VideoLinkDeviceList = useAppSelector(selectVideoLinkDeviceList)
  const winPosition = useAppSelector(winPositionInfo)
  // 云台控制位置
  const controlWinPosition = useAppSelector(controlWinPositionInfo)
  const selectedWinKey = useAppSelector(selectedKey)

  // 关闭弹窗时，当前弹窗的唯一标识
  const [closeWinKey, setCloseWinKey] = useState<string>('')

  // 关闭弹窗时，选中其他的窗口。
  useEffect(() => {
    if (closeWinKey) {
      for (let i = 0; i < VideoLinkDeviceList.length; i++) {
        if (VideoLinkDeviceList[i].key !== closeWinKey && VideoLinkDeviceList[i].deviceCode) {
          dispatch(setSelectedKey(VideoLinkDeviceList[i].key))
          setCloseWinKey('')
          break;
        }
      }
    }
  }, [VideoLinkDeviceList, closeWinKey, dispatch])

  const videoLink = useCallback(
    async ({
      targetType,
      lat,
      lng,
      mmsi,
      uniqueId,
      fusionId,
      station
    }: Props) => {

      setCloseWinKey('')
      let codeType = 6
      let codeValue = ''
      if (targetType === 'ais') {
        codeType = 6
        codeValue = mmsi || ''
      } else if (targetType === 'radar') {
        codeType = 7
        codeValue = uniqueId || ''
      }
      // 开始联动
      let linkage = await getRealtimeVideoUrlAsync({
        codeType,
        codeValue,
        fusionId: fusionId || '',
        latitude: lat,
        longitude: lng,
        station: station || '',
        mmsi: mmsi || '',
        batchNum: uniqueId || ''
      })

      /**
       * 弹窗逻辑步骤：
       * 1、先判断是否有空位（之前打开过，然后关闭弹窗了）或者有视频失败的弹窗（空视频），则覆盖这类弹窗
       * 2、再判断当前设备是否已经打开，如果打开，则再覆盖此弹窗。
       * 3、如果三个位置都成功，则后面打开弹窗的覆盖最后一个弹窗
      */
      // 弹窗位置
      let offset = [1480, 55]
      // 弹窗唯一标识
      let key = _.uniqueId()
      // 判断是否有空位或者有失败的视频
      let isFailedVideo = VideoLinkDeviceList.some((item: any) => item.deviceCode === '')

      if (isFailedVideo) {
        // 有失败的视频或者空位，就覆盖空位或者失败视频
        for (let i = 0; i < VideoLinkDeviceList.length; i++) {
          if (VideoLinkDeviceList[i].deviceCode === '') {
            key = VideoLinkDeviceList[i].key
            switch (i) {
              case 0:
                offset = [1480, 60]
                break
              case 1:
                offset = [1030, 60]
                break
              case 2:
                offset = [1030, 470]
                break
            }
            // 终止循环
            break
          }
        }
      } else {
        let len = VideoLinkDeviceList.length
        switch (len) {
          case 0:
            offset = [1480, 60]
            break
          case 1:
            offset = [1030, 60]
            break
          case 2:
            offset = [1030, 470]
            break
          case 3:
            if (selectedWinKey) {
              for (let i = 0; i < VideoLinkDeviceList.length; i++) {
                if (VideoLinkDeviceList[i].key === selectedWinKey) {
                  key = selectedWinKey
                  switch (i) {
                    case 0:
                      offset = [1480, 60]
                      break
                    case 1:
                      offset = [1030, 60]
                      break
                    case 2:
                      offset = [1030, 470]
                      break
                    default:
                      offset = [1030, 470]
                      break;
                  }
                  // 终止循环
                  break
                }
              }
            } else {
              offset = [1030, 470]
              key = VideoLinkDeviceList[2].key
            }
            break
        }
      }
      // 判断当前设备是否已经展示
      for (let i = 0; i < VideoLinkDeviceList.length; i++) {
        if (VideoLinkDeviceList[i].deviceCode === linkage?.data?.deviceCode) {
          key = VideoLinkDeviceList[i].key
          switch (i) {
            case 0:
              offset = [1480, 60]
              break
            case 1:
              offset = [1030, 60]
              break
            case 2:
              offset = [1030, 470]
              key = VideoLinkDeviceList[2].key
              break
          }
          break
        }
      }

      if (linkage.code !== 200) {
        message.error(linkage.msg || '暂无可用联动设备')
      } else {
        let haveOldWinPositionInfo = winPosition.height !== 0 && winPosition.width !== 0
        let width = haveOldWinPositionInfo ? (winPosition.width) : 400
        let height = haveOldWinPositionInfo ? (winPosition.height) : 360
        let winOffset = offset
        // 使用变化后的弹窗位置，为了避免重叠，错开16px像素
        if (winPosition.width > 460 && haveOldWinPositionInfo) {
          width = winPosition.width
          height = winPosition.height
          winOffset = [winPosition.left - 16, winPosition.top + 16]
        } else {
          width = 400
          height = 360
          winOffset = offset
        }
        windowUI(<VideoLink
          targetType={targetType === 'radar' ? 'radar' : 'ais'}
          uniqueId={uniqueId}
          fusionId={fusionId}
          mmsi={mmsi}
          uniqueKey={key}
        />, {
          title: `视频联动${linkage?.data?.deviceName ? ` : ${linkage?.data?.deviceName}` : ''}`,
          width: width + 'px',
          height: height + 'px',
          offset: winOffset,
          key: key, //替换原有的弹窗
          onClose: function () {
            dispatch(setDeviceList({
              key: key,
              deviceCode: '',
              videoInfo: null,
              videoLinkData: null,
              stepValue: 20
            }))
            setCloseWinKey(key)
          },
          isResize: true,
          style: {
            wrapperStyle: {
              overflowY: 'auto'
            }
          }
        })
        // 设置全局设备列表
        dispatch(setDeviceList({
          key: key,
          deviceCode: linkage.data.deviceCode,
          videoInfo: {
            ...linkage.data,
            url: linkage.data.vedioUrl,
            deviceCode: linkage.data.deviceCode,
            channel: linkage.data.channel,
            lockId: linkage.data.lockId
          },
          videoLinkData: {
            targetType,
            lat,
            lng,
            mmsi,
            uniqueId,
            fusionId,
            station
          },
          stepVal: 20
        }))
        // 选中当前打开的视频
        dispatch(setSelectedKey(key))
        let isUseOldPosition = controlWinPosition.left > 0 && controlWinPosition.top > 0
        windowUI(<VideoControl />, {
          title: '云台控制',
          width: '400px',
          height: 'auto',
          offset: isUseOldPosition ? [controlWinPosition.left, controlWinPosition.top] : [1480, 470],
          key: 'cloudControlWin',
          onClose: () => {
            dispatch(setSelectedKey('null'))
          }
        })
      }
    },
    [VideoLinkDeviceList, controlWinPosition, selectedWinKey, dispatch, winPosition],
  )

  return videoLink
}

export default useVideoLinkage;