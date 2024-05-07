import { PlacePointType } from "features/DataCenter/PlaceDetail";
import MapPlace from "features/DataCenter/PlaceDetail/component/MapPlace";
import React, { useCallback, useEffect, useState } from "react";
import { getLabelTable } from "server/label";
import { doGetPlacesAllDevices } from "server/place";
import EquipmentList from "./component/EquipmentList";
import InvolvedList from "./component/InvolvedList";
import PlaceInfoCard from "./component/PlaceInfoCard";
import styles from "./index.module.sass";


const customStyleL = { width: '260px', height: '260px', left: '8px' }
const customStyleR = { width: '280px', height: '320px', right: '8px' }

interface IPlaceBaseData {
  placeId: any
  /** 场所类型 */
  labelId?: number
}

const PlaceBaseData: React.FC<IPlaceBaseData> = ({ placeId, labelId }) => {
  console.debug('BaseData')


  const [graphValue, setGraphValue] = useState('')

  const [labelList, setLabelList] = useState<any[]>([])

  const [markIconType, setMarkIconType] = useState<string>('99')

  // 设备列表
  const [deviceList, setdeviceList] = useState<any>([])

  useEffect(() => {
    async function main(){
      const vo: any = await doGetPlacesAllDevices({ focusPlaceId: placeId })
      setdeviceList(vo.data)
    }
    main()
  }, [placeId])
  

  // 场所详情回传过来的值，在地图组件上绘制图形
  async function handleGetPlaceInfo(data?: any) {
    let realLabelList: any[]
    // 获取所有场所类型
    if(!labelList?.length) {
      const vo = await getLabelTable({ type: 9 })
      realLabelList = vo?.data || []
      setLabelList(realLabelList)
    }
    else {
      realLabelList = labelList
    }
    const selectLabel = realLabelList.find((ele) => ele.id === labelId);
    // 使用marker
    const IsDrawMarker = PlacePointType.includes(selectLabel?.subType)
    // 地图打点图标
    IsDrawMarker && setMarkIconType(selectLabel.subType)
    // 回显图形
    data?.graph && setGraphValue(data.graph)
  }


  const handleUpdateDeviceList = useCallback(
    async() => {
      const vo: any = await doGetPlacesAllDevices({ focusPlaceId: placeId })
      setdeviceList(vo.data)
    },
    [placeId],
  )

  return (
    <article className={styles.wapper}>
      <div>
        <PlaceInfoCard placeId={placeId} customStyle={customStyleL} onFinish={handleGetPlaceInfo} />
      </div>

      <div>
        <EquipmentList placeId={placeId} customStyle={customStyleR} updateDevice={handleUpdateDeviceList}/>
      </div>

      <div className={`${styles.boxData} place_map`}>
        <MapPlace isHiddleControls={true} markIconType={markIconType} graphValue={graphValue} isShowTitle={false} deviceList={deviceList}/>
      </div>

      <div className={styles.boxData}>
        <InvolvedList id={placeId} />
      </div>
    </article>
  )
}

export default PlaceBaseData
