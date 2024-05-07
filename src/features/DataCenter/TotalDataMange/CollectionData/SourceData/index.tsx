import styles from "./index.module.sass";
import { useCallback, useEffect, useMemo, useState } from "react";
import AisData from "./AisData";
import RadarData from "./RadarData";
import CarData from "./CarData";
import FaceData from "./FaceData";
import HumanData from "./HumanData";
import VideoData from "./VideoData";
import ImangeData from "./ImageData";
import TabsRadio from "component/TabsRadio";
import { useLocation } from "react-router-dom";
import { clearCoreArea } from "slice/coreAreaSlice";
import { useAppDispatch } from "app/hooks";


export const WisdomSearchTabs = [
  { value: '1', name: 'AIS', icon: 'a-1AIS' },
  { value: '2', name: '雷达', icon: 'leida' },
  { value: '4', name: '人脸', icon: 'renlian' },
  { value: '5', name: '车辆', icon: 'cheliang' },
  { value: '7', name: '视频', icon: 'luxiang', size: 12, height: 32 },
  { value: '8', name: '图片', icon: 'tupian', size: 12, height: 32 },
]

const SourceData: React.FC = () => {
  console.debug('SourceData')


  const dispatch = useAppDispatch()


  const { state } = useLocation() as { state: { sourceDataActiveKey: string } }


  const [value, setValue] = useState(state && state.sourceDataActiveKey ? state.sourceDataActiveKey : '1')


  useEffect(() => {
    const _value = state ? state.sourceDataActiveKey : '1'
    setValue(_value)
  }, [state])


  const handleChange = useCallback(
    (key: string) => {
      setValue(key)
    },
    [],
  )


  const content = useMemo(() => {
    switch (value) {
      case '1':
        return <AisData />
      case '2':
        return <RadarData />
      // case 3:
      //   return <CodeData />
      case '5':
        return <CarData />
      case '4':
        return <FaceData />
      case '6':
        return <HumanData />
      case '7':
        return <VideoData />
      case '8':
        return <ImangeData />
    }
  }, [value])


  useEffect(() => {
    return () => {
      dispatch(clearCoreArea())
    }
  }, [dispatch])


  return (
    <article className={styles.wrapper}>
      <header>
        <TabsRadio options={WisdomSearchTabs} value={value} onChange={handleChange} />
      </header>
      <section className={styles.content}>
        {content}
      </section>
    </article>
  )
}

export default SourceData