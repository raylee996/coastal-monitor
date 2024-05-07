import { Radio } from "antd";
import RealTimeMonitor from "features/Core/components/RealTimeMonitor";
import JessibucaProHistoryMonitor from "features/DataCenter/TotalDataMange/CollectionData/SourceData/VideoData/components/JessibucaProHistoryMonitor";
import { useState } from "react";
import styles from "./index.module.sass";


interface IPlaceDataVideo {
  placeId: any
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: () => void
}

const PlaceDataVideo: React.FC<IPlaceDataVideo> = ({ placeId, onClosePopup }) => {
  console.debug('PlaceDataVideo')

  const [playType, setPlayType] = useState("0")


  function handlePlayType({ target: { value } }: any) {
    setPlayType(value)
  }

  return (
    <article className={styles.wrapper}>
      <header className={styles.funType}>
        <div className={styles.funItem}>播放类型：</div>
        <div className={styles.funItem}>
          <Radio.Group onChange={handlePlayType} defaultValue={'0'}>
            <Radio value={'0'}>实时数据</Radio>
            <Radio value={'1'}>历史视频</Radio>
          </Radio.Group>
        </div>
      </header>
      <section className={styles.content}>
        {playType === "0" ?
          <RealTimeMonitor placeId={placeId} isNotShowPatro={true} isNotShowTypeSelect={true} onClosePopup={onClosePopup} /> :
          <JessibucaProHistoryMonitor placeId={placeId} />
        }
      </section>
    </article>
  )
}

export default PlaceDataVideo