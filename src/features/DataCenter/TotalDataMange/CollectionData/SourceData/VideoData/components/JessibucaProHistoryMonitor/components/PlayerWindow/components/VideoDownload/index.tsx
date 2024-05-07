import { Button, message, Progress } from "antd"
import { downloadVideo, keepRequest, YMDHms } from "helper";
import { DayjsRange } from "hooks/hooks"
import _ from "lodash";
import { useCallback, useEffect, useState } from "react"
import { addVideoDownloadTask, getVideoDownloadList, getVideoDownloadProgress, startVideoDownload, stopVideoDownload } from "server/video"
import styles from "./index.module.sass";


interface Props {
  range?: DayjsRange
  deviceCode: string
  channel: string
}

const VideoDownload: React.FC<Props> = ({ range, deviceCode, channel }) => {
  console.debug('VideoDownload')


  const [title, setTitle] = useState('...')
  const [progress, setProgress] = useState(0)
  const [stream, setStream] = useState<string>()
  const [downloadPath, setDownloadPath] = useState<string>()
  const [taskId, setTaskId] = useState<string>()
  const [timeRange, setTimeRange] = useState<string>()
  const [mediaServerId, setMediaServerId] = useState('')


  // 开始下载
  useEffect(() => {
    let ctr: AbortController
    let _stream: string
    async function main() {
      if (range) {
        const [sTime, eTime] = range
        if (sTime && eTime) {
          ctr = new AbortController()
          setProgress(0)
          setTimeRange(sTime.format(YMDHms) + '-' + eTime.format(YMDHms))
          setTitle('视频数据准备中')
          setTaskId(undefined)
          setDownloadPath(undefined)
          _stream = await startVideoDownload(sTime, eTime, deviceCode, channel, ctr)
          setStream(_stream)
        } else {
          setTitle('需要开始时间和结束时间')
          message.warning('需要开始时间和结束时间')
        }
      } else {
        setTitle('需求时间范围')
        message.warning('需求时间范围')
      }
    }
    main()
    return () => {
      ctr?.abort()
      if (_stream) {
        stopVideoDownload(deviceCode, channel, _stream)
      }
    }
  }, [channel, deviceCode, range])

  // 查询下载进度
  useEffect(() => {
    let onExit: any
    try {
      const main = async () => {
        const vo = await getVideoDownloadProgress(deviceCode, channel, stream!)
        return vo
      }

      if (stream) {
        onExit = keepRequest(main, data => {
          const progress = data.progress * 100
          if (progress === 100) {
            setProgress(99)
            setMediaServerId(data.mediaServerId)
            onExit()
          } else {
            setProgress(progress)
          }
        })
      }
    } catch (error) {
      console.warn(error)
      onExit && onExit()
      setTitle('视频数据获取异常')
      message.warning('视频数据获取异常')
    }

    return () => {
      onExit && onExit()
    }
  }, [stream, channel, deviceCode])

  // 添加下载任务
  useEffect(() => {
    async function main() {
      if (progress === 99 && stream) {
        const _taskId = await addVideoDownloadTask(stream, mediaServerId)
        setTaskId(_taskId)
      }
    }
    main()
  }, [progress, stream, mediaServerId])

  // 获取下载地址
  useEffect(() => {
    let onExit: any
    try {
      const main = async () => {
        const vo = await getVideoDownloadList(stream!, taskId!, mediaServerId)
        return vo
      }

      if (stream && taskId) {
        onExit = keepRequest(main, data => {
          if (!_.isEmpty(data)) {
            const [target] = data
            onExit()
            setProgress(100)
            setDownloadPath(target.downloadFile)
            setTitle('视频数据准备完毕')
          }
        })
      }
    } catch (error) {
      console.warn(error)
      onExit && onExit()
      setTitle('视频数据获取异常')
      message.warning('视频数据获取异常')
    }

    return () => {
      onExit && onExit()
    }
  }, [stream, taskId, mediaServerId])

  const handleClick = useCallback(
    () => {
      if (downloadPath && timeRange) {
        downloadVideo(downloadPath, `历史视频${timeRange}`)
      }
    },
    [downloadPath, timeRange],
  )

  const handleFormat = useCallback(
    (percent?: number) => {
      if (percent) {
        // const result = percent.toFixed(0)
        const result = parseInt(percent.toString())
        return `${result}%`
      } else {
        return `0%`
      }
    },
    [],
  )



  return (
    <article>
      <header className={styles.title}>{title}</header>
      <section><Progress percent={progress} format={handleFormat} /></section>
      <footer>
        {downloadPath &&
          <Button type="primary" onClick={handleClick}>下载</Button>
        }
      </footer>
    </article>
  )
}

export default VideoDownload