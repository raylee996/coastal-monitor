/** 播放器接口 */
interface Player {
  /** 播放 */
  play: () => void
  /** 暂停 */
  pause: () => void
  /** 销毁 */
  destroy: () => void
}

export default Player