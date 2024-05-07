import Player from "."


interface Options {
  /** 是否自动播放 */
  isAutoPlay?: boolean
}

class RtcPlayer implements Player {

  player: any
  videoEle: HTMLVideoElement
  onPlay?: () => void
  onEnded?: () => void

  private onStateChange: (state: string) => void

  constructor(videoElement: HTMLVideoElement, url: string, options?: Options) {
    console.debug('[RtcPlayer]', url)
    this.videoEle = videoElement

    this.onStateChange = (state: string) => {
      console.debug('[RtcPlayer] state =', state)
      switch (state) {
        case 'connected':
          this.onPlay && this.onPlay()
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          this.onEnded && this.onEnded()
          this.destroy()
          this.create(videoElement, url, options)
          break;
        default:
          break;
      }
    }

    this.create(videoElement, url, options)
  }

  private create(videoElement: HTMLVideoElement, url: string, options?: Options) {
    videoElement.controls = false

    if (options?.isAutoPlay) {
      videoElement.muted = true
      videoElement.autoplay = true
    }

    let rtcPlayer = new ZLMRTCClient.Endpoint({
      element: videoElement,
      zlmsdpUrl: url,
      debug: false,
      recvOnly: true,
    })



    // RTC 状态变化 ,详情参考 https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState
    rtcPlayer.on(ZLMRTCClient.Events.WEBRTC_ON_CONNECTION_STATE_CHANGE, this.onStateChange);

    this.player = rtcPlayer
  }

  play() {
    this.videoEle.play()
  }

  pause() {
    this.videoEle.pause()
  }

  destroy() {
    if (this.player) {
      this.player.off(ZLMRTCClient.Events.WEBRTC_ON_CONNECTION_STATE_CHANGE, this.onStateChange)
      this.player.close()
      this.videoEle.srcObject = null
      this.videoEle.load()
    }
  }
}

export default RtcPlayer