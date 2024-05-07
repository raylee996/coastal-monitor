import Player from "."

interface Options {
  /** 是否自动播放 */
  isAutoPlay?: boolean
  /** 播放器配置项 */
  config?: any
}

class JessibucaProPlayer implements Player {

  readonly mseSupport264 = window.MediaSource && window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.64002A"')
  readonly mseSupport265 = window.MediaSource && window.MediaSource.isTypeSupported('video/mp4; codecs="hev1.1.6.L123.b0"')

  player: any
  videoEle: HTMLDivElement
  onPlay?: () => void
  onStats?: (stats: any) => void
  onEnded?: () => void

  private videoUrl: string
  private playbackRate: number = 1
  private isPlaybackPause = false

  constructor(container: HTMLDivElement, url: string, options?: Options) {
    console.debug(`[JbPro][JessibucaProPlayer] constructor mseSupport264 ${this.mseSupport264} mseSupport265 ${this.mseSupport265}`, url, options);
    this.videoUrl = url
    this.videoEle = container
    this.create(container, url, options)
  }

  private create(container: HTMLDivElement, url: string, options?: Options) {

    this.player = new JessibucaPro({
      container: container,
      decoder: "/assets/player/jessibucaProDemo/decoder-pro.js",
      videoBuffer: 0.2, // 缓存时长
      // debug: true,
      // debugLevel: 'debug',
      isResize: false,
      isNotMute: false,
      useWebGPU: true,
      useMSE: true,
      useWCS: false,
      useSIMD: false,
      useVideoRender: true,
      hasAudio: false,
      forceNoOffscreen: true,
      playbackForwardMaxRateDecodeIFrame: 4,
      ...options?.config
    });

    this.player.on('stats', (stats: any) => {
      // console.debug('[JbPro][JessibucaProPlayer] stats', stats);
      if (this.onStats) {
        this.onStats(stats)
      }
    })

    this.player.on('play', () => {
      console.debug('[JbPro][JessibucaProPlayer] play')
      if (this.onPlay) {
        this.onPlay()
      }
    })

    this.player.on("streamEnd", () => {
      console.debug("[JbPro][JessibucaProPlayer] streamEnd");
      if (this.onEnded) {
        this.onEnded()
      }
    })

    this.player.on("videoInfo", function (info: any) {
      console.debug("[JbPro][JessibucaProPlayer] videoInfo", info);
    })

    this.player.on('error', (err: any) => {
      console.warn("[JessibucaProPlayer] error", err)
    })

    if (options?.isAutoPlay) {
      this.player.play(url)
    }
  }

  play(isFirst?: boolean) {
    if (isFirst) {
      this.player.play(this.videoUrl)
    } else {
      this.player.play()
    }
  }

  pause() {
    this.isPlaybackPause = true
    this.player.pause();
  }

  destroy() {
    this.player.destroy()
    this.videoEle.innerHTML = ''
    this.videoEle.className = this.videoEle.classList[0]

    if (this.videoEle.attributes.getNamedItem('data-jbprov')) {
      this.videoEle.attributes.removeNamedItem('data-jbprov')
    }

    if (this.videoEle.attributes.getNamedItem('style')) {
      this.videoEle.attributes.removeNamedItem('style')
    }
  }

  setPlaybackRate(val: number) {
    try {
      console.debug("[JbPro][JessibucaProPlayer] setPlaybackRate", val)
      this.playbackRate = val
      this.player.forward(val)
    } catch (error) {
      console.warn(error)
    }
  }

}

export default JessibucaProPlayer