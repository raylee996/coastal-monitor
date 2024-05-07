import React from "react";
import TableInterface from "hooks/integrity/TableInterface";
import ShipResultCard from "./ShipResultCard";
import styles from './index.module.sass'
import {Button, Tabs} from 'antd'
import {InputType} from "hooks/flexibility/FormPanel";
import {behaviorDict, recordTargetDict} from "../../../../../helper/dictionary";
import ShipProcessData from "./ShipProcessData";
import {getShipDict, judgeResultListAsync} from "../../../../../server/core/wisdomJudgment";

interface Props {
  record?: any
  onClosePopup?:Function
  getCreateAgainId?: Function
}

//任务结果
const TaskResult: React.FC<Props> = ({record,getCreateAgainId}) => {
  function createTaskAgain(){
    getCreateAgainId && getCreateAgainId(record.id)
  }
  const inputs: any = [
    ['数据内容', 'codeValue', {
      placeholder: '请输入数据内容'
    }],
    ['数据类型', 'codeType', InputType.select, {
      dict: recordTargetDict,
      placeholder: '数据类型',
      style: {
        width: '120px'
      },
    }],
    ['行为', 'satisfy', InputType.select, {
      dict: behaviorDict,
      style: {
        width: '120px'
      },
    }],
    ['', 'eventType', InputType.selectRemote, {
      style: {
        width: '120px'
      },
      request: getShipDict
    }]
  ]
  return <TableInterface
    extraParams={{
      modelId: record.id,
      objType: '1'
    }}
    queryInputs={inputs}
    queryInit={{
      satisfy: true
    }}
    card={ShipResultCard}
    request={judgeResultListAsync}
    paginationProps={{
      pageSize: 20,
      showTotal: (total: number) => {
        return `总数 : ${total}`
      }
    }}
    toolsHeader={
      [ <>{getCreateAgainId && <Button type={"primary"} onClick={createTaskAgain}>再次分析</Button>}</>]
    }
  />
}

const ShipResult: React.FC<Props> = ({record,getCreateAgainId,onClosePopup}) => {
  function handleGetCreateTaskId(id:any){
    getCreateAgainId && getCreateAgainId(id)
    onClosePopup && onClosePopup()
  }
  const items = [
    {label: '任务结果', key: 'item-1', children: <TaskResult record={record} getCreateAgainId={getCreateAgainId ? handleGetCreateTaskId : undefined}/>}, // 务必填写 key
    {label: '过程数据', key: 'item-2', children: <ShipProcessData  record={record}/>},
  ];
  return <div className={styles.wrapper}>
    <Tabs items={items}/>
  </div>
}

export default ShipResult
