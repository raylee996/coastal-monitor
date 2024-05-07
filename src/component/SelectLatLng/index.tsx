import { Button, Input } from "antd";
import popup from "hooks/basis/Popup";
import { useEffect, useState } from "react";
import ChoosePointLatLng from "./component/ChoosePointLatLng";
import styles from "./index.module.sass";

interface Props {
  /** 设置值 */
  value?: any[]
  /** 值更新回调 */
  onChange?: (values: any[]) => void
  onClosePopup?: Function
}

const SelectLatLng: React.FC<Props> = ({ value, onChange }) => {
  console.debug('SelectLatLng')

  const [lat, setLat] = useState<number>()
  const [lng, setLng] = useState<number>()

  // const [realValue, setRealValue] = useState<LatLng[]>(value || [])

  // useEffect(() => {
  //   if (realValue?.length) {
  //     setLat(realValue[0].lat)
  //     setLng(realValue[0].lng)
  //   }
  // }, [realValue])

  useEffect(() => {
    if (value?.length) {
      // onChange && onChange([{ lat, lng }])
      setLat(value[0].lat)
      setLng(value[0].lng)
    }
  }, [value])

  function handClick() {
    popup(<ChoosePointLatLng value={value} onChange={onChange} />, { title: '地图选择', size: 'middle' })
  }
  function changPort(data:any){
    setLat(Number(data.target.value))
    onChange && onChange([{ lat:Number(data.target.value), lng }])
  }
  function changPortLng(data:any){
    setLng(Number(data.target.value))
    onChange && onChange([{ lat, lng:Number(data.target.value) }])
  }

  return (
    <article className={styles.wrapper}>
      <Input value={lng} addonAfter="E" onChange={(e:any)=>changPortLng(e)}/>
      <Input value={lat} addonAfter="N" onChange={(e:any)=>changPort(e)}/>
      <Button onClick={handClick}>地图选择</Button>
    </article>
  )
}

export default SelectLatLng