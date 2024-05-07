import PlaceDataCar from "./component/PlaceDataCar";
import PlaceDataFace from "./component/PlaceDataFace";
import PlaceDataImage from "./component/PlaceDataImage";
import PlaceDataInOutPort from "./component/PlaceDataInOutPort";
import PlaceDataShip from "./component/PlaceDataShip";
import PlaceDataVideo from "./component/PlaceDataVideo";
import styles from "./index.module.sass";
import Title from "../../../../../component/Title";
import TabsRadio from "component/TabsRadio";
import { useCallback, useMemo, useState } from "react";


interface IPlaceDataInfo {
  placeId: any;
  /** 来自父组件 popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: () => void
}

export const WisdomSearchTabs = [
  { value: '1', name: '船舶数据', icon: 'chuanboliebiao' },
  { value: '2', name: '车辆数据', icon: 'cheliang' },
  { value: '3', name: '人脸数据', icon: 'renlian' },
  { value: '6', name: '进出港数据', icon: 'jinchugangjilu' },
  { value: '4', name: '视频数据', icon: 'luxiang', size: 12, height: 32 },
  { value: '5', name: '图片数据', icon: 'tupian', size: 12, height: 32 },
]

const PlaceDataInfo: React.FC<IPlaceDataInfo> = ({ placeId, onClosePopup }) => {
  console.debug('PlaceDataInfo')


  const [value, setValue] = useState('1')
  const [showKey, setShowKey] = useState('1')


  const content = useMemo(() => {
    switch (showKey) {
      case '1':
        return <PlaceDataShip placeId={placeId} />
      case '2':
        return <PlaceDataCar placeId={placeId} />
      case '3':
        return <PlaceDataFace placeId={placeId} />
      case '4':
        return <PlaceDataVideo placeId={placeId} onClosePopup={onClosePopup}/>
      case '5':
        return <PlaceDataImage placeId={placeId} />
      case '6':
        return <PlaceDataInOutPort placeId={placeId} onClosePopup={onClosePopup} />
    }
  }, [onClosePopup, placeId, showKey])


  const handleChange = useCallback(
    (activeKey: string) => {
      setValue(activeKey);
      setShowKey(activeKey)
    },
    [],
  )


  return (
    <article className={styles.wapper}>
      <header>
        <Title title={'数据类型'} />
        <TabsRadio options={WisdomSearchTabs} defaultActive={value} onChange={handleChange} />
      </header>
      <section className={styles.content}>
        {content}
      </section>
    </article>
  )
}

export default PlaceDataInfo
