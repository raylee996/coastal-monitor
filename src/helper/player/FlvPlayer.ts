import _ from "lodash"
import Player from "."

/** 多段播放参数 */
export interface FlvPlayerSegment {
  url: string
  /** 段持续时间 */
  duration: number
}

type StatisticsInfoFn = (info: any, cacheInfo: CacheInfo) => void
type LoadingCompleteFn = (cacheInfo: CacheInfo) => void
type OnMediaInfo = (info: any) => void

interface CacheInfo {
  /** 记录累计播放时长，应对实例被重新创建 */
  timeList: { time: number }[]
}

interface Options {
  /** 是否不启动视频追帧 */
  isNotCurrentTime?: boolean
  /** 视频追帧时间判断，默认1秒 */
  currentDiffTime?: number
  /** 是否自动播放 */
  isAutoPlay?: boolean
  /** 获取媒体信息事件 */
  onMediaInfo?: OnMediaInfo
}

class FlvPlayer implements Player {

  player: any
  videoEle: HTMLVideoElement
  currentDiffTime = 3
  isPlay = false
  onMediaInfo?: OnMediaInfo

  private cacheInfo: CacheInfo = {
    timeList: []
  }

  private onStatisticsInfoFnList: StatisticsInfoFn[] = []
  private onLoadingCompleteFnList: LoadingCompleteFn[] = []
  private playbackRate: number = 1
  private playUrl: string | FlvPlayerSegment[]
  private opt: any
  // private chasingOrgRate: number = 1
  // private isChasing: boolean = false

  constructor(videoElement: HTMLVideoElement, url: string | FlvPlayerSegment[], options?: Options) {
    console.debug('[FlvPlayer]', url)
    if (options?.onMediaInfo) {
      this.onMediaInfo = options.onMediaInfo
    }
    if (options?.currentDiffTime) {
      this.currentDiffTime = options.currentDiffTime
    }
    this.videoEle = videoElement
    this.playUrl = url
    this.opt = options
    this.create(videoElement, url, options)
  }

  private create(videoElement: HTMLVideoElement, url: string | FlvPlayerSegment[], options?: Options) {
    console.debug('[FlvPlayer.create]', url)

    let current: { time: number } = { time: 0 } // 记录累计播放时间

    const config = {
      type: 'flv',
      isLive: true,
      hasAudio: false,
      hasVideo: true,
    }

    if (_.isArray(url)) {
      _.set(config, 'segments', url)
    } else {
      _.set(config, 'url', url)
    }

    let flvPlayer = flvjs.createPlayer(config)

    flvPlayer.attachMediaElement(videoElement);

    flvPlayer.on(flvjs.Events.ERROR, (errType: string, errDetail: any) => {
      console.warn(errType, errDetail)
      if (flvPlayer) {
        flvPlayer.pause()
        flvPlayer.unload()
        flvPlayer.detachMediaElement();
        flvPlayer.destroy();
        flvPlayer = null
        this.create(videoElement, url, options)
      }
    })

    flvPlayer.on(flvjs.Events.MEDIA_INFO, (info: any) => {
      console.debug('[MEDIA_INFO]', info)
      if (this.onMediaInfo) {
        this.onMediaInfo(info)
      }
      if (this.playbackRate) {
        videoElement.playbackRate = this.playbackRate
      }
    })

    flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
      console.debug('[LOADING_COMPLETE]', '缓存结束')
      if (flvPlayer) {
        flvPlayer.pause()
        flvPlayer.unload()
      }
      if (this.onLoadingCompleteFnList.length !== 0) {
        this.onLoadingCompleteFnList.forEach(fn => fn(this.cacheInfo))
      }
    })

    flvPlayer.on(flvjs.Events.STATISTICS_INFO, (info: any) => {
      current.time = flvPlayer.currentTime
      if (this.onStatisticsInfoFnList.length !== 0) {
        this.onStatisticsInfoFnList.forEach(fn => fn(info, this.cacheInfo))
      }

      if (this.player.buffered.length) {
        let end = this.player.buffered.end(0); //获取当前buffered值
        let diff = end - this.player.currentTime; //获取buffered于当前的差值
        if (flvPlayer && !options?.isNotCurrentTime && diff > this.currentDiffTime) {
          const targetTime = end - 1
          this.player.currentTime = targetTime;
        }
        // console.log('[chasingCurrentTime]', end, this.player.currentTime, diff)
      }
    })

    flvPlayer.load()

    if (flvPlayer && options?.isAutoPlay) {
      videoElement.muted = true
      this.isPlay = true
      flvPlayer.play()
    }


    this.cacheInfo.timeList.push(current)
    this.player = flvPlayer
  }

  rebuild() {
    if (this.player) {
      this.player.pause()
      this.player.unload()
      this.player.detachMediaElement();
      this.player.destroy();
      this.player = null
      this.create(this.videoEle, this.playUrl, this.opt)
    }
  }

  onSEI(handle: (data: any) => void) {
    if (this.player) {
      this.player.on(flvjs.Events.STATISTICS_INFO, () => {
        const seiData: any = _.get(this.player, '_transmuxer._controller._demuxer._SEIData')
        if (seiData) {
          handle(seiData)
        }
      })
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  on(eventType: any, handle: Function) {
    if (this.player) {
      this.player.on(eventType, handle)
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  play() {
    if (this.player) {
      this.isPlay = true
      this.player.play()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  pause() {
    if (this.player) {
      this.isPlay = false
      this.player.pause()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  unload() {
    if (this.player) {
      this.player.unload()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  destroy() {
    if (this.player) {
      this.player.detachMediaElement()
      this.player.destroy()
    } else {
      console.warn('[FlvPlayer] 实例不存在')
    }
  }

  addListenerStatisticsInfo(handle: StatisticsInfoFn) {
    this.onStatisticsInfoFnList.push(handle)
  }

  delListenerStatisticsInfo(handle: StatisticsInfoFn) {
    _.remove(this.onStatisticsInfoFnList, fn => fn === handle)
  }

  addLoadingComplete(handle: LoadingCompleteFn) {
    this.onLoadingCompleteFnList.push(handle)
  }

  delLoadingComplete(handle: LoadingCompleteFn) {
    _.remove(this.onLoadingCompleteFnList, fn => fn === handle)
  }

  setPlaybackRate(val: number) {
    this.playbackRate = val
    this.videoEle.playbackRate = val
  }

  updateBuffered() {
    if (this.player) {
      let end = this.player.buffered.end(0)
      const targetTime = end - 1
      this.player.currentTime = targetTime;
    }
  }
}

export default FlvPlayer