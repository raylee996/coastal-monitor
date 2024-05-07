import React from "react";
import styles from "./index.module.sass";
import {Button, Tabs} from "antd";
import {InputType} from "hooks/flexibility/FormPanel";
import {behaviorDict, recordTargetDict} from "../../../../../helper/dictionary";
import TableInterface from "hooks/integrity/TableInterface";
import PeopleCarResultCard from "./PeopleCarResultCard";
import PeopleCarProcessData from "./PeopleCarProcessData";
import {getPeopleCarDict, judgeResultListAsync} from "../../../../../server/core/wisdomJudgment";

interface Props{
  record?:any
  onClosePopup?:Function
  getCreateAgainId?: (id:string) => void
}
//人车任务结果
const TaskResult:React.FC<Props> = ({record,getCreateAgainId})=>{
  function createTaskAgain(){
    getCreateAgainId && getCreateAgainId(record.id)
  }
  const inputs:any = [
    ['数据内容','codeValue',{
      placeholder:'请输入数据内容'
    }],
    ['数据类型','codeType',InputType.select,{
      dict:recordTargetDict,
      placeholder:'数据类型',
      style:{
        width:'120px'
      },
    }],
    ['行为','satisfy',InputType.select,{
      dict: behaviorDict,
      style:{
        width:'120px'
      },
    }],
    ['','eventType',InputType.selectRemote,{
      style:{
        width:'120px'
      },
     request: getPeopleCarDict
    }]
  ]
  return <TableInterface
    extraParams={{
      modelId:record.id,
      objType:'2'
    }}
    queryInputs={inputs}
    queryInit={{
      satisfy: true
    }}
    card={PeopleCarResultCard}
    request={judgeResultListAsync}
    paginationProps={{
      pageSize: 20,
      showTotal: (total: number) => {
        return `总数 : ${total}`
      }
    }}
    toolsHeader={
      [<>{getCreateAgainId && <Button type={"primary"} onClick={createTaskAgain}>再次分析</Button>}</>]
    }
  />
}

//人车结果
const PeopleCarResult:React.FC<Props> = ({record,getCreateAgainId,onClosePopup})=>{
  function handleGetCreateTaskId(id:any){
    getCreateAgainId && getCreateAgainId(id)
    onClosePopup && onClosePopup()
  }
  const items = [
    { label: '任务结果', key: 'item-1', children: <TaskResult record={record} getCreateAgainId={getCreateAgainId ? handleGetCreateTaskId : undefined}/> }, // 务必填写 key
    { label: '过程数据', key: 'item-2', children: <PeopleCarProcessData record={record}/> },
  ];
  return<div className={styles.wrapper}>
    <Tabs items={items} />
  </div>
}

export default PeopleCarResult
