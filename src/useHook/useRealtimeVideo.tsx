import { useAppDispatch, useAppSelector } from "app/hooks";
import VideoLink from "component/VideoLink";
import VideoControl from "component/VideoLink/VideoControl";
import windowUI from "component/WindowUI";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { getVideoSrcByDeviceCodeAsync } from "server/ship";
import { controlWinPositionInfo, selectedKey, selectVideoLinkDeviceList, setDeviceList, setSelectedKey, winPositionInfo } from "slice/videoLinkSlice";

interface Props {
  deviceCode: string
  channel?: string
}
// 实时视频窗口
const useRealtimeVideo = () => {
  useState(() => console.debug('useRealtimeVideo'))


  const dispatch = useAppDispatch()


  const VideoLinkDeviceList = useAppSelector(selectVideoLinkDeviceList)
  const winPosition = useAppSelector(winPositionInfo)
  const selectedWinKey = useAppSelector(selectedKey)

  // 云台控制位置
  const controlWinPosition = useAppSelector(controlWinPositionInfo)

  // 关闭弹窗时，当前弹窗的唯一标识
  const [closeWinKey, setCloseWinKey] = useState<string>('')


  // 关闭弹窗时，选中第一个。
  useEffect(() => {
    if (closeWinKey) {
      for (let i = 0; i < VideoLinkDeviceList.length; i++) {
        if (VideoLinkDeviceList[i].key !== closeWinKey &&
          VideoLinkDeviceList[i].deviceCode &&
          VideoLinkDeviceList[i].videoInfo.cameraType !== 3 &&
          VideoLinkDeviceList[i].videoInfo.cameraType !== 6 &&
          VideoLinkDeviceList[i].videoInfo.cameraType !== 9
        ) {
          dispatch(setSelectedKey(VideoLinkDeviceList[i].key))
          setCloseWinKey('')
          break;
        }
      }
    }
  }, [VideoLinkDeviceList, closeWinKey, dispatch])


  const realtimeVideo = useCallback(
    async ({ deviceCode, channel }: Props) => {
      setCloseWinKey('')

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
        if (VideoLinkDeviceList[i].deviceCode === deviceCode) {
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
          break
        }
      }
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
      // 提前弹出空视频
      windowUI(<VideoLink
        uniqueKey={key}
        isRealTimeVideo={true}
      />, {
        title: `实时视频`,
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
            stepVal: 20
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
        deviceCode: '',
        videoInfo: {
          url: ''
        },
        videoLinkData: null,
        stepVal: 20
      }))

      let videoInfo = await getVideoSrcByDeviceCodeAsync({ deviceCode, channel, streamLevel: 1 })
      if (!videoInfo) {
        // 暂无视频
        windowUI(<VideoLink
          uniqueKey={key}
          isRealTimeVideo={true}
        />, {
          title: `实时视频`,
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
              stepVal: 20
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
          deviceCode: '',
          videoInfo: {
            url: undefined
          },
          videoLinkData: null,
          stepVal: 20
        }))
        setCloseWinKey(key)
      } else {
        windowUI(<VideoLink
          uniqueKey={key}
          isRealTimeVideo={true}
        />, {
          title: `实时视频${videoInfo?.deviceName ? `:${videoInfo?.deviceName}` : ''}`,
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
              stepVal: 20
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
          deviceCode: videoInfo?.deviceCode,
          videoInfo: {
            ...videoInfo,
            url: videoInfo.vedioUrl,
            deviceCode: videoInfo?.deviceCode,
            channel: videoInfo.channel,
            lockId: videoInfo.lockId
          },
          videoLinkData: null,
          stepVal: 20
        }))
        if (videoInfo.cameraType === 3 || videoInfo.cameraType === 6 || videoInfo.cameraType === 9) {
          return
        }
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
    [VideoLinkDeviceList, selectedWinKey, winPosition, dispatch, controlWinPosition],
  )

  return realtimeVideo
}

export default useRealtimeVideo;