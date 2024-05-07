import { getWarningVudioListApi } from "api/core/earlyWarning";
import { addDownloadTask, getDownloadList, getDownloadProgress, getVideoSegments, graphqlVideo, startDownload, stopDownload } from "api/video";
import { Dayjs } from "dayjs";
import { YMDHms } from "helper";
import { DayjsRange } from "hooks/hooks";


export async function getVideoTable() {
  const dto = {
    query: `{
      table {
        id
        url
      }
    }`,
  };
  const res = await graphqlVideo(dto);
  return res.data.data.table;
}

export async function getVideoSegmentList(device: any, range: DayjsRange, channel: string, signal?: AbortController): Promise<any[] | undefined> {

  if (channel && range) {
    const [start, end] = range
    const dto = {
      deviceCode: device.deviceCode,
      channel: channel,
      startTime: start?.format(YMDHms),
      endTime: end?.format(YMDHms)
    }
    const vo = await getVideoSegments(dto, { signal })
    return vo.recordList.map((item: any) => ({ ...item, beginTime: item.startTime }))
  } else {
    return undefined
  }

}

export async function getWarnVideoInfo(businessId: number) {
  const dto = {
    businessId,
    businessType: '05',
    fileType: '02,03'
  }
  const vo = await getWarningVudioListApi(dto)
  if (vo.records.length === 0) {
    return null
  } else {
    const [data] = vo.records
    return data
  }
}

/** 开始历史媒体下载 */
export async function startVideoDownload(sTime: Dayjs, eTime: Dayjs, deviceCode: string, channel: string, signal?: AbortController) {
  const dto = {
    deviceCode,
    channel,
    downloadSpeed: 16,
    startTime: sTime.format(YMDHms),
    endTime: eTime.format(YMDHms)
  }
  const vo = await startDownload(dto, { signal })
  return vo.stream
}

/** 获取历史媒体下载进度 */
export async function getVideoDownloadProgress(deviceCode: string, channel: string, stream: string, signal?: AbortController) {
  const dto = {
    deviceCode,
    channel,
    stream
  }
  const vo = await getDownloadProgress(dto, { signal })
  return vo
}

/** 停止历史媒体下载 */
export async function stopVideoDownload(deviceCode: string, channel: string, stream: string, signal?: AbortController) {
  const dto = {
    deviceCode,
    channel,
    stream
  }
  const vo = await stopDownload(dto, { signal })
  return vo
}

/** 添加视频裁剪合并任务 */
export async function addVideoDownloadTask(stream: string, mediaServerId: string, signal?: AbortController) {
  const dto = {
    app: 'rtp',
    stream,
    mediaServerId
  }
  const vo = await addDownloadTask(dto, { signal })
  return vo
}

/** 查询视频裁剪合并任务列表 */
export async function getVideoDownloadList(stream: string, taskId: string, mediaServerId: string, signal?: AbortController) {
  const dto = {
    app: 'rtp',
    isEnd: true,
    stream,
    taskId,
    mediaServerId
  }
  const vo = await getDownloadList(dto, { signal })
  return vo
}