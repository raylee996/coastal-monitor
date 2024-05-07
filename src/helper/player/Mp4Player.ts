import Player from "."


interface Options {
  /** 是否自动播放 */
  isAutoPlay?: boolean
}

class Mp4Player implements Player {


  videoEle: HTMLVideoElement
  onProgress?: (val: number) => void
  onPlay?: () => void
  onEnded?: () => void

  private onPlayProgress: () => void
  private onPlayStart: () => void
  private onPlayEnd: () => void
  private playbackRate: number = 1


  constructor(videoElement: HTMLVideoElement, url: string, options?: Options) {
    console.debug('[Mp4Player]', url)

    videoElement.src = url

    this.onPlayStart = () => {
      console.debug('[Mp4Player] play', videoElement.currentTime)
      if (this.onPlay) {
        this.onPlay()
      }
    }
    videoElement.addEventListener('play', this.onPlayStart)

    this.onPlayEnd = () => {
      // console.debug('[Mp4Player] ended', videoElement.currentTime)
      console.log('[Mp4Player] ended', videoElement.currentTime)
      if (this.onEnded) {
        this.onEnded()
      }
    }
    videoElement.addEventListener('ended', this.onPlayEnd)

    this.onPlayProgress = () => {
      const end = videoElement.buffered.end(0)
      // console.debug('[Mp4Player] progress', videoElement.currentTime, end, videoElement.playbackRate)
      console.log('[Mp4Player] progress', videoElement.currentTime, end, videoElement.playbackRate)
      if (this.onProgress) {
        this.onProgress(videoElement.currentTime)
      }
    }
    videoElement.addEventListener('progress', this.onPlayProgress)

    // videoElement.addEventListener('waiting', (evt: Event) => {
    //   console.log('[Mp4Player] waiting 由于暂时缺少数据，播放已停止', evt, videoElement.error)
    //   if (videoElement.error) {
    //     videoElement.load()
    //     videoElement.playbackRate = this.playbackRate
    //     videoElement.play()
    //   }
    // })
    // videoElement.addEventListener('suspend', (evt: Event) => {
    //   console.log('[Mp4Player] suspend 媒体数据加载已暂停', evt)
    // })
    // videoElement.addEventListener('emptied', (evt: Event) => {
    //   console.log('[Mp4Player] emptied 媒体内容变为空', evt)
    // })
    // videoElement.addEventListener('playing', (evt: Event) => {
    //   console.log('[Mp4Player] playing 播放准备开始', evt)
    // })
    // videoElement.addEventListener('canplay', (evt: Event) => {
    //   console.log('[Mp4Player] canplay', evt)
    // })
    // videoElement.addEventListener('canplaythrough', (evt: Event) => {
    //   console.log('[Mp4Player] canplaythrough', evt)
    // })

    videoElement.addEventListener('error', (evt: Event) => {
      console.warn('[Mp4Player] error', videoElement.error)
      videoElement.load()
      videoElement.playbackRate = this.playbackRate
      videoElement.play()
    })

    if (options?.isAutoPlay) {
      videoElement.play()
    }

    this.videoEle = videoElement
  }


  play() {
    this.videoEle.play()
  }


  pause() {
    this.videoEle.pause()
  }


  unload() {
    this.videoEle.pause()
  }


  destroy() {
    this.videoEle.pause()
    this.videoEle.removeEventListener('loadedmetadata', this.onPlayStart)
    this.videoEle.removeEventListener('progress', this.onPlayProgress)
    this.videoEle.removeEventListener('complete', this.onPlayEnd)
  }

  setPlaybackRate(val: number) {
    this.playbackRate = val
    this.videoEle.playbackRate = val
  }

  updateBuffered() {
  }
}

export default Mp4Player