import React, { forwardRef, useImperativeHandle, useRef } from "react";
import styles from './index.module.sass'
import TableInterface from "hooks/integrity/TableInterface";
import popup from "hooks/basis/Popup";
import ViewCondition from '../ViewCondition'
import ShipResult from "../ShipResult";
import PeopleCarResult from "../PeopleCarResult";
import {
  getJudgmentConditionList,
  getJudgmentListAsync, getRelationCaseList, judgmentEditAsync,
  judgmentTaskDeleteAsync
} from "../../../../../server/core/wisdomJudgment";
import { InputType } from "hooks/flexibility/FormPanel";
import { judgmentDataType, judgmentObjType, judgmentStatusDict } from "../../../../../helper/dictionary";
import { Button, message, Popconfirm, Menu, Dropdown, Modal } from "antd";
import FormInterface from "hooks/integrity/FormInterface";
import NoteAdd from "../../../../SystemManage/PersonalWorkbench/MyNote/NoteAdd";
import windowstill from "hooks/basis/Windowstill";

interface RelationCaseProps {
  //编辑携带的数据
  data?: any
  onClosePopup?: Function
}
//重新关联案件（编辑）
const RelationCaseAgain: React.FC<RelationCaseProps> = ({ data, onClosePopup }) => {
  const inputs = [
    ['案件', 'caseId', InputType.selectRemote, {
      request: getRelationCaseList,
      isRequired: true
    }]
  ]
  function onFinish(formData: any) {
    judgmentEditAsync({
      ...formData,
      id: data.id
    }).then(() => {
      onClosePopup && onClosePopup()
      message.success('操作成功')
    })
  }
  return <div className={styles.relationCase}>
    <FormInterface
      onFinish={onFinish}
      initData={{
        caseId: data.caseId || null
      }}
      inputs={inputs}
      formProps={{
        labelCol: {
          span: 3,
        }
      }}
      options={{
        isShowReset: false,
        submitText: '确定',
      }} />
  </div>
}

interface Props {
  getCreateAgainId?: (id: string) => void
}
const JudgmentTable = forwardRef(({ getCreateAgainId }: Props, ref) => {
  const columns = [
    ['任务状态', 'statusName'],
    ['任务名称', 'modelName'],
    ['研判对象', 'objType'],
    ['数据类型', 'dataType'],
    ['关联案件', 'caseIdName'],
    ['模型', 'modelIdName'],
    ['研判条件', 'eventType', {
      itemProps: {
        width: '300px'
      }
    }],
    ['结果数量', 'resultNum'],
    ['提交时间', 'createTime'],
    ['完成时间', 'finishTime'],
    ['提交人', 'createBy'],
    ['操作', '', {
      itemProps: {
        width: '140px',
        render: (text: any, record: any) => {
          function handleDel(record: any) {
            Modal.confirm({
              content: '确定删除吗?',
              cancelText: '取消',
              okText: '确定',
              onOk: () => delJudgment(record)
            })
          }
          const menu = (
            <Menu>
              <Menu.Item>
                <Button type={"link"} onClick={() => openViewCondition(record)}>查看条件</Button>
              </Menu.Item>
              <Menu.Item>
                <Button type={"link"} onClick={() => relationCaseAgain(record)}>重新关联案件</Button>
              </Menu.Item>
              <Menu.Item>
                <Button type={"link"} onClick={() => addNote(record)}>加入我的便签</Button>
              </Menu.Item>
              <Menu.Item>
                <Button type={"link"} onClick={() => handleDel(record)}>删除</Button>
              </Menu.Item>
            </Menu>
          );
          return (
            <div>
              {(record.status === '2' || record.status === '3') && <div>
                <Button type={"link"} onClick={() => openResultWin(record)}>查看结果</Button>
                <Dropdown overlay={menu} overlayClassName='dropdown_ui'>
                  <Button type={"link"}>更多</Button>
                </Dropdown>
              </div>}
              {(record.status === '0' || record.status === '1') && <div>
                <Button type={"link"} onClick={() => openViewCondition(record)}>查看条件</Button>
                <Popconfirm title="确定要删除吗?" onConfirm={() => delJudgment(record)}>
                  <Button type={"link"}>删除</Button>
                </Popconfirm>
              </div>}

            </div>
          )
        }
      }
    }],
  ]
  const inputs: any[] = [
    ['任务名称', 'modelName', {
      placeholder: '请输入任务名称',
      itemProps: {},
      allowClear: true
    }],
    ['研判对象', 'objType', InputType.select, {
      dict: judgmentObjType,
      style: {
        width: '200px'
      }
    }],
    ['任务状态', 'status', InputType.select, {
      dict: judgmentStatusDict,
      style: {
        width: '200px'
      }
    }],
    ['数据类型', 'dataType', InputType.selectMultiple, {
      dict: judgmentDataType,
      placeholder: '请选择数据类型',
      style: {
        width: '200px'
      }
    }],
    ['研判条件', 'eventType', InputType.selectMultipleRemote, {
      remote: getJudgmentConditionList,
      placeholder: '请选择研判条件',
      style: {
        width: '200px'
      }
    }]
  ]
  const tableRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    refreshTable: () => {
      refreshTable()
    }
  }))

  //重新关联
  function relationCaseAgain(record: any) {
    popup(<RelationCaseAgain data={record} />, {
      title: '关联案件', size: 'mini', onCloseCallback: function () {
        //刷新表格
        refreshTable()
      }
    })
  }
  //加入我的便签
  function addNote(record: any) {
    popup(<NoteAdd
      noteType={2}
      resultNum={record.resultNum}
      taskName={record.modelName}
      onSuccess={() => {
        refreshTable()
      }}
    />, { title: '加入我的便签', size: "auto" })
  }

  // 刷新列表
  function refreshTable() {
    tableRef.current.onRefresh()
  }
  //删除研判
  function delJudgment(record: any) {
    judgmentTaskDeleteAsync(record.id).then(() => {
      message.success('删除成功')
      refreshTable();
    })
  }

  //查看条件
  function openViewCondition(record: any) {
    //人车、船舶需要区分
    let type
    if (record.objType === '船舶') {
      type = 1
    } else {
      type = 2
    }
    popup(<ViewCondition type={type} data={record} getCreateAgainId={handleGetCreateTaskId} />, { title: '查看条件', size: 'large', })
  }

  function handleGetCreateTaskId(id: any) {
    getCreateAgainId && getCreateAgainId(id)
  }

  //查看船舶结果
  function openResultWin(record: any) {
    if (record.objType === '船舶') {
      windowstill(<ShipResult record={record} getCreateAgainId={handleGetCreateTaskId} />, { title: '查看结果(船舶)', width: '1880px', height: '840px', offset: [20, 70] })
    } else {
      windowstill(<PeopleCarResult record={record} getCreateAgainId={handleGetCreateTaskId} />, { title: '查看结果(人车)', width: '1880px', height: '840px', offset: [20, 70] })
    }
  }

  return <div className={styles.wrapper}>
    <TableInterface
      ref={tableRef}
      queryInputs={inputs}
      columns={columns}
      tableProps={{
        rowKey: 'id'
      }}
      request={getJudgmentListAsync}
      paginationProps={{
        showTotal: (total: number) => {
          return `总数 : ${total}`
        }
      }}
      isRefreshTableRealTime={true}
    />
  </div>
})

export default JudgmentTable
