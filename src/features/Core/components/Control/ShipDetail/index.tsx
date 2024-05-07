import { Col, Row, Image } from "antd";
import Title from "component/Title";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAreaOne } from "server/core/controlManage";
import styles from "./index.module.sass";
import './index.sass';

interface Props {
  /** 列表单条，用于展示 */
  record: any
}

const tableInfo = [
  { prop: 'controlName', label: '布控名称' },
  { prop: 'controlLevelName', label: '布控等级' },
  { prop: 'expiryDate', label: '截止日期' },
  { prop: 'controlTypeName', label: '布控分类' },
  { prop: 'areaName', label: '布控区域' },
  { prop: 'controlReason', label: '布控事由' },
  { prop: 'approveDeptName', label: '审批部门', defaultValue: '--' },
  { prop: 'approvePersonName', label: '审批人', defaultValue: '--' },
  { prop: 'approveDate', label: '审批时间', defaultValue: '--' },
]

const ShipDetail: React.FC<Props> = ({ record }) => {
  console.debug('ShipDetail')

  const mapRef = useRef<HTMLElement>(null)

  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>();

  const [areaList, setAreaList] = useState<any[]>([])

  const handleGetData = useCallback<any>(() => {
    async function main() {
      const vo = await getAreaOne({ id: record?.areaId })
      vo && setAreaList(oldArray => [...oldArray, vo])
      // })
    }
    main()
  }, [record.areaId])

  // 创建地图实例
  useEffect(() => {
    if (!mapRef.current) return;
    const crs = getCRSByMapType(MapType.SatelliteMap);
    const _mapLeaflet: CoastalMonitorWebgis = new CoastalMonitorWebgis(mapRef.current, { crs, zoom: 12 })
    getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
    setMapLeaflet(_mapLeaflet)
    return () => {
      _mapLeaflet?.map?.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapLeaflet) return;
    handleGetData()
  }, [handleGetData, mapLeaflet])

  console.log(areaList, 'areaList')

  useEffect(() => {
    if (mapLeaflet && areaList?.length) {
      areaList.map(item => {
        if (item?.properties?.subType === 'Circle') {
          let circle = new L.Circle([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
            radius: item.properties.radius,
            color: item.properties.borderColor, //颜色
            fillColor: item.properties.background,
            fillOpacity: 0.4, //透明度
          });
          circle.addTo(mapLeaflet.map);
          mapLeaflet.map.panTo(circle.getBounds().getCenter())
        }
        else {
          const areaLayer = L.geoJson(item).addTo(mapLeaflet.map)
          mapLeaflet.map.panTo(areaLayer.getBounds().getCenter())
          //边框、背景颜色回显
          areaLayer.setStyle({
            color: item.properties.borderColor,
            fillColor: item.properties.background,
            fillOpacity: 0.4
          })
        }
        return item
      })
    }
  }, [areaList, mapLeaflet])

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBox}>
        <Title title={'布控审批信息'} />
        <Row className={styles.infoBox}>
          {
            tableInfo.map(item => {
              return <Col span={8} className={styles.col}>
                <div className={styles.colLabel}>{`${item.label}：`}</div>
                {item.prop === 'approveDeptName' && <div className={styles.colText}>{record?.approvalJson?.approveDeptName || '--'}</div>}
                {item.prop === 'approvePersonName' && <div className={styles.colText}>{record?.approvalJson?.approvePersonName || '--'}</div>}
                {(item.prop !== 'approveDeptName' && item.prop !== 'approvePersonName') && <div className={styles.colText}>{record[item.prop] || (item.defaultValue || '')}</div>}
              </Col>
            })
          }
        </Row>
      </div>
      <div className={styles.bottomBox}>
        <div className={styles.bottomLeft}>
          <Title title={'布控区域'} />
          <section className={styles.drawMap} ref={mapRef}></section>
        </div>
        <div className={styles.bottomRight}>
          <div className={styles.warningBox}>
            <Title title={'预警条件'} />
            <div className={styles.warnContent}>
              <div>预警条件：</div>
              <div>{record.shipConditionJson.alarmConditionName + (record.shipConditionJson.alarmCondition === '3' ? ` , 航速大于${record.shipConditionJson.speed || 0}节` : '')}</div>
            </div>
          </div>
          <div className={'Control__Detail__Box'}>
            <Title title={'布控内容'} />
            {
              record.shipConditionJson.controlScope === '0' ? <span>所有船舶</span> :
                <>
                  <Row className={styles.labelRow}>
                    <Col span={6} className={styles.borderCol}>内容类型</Col>
                    <Col span={18}>布控内容</Col>
                  </Row>
                  <Row className={styles.rowCommon}>
                    <Col span={6} className={styles.borderCol}>船名</Col>
                    <Col span={18} className={styles.detailContent} title={record.shipConditionJson.alarmConditionShipNames}>{record.shipConditionJson.alarmConditionShipNames || '--'}</Col>
                  </Row>
                  <Row className={`${styles.rowTowCommon}`}>
                    <Col span={6} className={styles.borderCol}>MMSI</Col>
                    <Col span={18} className={styles.detailContent} title={record.shipConditionJson.alarmConditionShipMmsis}>{record.shipConditionJson.alarmConditionShipMmsis || '--'}</Col>
                  </Row>
                  <Row className={`${styles.rowCommon}`}>
                    <Col span={6} className={styles.borderCol}>船脸</Col>
                    <Col span={18}>
                      {
                        record.shipConditionJson?.alarmConditionShipFaceIds?.length ? record.shipConditionJson.alarmConditionShipFaceIds.map((item: string | undefined) => {
                          return <Image width={60} src={item} />
                        }) : '--'
                      }
                    </Col>
                  </Row>
                </>
            }
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShipDetail
