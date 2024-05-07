import React, {useEffect, useState} from "react";
import PeopleCarConditionAdd from "../../JudgmentAdd/components/PeopleCarConditionAdd";
import styles from './index.module.sass'
import _ from "lodash";
import Pengzhuang from "./components/Pengzhuang";
import Bansui from "./components/Bansui";
import Shouci from "./components/Shouci";
import Paihuai from "./components/Paihuai";
import Renkou from "./components/Renkou";
import Zhoufu from "./components/Zhoufu";
import Tuanhuo from "./components/Tuanhuo";
import Taopaiche from "./components/Taopaiche";
import Jiaoji from "./components/Jiaoji";
import Xiansuo from "./components/Xiansuo";
import HistoryTask from "./components/HistoryTask";

interface Props {
  record?: any
}

//人车过程数据
const PeopleCarProcessData: React.FC<Props> = ({record}) => {
  //获取表格数据需要eventId,eventType
  const [eventType, setEventType] = useState(null);
  const [eventId, setEventId] = useState(null);
  //给流程赋值
  const [conditionData, setConditionData] = useState('');

  //获取第一个节点的信息，用于请求列表数据
  useEffect(() => {
    setConditionData(record.originalJson)
    let graphData = JSON.parse(record.originalJson)
    let index = _.findIndex(graphData.cells, function (item: any) {
      return item.shape === 'rect'
    });
    //设置dbId,eventType
    setEventId(graphData.cells[index].data.dbId)
    setEventType(graphData.cells[index].data.eventType)
  }, [record]);

  //点击流程图节点，触发此函数
  function handleGetFirstNode(nodeInfo: any) {
    setEventId(nodeInfo.dbId)
    setEventType(nodeInfo.eventType)
  }

  let extraParams = (eventId && eventType) ? {eventId, eventType,objType:2} : undefined

  return <div className={styles.wrapper}>
    {/*模型*/}
    <div className={styles.graph}>
      <PeopleCarConditionAdd
        showCondition={false}
        data={conditionData}
        isSelectedFirstNode={true}
        selectedNodeInfo={handleGetFirstNode}
      />
    </div>
    {/*碰撞分析*/}
    {eventType === '22' && <Pengzhuang extraParams={extraParams} eventType={eventType} eventId={eventId}/>}
    {/*伴随分析*/}
    {eventType === '23' && <Bansui eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*首次出现*/}
    {eventType === '27' && <Shouci eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*徘徊分析*/}
    {eventType === '28' && <Paihuai eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*常住人口，流动人口*/}
    {(eventType === '29' || eventType === '30') && <Renkou eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*昼伏夜出*/}
    {eventType === '24' && <Zhoufu eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*团伙分析*/}
    {eventType === '25' && <Tuanhuo eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*套牌车*/}
    {eventType === '26' && <Taopaiche eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*交集运算，并集运算，差集运算*/}
    {(eventType === '14' || eventType === '15' || eventType === '17') &&
        <Jiaoji eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*线索目标*/}
    {eventType === '16' && <Xiansuo eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
    {/*历史任务*/}
    {eventType === '99' && <HistoryTask eventId={eventId} eventType={eventType} extraParams={extraParams}/>}
  </div>
}

export default PeopleCarProcessData
