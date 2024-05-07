import Mp4Player from "./Mp4Player"


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

class Mp4PlayerSegments {

  segments: Segment[] = []
  videoEle: HTMLVideoElement
  mp4Player: Mp4Player | undefined

  private getUrl: GetUrl
  private onPlay?: () => void
  private onEnded?: () => void
  private segmentIndex: number = 0
  private playbackRate: number = 1
  private isPause = false

  constructor(videoElement: HTMLVideoElement, params: Params) {
    console.debug('[Mp4PlayerSegments]')

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

      this.mp4Player = new Mp4Player(this.videoEle, url, options)

      this.mp4Player.onPlay = () => {
        this.onPlay && this.onPlay()
        this.isPause = false
      }

      this.mp4Player.onEnded = () => {
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

      this.mp4Player.setPlaybackRate(this.playbackRate)

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
    if (this.mp4Player) {
      this.destroy()
      this.create()
    } else {
      console.warn('[Mp4PlayerSegments] 实例不存在')
    }
  }

  play() {
    if (this.mp4Player) {
      this.isPause = false
    } else {
      console.warn('[Mp4PlayerSegments] 实例不存在')
    }
  }

  pause() {
    if (this.mp4Player) {
      this.isPause = true
    } else {
      console.warn('[Mp4PlayerSegments] 实例不存在')
    }
  }

  unload() {
    if (this.mp4Player) {
      this.mp4Player.unload()
    } else {
      console.warn('[Mp4PlayerSegments] 实例不存在')
    }
  }

  destroy() {
    if (this.mp4Player) {
      this.mp4Player.destroy()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  getCurrentSegment() {
    return this.segments[this.segmentIndex]
  }

  getCurrentPlayTime(): number | undefined {
    return this.mp4Player?.videoEle.currentTime
  }

  setSegmentIndex(val: number) {
    this.segmentIndex = val
  }

  setPlaybackRate(val: number) {
    this.playbackRate = val
    this.mp4Player?.setPlaybackRate(val)
  }

  updateBuffered() {
    this.mp4Player?.updateBuffered()
  }
}

export default Mp4PlayerSegments