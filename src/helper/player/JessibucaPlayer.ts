import Player from ".";

interface Options {
  /** 是否自动播放 */
  isAutoPlay?: boolean
}

class JessibucaPlayer implements Player {

  player: any
  onPlay?: () => void
  onEnded?: () => void

  private videoUrl: string
  private playbackRate: number = 1

  constructor(container: HTMLDivElement, url: string, options?: Options) {
    this.videoUrl = url
    this.create(container, url, options)
  }

  private create(container: HTMLDivElement, url: string, options?: Options) {
    this.player = new Jessibuca({
      container: container,
      decoder: "/assets/player/jessibuca/decoder.js",
      videoBuffer: 0.2, // 缓存时长
      isResize: false,
      useVideoRender: true,
      useWCS: true,
      isMulti: true,
      hasAudio: false,
    });

    this.player.on("videoInfo", function (info: any) {
      console.debug("[JessibucaPlayer] videoInfo", url, info);
    });

    this.player.on('play', () => {
      console.debug('[JessibucaPlayer] play')
      if (this.onPlay) {
        this.onPlay()
      }
    })

    this.player.on("streamEnd", () => {
      console.debug("[JessibucaProPlayer] streamEnd");
      if (this.onEnded) {
        this.onEnded()
      }
    })

    this.player.on('error', (err: any) => {
      console.warn("[JessibucaPlayer] error", err)
      this.destroy()
      this.create(container, url, options)
    })

    if (options?.isAutoPlay) {
      this.player.play(url)
    }
  }

  play() {
    this.player.play(this.videoUrl)
  }

  pause() {
    this.player.pause()
  }

  destroy() {
    if (this.player) {
      this.player.destroy()
    }
  }

  setPlaybackRate(val: number) {
    this.playbackRate = val
  }

}

export default JessibucaPlayer