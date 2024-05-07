import { Checkbox, Typography } from "antd";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { getShipListTable, getShipTrackList } from "server/ship";
import FaceCard from "../../../components/ImageCard";
import styles from "./index.module.sass";


const columns: any[] = [
  ['序号', 'ordinal', { itemProps: { width: 60 } }],
  ['数据类型', 'type'],
  ['数据内容', 'content'],
  ['采集时间', 'datetime'],
  ['采集地址', 'address']
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

const CarArchiveRelevant: React.FC<Props> = ({ id }) => {
  console.debug('CarArchiveRelevant', id)

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

  function handleFinish(params: any) {
    console.log(params)
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>
        <article className={styles.adjointShip}>
          <header>
            <div className={styles.title}>关联人脸（由：12321446456关联的结果）</div>
            <DateTimeRangeSimple/>
          </header>
          <section>
            <TableInterface
              request={getShipListTable}
              card={FaceCard}
              cardOptions={{
                isRadio: true,
                isSelectedFirst: true
              }}
              paginationProps={{
                size: 'small',
                showQuickJumper: false,
                showSizeChanger: false
              }}
            />
          </section>
        </article>
        <article className={styles.adjointShip}>
          <header>
            <div className={styles.title}>关联车辆（由：12321446456关联的结果）</div>
            <DateTimeRangeSimple/>
          </header>
          <section>
            <TableInterface
              request={getShipListTable}
              card={FaceCard}
              cardOptions={{
                isRadio: true,
                isSelectedFirst: true
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

export default CarArchiveRelevant