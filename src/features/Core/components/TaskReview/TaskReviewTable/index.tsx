import React from "react";
import TableInterface from "hooks/integrity/TableInterface";
import styles from "./index.module.sass";
import {taskReviewListAsync} from "../../../../../server/core/taskReview";
import {InputType} from "hooks/flexibility/FormPanel";
import {Button} from "antd";
import {taskSourceDict} from "../../../../../helper/dictionary";
import popup from "hooks/basis/Popup";
import TaskPlayback from "../../WisdomCommand/TaskPlayback";
import CaseArchiveInfo from "../../../../DataCenter/CaseArchiveInfo";
import Title from "../../../../../component/Title";

const TaskReviewTable:React.FC = ()=>{
  //搜索条件
  const inputs: any[] = [
    ['任务名称', 'taskName', {
      placeholder: '请输入任务名称',
      itemProps: {},
      allowClear: true
    }],
    [
      '任务来源','taskSourceId',InputType.select,{
        dict:taskSourceDict,
        allowClear: true,
        style: {
          width:'200px'
        }
      }
    ]
  ]
  const columns = [
    ['序号', 'index'],
    ['任务名称', 'taskName'],
    ['任务来源', 'taskSourceName'],
    ['跟踪目标', 'targetCode'],
    ['责任人', 'chargePersonName'],
    ['状态', 'taskStateId',{
      itemProps: {
        render: (_: any, record: any) => {
          return (
            <>
              {record.taskStateId === 1 && '进行中'}
              {record.taskStateId === 2 && '待分配'}
              {record.taskStateId === 3 && '已完成'}
            </>
          )
        }
      }
    }],
    ['关联案事件', 'relationCaseName',{
      itemProps: {
        render: (_: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={()=>{
                //打开案件信息详情窗口
                popup(<CaseArchiveInfo
                  caseItem={{id:record.relationCaseId,caseName:record.relationCaseName}} />,
                  { title: '案件详情', size: "fullscreen" })
              }}>{record.relationCaseName}</Button>
            </>
          )
        }
      }
    }],
    ['案件类型', 'relationCaseTypeName'],
    ['开始时间', 'createTime'],
    ['结束时间', 'completeTaskTime'],
    ['任务用时', 'taskTime'],
    ['操作', '',{
      itemProps: {
        width:'160px',
        render: (text: any, record: any) => {
          return (
            <>
              <Button className={styles.detailBtn} type={"link"} onClick={()=>openTaskPlayback()}>任务回放</Button>
            </>
          )
        }
      }
    }],
  ]
  function openTaskPlayback() {
    popup(<TaskPlayback />, { title: '任务回放', size: 'fullscreen' })
  }
  return<div>
    <Title title={'已完成任务列表'}/>
    <TableInterface
      extraParams={{taskStateId:3}}
      queryInputs={inputs}
      request={taskReviewListAsync}
      columns={columns}
    />
  </div>
}

export default TaskReviewTable
