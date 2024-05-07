import { Checkbox, Typography } from "antd";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { getFittingNumberList, getShipTrackList } from "server/ship";
import styles from "./index.module.sass";


const columns: any[] = [
  ['序号', 'ordinal', { itemProps: { width: 60 } }],
  ['数据类型', 'type'],
  ['数据内容', 'content'],
  ['采集时间', 'datetime'],
  ['采集地址', 'address']
]

const numberColumns: any[] = [
  ['IMSI', 'imsi'],
  ['次数', 'count', { itemProps: { width: 80 } }],
  [
    ['查看档案']
  ]
]

const inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange],
  ['轨迹类型', 'type', InputType.select, {
    dict: [{
      name: '全部',
      value: 0
    }, {
      name: '共轨',
      value: 1
    }]
  }],
]

const initialValues: any = {
  type: 0
}

interface Props {
  /** 船舶id */
  id?: string | number
}

const ShipArchiveFitting: React.FC<Props> = ({ id }) => {
  console.debug('ShipArchiveFitting', id)

  const mapRef = useRef<HTMLDivElement>(null)

  const [plainOptions] = useState(['Apple', 'Pear', 'Orange'])

  useEffect(() => {
    console.debug(initialValues)
  }, [])

  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.StreetMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs })
      getMapOffLineDate(MapType.StreetMap).addTo(_mapLeaflet.map);
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [])

  function handleRowClick(item: any) {
    console.debug(item)
  }

  function handleFinish(params: any) {
    console.log(params)
  }


  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>
        <article className={styles.adjointShip}>
          <header>
            <Typography.Title level={5}>拟合号码</Typography.Title>
          </header>
          <section>
            <TableInterface
              request={getFittingNumberList}
              columns={numberColumns}
              tableProps={{
                size: 'middle',
                onRow: (record: any) => {
                  return {
                    onClick: () => {
                      handleRowClick(record)
                    }
                  }
                }
              }}
              paginationProps={{
                size: 'small',
                showQuickJumper: false,
                showSizeChanger: false
              }}
            />
          </section>
        </article>
      </section>
      <section className={styles.content}>
        <header>
          <Typography.Title level={5}>轨迹信息</Typography.Title>
          <section className={styles.query}>
            <FormPanel
              inputs={inputs}
              formProps={{
                layout: 'inline',
                initialValues
              }}
              options={{
                isShowItemButton: true,
                isNotShowFooter: true,
                submitText: '查询'
              }}
              onFinish={handleFinish} />
          </section>
        </header>
        <section className={styles.mapBox} >
          <div className={styles.map} ref={mapRef}></div>
          <div className={styles.legend}>
            <Checkbox.Group options={plainOptions} value={plainOptions} />
          </div>
        </section>
        <footer className={styles.table}>
          <TableInterface
            columns={columns}
            request={getShipTrackList}
          />
        </footer>
      </section>
    </article>
  )
}

export default ShipArchiveFitting