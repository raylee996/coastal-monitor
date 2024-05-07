import VideoSimple from "component/VideoSimple";
import { useMemo } from "react";

interface Props {
  /** 视频类型 02-可直接播放 03-华为云拉流播放视频 */
  fileType: string
  /** 视频缩略图 */
  picUrl?: string
  /** 视频播放地址 */
  videoUrl?: string
  /** 华为云视频播放参数集合 */
  vstartTime?: string
  vendTime?: string
  channel?: string
  deviceCode?: string
}

const VideoCommon: React.FC<Props> = ({ fileType, picUrl, videoUrl, vstartTime, vendTime, channel, deviceCode }) => {


  const videoSimpleProps = useMemo(() => {
    if (fileType === '03') {
      return {
        getVideoParams: {
          startTime: vstartTime,
          endTime: vendTime,
          deviceChannelCode: channel,
          deviceCode,
        }
      }
    } else {
      return {
        src: videoUrl
      }
    }
  }, [channel, deviceCode, vendTime, vstartTime, fileType, videoUrl])


  return <VideoSimple {...videoSimpleProps} posterImage={picUrl} />
}

export default VideoCommon