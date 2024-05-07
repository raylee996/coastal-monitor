import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, DatePicker, Form, Select, Spin } from "antd";
import styles from "./index.module.sass";
import ShipTrackPlay, { TarckData } from 'component/ShipTrackPlay';
import dayjs, { Dayjs } from 'dayjs';
import { getAllHistoryTrack, queryAllPlacePort, queryImageVideoList, queryShipPlacePortList } from 'server/dataCenter/shipSailing';
import CommonMedia from '../CommonMedia';
import '../../../../../dataCenter.sass'
import XcEmpty from 'component/XcEmpty';
import InventedList, { ChildProps } from 'component/InventedList';


const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props {
  /** 船舶信息 */
  shipData?: any
}

const timeDefaultValue: [Dayjs, Dayjs] = [dayjs().subtract(1, 'month'), dayjs()]

// 在地图上显示区域名称的标签
let textToMapLayer: any

// 历经港口子组件
const GoThroughPortChild: React.FC<ChildProps> = (props) => {
  console.debug('GoThroughPortChild')

  const { data, attrObj, index } = props
  const { active, setActive } = attrObj || {}

  //选中当前item
  function handleClick(index: number) {
    setActive(index)
  }

  return <div className={`${styles.listBox} ${active === index ? styles.isActive : ''}`} key={index}>
    <div className={`${styles.boxWrapper}`} onClick={() => handleClick(index)}>
      <div className={`${styles.item} ${styles.listTitle}`}>
        <div className={styles.portName}>{data.placeName}</div>
        <div className={`${styles.state} ${data.isEntry === 1 ? styles.state1 : styles.state2}`}>{data.isEntry === 1 ? '进入' : '离开'}</div>
      </div>
      <div className={`${styles.item} `}>时间：{data.capTime}</div>
      <div className={`${styles.item} `}>航速：{data.speed}节</div>
      <div className={`${styles.item} `}>{data.codeType === 6 ? 'mmsi' : '雷达批号'}：{data.codeValue}</div>
    </div>
  </div>
}

// 来源
const origin: number[] = [6, 7]
/* 历经港口 */
const GoThroughPort: React.FC<Props> = ({ shipData }) => {
  console.debug('GoThroughPort', shipData)

  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  //激活时间轴
  const [active, setActive] = useState(0)

  const [portOptions, setportOptions] = useState<any>([])

  // 进出港记录
  // const [inoutData, setInOut] = useState<any>([])

  const [trackData, setTrackData] = useState<TarckData[]>()

  const [areaList, setAreaList] = useState<any[]>()

  // const [areaGeoList, setGeoAreaList] = useState<any[]>([])

  const shipRef = useRef<any>(null);

  const [mediaParams, setMediaParams] = useState<any>()

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // 获取所有港口列表
    async function allMain() {
      const vo = await queryAllPlacePort({ placeType: '1' })
      setportOptions([{ name: '全部', value: '' }, ...vo])
    }
    allMain()
  }, []);

  useEffect(() => {
    shipData?.id && getShipPlacePort({ archiveId: shipData.id, time: timeDefaultValue })
  }, [shipData?.id])

  useEffect(() => {
    const mapLeaflet = shipRef?.current.mapLeaflet
    let areaGeoList: any[] = []
    if (shipRef?.current) {
      // console.log(areaList, "areaList")

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
      // console.log(active, list[active])
      const obj: any = list[active]
      const customTime = [dayjs(obj.createTime).subtract(1, 'hour'), dayjs(obj.createTime).add(1, 'hour')]
      const trackDto: any = {
        aisDateType: 1,
        customTime
      }
      if (obj.codeType === 6) {
        trackDto.mmsi = obj.codeValue
      } else {
        trackDto.uniqueId = obj.codeValue
      }
      queryTrackData(trackDto)
      setMediaParams({ customTime, codeValue: obj.codeValue, businessId: obj.id, businessType: '06' })
    }
  }, [active, list])

  //获取表单的所有值
  function getFormValue() {
    // console.log(form.getFieldsValue())
    // 清空地图上的数据
    if (shipRef && shipRef?.current) {
      shipRef?.current.mapLeaflet.map.removeLayer(textToMapLayer)
      setTrackData([])
    }

    const params = form.getFieldsValue()
    // const obj: any = portOptions[active]
    // getShipPlacePort({ archiveId: shipData.id, codeValue: obj.codeValue || '', ...params })
    getShipPlacePort({ archiveId: shipData.id, ...params })

  }

  // 获取进出港口列表
  async function getShipPlacePort(params: any) {
    setLoading(true)
    const vo = await queryShipPlacePortList({ placeType: '1', archiveType: '3', ...params })
    setList(vo?.page?.records || [])
    setAreaList(vo?.areas || [])
    setLoading(false)
  }

  function setTextToMap(map: any, name: string, center: [number, number]) {
    // 清空地图上的数据
    if (shipRef && shipRef?.current && textToMapLayer) {
      shipRef?.current.mapLeaflet.map.removeLayer(textToMapLayer)
      setTrackData([])
    }
    const myIcon = L.divIcon({
      html: `<div style='color:#fff;'>${name}</div>`,
      className: 'my-div-icon',
      iconSize: 80,
      iconAnchor: center
    });
    textToMapLayer = L.marker(center, { icon: myIcon }).addTo(map);
  }

  async function queryTrackData(params: any) {
    const res = await getAllHistoryTrack(params)
    setTrackData(res || [])
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>进出港记录</div>
        <Form
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item name='time' label='日期' className={styles.formItem} initialValue={timeDefaultValue}>
            <RangePicker onChange={getFormValue} allowClear />
          </Form.Item>
          <Form.Item name='placeId' label='港口' className={styles.formItem}>
            <Select placeholder="全部" onChange={getFormValue} showSearch allowClear>
              {portOptions.map((item: any) =>
                <Option key={item.id} value={item.id}>{item.name}</Option>
              )}
            </Select>
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
              <InventedList list={list} Children={GoThroughPortChild} viewCount={10} attrObj={{
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
      <div className={styles.media}>
        <CommonMedia request={queryImageVideoList} params={mediaParams} />
      </div>
    </div>
  )
}

//每条数据的interface
// interface TimelineData {
//   placeName: string
//   isEntry: number
//   capTime: string
//   speed: string
// }

// interface TimelineItemProps {
//   data: TimelineData
//   isActive: boolean
//   onClick?: Function
// }
//单条时间轴数据item
// const TimelineItem: React.FC<TimelineItemProps> = ({ data, isActive, onClick }) => {

//   function handleClick() {
//     onClick && onClick()
//   }

//   return <div className={`${styles.TimelineItem} ${isActive ? styles.activeItem : ''}`} onClick={() => handleClick()}>
//     <div className={styles.timelineItemTitle}>
//       <div className={styles.itemTitleLeft}>{data.placeName}</div>
//       <div className={styles.itemTitleRight}>{getDictName(isEntryDict, data.isEntry)}</div>
//     </div>
//     <p className={styles.line}>时间: {data.capTime}</p>
//     <p className={styles.line}>航速: {data.speed}节</p>
//   </div>
// }

export default GoThroughPort;
