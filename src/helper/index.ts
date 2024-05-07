import { Addon } from '@antv/x6'
import dayjs from 'dayjs'
import _ from 'lodash'
import common from './common'
import { echartsColor } from './echartsConfig'
import risk1_src from "images/ship/risk1.png"
import risk2_src from "images/ship/risk2.png"
import risk3_src from "images/ship/risk3.png"
import risk4_src from "images/ship/risk4.png"
import place1_src from "images/place/1.svg"
import place2_src from "images/place/2.svg"
import place3_src from "images/place/3.svg"
import place4_src from "images/place/4.svg"
import place5_src from "images/place/5.svg"
import place6_src from "images/place/6.svg"
import place7_src from "images/place/7.svg"
import place8_src from "images/place/8.svg"
import place9_src from "images/place/9.svg"
import place10_src from "images/place/10.svg"
import place11_src from "images/place/11.svg"
import place99_src from "images/place/99.svg"
import defaultMarkerIconSrc from "images/mapIcon/markerIcon.png"
import Player from './player'
import HlsPlayer from './player/HlsPlayer'
import RtcPlayer from './player/RtcPlayer'
import FlvPlayer from './player/FlvPlayer'
import placeBlueSrc from "images/place/other/blue.svg"
import placeGreenSrc from "images/place/other/green.svg"
import placeLightBlueSrc from "images/place/other/light_blue.svg"
import placePinkSrc from "images/place/other/pink.svg"
import placePurpleSrc from "images/place/other/purple.svg"
import placeRedSrc from "images/place/other/red.svg"
import placeYellowSrc from "images/place/other/yellow.svg"
import Mp4Player from './player/Mp4Player'


// 便捷日期时间模板
export const YMDHms = 'YYYY-MM-DD HH:mm:ss'
export const YMDHm = 'YYYY-MM-DD HH:mm'
export const YMD = 'YYYY-MM-DD'
export const MD = 'MM-DD' // 短日期：01-03
export const MDpoint = 'MM.DD' // 短日期带点：01.03
export const MDHms = 'MM-DD HH:mm:ss'
export const Hms = 'HH:mm:ss'


export const screenTypeListData = [
  {
    alt: '1',
    defSrc: require('images/core/screenType/1def.png'),
    actSrc: require('images/core/screenType/1act.png'),
    curSrc: require('images/core/screenType/1def.png')
  },
  {
    alt: '2',
    defSrc: require('images/core/screenType/2def.png'),
    actSrc: require('images/core/screenType/2act.png'),
    curSrc: require('images/core/screenType/2def.png')
  },
  {
    alt: '3',
    defSrc: require('images/core/screenType/3def.png'),
    actSrc: require('images/core/screenType/3act.png'),
    curSrc: require('images/core/screenType/3def.png')
  },
  {
    alt: '4',
    defSrc: require('images/core/screenType/4def.png'),
    actSrc: require('images/core/screenType/4act.png'),
    curSrc: require('images/core/screenType/4def.png')
  },
  {
    alt: '6',
    defSrc: require('images/core/screenType/6def.png'),
    actSrc: require('images/core/screenType/6act.png'),
    curSrc: require('images/core/screenType/6def.png')
  },
  {
    alt: '9',
    defSrc: require('images/core/screenType/9def.png'),
    actSrc: require('images/core/screenType/9act.png'),
    curSrc: require('images/core/screenType/9def.png')
  },
  // {
  //   alt: '16',
  //   defSrc: require('images/core/screenType/12def.png'),
  //   actSrc: require('images/core/screenType/12act.png'),
  //   curSrc: require('images/core/screenType/12def.png')
  // }
]

// 地图中画扇形图
/* 
   leaflet 扇形绘制
   center: 中心点
   radius: 半径
   startAngle: 起始角度
   endAngle：终止角度
   pointNum: 圆弧上点的个数
 */
export function getPoints(center?: [number, number], radius?: number, startAngle?: number, endAngle?: number, pointNum?: number) {
  let sin, cos, x, y, angle;
  let points = [];
  points.push(center)
  for (let i = 0; i <= pointNum!; i++) {
    angle = startAngle! + (endAngle! - startAngle!) * i / pointNum!;
    sin = Math.sin(angle * Math.PI / 180);
    cos = Math.cos(angle * Math.PI / 180);
    y = center![0] + radius! * cos;
    x = center![1] + radius! * sin;
    points[i] = [y, x]
  }
  let point = points
  point.push(center)
  return point
}

/*   function test() {
    let lon = 113.926506;
    let lat = 22.482749;
    let points = getPoints([lat, lon], 0.1, 165, 180, 200);
    points[points.length] = points[0];
    L.polygon(points, { weight: 1 }).addTo(map2d?.map).bindPopup('扇形')
    map2d?.map.setView([lat, lon])
  } */

// 流程图 拖拽生成四边形
export const startDragToGraph = (graph: any, text: string, type: string, e: any, paramsType: string, ...params: any) => {
  let node = graph.createNode({
    width: params[0].width || 100, // 节点的宽度
    height: 30, // 节点的高度
    type: paramsType, //自定义的按钮类型
    data: {
      eventName: text,
      type: type,  //1是单维条件，2是聚合条件
      eventType: params[0].eventType || '',
      modelIds: params[0].modelIds || null
    }, //自定义存储节点数据
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'image',
        selector: 'img',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ],
    attrs: {
      label: {
        text: text,
        fill: '#a6cdff',
        fontSize: 12,
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
        height: '30px',
        rx: 4,
        ry: 4,
      },
      /* img: {
         x: 6,
         y: 6,
         width: 16,
         height: 16,
         'xlink:href':
           'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*pwLpRr7QPGwAAAAAAAAAAAAAARQnAQ',
       },*/
    },
    // ports: type === 'single' ? singlePorts : multiplePorts
    ports: multiplePorts
  })
  const dnd = new Addon.Dnd({ target: graph })
  dnd.start(node, e)
}
// 下面是锚点的代码。单位条件只有右边有连接点

const multiplePorts = {
  groups: {
    // 输入链接桩群组定义
    top: {
      position: 'top',
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
    // 输出链接桩群组定义
    bottom: {
      position: 'bottom',
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
    /* {
         id: 'port1',
         group: 'top'
     },
     {
         id: 'port2',
         group: 'bottom'
     },*/
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



// 船舶档案-预警信息-风险等级-EChart
export const getShipWarnLevelOptions = (seriesData: any[], params?: any) => {

  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      top: '8%',
      icon: "circle",
      itemHeight: 12,
      textStyle: {
        color: '#79a7e3',

        rich: {
          item1: {
            color: '#79a7e3',
            fontSize: '14px',
          },
          item2: {
            color: '#00f0fe',
            fontSize: '14px',
          },
        }
      },
      formatter: (name: any) => {
        let data: any = seriesData
        let val: any
        data.forEach((item: any) => {
          if (name === item.name) {
            val = item.value
          }
        })
        return `{item1|${name}: } {item2|${val}}`
      }
    },
    series: [
      {
        name: params && common.isNull(params.series) ? params.series.name : '',
        type: 'pie',
        radius: ['45%', '65%'],
        center: ['30%', '45%'],
        avoidLabelOverlap: false,
        //roseType:"area",
        label: {
          normal: {
            show: true,
            position: 'center',
            rich: {
              totalText: {
                fontSize: 12,
                lineHeight: 20,
                color: '#797979'
              },
              totalNumber: {
                fontSize: 16,
                color: '#4F6EF3'
              }
            }
          },
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
          normal: {
            color: function (colors: any) {
              let list: any = ['#7f90ff', '#2785f7', '#26c7fb', '#1ce694', '#fbb51f', '#e24cff']
              return list[colors.dataIndex]
            }
          }
        },
        labelLine: {
          show: false
        },
        data: seriesData
      }
    ]
  }
}

// 船舶档案-预警信息-预警行为统计-EChart
export const getShipWarnActionOptions = (seriesData: any[]) => {

  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      top: '10%',
      left: '65%',
      icon: "circle",
      itemHeight: 12,
      type: 'scroll',
      textStyle: {
        color: '#79a7e3',

        rich: {
          item1: {
            color: '#79a7e3',
            fontSize: '14px',
          },
          item2: {
            color: '#00f0fe',
            fontSize: '14px',
          },
        }
      },
      formatter: (name: any) => {
        let data: any = seriesData
        let val: any
        data.forEach((item: any) => {
          if (name === item.name) {
            val = item.value
          }
        })
        return `{item1|${name}: } {item2|${val}}`
      }
    },
    series: [
      {
        name: '预警行为统计',
        type: 'pie',
        radius: '45%',
        center: ['30%', '45%'],
        avoidLabelOverlap: false,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        /* label: {
          normal: {
            show: false,
            position: 'center',
            rich: {
              totalText: {
                fontSize: 12,
                lineHeight: 20,
                color: '#797979'
              },
              totalNumber: {
                fontSize: 16,
                color: '#4F6EF3'
              }
            }
          },
          emphasis: {
            show: true
          }
        }, */
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
          normal: {
            color: function (colors: any, index: number) {
              const len = echartsColor.length - 1
              return echartsColor[colors.dataIndex > len ? colors.dataIndex % len : colors.dataIndex]
            }
          }
        },
        /*  labelLine: {
           show: false
         }, */
        data: seriesData
      }
    ]
  }
}

// 船舶档案-预警信息-每日预警统计-EChart
export const getShipWarnDateOptions = (xAxisData: any[], seriesData: any[]) => {
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (data: any) => {
        let str = `<div>${data[0].name}</div><div>数据：${data[0].value}</div>`
        return str
      }
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#79a7e3"
        }
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#97b0e1'
        }
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#79a7e3"
        }
      }
    },
    series: [
      {
        data: seriesData,
        type: 'line',
        itemStyle: {
          normal: {
            areaStyle: { type: 'default' },
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: '#07ecff' },
                { offset: 0.5, color: 'rgba(7,236,255,0.3)' },
                { offset: 1, color: 'rgba(7,236,255,0.1)' },
              ]
            )
          }
        }
      }
    ]
  }
}
export const getCollectOptions = (title: any, xAxisData: any[], seriesData: any[]) => {
  return {
    title: {
      text: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (data: any) => {
        let str = `<div>${data[0].name}</div><div>数据：${data[0].value}</div>`
        return str
      }
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#79a7e3"
        }
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#97b0e1'
        }
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#79a7e3"
        }
      }
    },
    series: [
      {
        data: seriesData,
        type: 'bar',
        showBackground: true,
        barWidth: 20,
        backgroundStyle: {
          color: 'rgba(48,114,172,0.28)',
          borderColor: 'rgba(48,114,172,0.28)',
          borderWidth: 4
        },
        itemStyle: {
          normal: {
            areaStyle: { type: 'default' },
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: '#26c4f9' },
                //{offset:0.5,color:'rgba(7,236,255,0.3)'},
                { offset: 1, color: '#0567c9' },
              ]
            )
          }
        }
      }
    ]
  }
}


/** 获取地图船舶信息面版风险分布*/
export const getEchartOptionByRiskRadar = (indicatorData: any, seriesData: number[]) => {
  return {
    radar: {
      indicator: indicatorData,
      radius: '50%',
      splitNumber: 4,
      // splitArea: {
      //   areaStyle: {
      //     color: [
      //       'rgb(37, 240, 118, 0.5)',
      //       'rgb(244, 251, 52, 0.5)',
      //       'rgba(255, 165, 23, 0.5)',
      //       'rgba(255, 47, 37, 0.5)'
      //     ]
      //   }
      // }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: seriesData,
            itemStyle: {
              color: 'rgb(255, 145, 124)'
            },
            lineStyle: {
              color: 'rgb(255, 145, 124)'
            },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                { color: 'rgba(255, 145, 124, 0.1)', offset: 0 },
                { color: 'rgba(255, 145, 124, 0.9)', offset: 1 },
              ])
            }
          }
        ]
      }
    ]
  }
}

// 过滤诺依系统自带的菜单项
export const filterRouYiMenuOfTree = (tree: any[]) => {
  const result = _.filter(
    tree,
    (ele) => !["系统管理_rouyi", "系统监控_rouyi", "系统工具_rouyi"].includes(ele.menuName)
  );
  return result
}

/**
 * 树结构数据转列表数据, 默认字段：id, children，当无 parentId 字段时会自动加上
 * @param tree 树结构数据
 * @returns 列表数据
 */
export const treeToList = (tree: any[]) => {
  const list: any[] = []
  const doIterate = (children: any[], parentId?: any) => {
    children.forEach(ele => {
      if (_.has(ele, 'parentId')) {
        list.push(ele)
      } else {
        list.push({
          ...ele,
          parentId: parentId
        })
      }
      if (ele.children) {
        doIterate(ele.children, ele.id)
      }
    })
  }
  doIterate(tree)
  return list
}

/** 更改时间格式，清除时间格式中的T */
export const changeTime = (targetList: any[], key: string) => {
  targetList.forEach((item: any) => {
    if (_.has(item, key)) {
      const value = _.get(item, key);
      let time = value.replace(/T/, " ");
      _.set(item, key, time);
    }
  });
};


/**
 * 下载文件工具函数
 * @param data 后端返回的数据流
 * @param fileName 设置下载文件名称
 */
export const downloadFile = (data: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link) // 下载完成移除元素
  window.URL.revokeObjectURL(url) // 释放掉blob对象
}

/**
 * 下载文件工具函数
 * @param data 后端返回的数据流
 * @param fileName 设置下载文件名称
 */
export const downloadVideo = (url: string, fileName: string) => {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.target = '_blank'
  link.download = fileName
  link.click()
}


export const getIconUrlByDeviceType = (type: number) => {
  let result = ''
  switch (type) {
    case 1:
      // result = require('images/mapIcon/device/a-7Ayifenping.png')
      break;
    default:
      break;
  }

  return result
}

/**
 * 对数组按日期时间进行排序
 * @param list 数组
 * @param key 数组中存储日期时间项的key
 * @param type 'desc' | 'asc' desc是降序排列，而升序排列是使用asc，默认asc
 * @returns 原数组
 */
export const datetimeSort = (list: any[], key: string, type?: 'desc' | 'asc') => {
  if (_.isUndefined(type) || type === 'asc') {
    return list.sort((a, b) => dayjs(a[key]).unix() - dayjs(b[key]).unix())
  } else {
    return list.sort((a, b) => dayjs(b[key]).unix() - dayjs(a[key]).unix())
  }
}

// 浮标
export const mapMarkerA = [
  { lng: 113.891900, lat: 22.443970 },
  { lng: 113.897140, lat: 22.445880 },
  { lng: 113.899120, lat: 22.451950 },
  { lng: 113.903140, lat: 22.460580 },
  { lng: 113.907910, lat: 22.456590 },
  { lng: 113.909150, lat: 22.456440 },
  { lng: 113.907660, lat: 22.460400 },
  { lng: 113.908980, lat: 22.460310 },
  { lng: 113.909060, lat: 22.465090 },
  { lng: 113.910210, lat: 22.464960 },
  { lng: 113.911360, lat: 22.468270 },
  { lng: 113.924700, lat: 22.480620 },
  { lng: 113.933390, lat: 22.478630 },
  { lng: 113.935230, lat: 22.477540 },
  { lng: 113.935660, lat: 22.474050 },
  { lng: 113.928950, lat: 22.471380 },
  { lng: 113.943830, lat: 22.478490 },
  { lng: 113.947910, lat: 22.477780 },
  { lng: 113.949540, lat: 22.480060 },
  { lng: 113.907970, lat: 22.451310 },
  { lng: 113.909480, lat: 22.451270 },
  { lng: 113.958600, lat: 22.488920 },
  { lng: 113.951230, lat: 22.488440 },
  { lng: 113.951640, lat: 22.487270 },
  { lng: 113.949000, lat: 22.487530 },
  { lng: 113.949660, lat: 22.486330 },
  { lng: 113.986230, lat: 22.508100 },
  { lng: 113.994980, lat: 22.511370 },
  { lng: 113.992900, lat: 22.517600 },
]
// 灯塔
export const mapMarkerB = [
  { lat: 22.475890, lng: 113.915610 },
]


// 根据经纬度坐标、速度、方向得到速度线
export const getSpeedLength = (latLng: { lat: number, lng: number }, speed: number, course: number) => {
  const angle = Math.PI / 2.0 - course * Math.PI / 180.0
  const leaderLength = speed * 60
  const leaderEndLng = latLng.lng + getLngSizeOf(leaderLength * Math.cos(angle))
  const leaderEndLat = latLng.lat + getLatSizeOf(leaderLength * Math.sin(angle))

  function getLngSizeOf(value: number) {
    return ((value / 40075017) * 360) / Math.cos((Math.PI / 180) * latLng.lat);
  }

  function getLatSizeOf(value: number) {
    return (value / 40075017) * 360;
  }

  return [latLng, { lat: leaderEndLat, lng: leaderEndLng }]
}

/**
 * 获取船舶风险等级对应的图标资源地址
 * @param value ShipRiskDict字典值
 * @returns 图标资源地址
 */
export const getRiskLevelIconSrc = (value: number) => {
  let src = ''
  switch (value) {
    case 1:
      src = risk1_src
      break;
    case 2:
      src = risk2_src
      break;
    case 3:
      src = risk3_src
      break;
    case 4:
      src = risk4_src
      break;
    default:
      break;
  }
  return src
}


interface CreatePlayerOptions {
  isAutoPlay?: boolean
  isNotCurrentTime?: boolean
}

export const createPlayer = (videoElement: HTMLVideoElement, url: string, opt?: CreatePlayerOptions) => {
  let player: Player

  if (url.search('m3u8') !== -1) {
    player = new HlsPlayer(videoElement, url, opt)
  } else if (url.search('webrtc') !== -1) {
    player = new RtcPlayer(videoElement, url, opt)
  } else if (url.search('mp4') !== -1) {
    player = new Mp4Player(videoElement, url, opt)
  } else {
    player = new FlvPlayer(videoElement, url, opt)
  }

  return player
}

/**
 * 获取重点场所类型的图标资源地址
 * @param value PlaceTypeIconDict 字典值
 * @returns 图标资源地址
 */
export const getPlaceTypeIconSrc = (value?: string) => {
  let src = ''
  switch (value) {
    case '1':
      src = place1_src
      break;
    case '2':
      src = place2_src
      break;
    case '3':
      src = place3_src
      break;
    case '4':
      src = place4_src
      break;
    case '5':
      src = place5_src
      break;
    case '6':
      src = place6_src
      break;
    case '7':
      src = place7_src
      break;
    case '8':
      src = place8_src
      break;
    case '9':
      src = place9_src
      break;
    case '10':
      src = place10_src
      break;
    case '11':
      src = place11_src
      break;
    case '99':
      src = place99_src
      break;
    /** 类型其他的图标 */
    case '1001':
      src = placeBlueSrc
      break;
    case '1002':
      src = placeGreenSrc
      break;
    case '1003':
      src = placeLightBlueSrc
      break;
    case '1004':
      src = placePinkSrc
      break;
    case '1005':
      src = placePurpleSrc
      break;
    case '1006':
      src = placeRedSrc
      break;
    case '1007':
      src = placeYellowSrc
      break;
    default:
      src = defaultMarkerIconSrc
      break;
  }
  return src
}

/**
 * 获取场所类型图标
 * @param value 场所类型
 * @returns L.icon
 */
export const getPlaceTypeIcon = (value?: string) => {
  const iconUrl = getPlaceTypeIconSrc(value)
  const icon = L.icon({
    iconUrl: iconUrl,
    iconSize: value ? value === '11' ? [94, 22] : [20, 20] : [25, 41],
    iconAnchor: value ? undefined : [12.5, 38]
  })
  return icon
}

/** 根据tagType获取搜索结果展示的文本内容 */
export const getSearchResultContentText = (extraData: any) => {
  let contentText = ''
  switch (extraData.tagType) {
    case '1':
      contentText = `AIS: ${extraData.mmsi}, ${extraData.shipName}`
      break;
    case '2':
      contentText = `雷达批号: ${extraData.batchNum}`
      break;
    case '3':
      contentText = `融合目标: ${extraData.mmsi}${extraData.batchNum}`
      break;
    default:
      break;
  }
  return contentText
}

/**
 * 保持请求，直到执行返回的函数回调
 * @param remote async function
 * @param cb 请求的回调
 * @param interval 每个请求的时间间隔（毫秒），默认1500
 */
export const keepRequest = (remote: () => Promise<any>, cb: (data: any) => void, interval?: number) => {
  let isContinue = true

  const onExit = () => {
    isContinue = false
  }

  const timer = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(200)
      }, interval || 1500)
    })
  }

  const main = async () => {
    do {
      const result = await remote()
      cb(result)
      await timer()
    } while (isContinue)
  }

  main()

  return onExit
}

/**
 * 根据结构化信息返回新的图片地址
 * @param src 图片资源地址
 * @param info 结构化信息字符串
 */
export const getRelationImgSrc = (src: string, info: string) => {
  return new Promise<string>((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const data = JSON.parse(info)
        ctx.drawImage(img, 0, 0)

        ctx.lineWidth = 4

        const xRatio = img.width / 8192
        const yRatio = img.height / 8192

        let is = false

        if (data.detectLine.length > 1) {
          ctx.strokeStyle = '#2196f3'
          ctx.beginPath()
          data.detectLine.forEach((item: any, index: number) => {
            const lineX = item.x * xRatio
            const lineY = item.y * yRatio
            if (index === 0) {
              ctx.moveTo(lineX, lineY)
            } else {
              ctx.lineTo(lineX, lineY)
            }
          })
          ctx.stroke()
          is = true
        }

        if (data.downstairsLine.length > 1) {
          ctx.strokeStyle = '#2196f3'
          ctx.beginPath()
          data.downstairsLine.forEach((item: any, index: number) => {
            const lineX = item.x * xRatio
            const lineY = item.y * yRatio
            if (index === 0) {
              ctx.moveTo(lineX, lineY)
            } else {
              ctx.lineTo(lineX, lineY)
            }
          })
          ctx.stroke()
          is = true
        }

        if (data.upstairsLine.length > 1) {
          ctx.strokeStyle = '#2196f3'
          ctx.beginPath()
          data.upstairsLine.forEach((item: any, index: number) => {
            const lineX = item.x * xRatio
            const lineY = item.y * yRatio
            if (index === 0) {
              ctx.moveTo(lineX, lineY)
            } else {
              ctx.lineTo(lineX, lineY)
            }
          })
          ctx.stroke()
          is = true
        }

        if (!_.isEmpty(data.objectRect)) {
          const rectX = data.objectRect.left * xRatio
          const rectY = data.objectRect.top * yRatio
          const rectW = (data.objectRect.right - data.objectRect.left) * xRatio
          const rectH = (data.objectRect.bottom - data.objectRect.top) * yRatio

          ctx.strokeStyle = 'red'
          ctx.strokeRect(rectX, rectY, rectW, rectH)
          is = true
        }

        if (is) {
          const url = canvas.toDataURL('image/png')
          resolve(url)
        } else {
          resolve(src)
        }
      } else {
        resolve(src)
      }
    }
    img.onerror = (evt) => {
      console.warn(evt)
      resolve(src)
    }
    img.crossOrigin = 'anonymous'
    img.src = src
  })

}

/**
 * 将图片url转换为File对象
 * @param src 图片资源地址
 * @returns {Promise<unknown>}
 */
export const getImageFileFromUrl: (url: string) => any = (url: string) => {
  return new Promise((resolve, reject) => {
    let blob = null
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.setRequestHeader('Accept', 'image/jpg')
    xhr.responseType = 'blob'
    // 加载时处理
    xhr.onload = () => {
      // 获取返回结果
      blob = xhr.response
      let imageFile = new File([blob], '', { type: 'image/jpg' })
      // return出去
      resolve(imageFile)
    }
    xhr.onerror = (e) => {
      reject(e)
    }
    // 发送
    xhr.send()
  })
}