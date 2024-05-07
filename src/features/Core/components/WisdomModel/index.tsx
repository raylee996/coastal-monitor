import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.sass'
import { Button, message, Popconfirm, Switch, Tooltip } from "antd";
import ModelDetail from "./component/modelDetail";
import TableInterface from "hooks/integrity/TableInterface";
import {
  getModelDetailAsync,
  getModelListAsync,
  getRiskTypeList,
  getWarnList,
  modelTaskDeleteAsync,
  updateModelStatusAsync
} from "../../../../server/core/model";
import popup from "hooks/basis/Popup";
import BehaviorRecord from "./component/behaviorRecord";
import { publicMethod, realTimeWarning } from "../../../../helper/dictionary";
import { InputType } from "hooks/flexibility/FormPanel";
import { useAppDispatch } from 'app/hooks';
import { setIndex, setParams } from 'slice/funMenuSlice';
import PlanAdd from '../PlanManage/PlanAdd';
import PreviewModel from './component/PreviewModel';

interface Props {
  data?: any,
  //是否显示模型列表
  isShowTable?: boolean
  /**添加完后，返回添加的对象record*/
  getRecord?: Function
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
  //外部传入modelId，编辑
  modelId?: any
}


/*智慧建模*/
const WisdomModel: React.FC<Props> = ({
  data,
  isShowTable = true,
  getRecord,
  onClosePopup,
  modelId
}) => {

  //搜索条件
  const inputs: any[] = [
    ['模型名称', 'modelName', {
      placeholder: '模型名称',
      itemProps: {},
      allowClear: true
    }],
    ['公开方式', 'publicType', InputType.select, {
      placeholder: '公开方式',
      dict: publicMethod,
      allowClear: true,
      style: {
        width: '200px'
      }
    }],
    ['风险类别', 'riskTypeId', InputType.selectRemote, {
      style: {
        width: '200px'
      },
      placeholder: '风险类别',
      request: getRiskTypeList,
      allowClear: true
    }],
    ['预警条件', 'conditionType', InputType.selectMultipleRemote, {
      style: {
        width: '200px'
      },
      placeholder: '预警条件',
      remote: getWarnList,
      allowClear: true
    }],
    ['模型状态', 'status', InputType.select, {
      placeholder: '模型状态',
      dict: realTimeWarning,
      allowClear: true,
      style: {
        width: '200px'
      }
    }],
  ]
  /*表格数据*/
  const columns = [
    ['模型名称', 'modelName'],
    ['预警条件', 'conditionType', {
      itemProps: {
        width: '300px',
        render: (_: any, record: any) => {
          return (
            <div className={styles.textEllipsis}>
              <Tooltip placement="topLeft" title={record.conditionTypeName}>
                {record.conditionTypeName}
              </Tooltip>
            </div>
          )
        }
      }
    }],
    ['回溯时长', 'backDurationName'],
    ['公开方式', 'publicType', {
      itemProps: {
        render: (_: any, record: any) => {
          return (
            <>
              {record.publicType === '1' && '所有人可见'}
              {record.publicType === '2' && '本部门可见'}
              {record.publicType === '3' && '本人可见'}
            </>
          )
        }
      }
    }],
    ['风险类别', 'riskTypeIdName'],
    ['模型状态', 'status', {
      itemProps: {
        render: (_: any, record: any) => {
          return (
            <Popconfirm title={`确定要${record.status === '0' ? '开启' : '关闭'}吗?`} onConfirm={() => handleChangeStatus({ ...record })}>
              <Switch checkedChildren="开启" unCheckedChildren="关闭" checked={record.status === '1'} />
            </Popconfirm>
          )
        }
      }
    }],
    // ['截止日期', 'effectiveTime'],
    ['预警次数', 'warnCount', {
      itemProps: {
        width: '180px',
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={() => handleGoEarlyWarning(record)}>{record.warnCount}</Button>
            </>
          )
        }
      }
    }],
    ['更新时间', 'updateTime'],
    ['操作', '', {
      itemProps: {
        width: '180px',
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={(e) => getModelById(record, e)}>编辑</Button>
              <Popconfirm title="确定要删除吗?" onConfirm={() => delModel(record)}>
                <Button type={"link"}>删除</Button>
              </Popconfirm>
              <Button type={"link"} onClick={() => handlerOpenPreviewModel(record.modelId)}>预演</Button>
              <Button type={"link"} onClick={() => handlerOpenPlanManage(record.modelId)}>预案</Button>
            </>
          )
        }
      }
    }],
  ]

  // 显示详情或者新增界面,两者界面一样，操作不同，默认显示新增界面
  const [isShowAdd, setIsShowAdd] = useState(true)
  //编辑时候，传递给流程图的数据
  const [graphData, setGraphData] = useState<any>({})

  const tableRef = useRef<any>(null)

  const dispatch = useAppDispatch()

  //外部传入data
  useEffect(() => {
    if (data) {
      //创建一个线索目标
      let originJson = {
        "cells": [
          {
            "position": { "x": 390, "y": 110 },
            "size": { "width": 110, "height": 30 },
            "attrs": {
              "body": { "stroke": "#2f689e", "strokeWidth": 1, "fill": "#062238", "height": "30px", "rx": 4, "ry": 4 },
              "label": { "text": "线索目标", "fill": "#a6cdff", "fontSize": 12, "textWrap": { "width": -10, "height": -10, "ellipsis": true } },
              "img": { "height": 16, "width": 16, "x": 6, "xlink:href": "", "y": 6 }
            },
            "visible": true,
            "shape": "rect",
            "id": "ad0bcd40-7ce0-43fb-9bd4-2efa72c9ea8e",
            "type": "clueTarget",
            "data": { "eventName": "线索目标", "type": "1", "clueInfo": [] },
            "markup": [
              { "tagName": "rect", "selector": "body" },
              { "tagName": "image", "selector": "img" },
              { "tagName": "text", "selector": "label" }],
            "ports": {
              "groups": {
                "top": { "position": "top", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } },
                "bottom": { "position": "bottom", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } },
                "left": { "position": "left", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } },
                "right": { "position": "right", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } }
              },
              "items": [{ "id": "port3", "group": "left" }, { "id": "port4", "group": "right" }]
            },
            "zIndex": 1
          }]
      }
      originJson.cells[0].data = {
        ...originJson.cells[0].data,
        ...data
      }
      let graphData = {
        originalJson: JSON.stringify(originJson)
      }
      setGraphData(graphData)
      setIsShowAdd(true)
    }
  }, [data]);

  //外部传入modelId
  useEffect(() => {
    if (modelId) {
      //获取详情
      getModelDetailAsync(modelId).then(res => {
        setGraphData(res)
      })
    }
    setIsShowAdd(!modelId)
  }, [modelId]);

  // 打开预案
  function handlerOpenPlanManage(modelId: string | number) {
    popup(<PlanAdd modelId={modelId} />, {
      title: '新增预案',
      size: "fullscreen",
    })
  }
  // 预演
  function handlerOpenPreviewModel(modelId: string | number) {
    popup(<PreviewModel modelId={modelId} />, {
      title: '预演',
      size: "fullscreen",
    })
  }

  // 跳转并打开至预警列表 弹窗
  function handleGoEarlyWarning(record: any) {
    dispatch(setParams(record))
    dispatch(setIndex(2))
    onClosePopup && onClosePopup()
  }

  //点击新增按钮
  function showAddModel(e: any) {
    e.stopPropagation()
    const wisdomModelTop = document.getElementById('wisdomModelTop')!;
    wisdomModelTop.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'start'
    })
    setTimeout(() => {
      setIsShowAdd(true)
      setGraphData({})
    }, 600)
  }

  //行为记录
  function showBehaviorPopup() {
    popup(<BehaviorRecord />, { title: '行为记录', size: 'fullscreen' })
  }

  // 刷新列表
  function refreshTable() {
    isShowTable && tableRef.current.onRefresh()
  }

  //删除模型
  function delModel(record: any) {
    modelTaskDeleteAsync(record.modelId).then(() => {
      message.success('删除成功')
      refreshTable();
    })
  }

  //获取模型详情
  function getModelById(record: any, e: any) {
    e.stopPropagation()
    //滚动到顶部
    const wisdomModelTop = document.getElementById('wisdomModelTop')!;
    wisdomModelTop.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'start'
    })
    setTimeout(() => {
      setIsShowAdd(false)
    }, 600)
    //获取详情
    getModelDetailAsync(record.modelId).then(res => {
      setGraphData(res)
    })
  }

  // 切换开启关闭状态
  async function handleChangeStatus(record: any) {
    const { status, modelId } = record
    await updateModelStatusAsync({
      modelId,
      status: status === '1' ? '0' : '1'
    })
    refreshTable()
  }

  return (
    <div className={styles.wrapper}>
      {/*上半部分*/}
      <div className={styles.top} id='wisdomModelTop'>
        {/*新增模型*/}
        {isShowAdd &&
          <div className={`${styles.modelDetail} ${isShowAdd ? styles.modelAddShow : styles.modelAddHidden}`}>
            <ModelDetail getRecord={getRecord} data={graphData} refreshTable={refreshTable} onClosePopup={onClosePopup} />
          </div>
        }
        {/*模型详情(编辑)*/}
        {!isShowAdd &&
          <div className={`${styles.modelDetail}  ${!isShowAdd ? styles.modelAddShow : styles.modelAddHidden}`}>
            <ModelDetail changeToAdd={setIsShowAdd} setData={setGraphData} data={graphData} refreshTable={refreshTable} />
          </div>
        }
      </div>
      {/*下半部分*/}
      {isShowTable && <div className={styles.bottom}>
        <div className={styles.modelList}>
          <div className={styles.modelTitle}>
            <span className={`icon iconfont ${styles.iconColor}`}>&#xe67c;</span>
            模型列表
          </div>
          <div className={styles.modelItems}>
            <TableInterface
              ref={tableRef}
              queryInputs={inputs}
              columns={columns}
              tableProps={{
                rowKey: 'modelId'
              }}
              request={getModelListAsync}
              paginationProps={{
                showTotal: (total: number) => {
                  return `总数 : ${total}`
                }
              }}
              tools={[<>
                <Button type={"default"} onClick={(e) => showAddModel(e)} style={{ marginRight: '10px' }}>新增</Button>
                <Button type={"default"} onClick={showBehaviorPopup}>行为记录</Button>
              </>]}
            />
          </div>
        </div>
      </div>}
    </div>
  );
}

export default WisdomModel;
