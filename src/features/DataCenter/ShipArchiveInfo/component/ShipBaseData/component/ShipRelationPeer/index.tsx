import { followRelationType, follwoRelationTime, nodeLevelDict } from "helper/dictionary";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import styles from "./index.module.sass";
import { useEffect, useState } from "react";
import { getPeerRelationPageAsync, getShipDetailInfo } from "server/ship";
import TableInterface from "hooks/integrity/TableInterface";
import XcEchartsNode from "component/XcEchartsNode";
import XcRadios from "component/XcRadios";
import dayjs from "dayjs";
import Title from "component/Title";

interface Props {
  id: any
}

let count = 5

const ShipRelationPeer: React.FC<Props> = ({ id }) => {
  console.debug('ShipRelationPeer')
  //数据定义

  const [tableIndex] = useState(0)
  const [relationData, setRelationData] = useState<any>(undefined)

  const [tableSource, setTableSource] = useState<any>()

  const columns = [
    ['自身数据', 'vid'],
    ['同行数据类型', 'peerDataType'],
    ['同行数据', 'peerData'],
    ['船名', 'name'],
    ['同行次数', 'peerTimes'],
    /*   [
        ['查看', (record: any) => {
          //查看二级同行,切换第二个表格
          setTableIndex(1)
        }]
      ] */
  ]

  const columns1 = [
    ['自身数据', 'vid'],
    ['同行数据类型', 'peerDataType'],
    ['同行数据', 'peerData'],
    ['船名', 'shipName'],
    ['同行次数', 'peerTimes']
  ]

  const formInputs = [
    [
      '',
      'level',
      InputType.component,
      {
        component: XcRadios,
        isRow: true,
        option: { data: [{ name: '展示1层', value: 1 }, { name: '展示2层', value: 2 }] }
      }
    ],

    [
      '每层条数', 'count', InputType.select, {
        dict: nodeLevelDict,
        placeholder: '请选择',
      }
    ],
    [
      '同行数据类型', 'type', InputType.select, {
        dict: followRelationType,
        placeholder: '请选择',
      }
    ],
    [
      '时间', 'time', InputType.select, {
        dict: follwoRelationTime,
        placeholder: '请选择',
      }
    ],
  ]


  // 初次获取图谱数据
  useEffect(() => {
    async function main() {
      const vo = await getShipDetailInfo(id)
      // type: 4:ais 5:radar 6:不限
      let type = 6
      if (vo.fusionStatus === 1) {
        type = 4
      } else if (vo.fusionStatus === 2) {
        type = 5
      } else {
        type = 6
      }
      let beginTime = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
      let endTime = dayjs().format('YYYY-MM-DD');
      let res = await getPeerRelationPageAsync({
        type,
        count: 5,
        level: 1,
        srcCode: id,
        beginTime,
        endTime,
      })
      setRelationData(res.data)
      if (res.data.data.links && res.data.data.links.length) {
        setTableSource(res.data.data.nodes)
      }
    }
    main();
  }, [id])


  // 搜索
  async function handleFinish(value?: any) {
    count = value.count || 5
    setRelationData(undefined)
    let beginTime: string = ''
    let endTime = dayjs().format('YYYY-MM-DD');
    switch (value.time) {
      // 近一周
      case '1':
        beginTime = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        break;
      //近一月  
      case '2':
        beginTime = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
        break;
      case '3':
        beginTime = dayjs().subtract(3, 'month').format('YYYY-MM-DD')
        break;

    }
    let res = await getPeerRelationPageAsync({
      type: value.type,
      count: value.count || 5,
      level: value.level,
      srcCode: id,
      beginTime,
      endTime,
    })

    setRelationData(res.data || undefined)
    if (res.data.data.links && res.data.data.links.length) {
      setTableSource(res.data.data.nodes)
    }
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.condition}>
        {
          <FormPanel
            inputs={formInputs}
            initData={{
              level: 1,
              count,
              type: 6,
              time: '1'
            }}
            onAsyncFinish={handleFinish}
            formProps={{
              layout: "inline",
            }}
            options={{
              isNotShowFooter: true,
              isShowItemButton: true,
              isShowReset: false,
              submitText: '筛选'
            }} />
        }
      </div>

      <div className={styles.boxEchartsNode}>
        <XcEchartsNode data={relationData} />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Title title="数据详情" />
        </div>
        <div className={styles.panelContent}>
          <TableInterface
            columns={tableIndex === 0 ? columns : columns1}
            tableDataSource={tableSource}
          />
        </div>
      </div>
    </div>
  )
}

export default ShipRelationPeer