import RtcPlayer from "./RtcPlayer"


interface Segment {
  beginTime: string
  endTime: string
}

type GetUrl = (segment: Segment, index: number) => Promise<string | undefined>

interface Params {
  segments: Segment[]
  getUrl: GetUrl
  onPlay?: () => void
  onEnded?: () => void
}

class RtcPlayerSegments {

  segments: Segment[] = []
  videoEle: HTMLVideoElement
  rtcPlayer: RtcPlayer | undefined

  private getUrl: GetUrl
  private onPlay?: () => void
  private onEnded?: () => void
  private segmentIndex: number = 0
  // private playbackRate: number = 1
  private isPause = false

  constructor(videoElement: HTMLVideoElement, params: Params) {
    console.debug('[RtcPlayerSegments]')

    this.segments = params.segments
    this.videoEle = videoElement
    this.getUrl = params.getUrl
    this.onPlay = params.onPlay
    this.onEnded = params.onEnded

    this.create()
  }

  private async create() {
    const segment = this.segments[this.segmentIndex]
    const url = await this.getUrl(segment, this.segmentIndex)

    if (url) {
      const options = {
        isAutoPlay: true,
      }

      this.rtcPlayer = new RtcPlayer(this.videoEle, url, options)

      this.rtcPlayer.onPlay = () => {
        this.onPlay && this.onPlay()
        this.isPause = false
      }

      this.rtcPlayer.onEnded = () => {
        if (!this.isPause) {
          this.segmentIndex += 1
          if (this.segmentIndex < this.segments.length) {
            this.destroy()
            this.create()
          } else {
            this.onEnded && this.onEnded()
          }
        }
      }

      // this.rtcPlayer.setPlaybackRate(this.playbackRate)

    } else {
      this.segmentIndex += 1
      if (this.segmentIndex < this.segments.length) {
        this.create()
      } else {
        this.onEnded && this.onEnded()
      }
    }
  }

  rebuild() {
    if (this.rtcPlayer) {
      this.destroy()
      this.create()
    } else {
      console.warn('[RtcPlayerSegments] 实例不存在')
    }
  }

  play() {
    if (this.rtcPlayer) {
      this.isPause = false
    } else {
      console.warn('[RtcPlayerSegments] 实例不存在')
    }
  }

  pause() {
    if (this.rtcPlayer) {
      this.isPause = true
    } else {
      console.warn('[RtcPlayerSegments] 实例不存在')
    }
  }

  unload() {
    if (this.rtcPlayer) {
      this.rtcPlayer.destroy()
    } else {
      console.warn('[RtcPlayerSegments] 实例不存在')
    }
  }

  destroy() {
    if (this.rtcPlayer) {
      this.rtcPlayer.destroy()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  getCurrentSegment() {
    return this.segments[this.segmentIndex]
  }

  getCurrentPlayTime(): number | undefined {
    return this.rtcPlayer?.videoEle.currentTime
  }

  setSegmentIndex(val: number) {
    this.segmentIndex = val
  }

  setPlaybackRate(val: number) {
    console.debug(val)
  }

  updateBuffered() {
    // this.rtcPlayer?.updateBuffered()
  }
}

export default RtcPlayerSegments