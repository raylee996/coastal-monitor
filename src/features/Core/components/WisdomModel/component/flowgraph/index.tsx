import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import styles from './index.module.sass'
import { Graph, Shape } from '@antv/x6'
import './index.sass'
import ConditionParams from "./conditionParams";
import { startDragToGraph } from "../../../../../../helper";
import _ from "lodash";
import { Button, Modal } from "antd";
import dayjs from "dayjs";

import HighIcon from 'images/shipList/lingdang_high.png'
import MiddleIcon from 'images/shipList/lingdang_middle.png'
import LowIcon from 'images/shipList/lingdang_low.png'


interface Props {
  // 获取流程图的数据
  getFlowGraphData?: Function
  // 流程图data，赋值给流程图
  data?: any
  //  是否显示条件
  showCondition?: boolean,
  // 节点点击事件
  onNodeClick?: (data: any) => void
  //  是否显示条件参数
  isNotShowConditionParams?: boolean
  // paneHeight，路程图高度(100px)
  graphHeight?: string

  // 是否显示删除按钮
  isNotShowRemoveBtn?: boolean
  // 是否显示条件参数上面的遮罩层，用于遮住不能编辑条件参数功能
  isShowMask?: boolean
  // 图形是否居中显示
  isGraphCenter?: boolean
}


const Flowgraph = forwardRef(({
  getFlowGraphData,
  data,
  showCondition = true,
  onNodeClick,
  isNotShowConditionParams,
  isNotShowRemoveBtn,
  isShowMask,
  graphHeight,
  isGraphCenter
}: Props, ref) => {
  console.debug('Flowgraph')
  //参数类型，点击节点后获取参数类型
  const [paramType, setParamType] = useState('');
  //传递的自定义参数
  const [params, setParams] = useState({});
  //显示求并，求交弹窗
  const [open, setOpen] = useState(false);

  const [graph, setGraph] = useState<any>();

  const containerRef = useRef(null);

  const [isNotShowCondition, setIsNotShowCondition] = useState<any>(isNotShowConditionParams)

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
      container: containerRef.current!,
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
      /*   //网格
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
                strokeWidth: 2,
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
        validateMagnet({ magnet }) {
          return magnet.getAttribute('port-group') !== 'left'
        },

        validateConnection({ sourceMagnet, targetMagnet }) {
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
    _graph.on('node:selected', ({ node }: any) => {
      if (node.store.data.data.rangeTime) {
        node.store.data.data.rangeTime[0] = dayjs(node.store.data.data.rangeTime[0])
        node.store.data.data.rangeTime[1] = dayjs(node.store.data.data.rangeTime[1])
      }

      // 当框选的节点大于1个时，参数设置面板不显示
      const cells = _graph.getSelectedCells()
      if (cells.length > 1) {
        setIsNotShowCondition(true)
        return;
      } else {
        setIsNotShowCondition(() => {
          if (isNotShowConditionParams) {
            return true
          } else {
            return false
          }
        })
        // !isNotShowCondition && setIsNotShowCondition(false)
      }

      setParams(node.store.data.data)
      setParamType(() => {
        return node.store.data.type
      })
      if (isNotShowRemoveBtn) {
        return
      }

      node.addTools({
        name: 'button-remove',
        args: {
          x: 0,
          y: 0,
          offset: { x: 0, y: -10 },
        },
      })
    })
    _graph.on('edge:selected', ({ edge }: any) => {
      if (isNotShowRemoveBtn) {
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
    _graph.on('node:added', ({ node }: any) => {
      _graph.resetSelection(node) //选中节点
      setParams(node.store.data.data)
      setParamType(() => {
        return node.store.data.type
      })
    })

    // 取消选中 隐藏删除按钮
    // @ts-ignore
    _graph.on('node:unselected', ({ node }) => {
      setParamType('')
      if (isNotShowRemoveBtn) {
        return
      }
      node.removeTools()
    })

    _graph.on('edge:unselected', ({ edge }) => {
      if (isNotShowRemoveBtn) {
        return
      }
      edge.removeTools()
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
      if (isNotShowRemoveBtn) {
        return
      }
      const cells = _graph.getSelectedCells()
      if (cells.length) {
        _graph.removeCells(cells)
      }
    })

    setGraph(_graph)

    return () => {
      //销毁流程图
      // graph.dispose()
    }
  }, [getFlowGraphData, isNotShowRemoveBtn, isNotShowConditionParams]);

  //给流程图赋值
  useEffect(() => {
    // graph && graph.fromJSON({"cells":[{"position":{"x":170,"y":150},"size":{"width":108,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"线索目标","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"06fde909-14f0-446c-b4c7-ca9ef7956c5e","type":"clueTarget","data":{"eventName":"线索目标","type":"1","clueInfo":[]},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":1,"tools":{"items":[{"name":"button-remove","args":{"x":0,"y":0,"offset":{"x":0,"y":-5}}}],"name":null}}]})
    if (!_.isEmpty(data) && graph) {
      graph.fromJSON(JSON.parse(data))
      if (isGraphCenter && graph) {
        // 图形在画布中居中显示
        graph.centerContent()
      }
    } else if (_.isEmpty(data) && graph) {
      graph.fromJSON({})
    }
  }, [data, graph, isGraphCenter]);

  //节点点击事件
  useEffect(() => {
    if (graph && onNodeClick) {
      graph.on('node:selected', ({ node }: any) => onNodeClick(node.store.data))
    }
  }, [graph, onNodeClick]);

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
    clearFlowData: () => {
      graph.fromJSON({})
    },
    //获取所有的节点
    getAllNodes() {
      return graph.getNodes()
    }
  }))

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
          fill: '#a6cdff',
          fontSize: 14,
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true
          }
        },
        body: {
          stroke: '#2f689e',
          strokeWidth: 1,
          fill: '#062238',
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
        source: { cell: cells[i], port: 'port4' },
        target: { cell: rect, port: 'port3' },
        zIndex: 99999,
        attrs: {
          line: {
            stroke: '#59bdff',
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


  /**
   * 功能：拖拽节点至画布
   *  text：节点的文本
   * type: single,multiple，用于区分单维条件和聚合条件
   * e: 鼠标事件，用于拖拽
   * paramsType: 参数设置，用于区分按钮，然后设值
   * */
  function startDrag(text: string, type: string, e: any, paramsType: string, ...extraParams: any) {
    if (extraParams.length > 0) {
      startDragToGraph(graph!, text, type, e, paramsType, {
        width: e.target.offsetWidth + 30,
        eventType: (extraParams && extraParams[0].eventType) || '',
        modelIds: extraParams[0].modelIds || null
      })
    } else {
      startDragToGraph(graph!, text, type, e, paramsType, { width: e.target.offsetWidth + 30 })
    }
  }

  //子组件修改父组件中node节点的data值
  function handlerChangeNodeData(data: any) {
    const cells = graph.getSelectedCells()
    if (!cells.length) {
      return
    }
    cells[0].store.data.data = data

    if (data.isWarn === 1) {
      switch (data.riskLevel) {
        case 1:
          cells[0].setAttrs({
            img: {
              height: 16,
              width: 16,
              x: 6,
              'xlink:href': HighIcon,
              y: 6
            }
          })
          break;
        case 2:
          cells[0].setAttrs({
            img: {
              height: 16,
              width: 16,
              x: 6,
              'xlink:href': MiddleIcon,
              y: 6
            }
          })
          break;
        case 3:
          cells[0].setAttrs({
            img: {
              height: 16,
              width: 16,
              x: 6,
              'xlink:href': LowIcon,
              y: 6
            }
          })
          break
      }
    } else {
      cells[0].setAttrs({
        img: {
          height: 16,
          width: 16,
          x: 6,
          'xlink:href': '',
          y: 6
        }
      })
    }
  }

  return <div style={{ position: 'relative' }}>
    {showCondition && <div className={styles.flowGraph}>
      <div className={styles.conditions}>
        <div className={styles.littleTitle}>
          <span className={`icon iconfont ${styles.iconColor}`}>&#xe67c;</span>
          条件设置：
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
            <span onMouseDown={(e) => startDrag('偏航', '1', e, 'offCourse')}>偏航</span>
            <span onMouseDown={(e) => startDrag('曾去地', '1', e, 'onceWent')}>曾去地</span>
            <span onMouseDown={(e) => startDrag('船型', '1', e, 'boatType')}>船型</span>
            <span onMouseDown={(e) => startDrag('船籍', '1', e, 'boatRegister')}>船籍</span>
            <span onMouseDown={(e) => startDrag('线索目标', '1', e, 'clueTarget')}>线索目标</span>
          </div>
        </div>
        <div className={styles.singleConditionWrap}>
          <div className={styles.conditionTitle}>聚合条件 :</div>
          <div className={styles.singleCondition}>
            <span onMouseDown={(e) => startDrag('两船靠泊', '2', e, 'twoBoatStop')}>两船靠泊</span>
            <span onMouseDown={(e) => startDrag('并行行驶', '2', e, 'togetherGo')}>并行行驶</span>
            <span onMouseDown={(e) => startDrag('尾随行驶', '2', e, 'afterGo')}>尾随行驶</span>
            <span onMouseDown={(e) => startDrag('与运算', '2', e, 'withCount')}>与运算</span>
            <span onMouseDown={(e) => startDrag('或运算', '2', e, 'orCount')}>或运算</span>
          </div>
          {/* {<button onClick={() => { console.log(JSON.stringify(graph.toJSON())) }}>转json</button>} */}
        </div>
      </div>
    </div>}

    {/*流程图container容器*/}
    <div ref={containerRef} className={`${styles.container} graphContainer`} style={{ height: graphHeight ? graphHeight : '434px' }} />

    {!isNotShowCondition && <ConditionParams isShowMask={isShowMask} paramsType={paramType} params={params} onChange={handlerChangeNodeData} />}
    {/*结果求交，结果求并*/}
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      title='多种结果'
      footer={[
        <Button key="withCount" type={"primary"} onClick={() => autoAddNode('2', '与运算', 'withCount')}>
          结果求与
        </Button>,
        <Button key="orCount" type={"primary"} onClick={() => autoAddNode('2', '或运算', 'orCount')}>
          结果求或
        </Button>
      ]}>
      该模型有多种结果，请选择处理方式：
    </Modal>
  </div>
})

export default Flowgraph
