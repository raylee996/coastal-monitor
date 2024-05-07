import React, {useRef, useState} from "react";
import styles from './index.module.sass'
import JudgmentTable from "./JudgmentTable";
import JudgmentAdd from "./JudgmentAdd";
import {getJudgmentDetailAsync} from "../../../../server/core/wisdomJudgment";

//智能研判
interface Props{
  //objType,dataType,clueInfo
  // objType: 1:船舶， 2：人车
  // dataType: 01:人脸， 02：车辆， 03：帧码 04：AIS 05：雷达
  // eg: {objType: 1, dataType: '03', clueInfo:[{codeType: item.codeType, codeValue: item.content},{codeType:1,codeValue:'2222'}]}
  data?:any
}

const WisdomJudgment:React.FC<Props> = ({data})=>{
  const judgmentTableRef = useRef<any>(null);
  const [judgementData, setJudgementData] = useState<any>(data);

  function handlerRefreshTable (){
   judgmentTableRef.current.refreshTable()
  }

  //再次创建任务，需要获取的id,然后填充表单和流程图数据
  async function handleGetCreateTaskId(id:string){
    let result = await getJudgmentDetailAsync(id)
    setJudgementData(result)
    const judgmentTop = document.getElementById('judgmentTop')!;
    judgmentTop.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start'
    })
  }

  return<article className={styles.wrapper}>
    <div className={`${styles.modelDetail} ${styles.modelAddShow}`} id={'judgmentTop'}>
      <JudgmentAdd data={judgementData} refreshTable={handlerRefreshTable}/>
    </div>
    <div className={`${styles.modelTitle}`}>
      <span className={`icon iconfont icon-zhuangshitubiao ${styles.iconColor}`}/>
      <span>任务列表</span>
    </div>
    <JudgmentTable ref={judgmentTableRef} getCreateAgainId={handleGetCreateTaskId}/>
  </article>
}

export default WisdomJudgment
