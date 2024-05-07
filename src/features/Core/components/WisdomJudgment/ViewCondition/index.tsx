import React from "react";
import styles from './index.module.sass'
import ShipConditionAdd from "../JudgmentAdd/components/ShipConditionAdd";
import PeopleCarConditionAdd from "../JudgmentAdd/components/PeopleCarConditionAdd";
import Title from "../../../../../component/Title";
import {Button} from "antd";

interface Props{
  //人车（2）、船舶（1）
  type:number
  //组件数据
  data:any
  onClosePopup?:Function
  getCreateAgainId?: (id:string) => void
}

/*查看条件页面*/
const ViewCondition:React.FC<Props> = ({type,data,onClosePopup,getCreateAgainId})=>{
  function createTaskAgain(){
    getCreateAgainId && getCreateAgainId(data.id)
    onClosePopup && onClosePopup()
  }
  return<div className={styles.wrapper}>
    <div className={styles.top}>
      <Title title={'基本信息'}/>
      <Button type={"primary"} onClick={createTaskAgain}>再次创建任务</Button>
    </div>
    <div className={styles.info}>
      <div className={styles.infoItem}>
        <span className={styles.infoTitle}> 任务名称: </span>
        <span className={styles.infoContent}>{data.modelName}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoTitle}> 研判对象: </span>
        <span className={styles.infoContent}>{data.objType}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoTitle}> 数据类型: </span>
        <span className={styles.infoContent}>{data.dataType}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoTitle}> 时间: </span>
        <span className={styles.infoContent}>{data.beginTime} ~ {data.endTime}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoTitle}> 关联案件: </span>
        <span className={styles.infoContent}>{data.caseIdName}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoTitle}> 模型: </span>
        <span className={styles.infoContent}>{data.modelIdName}</span>
      </div>
    </div>
    <Title title={'条件设置'}/>
    {
      type === 1 && <div style={{width:'100%',height:'500px'}}>
          <ShipConditionAdd showCondition={false} data={data.originalJson} isNotShowRemoveBtn={true}/>
        </div>
    }
    {
      type === 2 && <div style={{width:'100%',height:'500px'}}>
          <PeopleCarConditionAdd  showCondition={false} data={data.originalJson} isNotShowRemoveBtn={true}/>
        </div>
    }
  </div>
}

export default ViewCondition
