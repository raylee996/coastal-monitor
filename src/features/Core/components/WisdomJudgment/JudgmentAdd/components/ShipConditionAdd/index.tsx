import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import styles from "./index.module.sass";
import './index.sass'
import {startDragToGraph} from "../../../../../../../helper";
import {Graph, Shape} from "@antv/x6";
import _ from "lodash";
import ShipConditionItems from "./ShipConditionItems";
import {Button, Modal, Tag} from "antd";
import dayjs from "dayjs";
import popup from "hooks/basis/Popup";
import HistoryTaskAdd from "../../../HistoryTaskAdd";

interface Props {
  //获取流程图的数据
  getFlowGraphData?: Function
  //流程图data，赋值给流程图
  data?: any,
  //  是否显示条件
  showCondition?: boolean,
  //开始结束时间
  beginEndTime?: any
  //默认区域id
  areaId?: any
  //是否选中第一个节点
  isSelectedFirstNode?: boolean
  selectedNodeInfo?: Function
  // 是否不显示删除节点或者线条
  isNotShowRemoveBtn?: boolean
}

const ShipConditionAdd = forwardRef((
  {
    getFlowGraphData,
    data,
    showCondition = true,
    beginEndTime,
    areaId,
    isSelectedFirstNode,
    selectedNodeInfo,
    isNotShowRemoveBtn
  }: Props, ref) => {
  const [graph, setGraph] = useState<any>();
  //参数类型，点击节点后获取参数类型
  const [paramType, setParamType] = useState('');
  //传递的自定义参数
  const [params, setParams] = useState({});

  const shipConditionContainer = useRef(null);

  //历史任务
  const [historyList, setHistoryList] = useState<any[]>([]);
  //传递给列表，默认选中
  const [defaultHistoryListKeys, setDefaultHistoryListKeys] = useState<any>([]);
  //显示求并，求交弹窗
  const [open, setOpen] = useState(false);
  //流程图相关的
  useEffect(() => {
    //配置流程图
    const magnetAvailabilityHighlighter = {
      name: 'stroke',
      args: {
        padding: 3,
        attrs: {
          strokeWidth: 3,
          stroke: '#59bdff',
        },
      },
    }
    const _graph = new Graph({
      container: shipConditionContainer.current!,
      autoResize: true,
      background: {
        color: 'rgba(23,39,61,0.8)', // 设置画布背景颜色
      },
      //对齐线
      snapline: {
        enabled: true,
      },
      //高亮显示
      highlighting: {
        magnetAvailable: magnetAvailabilityHighlighter,
      },
     /* //网格
      grid: {
        size: 10,      // 网格大小 10px
        visible: true, // 渲染网格背景
      },*/
      //漫游
      panning: {
        enabled: true,
        modifiers: 'shift',
      },
      //框选
      selecting: {
        enabled: true,
        multiple: true,
        rubberband: true,//启用框选
        showEdgeSelectionBox: true,
        showNodeSelectionBox: true,
        className: 'my-selecting'
      },
      //连线
      connecting: {
        router: {
          name: 'manhattan',
          args: {
            padding: 20,
          },
        },
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        highlight: true,
        allowLoop: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#2f689e',
                strokeWidth: 1,
                targetMarker: {
                  name: 'block',
                  width: 8,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          })
        },
        validateMagnet({magnet}) {
          return magnet.getAttribute('port-group') !== 'left'
        },

        validateConnection({sourceMagnet, targetMagnet}) {
          // 只能从输出链接桩创建连接
          if (
            !sourceMagnet ||
            sourceMagnet.getAttribute('port-group') === 'left'
          ) {
            return false
          }
          // 只能连接到输入链接桩
          if (
            !targetMagnet ||
            targetMagnet.getAttribute('port-group') !== 'left'
          ) {
            return false
          }
          return true
        },
      },
      keyboard: true, //启用键盘
      history: true,//undo redo需要启用
      /*禁止图形超出画布外*/
      translating: {
        restrict: true,
      }
    });
    //选中展示删除按钮
    // @ts-ignore
    _graph.on('node:selected', ({node}: any) => {
      console.log(node)
      if (node.store.data.data.rangeTime) {
        node.store.data.data.rangeTime[0] = dayjs(node.store.data.data.rangeTime[0])
        node.store.data.data.rangeTime[1] = dayjs(node.store.data.data.rangeTime[1])
      }
      setParams(node.store.data.data)
      setParamType(() => {
        return node.store.data.type
      })
      if(isNotShowRemoveBtn){
        return
      }
      node.addTools({
        name: 'button-remove',
        args: {
          x: node.store.data.size.width,
          y: 0,
          offset: {x: 8, y: -5},
        },
      })
    })
    _graph.on('edge:selected', ({ edge }: any) => {
      if(isNotShowRemoveBtn){
        return
      }
      edge.addTools({
        name: 'button-remove',
        args: {
          
          y: 0,
          offset: { x: -60, y: -10 },
        },
      })
    })
    //点击画布空白处，不显示右下角弹窗
    _graph.on('blank:click', () => {
      setParamType('')
    })

    //添加元素触发
    _graph.on('node:added', ({node}: any) => {
      _graph.resetSelection(node) //选中节点
      setParams(node.store.data.data)
      setParamType(() => {
        return node.store.data.type
      })
    })

    _graph.on('edge:unselected', ({ edge }) => {
      if(isNotShowRemoveBtn){
        return
      }
      edge.removeTools()
    })
    // 取消选中 隐藏删除按钮
    // @ts-ignore
    _graph.on('node:unselected', ({node}) => {
      setParamType('')
      if(isNotShowRemoveBtn){
        return
      }
      node.removeTools()
    })
    //undo
    _graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (_graph.history.canUndo()) {
        _graph.history.undo()
      }
      return false
    })
    //redo
    _graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
      if (_graph.history.canRedo()) {
        _graph.history.redo()
      }
      return false
    })
    //delete删除键
    _graph.bindKey(['backspace', 'delete'], () => {
      const cells = _graph.getSelectedCells()
      if (cells.length) {
        _graph.removeCells(cells)
      }
    })

    setGraph(_graph)
  }, [getFlowGraphData,isNotShowRemoveBtn]);

  //给流程图赋值
  useEffect(() => {
    if (!_.isEmpty(data) && graph) {
      graph.fromJSON(JSON.parse(data))
    }
  }, [data, graph]);

  let selectedFirst = useCallback(
    () => {
      if (isSelectedFirstNode && graph){
        let graphData = JSON.parse(JSON.stringify(graph.toJSON()))
        let index = _.findIndex(graphData.cells, function(item:any) { return item.shape === 'rect' });
        graph.resetSelection(graph.getCells()[index])
      }
    },
    [graph, isSelectedFirstNode],
  );

  //选中第一个节点,并选中
  useEffect(() => {
    selectedFirst()
  }, [selectedFirst])

  //给父组件传递节点数据
  useEffect(() => {
    if (selectedNodeInfo && graph){
      graph.on('node:selected',({node}:any)=>{
        selectedNodeInfo && selectedNodeInfo(node.store.data.data)
      })
    }
  }, [graph, selectedNodeInfo]);


  useImperativeHandle(ref, () => ({
    // getFlowData 就是暴露给父组件的方法
    getFlowData: () => {
      if (graph.getLeafNodes().length > 1) {
        setOpen(true)
        return false
      }
      return JSON.stringify(graph.toJSON())
    },
    cancelSelection: () => {
      graph.cleanSelection()
      setParamType('')
    },
    //清空画布
    clearFlowData: () => {
      graph.fromJSON({})
    }
  }))

  function startDrag(text: string, type: string, e: any, paramsType: string, ...extraParams: any) {
    if (extraParams.length > 0) {
      startDragToGraph(graph!, text, type, e, paramsType, {
        width: e.target.offsetWidth + 30,
        eventType: (extraParams && extraParams[0].eventType) || '',
        modelIds: extraParams[0].modelIds || null
      })
    } else {
      startDragToGraph(graph!, text, type, e, paramsType, {width: e.target.offsetWidth + 30})
    }
  }

  //子组件修改父组件中node节点的data值
  function handlerChangeNodeData(data: any) {
    const cells = graph.getSelectedCells()
    cells[0].store.data.data = data
  }

  /*自动补齐求交节点*/
  function autoAddNode(type: string, eventName: string, paramsType: string) {
    let cells = graph.getLeafNodes();
    let x_arr = []; //获取最大值
    let y_arr = []; //获取平均值

    for (let i = 0; i < cells.length; i++) {
      x_arr.push(cells[i].store.data.position.x)
      y_arr.push(cells[i].store.data.position.y)
    }

    let y = y_arr.reduce(function (pre, curr) {
      return pre + curr;
    }) / y_arr.length;

    const rect = new Shape.Rect({
      id: _.uniqueId(),
      x: Math.max(...x_arr) + 160,
      y: y,
      width: 100, // 节点的宽度
      height: 30, // 节点的高度
      type: paramsType, //自定义的按钮类型
      data: {
        eventName: eventName,
        type: type
      }, //自定义存储节点数据
      attrs: {
        label: {
          text: eventName,
          fill: '#000000',
          fontSize: 14,
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true
          }
        },
        body: {
          stroke: '#000000',
          strokeWidth: 1,
          fill: '#ffffff'
        }
      },
      ports: {
        groups: {
          // 输入链接桩群组定义
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 1,
                fill: '#fff'
              }
            }
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 1,
                fill: '#fff'
              }
            }
          }
        },
        items: [
          {
            id: 'port3',
            group: 'left'
          },
          {
            id: 'port4',
            group: 'right'
          }
        ]
      }
    })
    graph.addNode(rect)

    for (let i = 0; i < cells.length; i++) {
      const edge = new Shape.Edge({
        id: _.uniqueId(),
        source: {cell: cells[i], port: 'port4'},
        target: {cell: rect, port: 'port3'},
        zIndex: 99999,
        attrs: {
          line: {
            stroke: 'green',
            strokeWidth: 1,
            targetMarker: {
              name: 'block',
              width: 8,
              height: 8,
            },
          },
        },
      })
      graph.addEdge(edge)
    }
    setOpen(false)
  }

  //获取新添加的任务列表
  function handleGetHistoryTask(val: any) {
    //设置默认选中项
    let defaultHistoryListKeys = []
    if (val && val.length > 0) {
      for (let i = 0; i < val.length; i++) {
        defaultHistoryListKeys.push(val[i].id)
      }
      setDefaultHistoryListKeys(defaultHistoryListKeys)
    }
    setHistoryList(val)
  }

  //添加历史任务
  function handleOpenHistoryList() {
    popup(<HistoryTaskAdd
        objType={1}
        selectedRowsList={historyList}
        defaultKeys={defaultHistoryListKeys}
        onChange={handleGetHistoryTask}/>,
      {title: '添加任务', size: 'large'})
  }

  //拖拽历史任务，需要特殊处理一下
  function handleDragTask(e: any, item: any) {
    e.preventDefault()
    let ele = document.getElementById(item.id)
    let isMove = false;

    function start() {
      isMove = true;
    }

    function move() {
      if (!ele && !isMove) {
        return
      }
      startDrag(item.modelName, '3', e, '', {eventType: '99', modelIds: item.id})
    }

    function end() {
      if (ele) {
        ele!.removeEventListener('mousemove', move)
      }
      ele = null
      isMove = false
    }

    ele!.addEventListener('mousemove', move)
    ele!.addEventListener('mousedown', start)
    document.addEventListener('mouseup', end)
  }

  function handleCloseTask(e: any, id: any) {
    e.preventDefault();
    let defaultKeys = defaultHistoryListKeys.filter((item: any) => item !== id)
    let taskListData = historyList.filter((item: any) => item.id !== id)
    setDefaultHistoryListKeys(defaultKeys)
    setHistoryList(taskListData)
  }

  return <div style={{position: "relative", height: '100%'}}>
    <div className={styles.flowGraph}>
      {showCondition && <div className={styles.conditions}>
          <div className={styles.littleTitle}>
              <span className={`icon iconfont icon-zhuangshitubiao ${styles.iconColor}`}/>
              条件设置:
          </div>
          <div className={styles.singleConditionWrap}>
              <div className={styles.conditionTitle}>单维条件 :</div>
              <div className={styles.singleCondition}>
                  <span onMouseDown={(e) => startDrag('未开AIS', '1', e, 'ais')}>未开AIS</span>
                  <span onMouseDown={(e) => startDrag('超速', '1', e, 'highSpeed')}>超速</span>
                  <span onMouseDown={(e) => startDrag('怠速', '1', e, 'lowSpeed')}>怠速</span>
                  <span onMouseDown={(e) => startDrag('越线', '1', e, 'crossOver')}>越线</span>
                  <span onMouseDown={(e) => startDrag('靠岸', '1', e, 'landing')}>靠岸</span>
                  <span onMouseDown={(e) => startDrag('进出区域', '1', e, 'inoutArea')}>进出区域</span>
                  <span onMouseDown={(e) => startDrag('海面停泊', '1', e, 'seaStop')}>海面停泊</span>
                  <span onMouseDown={(e) => startDrag('曾去地', '1', e, 'onceWent')}>曾去地</span>
                  <span onMouseDown={(e) => startDrag('船型', '1', e, 'boatType')}>船型</span>
                  <span onMouseDown={(e) => startDrag('船籍', '1', e, 'boatRegister')}>船籍</span>
                  <span onMouseDown={(e) => startDrag('线索目标', '1', e, 'clueTarget')}>线索目标</span>
                  <span onMouseDown={(e) => startDrag('走走停停', '1', e, 'goStop')}>走走停停</span>
                  <span onMouseDown={(e) => startDrag('折返分析', '1', e, 'brokenLineAnalysis')}>折返分析</span>
                  <span onMouseDown={(e) => startDrag('往返分析', '1', e, 'goBackAnalysis')}>往返分析</span>
              </div>
          </div>
          <div className={styles.singleConditionWrap}>
              <div className={styles.conditionTitle}>聚合条件 :</div>
              <div className={styles.singleCondition}>
                  <span onMouseDown={(e) => startDrag('两船靠泊', '2', e, 'twoBoatStop')}>两船靠泊</span>
                  <span onMouseDown={(e) => startDrag('并行行驶', '2', e, 'togetherGo')}>并行行驶</span>
                  <span onMouseDown={(e) => startDrag('尾随行驶', '2', e, 'afterGo')}>尾随行驶</span>
                  <span onMouseDown={(e) => startDrag('交集运算', '2', e, 'withCount')}>交集运算</span>
                  <span onMouseDown={(e) => startDrag('并集运算', '2', e, 'orCount')}>并集运算</span>
                  <span onMouseDown={(e) => startDrag('差集运算', '2', e, 'diffCount')}>差集运算</span>
                  {/*<button onClick={() => {
                    console.log(graph.toJSON())
                  }}>转json
                  </button>*/}
              </div>
          </div>
          <div className={styles.history}>
              <div className={styles.conditionTitle} style={{marginRight:'6px'}}>历史任务 :</div>
              <div className={styles.historyItem}>
                {
                  historyList.length > 0 && historyList.map((item: any) => {
                    return <Tag
                      key={item.id}
                      className={styles.historyTag}
                      closable
                      onMouseDown={(e) => handleDragTask(e, item)} id={item.id}
                      onClose={(e) => handleCloseTask(e, item.id)}
                    >{item.modelName}</Tag>
                  })
                }
                  <span className={styles.addBtn} onClick={handleOpenHistoryList}>添加</span>
              </div>
          </div>
      </div>}

      {/*流程图container容器*/}
      <div ref={shipConditionContainer} className={styles.container}/>
    </div>
    <ShipConditionItems
      beginEndTime={beginEndTime}
      areaId={areaId}
      paramsType={paramType}
      params={params}
      onChange={handlerChangeNodeData}/>
    {/*结果求交，结果求并*/}
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      title='多种结果'
      footer={[
        <Button key="withCount" type={"primary"} onClick={() => autoAddNode('2', '交集运算', 'withCount')}>
          结果求交
        </Button>,
        <Button key="orCount" type={"primary"} onClick={() => autoAddNode('2', '并集运算', 'orCount')}>
          结果求并
        </Button>
      ]}>
      该模型有多种结果，请选择处理方式：
    </Modal>
  </div>
})


export default React.memo(ShipConditionAdd)
