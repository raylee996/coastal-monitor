import JessibucaPlayer from "./JessibucaPlayer"


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

class JessibucaPlayerSegments {

  segments: Segment[] = []
  jessibucaPlayer: JessibucaPlayer | undefined
  container: HTMLDivElement

  private getUrl: GetUrl
  private onPlay?: () => void
  private onEnded?: () => void
  private segmentIndex: number = 0
  private playbackRate: number = 1
  private isPause = false

  constructor(container: HTMLDivElement, params: Params) {
    console.debug('[JessibucaPlayerSegments]')

    this.container = container
    this.segments = params.segments
    this.getUrl = params.getUrl
    this.onPlay = params.onPlay
    this.onEnded = params.onEnded
    this.create()
  }

  private async create() {
    const segment = this.segments[this.segmentIndex]
    const url = await this.getUrl(segment, this.segmentIndex)

    if (url) {
      this.jessibucaPlayer = new JessibucaPlayer(this.container, url)

      this.jessibucaPlayer.onPlay = () => {
        this.onPlay && this.onPlay()
        this.isPause = false
      }

      this.jessibucaPlayer.onEnded = () => {
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

      this.jessibucaPlayer.setPlaybackRate(this.playbackRate)

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
    if (this.jessibucaPlayer) {
      this.destroy()
      this.create()
    } else {
      console.warn('[JessibucaPlayerSegments] 实例不存在')
    }
  }

  play() {
    if (this.jessibucaPlayer) {
      this.isPause = false
    } else {
      console.warn('[JessibucaPlayerSegments] 实例不存在')
    }
  }

  pause() {
    if (this.jessibucaPlayer) {
      this.isPause = true
    } else {
      console.warn('[JessibucaPlayerSegments] 实例不存在')
    }
  }

  destroy() {
    if (this.jessibucaPlayer) {
      this.jessibucaPlayer.destroy()
    } else {
      console.warn('[JessibucaPlayer] 实例不存在')
    }
  }

  getCurrentSegment() {
    return this.segments[this.segmentIndex]
  }

  setSegmentIndex(val: number) {
    this.segmentIndex = val
  }

  setPlaybackRate(val: number) {
    this.playbackRate = val
    this.jessibucaPlayer?.setPlaybackRate(val)
  }
}

export default JessibucaPlayerSegments