import JessibucaProPlayer from "./JessibucaProPlayer"


export interface PlayerSegment {
  beginTime: string
  endTime: string
}

type GetUrl = (segment: PlayerSegment, index: number) => Promise<string | undefined>

interface Params {
  segments: PlayerSegment[]
  getUrl: GetUrl
  onPlay?: () => void
  onTime?: (time: number, segments: PlayerSegment) => void
  onEnded?: () => void
}

class JessibucaProPlayerSegments {

  segments: PlayerSegment[] = []
  jessibucaProPlayer: JessibucaProPlayer | undefined
  container: HTMLDivElement

  private getUrl: GetUrl
  private onPlay?: () => void
  private onTime?: (time: number, segments: PlayerSegment) => void
  private onEnded?: () => void
  private segmentIndex: number = 0
  private playbackRate: number = 1
  private isPause = false

  constructor(container: HTMLDivElement, params: Params) {
    console.debug('[JessibucaProPlayerSegments]')

    this.container = container
    this.segments = params.segments
    this.getUrl = params.getUrl
    this.onPlay = params.onPlay
    this.onTime = params.onTime
    this.onEnded = params.onEnded
    this.create()
  }

  private async create() {
    const segment = this.segments[this.segmentIndex]
    const url = await this.getUrl(segment, this.segmentIndex)
    let videoStartTime = 0

    if (url) {
      this.jessibucaProPlayer = new JessibucaProPlayer(this.container, url, {
        config: {
          videoBuffer: 2,
          videoBufferDelay: 2,
          useMSE: false,
          useWCS: true,
          debug: true,
          debugLevel: 'debug',
        }
      })

      this.jessibucaProPlayer.onPlay = () => {
        this.onPlay && this.onPlay()
        this.isPause = false
        if (this.playbackRate !== 1) {
          this.jessibucaProPlayer?.setPlaybackRate(this.playbackRate)
        }
      }

      this.jessibucaProPlayer.onEnded = () => {
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

      this.jessibucaProPlayer.onStats = (stats) => {
        if (this.onTime) {
          const segment = this.segments[this.segmentIndex]
          let time = stats.pTs
          if (videoStartTime === 0) {
            videoStartTime = stats.ts
          } else {
            let diff = 0
            if (stats.ts > videoStartTime) {
              diff = stats.ts - videoStartTime
            } else {
              diff = videoStartTime - stats.ts
            }
            const diffS = diff / 1000
            time = Math.trunc(diffS)
          }
          console.log(stats.ts)
          this.onTime(time, segment)
        }
      }

      this.jessibucaProPlayer.player.playback(url, {
        showControl: false,
        isPlaybackPauseClearCache: true,
        useWCS: true
      })
      // this.jessibucaProPlayer.setPlaybackRate(this.playbackRate)

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
    if (this.jessibucaProPlayer) {
      this.destroy()
      this.create()
    } else {
      console.warn('[JessibucaProPlayerSegments] 实例不存在')
    }
  }

  play() {
    if (this.jessibucaProPlayer) {
      this.isPause = false
      this.jessibucaProPlayer.player.play()
    } else {
      console.warn('[JessibucaProPlayerSegments] 实例不存在')
    }
  }

  pause() {
    if (this.jessibucaProPlayer) {
      this.isPause = true
      this.jessibucaProPlayer.pause()
    } else {
      console.warn('[JessibucaProPlayerSegments] 实例不存在')
    }
  }

  destroy() {
    if (this.jessibucaProPlayer) {
      this.jessibucaProPlayer.destroy()
    } else {
      console.warn('[JessibucaProPlayerSegments] 实例不存在')
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
    this.jessibucaProPlayer?.setPlaybackRate(val)
  }
}

export default JessibucaProPlayerSegments