import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import styles from "./index.module.sass";
import './index.sass'
import { startDragToGraph } from "../../../../../../../helper";
import { Graph, Shape } from "@antv/x6";
import _ from "lodash";
import PeopleCarConditionItems from "./PeopleCarConditionItems";
import { Button, Modal, Tag } from "antd";
import dayjs from "dayjs";
import popup from "hooks/basis/Popup";
import HistoryTaskAdd from "../../../HistoryTaskAdd";
interface Props {
  //获取流程图的数据
  getFlowGraphData?: Function
  //流程图data，赋值给流程图
  data?: any
  //是否显示设置条件
  showCondition?: boolean
  //开始结束时间
  beginEndTime?: any
  //点位
  devicesId?: any
  //是否选中第一个节点
  isSelectedFirstNode?: boolean
  selectedNodeInfo?: Function
  // 是否不显示删除节点或者线条
  isNotShowRemoveBtn?: boolean
}
const PeopleCarConditionAdd = forwardRef(({
  getFlowGraphData,
  data,
  showCondition = true,
  beginEndTime,
  devicesId,
  isSelectedFirstNode,
  selectedNodeInfo,
  isNotShowRemoveBtn
}: Props, ref) => {
  const [graph, setGraph] = useState<any>();
  //参数类型，点击节点后获取参数类型
  const [paramType, setParamType] = useState('');
  //传递的自定义参数
  const [params, setParams] = useState({});

  const containerRef = useRef(null);
  //显示求并，求交弹窗
  const [open, setOpen] = useState(false);

  //历史任务
  const [historyList, setHistoryList] = useState<any[]>([]);
  //传递给列表，默认选中
  const [defaultHistoryListKeys, setDefaultHistoryListKeys] = useState<any>([]);

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
      //网格
      /* grid: {
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

      if (node.store.data.data.frontEndStartHour) {
        node.store.data.data.frontEndStartHour = dayjs(node.store.data.data.frontEndStartHour)
      }
      if (node.store.data.data.frontEndEndHour) {
        node.store.data.data.frontEndEndHour = dayjs(node.store.data.data.frontEndEndHour)
      }
      if (node.store.data.data.frontEndStartHourTwo) {
        node.store.data.data.frontEndStartHourTwo = dayjs(node.store.data.data.frontEndStartHourTwo)
      }
      if (node.store.data.data.frontEndEndHourTwo) {
        node.store.data.data.frontEndEndHourTwo = dayjs(node.store.data.data.frontEndEndHourTwo)
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
          offset: { x: 8, y: -5 },
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
    _graph.on('node:added', ({ node }: any) => {
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
    _graph.on('node:unselected', ({ node }) => {
      setParamType('')
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
    // graph && graph.fromJSON({"cells":[{"shape":"edge","attrs":{"line":{"stroke":"green","strokeWidth":1,"targetMarker":{"name":"block","width":8,"height":8}}},"id":"6025858d-d1c1-410e-b7d5-27b03c0abf8c","zIndex":0,"source":{"cell":"ee52f034-6ab1-4068-8c6f-9ab9dba38034","port":"port4"},"target":{"cell":"f682ea79-8257-472c-8ff9-a9f502dfdf58","port":"port3"}},{"shape":"edge","attrs":{"line":{"stroke":"green","strokeWidth":1,"targetMarker":{"name":"block","width":8,"height":8}}},"id":"5d7ed1ee-1d6e-4053-9c30-075564b36434","zIndex":0,"source":{"cell":"f682ea79-8257-472c-8ff9-a9f502dfdf58","port":"port4"},"target":{"cell":"1f654ae2-eba9-4949-a63b-03882e87a619","port":"port3"}},{"shape":"edge","attrs":{"line":{"stroke":"green","strokeWidth":1,"targetMarker":{"name":"block","width":8,"height":8}}},"id":"bdcc9eda-5af8-4777-842b-d8eae74b94ca","zIndex":0,"source":{"cell":"1f654ae2-eba9-4949-a63b-03882e87a619","port":"port4"},"target":{"cell":"2ed9439f-a6f9-40fd-9abd-832a11e3a3a4","port":"port3"}},{"shape":"edge","attrs":{"line":{"stroke":"green","strokeWidth":1,"targetMarker":{"name":"block","width":8,"height":8}}},"id":"61ccbb95-dfc2-403d-8628-dc3d93096fcb","zIndex":0,"source":{"cell":"31853f76-6c4b-4cb7-a3b0-5261de92276c","port":"port4"},"target":{"cell":"0b0d4457-c035-474a-842c-5ec01a183474","port":"port3"}},{"shape":"edge","attrs":{"line":{"stroke":"green","strokeWidth":1,"targetMarker":{"name":"block","width":8,"height":8}}},"id":"3633d458-ed66-4539-bfb9-95d42c1609e5","zIndex":0,"source":{"cell":"1d4c5156-9bd3-4c76-8310-cab472aaf5f8","port":"port4"},"target":{"cell":"0b0d4457-c035-474a-842c-5ec01a183474","port":"port3"}},{"shape":"edge","attrs":{"line":{"stroke":"green","strokeWidth":1,"targetMarker":{"name":"block","width":8,"height":8}}},"id":"9183f90d-5cd3-484b-96a1-ff59f3a1a459","zIndex":0,"source":{"cell":"0b0d4457-c035-474a-842c-5ec01a183474","port":"port4"},"target":{"cell":"b10980e6-39cd-4542-85d8-9569ffcdfa89","port":"port3"}},{"shape":"edge","attrs":{"line":{"stroke":"green","strokeWidth":1,"targetMarker":{"name":"block","width":8,"height":8}}},"id":"e85d859f-82ab-458a-a0b2-9d95f3a87aee","zIndex":0,"source":{"cell":"2ed9439f-a6f9-40fd-9abd-832a11e3a3a4","port":"port4"},"target":{"cell":"b10980e6-39cd-4542-85d8-9569ffcdfa89","port":"port3"}},{"position":{"x":80,"y":80},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"未开AIS","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"31853f76-6c4b-4cb7-a3b0-5261de92276c","type":"ais","data":{"eventName":"未开AIS","eventType":"1"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":1},{"position":{"x":80,"y":176},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"超速","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"1d4c5156-9bd3-4c76-8310-cab472aaf5f8","type":"highSpeed","data":{"eventName":"超速","eventType":"1"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":2},{"position":{"x":240,"y":130},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"交集运算","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"0b0d4457-c035-474a-842c-5ec01a183474","type":"withCount","data":{"eventName":"交集运算","eventType":"2"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":3},{"position":{"x":70,"y":310},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"怠速","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"ee52f034-6ab1-4068-8c6f-9ab9dba38034","type":"lowSpeed","data":{"eventName":"怠速","eventType":"1"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":4},{"position":{"x":240,"y":310},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"越线","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"f682ea79-8257-472c-8ff9-a9f502dfdf58","type":"crossOver","data":{"eventName":"越线","eventType":"1"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":5},{"position":{"x":423,"y":310},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"靠岸","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"1f654ae2-eba9-4949-a63b-03882e87a619","type":"landing","data":{"eventName":"靠岸","eventType":"1"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":6},{"position":{"x":592,"y":310},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"进出区域","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"2ed9439f-a6f9-40fd-9abd-832a11e3a3a4","type":"inoutArea","data":{"eventName":"进出区域","eventType":"1"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":7},{"position":{"x":765,"y":206},"size":{"width":100,"height":30},"attrs":{"body":{"stroke":"#000000","strokeWidth":1,"fill":"#ffffff"},"label":{"text":"两船靠泊","fill":"#000000","fontSize":14,"textWrap":{"width":-10,"height":-10,"ellipsis":true}}},"visible":true,"shape":"rect","id":"b10980e6-39cd-4542-85d8-9569ffcdfa89","type":"twoBoatStop","data":{"eventName":"两船靠泊","eventType":"2"},"ports":{"groups":{"top":{"position":"top","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"bottom":{"position":"bottom","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"left":{"position":"left","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}},"right":{"position":"right","attrs":{"circle":{"r":4,"magnet":true,"stroke":"#2D8CF0","strokeWidth":1,"fill":"#fff"}}}},"items":[{"id":"port3","group":"left"},{"id":"port4","group":"right"}]},"zIndex":8}]})
    if (!_.isEmpty(data) && graph) {
      graph.fromJSON(JSON.parse(data))
    }

  }, [data, graph]);

  let selectedFirst = useCallback(
    () => {
      if (isSelectedFirstNode && graph) {
        let graphData = JSON.parse(JSON.stringify(graph.toJSON()))
        let index = _.findIndex(graphData.cells, function (item: any) { return item.shape === 'rect' });
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
    if (selectedNodeInfo && graph) {
      graph.on('node:selected', ({ node }: any) => {
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
      startDragToGraph(graph!, text, type, e, paramsType, { width: e.target.offsetWidth + 30 })
    }
  }
  //子组件修改父组件中node节点的data值
  function handlerChangeNodeData(data: any) {
    if (!showCondition) {
      return;
    }
    const cells = graph.getSelectedCells()
    cells[0].store.data.data = {
      ...(cells[0].store.data.data),
      ...data
    }
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
        source: { cell: cells[i], port: 'port4' },
        target: { cell: rect, port: 'port3' },
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
      objType={2}
      selectedRowsList={historyList}
      defaultKeys={defaultHistoryListKeys}
      onChange={handleGetHistoryTask} />,
      { title: '添加任务', size: 'large' })
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
      startDrag(item.modelName, '3', e, '', { eventType: '99', modelIds: item.id })
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
  return <div style={{ position: "relative", height: '100%' }}>
    <div className={styles.flowGraph}>
      {showCondition && <div className={styles.conditions}>
        <div className={styles.littleTitle}>
          <span className={`icon iconfont icon-zhuangshitubiao ${styles.iconColor}`} />
          条件设置:
        </div>
        <div className={styles.singleConditionWrap}>
          <div className={styles.conditionTitle}>单维条件 :</div>
          <div className={styles.singleCondition}>
            <span onMouseDown={(e) => startDrag('碰撞分析', '1', e, 'knockAnalysis')}>碰撞分析</span>
            <span onMouseDown={(e) => startDrag('伴随分析', '1', e, 'followAnalysis')}>伴随分析</span>
            <span onMouseDown={(e) => startDrag('昼伏夜出', '1', e, 'dayNightAnalysis')}>昼伏夜出</span>
            <span onMouseDown={(e) => startDrag('团伙分析', '1', e, 'gangAnalysis')}>团伙分析</span>
            <span onMouseDown={(e) => startDrag('套牌车分析', '1', e, 'cloneCarAnalysis')}>套牌车分析</span>
            <span onMouseDown={(e) => startDrag('首次出现', '1', e, 'appearFirst')}>首次出现</span>
            <span onMouseDown={(e) => startDrag('徘徊分析', '1', e, 'lingerAnalysis')}>徘徊分析</span>
            <span onMouseDown={(e) => startDrag('常住人口', '1', e, 'permanentPopulation')}>常住人口</span>
            <span onMouseDown={(e) => startDrag('流动人口', '1', e, 'flowPopulation')}>流动人口</span>
            <span onMouseDown={(e) => startDrag('线索目标', '1', e, 'clueTarget')}>线索目标</span>
          </div>
        </div>
        <div className={styles.singleConditionWrap}>
          <div className={styles.conditionTitle}>聚合条件 :</div>
          <div className={styles.singleCondition}>
            <span onMouseDown={(e) => startDrag('交集运算', '2', e, 'withCount')}>交集运算</span>
            <span onMouseDown={(e) => startDrag('并集运算', '2', e, 'orCount')}>并集运算</span>
            <span onMouseDown={(e) => startDrag('差集运算', '2', e, 'diffCount')}>差集运算</span>
            {/*<button onClick={()=>{console.log(graph.toJSON())}}>转json</button>*/}
          </div>
        </div>
        <div className={styles.history}>
          <div className={styles.conditionTitle} style={{ marginRight: '6px' }}>历史任务 :</div>
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
      <div ref={containerRef} className={styles.container} />
    </div>
    <PeopleCarConditionItems
      beginEndTime={beginEndTime}
      devicesId={devicesId}
      paramsType={paramType}
      params={params}
      onChange={handlerChangeNodeData} />
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

export default React.memo(PeopleCarConditionAdd)
