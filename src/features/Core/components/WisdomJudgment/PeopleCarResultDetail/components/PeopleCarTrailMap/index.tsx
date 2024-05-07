import React from "react";
import styles from "./index.module.sass";
import {DatePicker} from "antd";
import TargetTrackPlay from "../../../../../../../component/TargetTrackPlay";
const { RangePicker } = DatePicker;

interface Props{
  trackData?: any[]
  setTrackTime?:any
}
const PeopleCarTrailMap:React.FC<Props> = ({trackData,setTrackTime})=>{

  return <div className={styles.wrapper}>
    <div className={styles.chooseTime}>
      <RangePicker showTime onChange={setTrackTime}/>
    </div>
    {/*放置地图的位置*/}
    <div className={styles.mapContainer}>
      <TargetTrackPlay isNotControlPanel={true} data={trackData}/>
    </div>
  </div>
}
export default PeopleCarTrailMap
