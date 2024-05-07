import React, { useCallback, useEffect, useState } from "react";
import styles from './index.module.sass'
import { Form, Tag, Radio, InputNumber, DatePicker, Button, message, Space } from "antd";
import dayjs from "dayjs";
import { getHistoryBehaviorWarnAsync, shipHistoryTrack } from "../../../../../../server/ship";
import { useAppDispatch, useAppSelector } from "../../../../../../app/hooks";
import { selectValue } from "../../../../../../slice/coreMapSlice";
import { WarningOutlined } from "@ant-design/icons";
import { selectTarget } from "slice/selectTargetSlice";
import { Latlngs } from "webgis/webgis";
import { RangePickerProps } from "antd/es/date-picker";

const { RangePicker } = DatePicker;

interface Props {
  //船舶列表
  list?: any[]
  //更新船舶列表
  setList?: Function
  // 雷达或者ais船舶
  targetType: string
}
//历史轨迹，轨迹坐标相邻的线 ， 二维数组，polyline = [[line1],[line2]]
let polyline: any[] = []
//行为记录
let recordList: any[] = []

// 带箭头的线，箭头有颜色，线条无色
let arrowLineList: any[] = []

// 单条船整体的路线,用于定位到中间视图
let shipPolyline: any[] = []

interface IRecordInfoProps {
  time?: string
  record?: string
}

// 轨迹上的时间标签,是一个二维数组，一条线一个数组。
let timeTagList: any[] = []

//行为记录弹层组件
const RecordInfo: React.FC<IRecordInfoProps> = ({ time, record }) => {
  return <div className={styles.RecordInfo}>
    <Space>
      {record && <WarningOutlined />}
      <span> {time} {record ? record : ''}</span>
    </Space>
  </div>
}

let isRequesting: boolean = false

//船舶列表，查看历史轨迹
const ViewHistoryTrack: React.FC<Props> = ({ list, setList, targetType }) => {
  console.debug('ViewHistoryTrack')

  const [form] = Form.useForm();
  //船舶列表
  const [shipList, setShipList] = useState<any[]>([]);
  const { map2d } = useAppSelector(selectValue)

  // 查看按钮锁
  const [isDisableBtn, setIsDisableBtn] = useState(false)

  const [replayHour, setReplayHour] = useState<any>(1);
  const [replayDay, setReplayDay] = useState<any>(1);
  const [replayCustomTime, setReplayCustomTime] = useState<any>([null, null]);

  // 选中船舶
  const [selectedShip, setSelectedShip] = useState<number>((list && list.length - 1) || 0)

  // 地图等级
  const [searchParams, setSearchParams] = useState<any>(null)

  const disabledDate: RangePickerProps['disabledDate'] = (current: any) => {
    return current && current > dayjs().endOf('day');
  };

  const dispatch = useAppDispatch()

  const submitForm = useCallback(
    async () => {
      if (isRequesting) {
        return
      }
      if (map2d && shipList && shipList.length > 0) {
        //查看之前，先清除之前的轨迹
        if (polyline.length > 0) {
          for (let i = 0; i < polyline.length; i++) {
            for (let j = 0; j < polyline[i].length; j++) {
              map2d.map.removeLayer(polyline[i][j])
            }
          }
          polyline = []
        }
        // 查看之前先清除线条上的箭头
        if (arrowLineList.length > 0) {
          for (let i = 0; i < arrowLineList.length; i++) {
            map2d && map2d.map.removeLayer(arrowLineList[i])
          }
          arrowLineList = []
        }

        //查看之前，先清除之前的行为记录
        if (recordList.length > 0) {
          for (let i = 0; i < recordList.length; i++) {
            map2d && map2d.map.removeLayer(recordList[i])
          }
          recordList = []
        }
        // 查看之前，先清空时间标签
        if (timeTagList.length > 0) {
          for (let i = 0; i < timeTagList.length; i++) {
            map2d && map2d.map.removeLayer(timeTagList[i])
          }
          timeTagList = []
        }

        // 清空船舶轨迹（用于设置视口居中使用）
        if (shipPolyline.length > 0) {
          shipPolyline = []
        }
        //获取船名id
        let shipName: any = []
        if (targetType === 'ais') {
          for (let i = 0; i < shipList.length; i++) {
            shipName.push(shipList[i].mmsi)
          }
        } else {
          for (let i = 0; i < shipList.length; i++) {
            shipName.push(shipList[i].batchNum)
          }
        }

        //获取回放时间
        let beginTime: any = ''
        let endTime: any = ''
        const { replayTime, aisDateType } = form.getFieldsValue();
        switch (replayTime) {
          case 1:
            if (!replayHour) {
              message.error('回放时间不能为空')
              return
            }
            beginTime = dayjs().subtract(replayHour, 'hour').format('YYYY-MM-DD HH:mm:ss')
            endTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
            break
          case 2:
            if (!replayDay) {
              message.error('回放时间不能为空')
              return
            }
            beginTime = dayjs().subtract(replayDay, 'day').format('YYYY-MM-DD HH:mm:ss')
            endTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
            break
          case 3:
            if (!replayCustomTime) {
              message.error('回放时间不能为空')
              return
            }
            beginTime = dayjs(replayCustomTime[0]).format('YYYY-MM-DD HH:mm:ss')
            endTime = dayjs(replayCustomTime[1]).format('YYYY-MM-DD HH:mm:ss')
            break
        }


        if (shipName.length === 0) {
          message.error('名称不能为空')
          return
        }
        if (beginTime === 'Invalid Date' || endTime === 'Invalid Date') {
          message.error('回放时间不能为空')
          return
        }
        setIsDisableBtn(true)
        isRequesting = true

        // 搜索参数
        setSearchParams({
          beginTime: beginTime,
          endTime: endTime,
          aisDateType: aisDateType,
        })

        //获取轨迹信息
        let vo: any = []
        //获取行为记录
        let actionRecord: any = [];
        if (targetType === 'ais' && shipName.length > 0) {
          try {
            for (let i = 0; i < shipName.length; i++) {
              // 单个船的轨迹数据
              let track = await shipHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, {
                beginTime: beginTime,
                endTime: endTime,
                mmsi: shipName[i],
                aisDateType: aisDateType
              })
              vo.push(track)
            }
          } catch (error) {
            setIsDisableBtn(false)
            isRequesting = false
          }
          //获取行为记录
          for (let i = 0; i < shipName.length; i++) {
            let record = await getHistoryBehaviorWarnAsync({
              startTime: beginTime,
              endTime: endTime,
              warnContent: shipName[i]
            })
            actionRecord.push(...record.records)
          }
        } else if (targetType === 'radar' && shipName.length > 0) {
          try {
            for (let i = 0; i < shipName.length; i++) {
              // 单个船的轨迹数据
              let track = await shipHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, {
                beginTime: beginTime,
                endTime: endTime,
                uniqueId: shipName[i],
                aisDateType: aisDateType,
              })
              vo.push(track)
            }
          } catch (error) {
            setIsDisableBtn(false)
            isRequesting = false
          }
          //获取行为记录
          for (let i = 0; i < shipName.length; i++) {
            let record = await getHistoryBehaviorWarnAsync({
              startTime: beginTime,
              endTime: endTime,
              warnContent: shipName[i]
            })
            actionRecord.push(...record.records)
          }
        } else {
          return false;
        }

        //渲染预警信息记录
        for (let i = 0; i < actionRecord.length; i++) {
          const infoMarker = map2d.createInfoMarker({
            latLng: [actionRecord[i].latitude, actionRecord[i].longitude],
            content: <RecordInfo time={actionRecord[i].warnTime} record={actionRecord[i].monitorName} />
          })
          recordList.push(infoMarker)
          infoMarker.addTo(map2d.map)
        }

        let trackLine: any[] = []
        // 多条船舶，每条船舶的两点之间单独渲染
        for (let i = 0; i < shipName.length; i++) {
          let trackList = vo[i].content

          // 两个点之间单独划实线或者虚线
          for (let j = 0; j < trackList.length; j++) {
            let line: any = ''
            // 只有一个点的情况
            if (trackList.length === 1) {
              let latLng = [[trackList[0].latitude, trackList[0].longitude]]
              line = L.polyline(latLng, { color: 'red', weight: 1 }).addTo(map2d.map)
              trackLine.push(line)
            }
            // 大于一个点的情况
            if (trackList.length > 1 && j < trackList.length - 1) {
              // 相邻两个点的坐标
              let latLng: Latlngs = [
                [trackList[j].latitude, trackList[j].longitude],
                [trackList[j + 1].latitude, trackList[j + 1].longitude],
              ]

              // 两点之间的时间大于30分钟，使用虚线
              if (dayjs(trackList[j].capTime).diff(trackList[j + 1].capTime, 'minute') > 30) {
                line = L.polyline(latLng, { color: 'red', weight: 1, dashArray: '2,4' }).addTo(map2d.map)
              } else {
                line = L.polyline(latLng, { color: 'red', weight: 1 }).addTo(map2d.map)
              }
              trackLine.push(line)
            }
          }
          if (trackList.length > 0) {
            polyline.push(trackLine)
          }
        }

        // 多条船舶，轨迹单独渲染，不追加到地图，只是用于轨迹定位视口居中
        for (let i = 0; i < shipName.length; i++) {
          /*  let trackList = vo[i].content.filter((item: any) => {
             return item.content === shipName[i].toString()
           }) */
          let trackList = vo[i].content
          let latlngs: Latlngs = []
          for (let j = 0; j < trackList.length; j++) {
            latlngs.push([trackList[j].latitude, trackList[j].longitude])
          }

          // 标注起点
          if (latlngs.length > 0) {
            const infoMarker = map2d.createInfoMarker({
              latLng: latlngs[latlngs.length - 1],
              content: <div className={styles.startDot}>起点</div>
            })
            recordList.push(infoMarker)
            infoMarker.addTo(map2d.map)
          }
          // 标注终点
          if (latlngs.length > 0) {
            const infoMarker = map2d.createInfoMarker({
              latLng: latlngs[0],
              content: <div className={styles.startDot}>终点</div>
            })
            recordList.push(infoMarker)
            infoMarker.addTo(map2d.map)
          }

          let trackLine = L.polyline(latlngs, { color: 'red', weight: 1 })
          // 添加无颜色的线，箭头为红色
          let arrowLine = map2d.createPolylineDecorator(latlngs.reverse()).addTo(map2d.map)

          arrowLineList.push(arrowLine)
          shipPolyline.push(trackLine)
        }

        let trackList: any[] = []
        for (let i = 0; i < vo.length; i++) {
          trackList.push(vo[i].content)
        }

        // 时间标签
        for (let i = 0; i < trackList?.length; i++) {
          for (let j = 0; j < trackList[i].length; j++) {
            if (trackList[i][j].timeTag) {
              if (form.getFieldValue('isShowTimeLabel') === false) {
                break
              }
              let toolTip = L.tooltip({
                permanent: true,
                direction: j % 2 === 0 ? 'left' : 'right'
              }).setLatLng([trackList[i][j].latitude, trackList[i][j].longitude]).setContent(`${trackList[i][j].capTime}`).addTo(map2d.map)
              timeTagList.push(toolTip)
            }
          }
        }

        shipPolyline[selectedShip]._latlngs.length > 0 && map2d.map.fitBounds(shipPolyline[selectedShip].getBounds(), { maxZoom: 14 });
        setIsDisableBtn(false)
        isRequesting = false
      }
    },
    [map2d, shipList, targetType, form, selectedShip, replayHour, replayDay, replayCustomTime],
  )


  useEffect(() => {
    list && setShipList(list)
    submitForm()
  }, [list, submitForm])

  useEffect(() => {
    form.setFieldsValue({
      replayTime: 1,
      aisDateType: 1,
      isShowTimeLabel: true
    })
  }, [form]);

  // 设置时间标签
  const setTimeLabel = useCallback(
    async (ctr?: any, e?: any, isShowTimeLabel?: boolean) => {
      let level = e?.target.getZoom()
      // 查看之前，先清空时间标签
      if (timeTagList.length > 0) {
        for (let i = 0; i < timeTagList.length; i++) {
          map2d && map2d.map.removeLayer(timeTagList[i])
        }
        timeTagList = []
      }
      //获取船名id
      let shipName: any = []
      if (targetType === 'ais') {
        for (let i = 0; i < shipList.length; i++) {
          shipName.push(shipList[i].mmsi)
        }
      } else {
        for (let i = 0; i < shipList.length; i++) {
          shipName.push(shipList[i].batchNum)
        }
      }

      let trackList: any = []
      if (targetType === 'ais' && shipName.length > 0) {
        for (let i = 0; i < shipName.length; i++) {
          // 单个船的轨迹数据
          let track = await shipHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, {
            ...searchParams,
            mmsi: shipName[i],
            level: level < 14 ? 14 : level
          }, ctr)
          trackList.push(track.content)
        }
      } else if (targetType === 'radar' && shipName.length > 0) {
        for (let i = 0; i < shipName.length; i++) {
          // 单个船的轨迹数据
          let track = await shipHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, {
            ...searchParams,
            uniqueId: shipName[i],
            level: level < 14 ? 14 : level
          }, ctr)
          trackList.push(track.content)
        }
      }
      // 时间标签
      for (let i = 0; i < trackList?.length; i++) {
        for (let j = 0; j < trackList[i].length; j++) {
          if (!isShowTimeLabel) {
            break
          }
          if (trackList[i][j].timeTag) {
            let toolTip = L.tooltip({
              permanent: true,
              direction: j % 2 === 0 ? 'left' : 'right'
            }).setLatLng([trackList[i][j].latitude, trackList[i][j].longitude]).setContent(`${trackList[i][j].capTime}`).addTo(map2d && map2d.map)
            timeTagList.push(toolTip)
          }
        }
      }
    },
    [map2d, searchParams, shipList, targetType],
  )


  // 动态获取地图等级,修改轨迹时间标签
  useEffect(() => {
    let ctr: AbortController
    ctr = new AbortController()
    map2d?.map.on('zoomend', (e: any) => {
      if (!searchParams) {
        return
      }
      let isShowTimeLabel = form.getFieldValue('isShowTimeLabel')
      setTimeLabel(ctr, e, isShowTimeLabel)
    })
    return () => {
      ctr?.abort()
    }
  }, [form, map2d, searchParams, setTimeLabel, shipList, targetType])

  // 显示隐藏时间标签
  function handleShowTimeLabel(e: any) {
    setTimeLabel(null, null, e.target.value)
  }

  //关闭页面时，清空轨迹。
  useEffect(() => {
    return () => {
      if (polyline.length > 0) {
        for (let i = 0; i < polyline.length; i++) {
          for (let j = 0; j < polyline[i].length; j++) {
            map2d && map2d.map.removeLayer(polyline[i][j])
          }
        }
        polyline = []
      }
      if (recordList.length > 0) {
        for (let i = 0; i < recordList.length; i++) {
          map2d && map2d.map.removeLayer(recordList[i])
        }
      }
      if (timeTagList.length > 0) {
        for (let i = 0; i < timeTagList.length; i++) {
          map2d && map2d.map.removeLayer(timeTagList[i])
        }
      }
      if (arrowLineList.length > 0) {
        for (let i = 0; i < arrowLineList.length; i++) {
          map2d && map2d.map.removeLayer(arrowLineList[i])
        }
        arrowLineList = []
      }
      setShipList([])
    };
  }, [map2d]);

  //删除船舶
  function handleCloseTag(e: any) {
    if (targetType === 'ais') {
      let newShipList = shipList.filter((item) => {
        return item.mmsi !== e
      })
      setList && setList(newShipList)
      setShipList && setShipList(newShipList)
    } else {
      let newShipList = shipList.filter((item) => {
        return item.batchNum !== e
      })
      setList && setList(newShipList)
      setShipList && setShipList(newShipList)
    }
  }
  // 选中船舶
  function handleSelectShip(index: number, searchText: string) {
    setSelectedShip(index)
    if (shipPolyline.length > 0) {
      // map2d && map2d.map.fitBounds(shipPolyline[index].getBounds())
    }
    if (targetType === 'ais') {
      dispatch(selectTarget({ mmsi: searchText }))
    } else {
      dispatch(selectTarget({ radar: searchText }))
    }
  }

  return <div className={styles.wrapper}>
    <Form
      form={form}
      labelCol={{ span: 2 }}
    >
      <Form.Item label='名称' className={styles.formItem}>
        {(targetType === 'ais') && <div>
          {shipList.map((item: any, index: number) => {
            return <Tag

              key={item.mmsi}
              onClose={() => handleCloseTag(item.mmsi)}
              className={` ${selectedShip === index ? styles.activeShip : ''} ${styles.shipTag}`}
              onClick={() => { handleSelectShip(index, item.mmsi) }}>
              {item.mmsi}
            </Tag>
          })}
        </div>}
        {(targetType === 'radar') && <div>
          {shipList.map((item: any, index: number) => {
            return <Tag

              key={item.batchNum}
              onClose={() => handleCloseTag(item.batchNum)}
              className={` ${selectedShip === index ? styles.activeShip : ''} ${styles.shipTag}`}
              onClick={() => { handleSelectShip(index, item.batchNum) }}
            >
              {item.batchNum}
            </Tag>
          })}
        </div>}
      </Form.Item>
      <Form.Item label='回放时间' name='replayTime' className={styles.formItem}>
        <Radio.Group value={1} className={styles.returnTime}>
          <Radio value={1}>
            <Form.Item className={styles.formItem}>
              近<InputNumber
                min={0}
                className={styles.input}
                defaultValue={1}
                value={replayHour}
                onChange={(value) => setReplayHour(value)}
              />小时
            </Form.Item>
          </Radio>
          <Radio value={2}>
            <Form.Item className={styles.formItem}>
              近<InputNumber
                min={0}
                className={styles.input}
                defaultValue={1}
                value={replayDay}
                onChange={(value) => setReplayDay(value)}
              />天
            </Form.Item>
          </Radio>
          <Radio value={3}>
            <Form.Item className={styles.formItem}>
              自定义
              <RangePicker
                disabledDate={disabledDate}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                className={styles.timeSelect}
                defaultValue={replayCustomTime}
                onChange={(value: any) => setReplayCustomTime(value)}
              />
            </Form.Item>
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='轨迹类型' name='aisDateType' className={styles.formItem}>
        <Radio.Group value={1}>
          <Radio value={1}>融合轨迹</Radio>
          <Radio value={0}>AIS轨迹</Radio>
          <Radio value={2}>雷达轨迹</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='时间标签' name='isShowTimeLabel' className={styles.formItem}>
        <Radio.Group value={true} onChange={handleShowTimeLabel}>
          <Radio value={true}>显示</Radio>
          <Radio value={false}>隐藏</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item style={{ display: "flex", justifyContent: 'center' }}>
        <Button type="primary" onClick={submitForm} loading={isDisableBtn}> 查看 </Button>
      </Form.Item>
    </Form>
  </div>
}

export default ViewHistoryTrack
