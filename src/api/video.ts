import { Config, get, post } from "helper/ajax";

export function graphqlVideo(dto: any) {
  return post('/graphql/video', dto, { isNotToken: true, isGraphql: true })
}

/** 获取视频流通道 */
export function getHistoryPlay(dto: any, search: any, config?: Config) {
  return get(`/gb28181/api/playback/start/${dto.deviceCode}/${dto.deviceChannelCode}`, search, { isNotErrorMessage: true, ...config })
}
export function getHistoryPlayUrl(dto: any, config?: Config) {
  const { deviceCode, channel, ...othParams } = dto
  return get(`/gb28181/api/playback/start/${deviceCode}/${channel}`, othParams, { isNotErrorMessage: true, ...config })
}

/** 恢复暂停播发的视频流推送 */
export function resumeHistoryPlay(stream: string) {
  return get(`/gb28181/api/playback/resume/${stream}`)
}

/** 暂停视频流推送 */
export function pauseHistoryPlay(stream: string) {
  return get(`/gb28181/api/playback/pause/${stream}`)
}

/** 暂停视频流推送 */
export function checkHistoryPlay(stream: string) {
  return get(`/gb28181/api/playback/exist/${stream}`)
}

/** 倍数视频流推送 */
export function speedHistoryPlay(dto: any) {
  return get(`/gb28181/api/playback/speed/${dto.stream}/${dto.speed}`)
}

/** 回放倍数视频流推送 */
export function setSpeedByHistoryPlay(dto: any, config?: Config) {
  return get(`/gb28181/api/playback/speed/${dto.stream}/${dto.speed}`, null, config)
}

/** 倍数视频流推送 */
export function seekHistoryPlay(dto: any) {
  return get(`/gb28181/api/playback/seek/${dto.stream}/${dto.time}`, null, { isNotErrorMessage: true })
}

/** 视频流停止推送 */
export function stopHistoryPlay(dto: any) {
  return get(`/gb28181/api/playback/stop/${dto.deviceCode}}/${dto.channelId}/${dto.stream}`, null, { isNotErrorMessage: true })
}

/** 获取历史视频-录像查询 */
export function queryGbRecordApi(dto: any, search: any, config?: Config) {
  return get(`/gb28181/api/gb_record/query/${dto.deviceCode}/${dto.deviceChannelCode}`, search, config)
}

/** 获取历史视频-录像查询-根据时间范围获取有效时段 */
export function getVideoSegments(dto: any, config?: Config) {
  const { deviceCode, channel, ...othParams } = dto
  return get(`/gb28181/api/gb_record/query/${deviceCode}/${channel}`, othParams, config)
}

/** 开始历史媒体下载 */
export function startDownload(dto: {
  deviceCode: string
  channel: string
  startTime: string
  endTime: string
  downloadSpeed: number
}, config?: Config) {
  const { deviceCode, channel, ...otherParams } = dto
  return get(`/gb28181/api/gb_record/download/start/${deviceCode}/${channel}`, otherParams, config)
}

/** 获取历史媒体下载进度 */
export function getDownloadProgress(dto: {
  deviceCode: string
  channel: string
  stream: string
}, config?: Config) {
  const { deviceCode, channel, stream } = dto
  return get(`/gb28181/api/gb_record/download/progress/${deviceCode}/${channel}/${stream}`, null, config)
}

/** 停止历史媒体下载 */
export function stopDownload(dto: {
  deviceCode: string
  channel: string
  stream: string
}, config?: Config) {
  const { deviceCode, channel, stream } = dto
  return get(`/api/gb_record/download/stop/${deviceCode}/${channel}/${stream}`, null, { ...config, isNotErrorMessage: true })
}

/** 添加视频裁剪合并任务 */
export function addDownloadTask(dto: any, config?: Config) {
  const { mediaServerId, ...othDto } = dto
  return get(`/gb28181/record_proxy/${mediaServerId}/api/record/file/download/task/add`, othDto, config)
}

/** 查询视频裁剪合并任务列表 */
export function getDownloadList(dto: any, config?: Config) {
  const { mediaServerId, ...othDto } = dto
  return get(`/gb28181/record_proxy/${mediaServerId}/api/record/file/download/task/list`, othDto, config)
}