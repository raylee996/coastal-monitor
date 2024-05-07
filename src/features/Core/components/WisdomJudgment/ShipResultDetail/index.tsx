import React, {useEffect, useState} from "react";
import styles from './index.module.sass'
import ShipResultDetailTop from "./components/ShipResultDetailTop";
import ShipResultRelationTable from "./components/ShipResultRelationTable";
import ShipResultTrailTable from "./components/ShipResultTrailTable";
import ShipResultTrailMap from "./components/ShipResultTrailMap";
import _ from "lodash";
import {getJudgeHistoryTrack, viewResultDetailAsync} from "../../../../../server/core/wisdomJudgment";
import Title from "../../../../../component/Title";

interface Props{
  data?:any
}
interface LatLng {
  lng: number
  lat: number
  time?: string
  speed?: number
  course?: number
  heading?: number
}

interface Data {
  legendName: string
  legendImgSrc?: string
  legendColor?: string
  latLngList: LatLng[]
}

const ShipResultDetail: React.FC<Props> = ({data}) => {
  //船舶信息
  const [shipInfo, setShipInfo] = useState<any>('');
  const [trackData, setTrackData] = useState<Data[]>();
  const [trackDetailTable, setTrackDetailTable] = useState([]);

  //用于请求轨迹的对象[{targetType:1,targetValue:粤B123456},{targetType:0,targetVal:faceId}]
  const [obj, setObj] = useState([{targetType:data.targetType,targetValue:data.targetValue}]);
  const [trackTime, setTrackTime] = useState<any>(null);

  //顶部的查询船舶信息
  useEffect(() => {
    async function main(){
      let newData = JSON.parse(JSON.stringify(data))
      _.unset(newData,'eventTypeArr')
      let vo = await viewResultDetailAsync({
        ...newData,
        objType:1,
      })
     /* let vo = await viewResultDetailAsync({
        ...newData,
        objType:1,
        modelId:'1615597136145375234',
        eventType: 15,
        codeValue: 'F-412888832-2-1673512066'
      })*/
      setShipInfo({...data,...vo})
    }
    main();
  }, [data]);

  //获取轨迹信息
  useEffect( () => {
    async function main(){
      let time = trackTime? trackTime :null
      const vo = await getJudgeHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, {
        obj,
        time
      })
      setTrackData(vo.trackData)
      setTrackDetailTable(vo.data)
    }
    main()
  }, [obj,trackTime]);

  function handleChangeObj(val:any){
    setObj([
      //当前的对象，顶部的
      {targetType:data.targetType,targetValue:data.targetValue},
      //表格选中的对象
      {...val}
    ])
  }

  return <div className={styles.wrapper}>
    {/*顶部的船舶信息*/}
    <ShipResultDetailTop shipInfo={shipInfo}/>
    {/*关联信息*/}
    <div style={{marginTop:'20px'}}>
      <Title title={'关联信息'}/>
    </div>
    <ShipResultRelationTable shipInfo={shipInfo}  changeObj={handleChangeObj}/>
    <div className={styles.mapAndTable}>
      {/*轨迹信息*/}
      <div className={styles.trailInfo}>
        <Title title={'轨迹信息'}/>
        <div className={styles.map}>
          <ShipResultTrailMap trackData={trackData} setTrackTime={setTrackTime}/>
        </div>
      </div>
      {/*轨迹详情*/}
      <div className={styles.trailInfoDetail}>
        <Title title={'轨迹详情'}/>
        <ShipResultTrailTable tableData={trackDetailTable}/>
      </div>
    </div>
  </div>
}
export default ShipResultDetail
