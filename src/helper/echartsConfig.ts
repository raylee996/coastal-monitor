// echarts-node相关配置与方法
import _ from 'lodash';

let echartsConfig = {
  isNull(val?: any) {
    if (_.isNull(val) || _.isUndefined(val) || val === '') {
      return true
    } else {
      return false
    }
  },
  getImgData(imgSrc: any) {
    //图片剪切成圆角
    var fun = function (resolve: any) {
      const canvas = document.createElement('canvas');
      const contex: any = canvas.getContext('2d');
      const img = new Image();

      img.crossOrigin = '';
      img.onload = function () {
        // 设置图形宽高比例
        let center = {
          x: img.width / 2,
          y: img.height / 2
        };
        let diameter = img.width;
        let radius = diameter / 2; // 半径

        canvas.width = diameter;
        canvas.height = diameter;
        contex.clearRect(0, 0, diameter, diameter);
        contex.save();

        contex.beginPath();
        contex.arc(radius, radius, radius, 0, 2 * Math.PI); // 画出圆
        contex.clip();

        contex.drawImage(
          img,
          center.x - radius,
          center.y - radius,
          diameter,
          diameter,
          0,
          0,
          diameter,
          diameter
        ); // 在刚刚裁剪的园上画图
        contex.restore(); // 还原状态

        resolve(canvas.toDataURL('image/png', 1));
      };
      img.src = imgSrc;
    };
    var promise = new Promise(fun);
    return promise;
  },
  getEchartsLabel(images?: any) {
    //关系图谱中的对象标签设置
    let _this = this
    return {
      // 关系对象上的标签
      show: true, // 是否显示标签
      formatter: function (params: any) {

        // return  `{a|} {g|{b}}`

        return `{a|} {g|${params.name}}  {val|${params.value}}`
      },
      align: "bottom",
      /* backgroundColor: new echarts.graphic.LinearGradient(
        0, 0, 1, 0,
        [
          { offset: 0, color: 'rgba(28,92,140,0.1)' },

          { offset: 1, color: 'rgba(28,92,140,1)' }
        ]
      ), */
      borderRadius: 50,
      borderColor: 'rgba(42,112,163,1)',
      // borderWidth: 0.5,
      offset: [0, 0],
      padding: [-4, -2, 0, -6],
      height: 50,
      rich: {
        a: {
          backgroundColor: {
            image: !_this.isNull(images) ? images : '',
          },
          align: "left",
          borderRadius: 20,
          padding: [30, 0, 0, 0],
          height: 26,
          width: 56,
        },
        g: {
          padding: [20, 24, 0, 16],
          align: "left",
          color: "rgba(160,222,255,1)",
          fontSize: 12,
          lineHeight: 12
        },
        val: {
          padding: [50, 24, 30, -12],
          align: "left",
          color: "rgba(160,222,255,1)",
          fontSize: 12,
          lineHeight: 12
        }

      },
      textStyle: {
        // 文本样式
        fontSize: 12,
      },
    }
  },
  getEchaNodeOptions(params?: any) {
    // 获取关系图配置信息
    let myOptions = {
      tooltip: {
        // 提示框的配置
        formatter: function (param: any) {
          if (param.dataType === "edge") {
            // 鼠标指向边界
            // return `行为：${param.data.category}<br>起始时间：${param.data.startDate}<br>结束时间：${param.data.endDate}`;
            return `行为：${param.data.category}`;
          }
          return param.data.name;
        },
      },
      series: [
        {
          type: "graph", // 系列类型:关系图
          top: "10%", // 图表距离容器顶部的距离
          symbol: "roundRect",

          center: [0, "0%"],
          edgeSymbol: ["circle", "arrow"],
          edgeSymbolSize: [4, 20],
          animation: false,
          draggable: true,
          emphasis: {
            disabled: true,
            scale: false,
          },
          // silent:true,
          roam: 'move', // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move'。设置成 true 为都开启
          focusNodeAdjacency: true, // 是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。[ default: false ]
          force: {
            // 力引导布局相关的配置项，力引导布局是模拟弹簧电荷模型在每两个节点之间添加一个斥力，每条边的两个节点之间添加一个引力，每次迭代节点会在各个斥力和引力的作用下移动位置，多次迭代后节点会静止在一个受力平衡的位置，达到整个模型的能量最小化。
            // 力引导布局的结果有良好的对称性和局部聚合性，也比较美观。
            repulsion: 1700, // [ default: 50 ]节点之间的斥力因子(关系对象之间的距离)。支持设置成数组表达斥力的范围，此时不同大小的值会线性映射到不同的斥力。值越大则斥力越大
            edgeLength: [50, 100], // [ default: 30 ]边的两个节点之间的距离(关系对象连接线两端对象的距离,会根据关系对象值得大小来判断距离的大小)，
            // 这个距离也会受 repulsion。支持设置成数组表达边长的范围，此时不同大小的值会线性映射到不同的长度。值越小则长度越长。如下示例:
            // 值最大的边长度会趋向于 10，值最小的边长度会趋向于 50      edgeLength: [10, 50]
          },
          // edgeSymbol:['circle','circle'],
          itemStyle: {
            borderType: "dashed",
            backgroundColor: 'transparent'
          },
          layout: "force", // 图的布局。[ default: 'none' ]

          lineStyle: {
            // 关系边的公用线条样式。其中 lineStyle.color 支持设置为'source'或者'target'特殊值，此时边会自动取源节点或目标节点的颜色作为自己的颜色。
            normal: {
              color: "#2187ff", // 线的颜色[ default: '#aaa' ]
              width: 1, // 线宽[ default: 1 ]
              type: "dashed", // 线的类型[ default: solid ]   'dashed'    'dotted'
              opacity: 1, // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。[ default: 0.5 ]
              curveness: 0, // 边的曲度，支持从 0 到 1 的值，值越大曲度越大。[ default: 0 ]
            },
          },

          edgeLabel: {
            // 连接两个关系对象的线上的标签
            normal: {
              show: true,
              textStyle: {
                fontSize: 12,
              },
              formatter: function (param: any) {
                // 标签内容

                return param.data.category;
              },
            },
          },
          data: params.data === undefined ? [] : params.data,// 节点数据
          links: params.links === undefined ? [] : params.links, // 节点连接线
          categories: params.categories === undefined ? [] : params.categories, // 数据关系
        },
      ],
    };

    return myOptions
  }
}

export default echartsConfig

// 没有数据的默认样式
export function getNoDataEchartsOption(props?: any) {
  let opt: any = {
    title: {
      text: '暂无数据',
      x: 'center',
      y: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      }
    }
  }

  opt = _.merge(opt, props)
  return opt
}

// echarts颜色调盘
export const echartsColor: any[] = ['#7f90ff', '#2785f7', '#26c7fb', '#1ce694', '#fbb51f', '#ff2f25', '#e24cff']

// 船型统计
export function getShipType(seriesData: any) {
  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: '60%',
      top: '10%',
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
        name: '船型统计',
        type: 'pie',
        radius: ['45%', '65%'],
        center: ['30%', '45%'],
        avoidLabelOverlap: false,
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
        labelLine: {
          show: false
        },
        data: seriesData
      }
    ]
  }
}

/**
 * 拆线图
 * @param options 基础配置项
 * @param props echarts其它配置项，相同会覆盖
 * @param delProps 删除某个echarts配置项
 * @returns echarts配置项
 */
export function getEchartsStackedLine(options: any, props?: any, delProps?: any) {
  let opt: any = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: options.legendData,
      textStyle: {
        color: '#add7ff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },
    toolbox: {
      feature: {
        // saveAsImage: {}
      }
    },
    /* dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        height: "20px"
      }], */
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: options.xAxisData,
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
    series: options.series,
  }

  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }

    });
  }
  opt = _.merge(opt, props)
  return opt
}

// 饼形图
export function getEchartsPieSimple(params: any, props?: any, delProps?: any) {

  let opt: any = {

    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: '65%',
      top: '10%',
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
        let data: any = params.seriesData
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
        name: '',
        type: 'pie',
        radius: '35%',
        center: ['30%', '45%'],
        data: params.seriesData,
        avoidLabelOverlap: true,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
          normal: {
            color: function (colors: any) {
              let list: any = ['#7f90ff', '#2785f7', '#26c7fb', '#1ce694', '#fbb51f', '#e24cff']
              return list[colors.dataIndex % 6]
            }
          }
        },
      }
    ]
  }
  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }

    });
  }
  opt = _.merge(opt, props)
  return opt
}

// 3D饼形图
export function get3DEchartsPie(params: any, props?: any, delProps?: any) {
  let opt: any = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: params.seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],

  }

  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }

    });
  }

  opt = _.merge(opt, props)
  return opt
}

/**
 * 预警数据-拆线图
 * @param options 基础配置项
 * @param props echarts其它配置项，相同会覆盖
 * @param delProps 删除某个echarts配置项
 * @returns echarts配置项
 */
export function getEchartsWarringDataStackedLine(params: any, props?: any, delProps?: any) {
  let opt: any = {
    tooltip: {
      trigger: 'axis',
      formatter: (data: any) => {
        let str = `<div>${data[0].name}</div><div>数据：${data[0].value}</div>`
        return str
      }
    },
    grid: {
      top: '10',
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: params.xAxisData,
      axisLabel: {
        color: '#fff'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false // 不显示坐标轴刻度线
      },

    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(64, 239, 255, 1)',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '',
      type: 'line',
      data: params.seriesData,
      stack: 'Total',
      lineStyle: {//折线颜色
        color: 'rgba(2, 236, 255, 1)'
      },
      itemStyle: {//折线加点
        color: "rgba(2, 236, 255, 1)",
        borderWidth: 1
      },
      areaStyle: {//面积区域
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(0, 162, 255, 1)",
          },
          {
            offset: 0.5,
            color: "rgba(0, 162, 255, 0.3)",
          },
          {
            offset: 1,
            color: "rgba(15, 127, 253, 0)",
          },
        ]),
      },
    }],
  }

  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }
    });
  }

  opt = _.merge(opt, props)
  return opt
}

// 态势感知-布控饼形
export function getControlEchartsPie(params: any, props?: any, delProps?: any) {
  let data = params.seriesData
  let opt: any = {
    color: ['#00ecd0', '#00e4ff', '#02a9f7', '#007eff', '#2062da', '#a5d3fe'],
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      top: 'center',
      right: '0',
      lineStyle: {
        width: 1.5
      },
      icon: "circle",
      itemWidth: 5,
      textStyle: {
        color: '#fff',
        fontSize: 9
      },
      formatter: function (lParams: any) {
        let val = data.filter((item: any) => {
          return item.name === lParams
        })
        return `${lParams} ${val ? val[0].value : 0}`
      }
    },
    series: [
      {
        name: '布控类型',
        type: 'pie',
        radius: ['30', '50'],
        left: -60,
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
          color: '#a5d3fe'
        },
        labelLine: {
          show: false,

        },
        itemStyle: {

        },
        data: params.seriesData,

      }
    ]
  }

  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }

    });
  }
  opt = _.merge(opt, props)
  return opt
}

// 态势感知-布控柱形
export function getEchartsControlBarTick(params: any, props?: any, delProps?: any) {
  let opt: any = {
    grid: {
      top: '10',
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: (data: any) => {
        let str = `<div>${data[0].name}</div><div>数据：${data[0].value}</div>`
        return str
      }
    },
    xAxis: {
      type: 'category',
      data: params.xAxisData,
      axisLabel: {
        color: '#fff'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false // 不显示坐标轴刻度线
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(64, 239, 255, 0.18)",
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(64, 239, 255,0.18)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: params.seriesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(5, 103, 201, 1)",
            },
            {
              offset: 1,
              color: "rgba(38, 196, 249, 1)",
            },
          ]),
        },
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(48, 114, 172, 0.28)'
        },
      }
    ]
  }

  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }

    });
  }

  opt = _.merge(opt, props)
  return opt
}

// 采集数据-布控柱形
export function getEchartsCollectionBarTick(params: any, props?: any, delProps?: any) {
  let opt: any = {
    color: [
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: "rgba(31,96,211,1)",
        },
        {
          offset: 1,
          color: "rgba(31,96,211,0)",
        },
      ]),
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: "rgba(60, 147, 249, 1)",
        },
        {
          offset: 1,
          color: "rgba(60, 147, 249,  0)",
        },
      ]),
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: "rgba(61, 235, 254, 1)",
        },
        {
          offset: 1,
          color: "rgba(61, 235, 254, 0)",
        },
      ]),
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: "rgba(82, 253, 172, 1)",
        },
        {
          offset: 1,
          color: "rgba(82, 253, 172, 0)",
        },
      ]),
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: "rgba(198, 220, 109, 1)",
        },
        {
          offset: 1,
          color: "rgba(198, 220, 109, 0)",
        },
      ])
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (data: any) => {
        let content = ''
        data.forEach((item: any) => {
          content += `<div>${item.seriesName}：${item.value}</div>`
        })
        let topTitle = `<div>${data[0].name}</div>`
        return topTitle + content
      }
    },
    grid: {
      top: "20",
      left: "3%",
      right: "3%",
      bottom: "5%",
      containLabel: true
    },
    legend: {
      top: '0',
      lineStyle: {
        width: 1.5
      },
      icon: "circle",
      itemWidth: 5,
      textStyle: {
        color: '#fff',
        fontSize: 9
      }
    },
    xAxis: [
      {
        type: 'category',
        data: params.dayArr,
        axisLabel: {
          color: '#fff'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false // 不显示坐标轴刻度线
        },

      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: '#fff'
        },
        axisLine: {
          color: '#fff',
          lineStyle: {
            type: [5, 10],
            dashOffset: 5
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(64, 239, 255, 1)',
            type: 'dashed'
          }
        }
      },
    ],
    series: [
      {
        name: 'AIS',
        type: 'bar',
        data: params.series.dataAisArr
      },
      {
        name: '雷达',
        type: 'bar',
        data: params.series.dataRadarArr
      },
      {
        name: '人脸',
        type: 'bar',
        data: params.series.dataFaceArr
      },
      {
        name: '车牌',
        type: 'bar',
        data: params.series.dataCarArr
      }
    ]
  }

  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }

    });
  }


  opt = _.merge(opt, props)
  return opt
}
/**3D 饼形图 start */

// 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
function getParametricEquation(startRatio: any, endRatio: any, isSelected: any, isHovered: any, k: any, h: any) {
  // 计算
  let midRatio = (startRatio + endRatio) / 2;

  let startRadian = startRatio * Math.PI * 2;
  let endRadian = endRatio * Math.PI * 2;
  let midRadian = midRatio * Math.PI * 2;

  // // 如果只有一个扇形，则不实现选中效果。
  // if (startRatio === 0 && endRatio === 1) {
  //     isSelected = false;
  // }
  isSelected = false;
  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== 'undefined' ? k : 1 / 3;

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  let offsetX = isSelected ? Math.sin(midRadian) * 0.1 : 0;
  let offsetY = isSelected ? Math.cos(midRadian) * 0.1 : 0;

  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  let hoverRate = isHovered ? 1.05 : 1;

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },

    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20,
    },

    x: function (u: any, v: any) {
      if (u < startRadian) {
        return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      if (u > endRadian) {
        return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    y: function (u: any, v: any) {
      if (u < startRadian) {
        return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      if (u > endRadian) {
        return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    z: function (u: any, v: any) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1;
      }
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1;
    },
  };
}

// 生成模拟 3D 饼图的配置项
export function getWarningPie3D(pieData: any, internalDiameterRatio: any) {
  let series = [];
  let sumValue = 0;
  let startValue = 0;
  let endValue = 0;
  let legendData = [];
  let k =
    typeof internalDiameterRatio !== 'undefined'
      ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
      : 1 / 3;

  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value;

    let seriesItem: any = {
      name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
      type: 'surface',
      parametric: true,
      wireframe: {
        show: false,
      },
      pieData: pieData[i],
      pieStatus: {
        selected: false,
        hovered: false,
        k: 1 / 10,
      },
      center: ["10%", "50%"],

      radius: ['20%', '50%']
    };

    if (pieData[i].itemStyle !== undefined) {
      let itemStyle: any = {};

      if (pieData[i].itemStyle.color !== undefined) {
        itemStyle.color = pieData[i].itemStyle.color
      }

      if (pieData[i].itemStyle.opacity !== undefined) {
        itemStyle.opacity = pieData[i].itemStyle.opacity
      }

      seriesItem.itemStyle = itemStyle;
    }
    series.push(seriesItem);
  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value;

    series[i].pieData.startRatio = startValue / sumValue;
    series[i].pieData.endRatio = endValue / sumValue;
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      false,
      false,
      k,
      100     // 控制各模块高度一致 如效果1
      // series[i].pieData.value  控制各模块高度根据value改变 如效果2
    );

    startValue = endValue;

    legendData.push(series[i].name);
  }

  //补充一个透明的圆环，用于支撑高亮功能的近似实现。
  series.push({
    name: 'mouseoutSeries',
    type: 'surface',
    parametric: true,
    wireframe: {
      show: false,
    },
    itemStyle: {
      opacity: 0.8,
      // color: '#E1E8EC',
      color: 'rgba(35,94,169,0.7)',
    },
    parametricEquation: {
      u: {
        min: 0,
        max: Math.PI * 2,
        step: Math.PI / 20,
      },
      v: {
        min: 0,
        max: Math.PI,
        step: Math.PI / 20,
      },
      x: function (u: any, v: any) {
        return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2;
      },
      y: function (u: any, v: any) {
        return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2;
      },
      z: function (u: any, v: any) {
        return Math.cos(v) > 0 ? -0.5 : -5;
      },
    },
  });

  // // 补充一个透明的圆环，用于支撑高亮功能的近似实现。
  // series.push({
  //   name: 'mouseoutSeries',
  //   type: 'surface',
  //   parametric: true,
  //   wireframe: {
  //     show: false,
  //   },
  //   itemStyle: {
  //     opacity: 0.8,
  //     color: 'rgba(54,122,177,1)',
  //   },
  //   parametricEquation: {
  //     u: {
  //       min: 0,
  //       max: Math.PI * 2,
  //       step: Math.PI / 20,
  //     },
  //     v: {
  //       min: 0,
  //       max: Math.PI,
  //       step: Math.PI / 20,
  //     },
  //     x: function (u: any, v: any) {
  //       return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2.1;
  //     },
  //     y: function (u: any, v: any) {
  //       return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2.1;
  //     },
  //     z: function (u: any, v: any) {
  //       return Math.cos(v) > 0 ? -5 : -7;// 圆环位置
  //     },
  //   },
  // });

  // // 补充一个透明的圆环，用于支撑高亮功能的近似实现。
  // series.push({
  //   name: 'mouseoutSeries',
  //   type: 'surface',
  //   parametric: true,
  //   wireframe: {
  //     show: false,
  //   },
  //   itemStyle: {
  //     opacity: 0.1,
  //     color: '#E1E8EC',
  //   },

  //   parametricEquation: {
  //     u: {
  //       min: 0,
  //       max: Math.PI * 2,
  //       step: Math.PI / 20,
  //     },
  //     v: {
  //       min: 0,
  //       max: Math.PI,
  //       step: Math.PI / 20,
  //     },
  //     x: function (u: any, v: any) {
  //       return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2.2;
  //     },
  //     y: function (u: any, v: any) {
  //       return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2.2;
  //     },
  //     z: function (u: any, v: any) {
  //       return Math.cos(v) > 0 ? -7 : -7;
  //     },
  //   },
  // });

  // 准备待返回的配置项，把准备好的 legendData、series 传入。
  let option = {
    animation: false,
    tooltip: {
      formatter: (key: any) => {
        let labelName = key.seriesName
        let val = null
        pieData.forEach((item: any) => {
          if (item.name === labelName) {
            val = item.value
          }
        })
        if (val) {
          return `${labelName}:${val}`
        }
      },
      position: ['10%', '10%']
    },
    legend: {
      orient: 'vertical',
      top: '30px',
      right: '-10px',
      // bottom:'0',
      lineStyle: {
        width: 5
      },
      icon: "circle",
      itemWidth: 3,
      /* textStyle: {
        color: '#fff',
        fontSize: 8
      }, */
      textStyle: {
        color: '#fff',
        rich: {
          item1: {
            color: '#fff',
            fontSize: '8px',
          },
          item2: {
            color: '#00f0fe',
            fontSize: '8px',
          },
        }
      },
      formatter: (name: any) => {
        let val: any
        pieData.forEach((item: any) => {
          if (name === item.name) {
            val = item.value
          }
        })
        return `{item1|${name}: } {item2|${val}}`
      },
      data: legendData
    },
    xAxis3D: {},
    yAxis3D: {},
    zAxis3D: {},
    grid3D: {
      // 用于鼠标的旋转，缩放等视角控制。
      viewControl: {
        autoRotate: true,// 是否开启视角绕物体的自动旋转查看。默认 true
        alpha: 30,     // 视角绕 x 轴，即上下旋转的角度
        distance: 300,//调整视角到主体的距离，类似调整zoom

      },
      left: '-30',
      show: false,
      boxHeight: 10,
      boxWidth: 200,
      boxDepth: 200
    },
    series: series,
  };
  return option;
}

/**3D 饼形图 end */


// 船舶档案-行为分类统计-饼形图
export function getBehivorEchartsPieSimple(params: any, props?: any, delProps?: any) {
  let opt: any = {
    color: echartsColor,
    title: {
      text: ""
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      top: 'center',
      right: '0',
      lineStyle: {
        width: 5
      },
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
        let data: any = params.seriesData === undefined ? [] : params.seriesData
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
        name: '',
        type: 'pie',
        radius: ['45%', '65%'],
        center: ['30%', '45%'],
        data: params.seriesData === undefined ? [] : params.seriesData,
        left: '0',

        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
          normal: {
            color: function (colors: any) {
              let list: any = ['#7f90ff', '#2785f7', '#26c7fb', '#1ce694', '#fbb51f', '#e24cff', '#ff2f25', '#ff4cad', '#F721FA']
              return colors.dataIndex > 8 ? '#ccc' : list[colors.dataIndex]
            }
          }
        },
      }
    ]
  }
  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }

    });
  }

  opt = _.merge(opt, props)
  return opt
}


// 船舶档案-行为分类统计-折线图
export function getBehivorEchartsLine(params: any, props?: any, delProps?: any) {
  let opt: any = {
    grid: {
      top: '10',
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: params.xAxisData,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#79a7e3"
        }
      }
      // axisLine: {
      //   show: false
      // },
      // axisTick: {
      //   show: false // 不显示坐标轴刻度线
      // },

    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: true,
        textStyle: {
          color: "#79a7e3"
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#79a7e3',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '',
      type: 'line',
      data: params.seriesData === undefined ? [] : params.seriesData,
      stack: 'Total',
      lineStyle: {//折线颜色
        color: 'rgba(2, 236, 255, 1)'
      },
      itemStyle: {//折线加点
        color: "rgba(2, 236, 255, 1)",
        borderWidth: 1
      },
      areaStyle: {//面积区域
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(0, 162, 255, 1)",
          },
          {
            offset: 0.5,
            color: "rgba(0, 162, 255, 0.3)",
          },
          {
            offset: 1,
            color: "rgba(15, 127, 253, 0)",
          },
        ]),
      },
    }]
  }

  if (delProps) {
    delProps.forEach((element: any) => {
      if (opt[element]) {
        delete opt[element]
      }
    });
  }
  opt = _.merge(opt, props)
  return opt
}

// 态势分析-感知目标-风险船舶数量趋势
export function getTargetStatisticRiskOption() {
  return {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
  };
}

// 态势分析-感知目标-AIS船舶类型分布
export function getShipTypeOption(data: { value: number, name: string }[]) {
  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      textStyle: {
        color: '#a6cdff'
      }
    },
    series: [
      {
        type: 'pie',
        radius: '80%',
        center: ['30%', '50%'],
        labelLine: {
          show: false
        },
        label: {
          show: false,
        },
        data: data
      }
    ]
  };
}

// 态势分析-感知目标-船舶数量趋势
export function getShipCountOption(xAxisData: string[], seriesDataA: number[], seriesDataB: number[]) {
  return {
    legend: {
      data: ['AIS', '雷达'],
      textStyle: {
        color: '#a6cdff'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '16',
      right: '16',
      top: '40',
      bottom: '16',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        color: '#a6cdff'
      },
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: '#a6cdff'
      },
    },
    series: [
      {
        name: 'AIS',
        data: seriesDataA,
        type: 'line'
      },
      {
        name: '雷达',
        data: seriesDataB,
        type: 'line'
      }
    ]
  };
}

// 态势分析-基础设施-设备数量统计
export function getDeviceTypeOption(data: { value: number, name: string }[]) {
  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      textStyle: {
        color: '#a6cdff'
      }
    },
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#4096ff'],
    series: [
      {
        type: 'pie',
        radius: '80%',
        center: ['20%', '50%'],
        labelLine: {
          show: false
        },
        label: {
          show: false,
        },
        data: data
      }
    ]
  };
}

// 态势分析-基础设施-设备状态统计
export function getDeviceFineAndFaultOption(xAxisData: string[], seriesDataA: number[], seriesDataB: number[]) {
  return {
    legend: {
      data: ['异常设备数', '正常设备数'],
      textStyle: {
        color: '#a6cdff'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '16',
      right: '16',
      top: '40',
      bottom: '16',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        color: '#a6cdff'
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: '#a6cdff'
      },
    },
    series: [
      {
        name: '正常设备数',
        data: seriesDataA,
        type: 'line'
      },
      {
        name: '异常设备数',
        data: seriesDataB,
        type: 'line'
      }
    ]
  };
}

// 态势分析-基础设施-采集数据统计
export function getCollectionOption(xAxisData: string[], seriesDataA: number[], seriesDataB: number[]) {
  return {
    legend: {
      data: ['上新数', '采集数'],
      textStyle: {
        color: '#a6cdff'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '16',
      right: '16',
      top: '40',
      bottom: '16',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        color: '#a6cdff'
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: '#a6cdff'
      },
    },
    series: [
      {
        name: '上新数',
        data: seriesDataA,
        type: 'line'
      },
      {
        name: '采集数',
        data: seriesDataB,
        type: 'line'
      }
    ]
  };
}

// 态势分析-基础设施-设备状态统计
export function getWarnShipStatisticsOption(xAxisData: string[], seriesDataA: number[], seriesDataB: number[]) {
  return {
    legend: {
      data: ['AIS', '雷达'],
      textStyle: {
        color: '#a6cdff'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '16',
      right: '16',
      top: '40',
      bottom: '16',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        color: '#a6cdff'
      },
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: '#a6cdff'
      },
    },
    series: [
      {
        name: 'AIS',
        data: seriesDataA,
        type: 'line'
      },
      {
        name: '雷达',
        data: seriesDataB,
        type: 'line'
      }
    ]
  };
}

// 态势分析-预警威胁-风险类别分布
export function getRiskTypeOption(data: { value: number, name: string }[]) {
  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      textStyle: {
        color: '#a6cdff'
      },
      type: 'scroll'
    },
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#4096ff'],
    series: [
      {
        type: 'pie',
        radius: '80%',
        center: ['20%', '50%'],
        labelLine: {
          show: false
        },
        label: {
          show: false,
        },
        data: data
      }
    ]
  };
}

// 态势分析-预警威胁-预警风险趋势
export function getDayRiskLevelStatsOption(
  xAxisData: string[],
  seriesDataA: number[],
  seriesDataB: number[],
  seriesDataC: number[],
  seriesDataD: number[]
) {
  return {
    legend: {
      data: ['总数', '高风险', '中风险', '低风险'],
      textStyle: {
        color: '#a6cdff'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '16',
      right: '16',
      top: '40',
      bottom: '16',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        color: '#a6cdff'
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: '#a6cdff'
      }
    },
    series: [
      {
        name: '总数',
        data: seriesDataA,
        type: 'line'
      },
      {
        name: '高风险',
        data: seriesDataB,
        type: 'line'
      },
      {
        name: '中风险',
        data: seriesDataC,
        type: 'line'
      },
      {
        name: '低风险',
        data: seriesDataD,
        type: 'line'
      }
    ]
  };
}

/** 态势分析-预警威胁-异常行为分布 */
export function getWarnCountByEventTypeOption(data: { value: number, name: string }[]) {
  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      textStyle: {
        color: '#a6cdff'
      },
      type: 'scroll'
    },
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#4096ff'],
    series: [
      {
        type: 'pie',
        radius: '80%',
        center: ['20%', '50%'],
        labelLine: {
          show: false
        },
        label: {
          show: false,
        },
        data: data
      }
    ]
  };
}