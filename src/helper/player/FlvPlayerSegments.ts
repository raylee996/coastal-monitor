import dayjs, { Dayjs } from "dayjs"
import _ from "lodash"
import FlvPlayer from "./FlvPlayer"


interface Segment {
  beginTime: string
  endTime: string
}

type GetUrl = (segment: Segment, index: number) => Promise<string | undefined>
type OnTime = (time: Dayjs, index: number) => void
type OnMediaInfo = (info: any) => void

interface Params {
  segments: Segment[]
  getUrl: GetUrl
  onTime?: OnTime
  onClose?: () => void
  onMediaInfo?: OnMediaInfo
}

class FlvPlayerSegments {

  segments: Segment[] = []
  flvPlayer: FlvPlayer | undefined
  videoEle: HTMLVideoElement
  getUrl: GetUrl
  onTime?: OnTime
  onClose?: () => void
  onMediaInfo?: OnMediaInfo

  private segmentIndex: number = 0
  private isStop: boolean = false
  private playbackRate: number = 1

  constructor(videoElement: HTMLVideoElement, params: Params) {
    console.debug('[FlvPlayerSegments]')

    this.segments = params.segments
    this.videoEle = videoElement
    this.getUrl = params.getUrl
    this.onTime = params.onTime
    this.onClose = params.onClose
    this.onMediaInfo = params.onMediaInfo

    this.create()
  }

  private async create() {
    const segment = this.segments[this.segmentIndex]
    const url = await this.getUrl(segment, this.segmentIndex)
    let isNotEndPlay = true

    if (url) {
      const options = {
        isAutoPlay: true,
        currentDiffTime: 10,
        onMediaInfo: this.onMediaInfo
      }
      this.flvPlayer = new FlvPlayer(this.videoEle, url, options)
      this.flvPlayer.setPlaybackRate(this.playbackRate)

      if (this.onTime) {
        let count = 0
        let currentTime = 0
        const segmentBeginTime = dayjs(segment.beginTime)
        this.flvPlayer.addListenerStatisticsInfo((info, cache) => {
          const sumTime = _.sum(cache.timeList.map(ele => ele.time))
          const second = _.floor(sumTime, 1)

          if (currentTime === second) {
            count += 1
          } else {
            currentTime = second
            count = 0
          }

          if (isNotEndPlay) {
            if (count === 5 && !this.isStop) {
              // 连续5次同时刻，判定推流结束
              isNotEndPlay = false
              this.segmentIndex += 1
              if (this.segmentIndex < this.segments.length) {
                this.destroy()
                this.create()
              } else {
                this.flvPlayer!.unload()
                this.onClose && this.onClose()
              }
            } else {
              const timeDayjs = segmentBeginTime.add(second, 's')
              this.onTime!(timeDayjs, this.segmentIndex)
            }
          }
        })
      }

      this.flvPlayer.addLoadingComplete(() => {
        if (isNotEndPlay) {
          isNotEndPlay = false
          this.segmentIndex += 1
          if (this.segmentIndex < this.segments.length) {
            this.destroy()
            this.create()
          } else {
            this.flvPlayer!.unload()
            this.onClose && this.onClose()
          }
        }
      })

    } else {
      this.segmentIndex += 1
      if (this.segmentIndex < this.segments.length) {
        this.create()
      }
    }
  }

  rebuild() {
    if (this.flvPlayer) {
      this.flvPlayer.rebuild()
    } else {
      console.warn('[FlvPlayerSegments] 实例不存在')
    }
  }

  play() {
    if (this.flvPlayer) {
      this.isStop = false
      this.flvPlayer.play()
    } else {
      console.warn('[FlvPlayerSegments] 实例不存在')
    }
  }

  pause() {
    if (this.flvPlayer) {
      this.isStop = true
      this.flvPlayer.pause()
    } else {
      console.warn('[FlvPlayerSegments] 实例不存在')
    }
  }

  unload() {
    if (this.flvPlayer) {
      this.flvPlayer.unload()
    } else {
      console.warn('[FlvPlayerSegments] 实例不存在')
    }
  }

  destroy() {
    if (this.flvPlayer) {
      this.flvPlayer.destroy()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  getCurrentSegment() {
    return this.segments[this.segmentIndex]
  }

  getCurrentPlayTime(): number | undefined {
    return this.flvPlayer?.player.currentTime
  }

  setPlaybackRate(val: number) {
    this.playbackRate = val
    this.flvPlayer?.setPlaybackRate(val)
  }

  updateBuffered() {
    this.flvPlayer?.updateBuffered()
  }
}

export default FlvPlayerSegments