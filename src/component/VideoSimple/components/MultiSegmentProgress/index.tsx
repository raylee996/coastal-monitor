import { Slider } from "antd";
import styles from "./index.module.sass";
import "./index.css";

interface Props {
  /** 历史视频流可播时间集合 */
  playerTimeList: PlayerTimeArray[]
  /** 历史视频流最后可播时刻 */
  playerLastTime?: string
  /** 播放进度回调，请用useCallback定义 */
  onChange?: (value: number) => void
}

export type PlayerTimeArray = { startTime: string; endTime: string }

const MultiSegmentProgress: React.FC<Props> = ({ playerTimeList, playerLastTime }) => {
  console.debug('MultiSegmentProgress')

  console.log(playerTimeList, playerLastTime, "playerTimeList, playerLastTime")
 
  return <div className={styles.wrapper}>
    {
      playerTimeList?.length ? playerTimeList.map(item => {
        return <Slider key={item.startTime} className={`${styles.slider} PlayerTime__slider`} marks={{
          0: item.startTime,
          100: item.endTime
        }} step={1} defaultValue={0} />
      }) : <></>
    }
  </div>
}

export default MultiSegmentProgress