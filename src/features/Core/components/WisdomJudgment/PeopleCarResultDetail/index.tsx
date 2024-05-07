import React, {useEffect, useState} from "react";
import styles from './index.module.sass'
import PeopleCarDetailTop from "./components/PeopleCarDetailTop";
import PeopleCarRelationTable from "./components/PeopleCarRelationTable";
import PeopleCarTrailMap from "./components/PeopleCarTrailMap";
import PeopleCarTrailTable from "./components/PeopleCarTrailTable";
import {getJudgeHistoryTrack, viewResultDetailAsync} from "../../../../../server/core/wisdomJudgment";
import _ from "lodash";
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
  //人车信息
  const [peopleCarInfo, setPeopleCarInfo] = useState<any>('');
  const [trackData, setTrackData] = useState<Data[]>();
  const [trackDetailTable, setTrackDetailTable] = useState([]);

  //用于请求轨迹的对象[{targetType:1,targetValue:粤B123456},{targetType:0,targetVal:faceId}]
  // const [obj, setObj] = useState([{targetType:6,targetValue:412888826},{targetType: 6,targetValue: 412888827}]);
  const [obj, setObj] = useState([{targetType:data.targetType,targetValue:data.targetValue}]);
  const [trackTime, setTrackTime] = useState<any>(null);

  //顶部的查询人车信息
  useEffect(() => {
    async function main(){
      let newData = JSON.parse(JSON.stringify(data))
      _.unset(newData,'eventTypeArr')
      let vo = await viewResultDetailAsync({
        ...newData,
        objType:2,
      })
      setPeopleCarInfo({...data,...vo})
    }
    main();
  }, [data]);

  //获取轨迹信息
  useEffect( () => {
    async function main(){
      let time = trackTime? trackTime :null
      const vo = await getJudgeHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, {
        obj:obj,
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
    {/*顶部的人车信息*/}
    <PeopleCarDetailTop peopleCarInfo={peopleCarInfo}/>
    {/*关联信息*/}
    <div style={{marginTop:'20px'}}>
      <Title title={'关联信息'}/>
    </div>
    <PeopleCarRelationTable peopleCarInfo={peopleCarInfo} changeObj={handleChangeObj}/>

    <div className={styles.mapAndTable}>
      {/*轨迹信息*/}
      <div className={styles.trailInfo}>
        <Title title={'轨迹信息'}/>
        <div className={styles.map}>
          <PeopleCarTrailMap trackData={trackData} setTrackTime={setTrackTime}/>
        </div>
      </div>
      {/*轨迹详情*/}
      <div className={styles.trailInfoDetail}>
        <Title title={'轨迹详情'}/>
        <PeopleCarTrailTable tableData={trackDetailTable}/>
      </div>
    </div>
  </div>
}
export default ShipResultDetail
