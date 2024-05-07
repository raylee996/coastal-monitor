import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Checkbox, DatePicker, Form, Spin } from "antd";
import styles from "./index.module.sass";
import ShipTrackPlay, { TarckData } from 'component/ShipTrackPlay';
import { getAllHistoryTrack, queryShipPlacePortList } from 'server/dataCenter/shipSailing';
import dayjs, { Dayjs } from 'dayjs';
import "../../../../../dataCenter.sass";
import InventedList, { ChildProps } from 'component/InventedList';
import XcEmpty from 'component/XcEmpty';

const { RangePicker } = DatePicker;

// const mapAttribute = { zoom: 14, minZoom: 13, maxZoom: 16 }

interface Props {
  /** 船舶信息 */
  shipData?: any
}

const timeDefaultValue: [Dayjs, Dayjs] = [dayjs().subtract(1, 'month'), dayjs()]
const timeDirectionValue: number[] = [0, 1]
// 来源
const origin: number[] = [6, 7]

// 历经港口子组件
const InoutNanshanChild: React.FC<ChildProps> = (props) => {
  console.debug('InoutNanshanChild')

  const { data, attrObj, index } = props
  const { active, setActive } = attrObj || {}

  // 选中当前item
  function handleClick(index: number) {
    setActive(index)
  }

  return <>
    <div className={`${styles.listBox} ${active === index ? styles.isActive : ''}`} key={index}>
      <div className={`${styles.boxWrapper}`} onClick={() => handleClick(index)}>
        <div className={`${styles.item} ${styles.listTitle}`}>
          {/* <div className={styles.portName}>{item.placeName}</div>*/}
          <div className={`${styles.state} ${data.isEntry === 1 ? styles.state1 : styles.state2}`}>{data.isEntry === 1 ? '进入' : '离开'}</div>
        </div>
        <div className={`${styles.item} `}>时间：{data.capTime}</div>
        <div className={`${styles.item} `}>航速：{data.speed}节</div>
        <div className={`${styles.item} `}>{data.codeType === 6 ? 'mmsi' : '雷达批号'}：{data.codeValue}</div>
        <div className={`${styles.item} `}>{`经纬度： ${data.latitude}，${data.longitude}`}</div>
      </div>
    </div>
  </>
}


//历经港口
const InoutNanshan: React.FC<Props> = ({ shipData }) => {
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  //激活时间轴
  const [active, setActive] = useState(0)

  const shipRef = useRef<any>(null);

  const [trackData, setTrackData] = useState<TarckData[]>()

  // const [mediaParams, setMediaParams] = useState<any>()

  // 南山区域形状
  const [areaList, setAreaList] = useState<any[]>()

  const [loading, setLoading] = useState(false);

  const getShipPlacePort = useCallback(
    async (params: any) => {
      // 获取进出港口列表
      setLoading(true)
      const vo = await queryShipPlacePortList({ placeType: '2', archiveType: shipData.dataType === 1 ? '3' : '4', ...params })
      setList(vo?.page?.records || [])
      setAreaList(vo?.areas || [])
      setLoading(false)
    },
    [shipData],
  )

  useEffect(() => {
    shipData?.id && getShipPlacePort({ archiveId: shipData.id, time: timeDefaultValue, isEntry: timeDirectionValue, codeType: origin })
  }, [shipData?.id, getShipPlacePort])

  useEffect(() => {
    const mapLeaflet = shipRef?.current.mapLeaflet
    let areaGeoList: any[] = []
    if (shipRef?.current) {
      console.log(areaList, "areaList")

      // 绘制形状
      areaList?.length && areaList.filter(item => item.graph).map(items => {
        const item = JSON.parse(items.graph)
        if (item?.properties?.subType === 'Circle') {
          let circle = new L.Circle([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
            radius: item.properties.radius,
            color: item.properties.borderColor, //颜色
            fillColor: item.properties.background,
            fillOpacity: 0.4, //透明度
          });
          areaGeoList = [circle, ...areaGeoList]
          // setGeoAreaList((val) => {
          //   return [circle, ...val]
          // })
          circle.addTo(mapLeaflet.map);
          const center = circle.getBounds().getCenter()
          mapLeaflet.map.panTo(center)
          // 标注名称
          setTextToMap(mapLeaflet.map, items.placeName, center)
        }
        else {
          const areaLayer = L.geoJson(item).addTo(mapLeaflet.map)
          // setGeoAreaList((val) => {
          //   return [areaLayer, ...val]
          // })
          areaGeoList = [areaLayer, ...areaGeoList]
          const center = areaLayer.getBounds().getCenter()
          mapLeaflet.map.panTo(center)
          // 标注名称
          setTextToMap(mapLeaflet.map, items.placeName, center)
          //边框、背景颜色回显
          areaLayer.setStyle({
            color: item.properties.borderColor,
            fillColor: item.properties.background,
            fillOpacity: 0.4
          })
        }
        return items
      })
    }
    return () => {
      // 清除旧的形状
      areaGeoList?.length && areaGeoList.map(res => {
        mapLeaflet.map.removeLayer(res)
        return res
      })
    }
  }, [areaList, shipRef])

  useEffect(() => {
    if (list?.length && list[active]) {

      const obj: any = list[active]
      const customTime = [dayjs(obj.createTime).subtract(1, 'hour'), dayjs(obj.createTime).add(1, 'hour')]

      const params: any = {
        aisDateType: 1,
        customTime
      }

      if (obj.codeType === 6) {
        params.mmsi = obj.codeValue
      } else {
        params.uniqueId = obj.codeValue
      }

      queryTrackData(params)
      // setMediaParams({ customTime, codeValue: obj.codeValue, businessId: obj.id, businessType: '06' })
    }
  }, [active, list])

  //获取表单的所有值
  function getFormValue() {
    console.log(form.getFieldsValue())
    const params = form.getFieldsValue()
    setActive(0)
    shipData?.id && getShipPlacePort({ archiveId: shipData.id, ...params })
  }

  async function queryTrackData(params: any) {
    const res = await getAllHistoryTrack(params)
    setTrackData(res || [])
  }

  function setTextToMap(map: any, name: string, center: [number, number]) {
    const myIcon = L.divIcon({
      html: `<div style='color:#fff;'>${name}</div>`,
      className: 'my-div-icon',
      iconSize: 80,
      iconAnchor: center
    });
    L.marker(center, { icon: myIcon }).addTo(map);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>出入南山记录</div>
        <Form
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item name='time' label='日期' className={styles.formItem} initialValue={timeDefaultValue}>
            <RangePicker onChange={getFormValue} allowClear />
          </Form.Item>
          <Form.Item name='isEntry' label='方向' className={styles.formItem} initialValue={timeDirectionValue}>
            <Checkbox.Group onChange={getFormValue}>
              <Checkbox value={1}>进入</Checkbox>
              <Checkbox value={0}>离开</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name='codeType' label='来源' className={styles.formItem} initialValue={origin}>
            <Checkbox.Group onChange={getFormValue}>
              <Checkbox value={6}>AIS</Checkbox>
              <Checkbox value={7}>雷达</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </Form>
        {/*时间轴*/}
        <Spin spinning={loading}>
          <div className={styles.Timeline}>
            {list && list.length !== 0 ?
              <InventedList list={list} Children={InoutNanshanChild} viewCount={10} attrObj={{
                active, setActive
              }} />
              : <XcEmpty />
            }
          </div>
        </Spin>

      </div>
      {/*中间地图*/}
      <div className={styles.mapContainer}>
        <ShipTrackPlay ref={shipRef} tarckList={trackData} isShowStart={true} />
      </div>
      {/*右侧视图信息*/}
      {/*   <div className={styles.media}>
        <CommonMedia request={queryImageVideoList} params={mediaParams} />
      </div> */}
    </div>
  )
}

// //每条数据的interface
// interface TimelineData {
//   /** 进出港类型 */
//   isEntry: number
//   /** 时间 */
//   capTime: string
//   /** 航速 */
//   speed: number
//   /** 纬度 */
//   latitude: number
//   /** 经度 */
//   longitude: number
// }

// interface TimelineItemProps {
//   data: TimelineData
//   isActive: boolean
//   onClick?: Function
// }
// const TimelineItem: React.FC<TimelineItemProps> = ({ data, isActive, onClick }) => {

//   function handleClick() {
//     onClick && onClick()
//   }
//   return (
//     <div className={styles.itemBox}>
//       <div className={`${styles.TimelineItem} ${isActive ? styles.activeItem : ''}`} onClick={() => handleClick()}>
//         <div className={styles.timelineItemTitle}>
//           <div className={styles.itemTitleRight}>{getDictName(isEntryDict, data.isEntry)}</div>
//           <div className={styles.line}>时间：{data.capTime}</div>
//         </div>
//         <p className={styles.line}>航速：{data.speed}节</p>
//         <p className={styles.line}>{`经纬度： ${data.latitude}，${data.longitude}`}</p>
//       </div>
//     </div>
//   )
// }

export default InoutNanshan;
