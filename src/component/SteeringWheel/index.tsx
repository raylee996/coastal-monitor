import { useCallback } from "react";
import styles from "./index.module.sass";


//方向键 上1、下2、左3、右4 左上5、右上6、左下7、右下8
export enum SteeringType {
  top = 1,
  topLeft = 5,
  left = 3,
  bottomLeft = 7,
  bottom = 2,
  bottomRight = 8,
  right = 4,
  topRight = 6,
  stop = 9
}

export enum CameraOptionType {
  /** 变倍-加 */
  zoomIn = 1,
  /** 变倍-减 */
  zoomOut,
  /** 光圈-加 */
  apertureIn,
  /** 光圈-减 */
  apertureOut,
  /** 聚焦-加 */
  focusIn,
  /** 聚焦-减 */
  focusOut,
  /** 拍照 */
  picture
}

interface Props {
  /** 鼠标按下放下 */
  onMouseDown?: (type: SteeringType) => void
  /** 鼠标松开方向 */
  onMouseUp?: (type: SteeringType) => void
  /** 鼠标移出 */
  onMouseLeave?: (type: SteeringType) => void
  /** 中间停止按键 */
  onStop?: () => void
}

const SteeringWheel: React.FC<Props> = ({ onMouseDown, onMouseUp, onMouseLeave, onStop }) => {
  console.debug('SteeringWheel')


  const onEvt = useCallback(
    (type: SteeringType) => {
      return {
        onMouseDown: () => {
          onMouseDown && onMouseDown(type)
        },
        onMouseUp: () => {
          onMouseUp && onMouseUp(type)
        },
        onMouseLeave: () => {
          onMouseLeave && onMouseLeave(type)
        }
      }
    },
    [onMouseDown, onMouseLeave, onMouseUp],
  )


  const handleStop = useCallback(
    () => {
      onStop && onStop()
    },
    [onStop]
  )


  return (
    <div className={styles.steer}>
      <div className={styles.part1}>
        <div className={`${styles.arrow} ${styles.arrow1}`} {...onEvt(SteeringType.top)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
        <div className={`${styles.arrow} ${styles.arrow2}`} {...onEvt(SteeringType.topLeft)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
        <div className={`${styles.arrow} ${styles.arrow3}`} {...onEvt(SteeringType.left)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
        <div className={`${styles.arrow} ${styles.arrow4}`} {...onEvt(SteeringType.bottomLeft)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
      </div>
      <div className={styles.part2}>
        <div className={`${styles.arrow} ${styles.arrow1}`} {...onEvt(SteeringType.bottom)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
        <div className={`${styles.arrow} ${styles.arrow2}`} {...onEvt(SteeringType.bottomRight)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
        <div className={`${styles.arrow} ${styles.arrow3}`} {...onEvt(SteeringType.right)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
        <div className={`${styles.arrow} ${styles.arrow4}`} {...onEvt(SteeringType.topRight)}>
          <div className={styles.figure}></div>
          <i className={`fa fa-chevron-up ${styles.arrowIcon}`}></i>
        </div>
      </div>
      <div className={styles.core} onClick={handleStop}>
        <i className={`fa fa-square-o ${styles.coreIcon}`}></i>
      </div>
    </div>
  )
}

export default SteeringWheel
