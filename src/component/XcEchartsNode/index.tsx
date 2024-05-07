// echarts-node图表
import { useEffect, useState } from "react";
import EchartsConfig from "helper/echartsConfig" // echarts配置信息

import style from "./index.module.sass";
import EchartPanel from "hooks/flexibility/EchartPanel";


const defaultImg = require('images/default.png')

interface EchartsNode {
  data?: any;
  option?: any//echarts-node option配置项
  custom?: any; //其它选项
  relationName?: string //连线上的关系
}

// 临时data
var tempNodeData = {
  "msg": "操作成功",
  "code": 200,
  "data": {
    "nodes": [
      // { "vid": "628297711657852928", "id": "91", "foreignId": "694846", "dataType": 1, "name": "竿蛆", "vertexTag": null, "idNum": "430802200211258976", "phone": "", "faceId": null, "facePath": "2022/09/8d5494eef01f3a2_1663667846937.jpg" }, 
      // { "vid": "628297712165363712", "id": "96", "foreignId": "537828", "dataType": 1, "name": "氓咐", "vertexTag": null, "idNum": "452622201603298874", "phone": "15821834235", "faceId": null, "facePath": "https://pics3.baidu.com/feed/cf1b9d16fdfaaf51055aeb850e4a2de7f01f7a73.jpeg" }, 
      { "vid": "628297711846596608", "id": "92", "foreignId": "554685", "dataType": 1, "name": "暂无数据", "vertexTag": null, "idNum": "522103194711247200", "phone": "", "faceId": null, "facePath": "2022/09/dcc451da81cb39dbb6fd1_1663227301168.jpg" }],
    "links": [
      // { "source": "628297711657852928", "target": "628297712165363712", "startDate": "2022-10-07", "endDate": "2022-10-07", "rank": 20221007, "content": "西丽街道", "relationType": 2 }, 
      // { "source": "628297711657852928", "target": "628297711846596608", "startDate": "2022-10-07", "endDate": "2022-10-07", "rank": 20221007, "content": "", "relationType": 6 }
    ]
  },
  "timestamp": 1667196883529
}

const XcEchartsNode: React.FC<EchartsNode> = ({ data, option, custom, relationName }: EchartsNode) => {
  console.debug("XcEchartsNode")

  // 数据定义
  const [echartsOptions, setEchartsOptions] = useState({})
  useEffect(() => {
    async function main() {
      let params = undefined
      if (data === undefined || data.length === 0) {
        params = tempNodeData
      } else {
        params = data
      }

      // echarts-关系图谱
      let picList: any = [] // 头像切图数据

      // 1-处理data.nodes节点数据
      let arrNodes: any = [] // 处理后的nodes节点数据
      if (params.data && params.data.nodes && params.data.nodes.length !== 0) {

        params.data.nodes.forEach((nodeItem: any, nodeIndex: number) => {
          // 处理头像
          /* if (nodeItem.facePath === undefined || nodeItem.facePath === null || nodeItem.facePath === '' || nodeItem.facePath === "null") {
            picList.push(defaultImg) // 默认头像
          } else {
            picList.push(nodeItem.facePath) // 节点头像
          } */
          picList.push(defaultImg)

          // 查找对应的关系
          let tempCategory: any = [
            { value: 0, name: "关系0" },
            { value: 1, name: "关系1" }
          ].filter(rItem => {
            return (nodeItem.dataType === rItem.value - 1)
          })

          // 创建节点数据
          arrNodes.push({
            id: nodeItem.vid,
            name: nodeItem.name || nodeItem.mmsi || '',
            category: tempCategory.length !== 0 ? tempCategory[0].name : '--', // 数据项所在类目的 index
            value: '',
            draggable: false, // 节点是否可拖拽，只在使用力引导布局的时候有用。
            symbolSize: 0,
            label: {},
          })
        })
      }

      // 2-处理data.links节点连接线
      let arrLinks: any = [] // 处理后的links节点连接线
      if (params.data && params.data.links && params.data.links.length !== 0) {
        params.data.links.forEach((linkItem: any, linkIndex: number) => {

          arrLinks.push({
            source: linkItem.source,
            target: linkItem.target,
            category: relationName || '',
            startDate: linkItem.startDate,
            endDate: linkItem.endDate,
          })
        })
      }

      // 加载头像，并切图
      picList = picList.filter((picItem: any) => {
        return EchartsConfig.getImgData(picItem)
      })

      if (picList.length > 0) {
        let tempNodes: any = arrNodes
        Promise.all(picList).then(images => {
          for (let i = 0; i < tempNodes.length; i++) {
            (function () {
              tempNodes[i].label = EchartsConfig.getEchartsLabel(images[i])//关系中的label设置
            }())
          }

        }).then(() => {
          // 获取关系图配置信息，并渲染
          let tempEchartsOption: any = null
          if (option === undefined) {
            tempEchartsOption = EchartsConfig.getEchaNodeOptions({
              data: tempNodes, // 节点数据
              links: arrLinks, // 节点线
              categories: [
                { value: 0, name: "关系0" },
                { value: 1, name: "关系1" }
              ] // 连接关系
            })
          } else {
            // 传入echarts option配置参数
            tempEchartsOption = option
          }

          //设置options，并传入组件
          setEchartsOptions(tempEchartsOption)
        });
      }

    }
    main()
  }, [data, option, relationName])

  return (
    <div className={style.panel}>
      <EchartPanel option={echartsOptions} />
    </div>
  );
};

export default XcEchartsNode;