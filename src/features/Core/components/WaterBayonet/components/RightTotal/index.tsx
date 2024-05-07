import { Row, Col, Select, Radio, Button, message } from 'antd'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import TableInterface from "hooks/integrity/TableInterface"
import { InputType } from "hooks/flexibility/FormPanel";
import styles from './index.module.sass'
import { getWatersLists, getWaterstypes, getWaterByDirection, getWaterscountByMmsi, findAllDevicesAsync } from 'server/search';
import Title from 'component/Title';
import _ from 'lodash';
import ShipArchiveInfo from 'features/DataCenter/ShipArchiveInfo';
import popup from 'hooks/basis/Popup';
import { getShipInfoData } from 'server/ship';
import ImageSimple from 'hooks/basis/ImageSimple';
import { getBayonetImgs } from 'server/system';
import viewer from 'hooks/basis/Viewer';

interface Props {
  changeSelect?: Function
}

const queryInputs = [
  ['时间', 'dateTimeRange', InputType.dateTimeRange],
  ['船舶', 'searchValue', {
    placeholder: '请输入船名/MMSI',
  }],
]

const handleImgs = (record: any) => {
  const handleImgList = async (signal: AbortController) => {
    const vo = await getBayonetImgs(record, signal)
    return vo
  }
  viewer({
    imgListRemote: handleImgList
  })
}

const columns = [
  ['时间', 'capTime'],
  ['进港/出港', 'directionName'],
  ['图片', 'imageUrl', {
    itemProps: {
      render: (text: any, record: any) => {
        return text ?
          <ImageSimple
            className={styles.image}
            width={60}
            height={60}
            src={text}
            preview={false}
            onClick={() => handleImgs(record)}
          />
          : '--'
      }
    }
  }],
  ['船名', 'shipName'],
  ['船型', 'shipTypeName'],
  ['MMSI', 'mmsi'],
  ['雷达批号', 'batchNum'],
  ['操作', '', {
    itemProps: {
      width: '160px',
      render: (text: any, record: any) => {
        return (
          <>
            {(record.mmsi || record.batchNum) && <Button className={styles.detailBtn} type={"link"} onClick={async () => {
              let vo = await getShipInfoData({
                mmsi: record.mmsi,
                radarNumber: record.batchNum
              })
              if (vo && vo.id) {
                popup(<ShipArchiveInfo id={vo.id} dataType={vo.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
              } else {
                message.error('暂无船舶档案')
              }

            }}>查看档案</Button>}
          </>
        )
      }
    }
  }],
]

const RightTotal: React.FC<Props> = ({ changeSelect }) => {
  console.debug('RightTotal')

  const tableRef = useRef<any>()

  // 卡口选择
  const [bayonetData, setBayonetData] = useState<any>([])
  const [placeID, setPlaceID] = useState()

  // 船舶流量统计
  const [controlFlow, setControlFlow] = useState('day')

  // 船舶AIS状态统计
  const [AIStotal, setAIStotal] = useState('day')
  const [FlowData, setFlowData] = useState<any>([])
  const [AISData, setAISData] = useState<any>([])

  // 获取卡口选择数据
  useEffect(() => {
    async function main() {
      const vo = await getWaterstypes()
      if (!_.isEmpty(vo)) {
        setPlaceID(vo[0].value)
        setBayonetData(vo)
      }
    }
    main()
  }, [])

  // 监测切换卡口
  useEffect(() => {
    async function main() {
      const vo = await findAllDevicesAsync({
        focusPlaceId: placeID,
        workTypeFlag: true
      })
      changeSelect && changeSelect(vo)

    }
    if (placeID) {
      main()
    }
  }, [placeID, changeSelect])

  useEffect(() => {
    async function main() {
      if (placeID) {
        let param: any = {
          dateType: controlFlow === 'day' ? 1 : 2,
          placeId: placeID
        }
        const vo = await getWaterByDirection(param)
        setFlowData(vo)
      }
    }
    main()
  }, [controlFlow, placeID])

  useEffect(() => {
    async function main() {
      if (placeID) {
        let params: any = {
          dateType: AIStotal === 'day' ? 1 : 2,
          placeId: placeID
        }
        const vo = await getWaterscountByMmsi(params)
        setAISData(vo)
      }
    }
    main()
  }, [AIStotal, placeID])

  function handleContral(data?: any, option?: any) {
    setPlaceID(option.value)
  }
  // 船舶流量统计
  function handleControlFlow(data?: any) {
    setControlFlow(data.target.value)
  }
  // 船舶AIS状态统计
  function handleAIStotal(data?: any) {
    setAIStotal(data.target.value)
  }

  const extraParams = useMemo(() => (placeID ? { placeId: placeID } : undefined), [placeID])

  return (
    <article className={styles.wrapper}>

      <section className={styles.charts}>
        <div className={styles.titleSelect}>
          <Select
            value={placeID}
            style={{ width: "240px" }}
            options={bayonetData}
            onChange={handleContral}
            allowClear={false} />
        </div>

        <Row>
          <Col span={12}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>船舶流量统计</div>
              <Radio.Group className={styles.cardRadio} value={controlFlow} onChange={handleControlFlow} size='small'>
                <Radio.Button value="day">近一天</Radio.Button>
                <Radio.Button value="month">近七天</Radio.Button>
              </Radio.Group>
              <div className={styles.cardContent}>
                {FlowData.map((item: any, index: number) =>
                  <div className={styles.item} key={index}>
                    <span className={styles.value}>{item.itemNum}</span>
                    <span className={styles.label}>{item.labelName}</span>
                  </div>
                )}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>船舶AIS状态统计</div>
              <Radio.Group className={styles.cardRadio} value={AIStotal} onChange={handleAIStotal} size='small'>
                <Radio.Button value="day">近一天</Radio.Button>
                <Radio.Button value="month">近七天</Radio.Button>
              </Radio.Group>
              <div className={styles.cardContent}>
                {AISData.map((item: any, index: number) =>
                  <div className={styles.item} key={index}>
                    <span className={styles.value}>{item.itemNum}</span>
                    <span className={styles.label}>{item.labelName}</span>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </section>

      <section className={styles.title}>
        <Title title='过船记录' />
      </section>

      <TableInterface
        className={styles.table}
        ref={tableRef}
        tableProps={{
          rowKey: 'id'
        }}
        extraParams={extraParams}
        isMustExtraParams={true}
        columns={columns}
        queryInputs={queryInputs}
        request={getWatersLists}
        paginationProps={{
          showTotal: (total: number) => {
            return `总数 : ${total}`
          }
        }}
      />
    </article>
  )
}
export default RightTotal