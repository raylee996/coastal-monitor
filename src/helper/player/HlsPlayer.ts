import Player from "."


interface Options {
  /** 是否自动播放 */
  isAutoPlay?: boolean
}

class HlsPlayer implements Player {

  player: any
  videoEle: HTMLVideoElement

  constructor(videoElement: HTMLVideoElement, url: string, options?: Options) {
    console.debug('[HlsPlayer]', url)
    const hlsPlayer = new Hls()

    hlsPlayer.loadSource(url)
    hlsPlayer.attachMedia(videoElement)

    if (options?.isAutoPlay) {
      videoElement.muted = true
      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement?.play()
      })
    }

    hlsPlayer.on(Hls.Events.ERROR, (event: any, data: any) => {
      console.warn('[HlsPlayer] 异常', event, data.details)
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hlsPlayer.startLoad()
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hlsPlayer.recoverMediaError()
            break;
          default:
            hlsPlayer.destroy()
            break;
        }
      }
    })

    this.player = hlsPlayer
    this.videoEle = videoElement

  }

  play() {
    if (this.videoEle) {
      this.videoEle.play()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  pause() {
    if (this.videoEle) {
      this.videoEle.pause()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  unload() {
  }

  destroy() {
    if (this.player) {
      this.player.destroy()
    } else {
      console.warn('[HlsPlayer] 实例不存在')
    }
  }

}

export default HlsPlayer