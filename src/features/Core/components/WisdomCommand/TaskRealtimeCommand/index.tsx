import { Button, Col, message, Row, Select, Space } from "antd";
import { useAppSelector } from "app/hooks";
import popupUI from "component/PopupUI";
import XcEmpty from "component/XcEmpty";
import CaseArchiveInfo from "features/DataCenter/CaseArchiveInfo";
import ShipViewGallery from "features/DataCenter/ShipArchiveInfo/component/ShipBaseData/component/ShipViewGallery";
import { getLabelName } from "helper/common";
import matching, { opinionTypeDict, riskLevelOptions } from "helper/dictionary";
import { getMapRadarTargetIcon, selectTargetIcon } from "helper/mapIcon";
import ClientWebsocket from "helper/websocket";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import _ from "lodash";
import { useEffect, useState } from "react";
import { addEditCommanderCommand, queryCommandCase } from "server/core/wisdomCommand";
import { getShipBaseInfo } from "server/ship";
import { selectValue as mapSelectValue } from "slice/coreMapSlice";
import { selectValue } from "slice/userInfoSlice";
import ShipAdd from "../../Control/ShipAdd";
import WisdomJudgment from "../../WisdomJudgment";
import WisdomModel from "../../WisdomModel";
import BehaviorAnalysis from "../component/BehaviorAnalysis";
import CommandFeedbackRecord from "../component/CommandFeedbackRecord";
import TargetDetail from "../component/TargetDetail";
import TaskFeedback from "../component/TaskFeedback";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'

const infoItems = [
  { label: '跟踪目标', value: '1' },
  { label: '关联目标', value: '2' },
]

const contentItems = [
  { label: '行为分析', value: '1' },
  { label: '涉案信息', value: '2' },
  { label: '反馈记录', value: '3' },
]

const keyToProps: { [key: string]: string } = {
  '1': 'first',
  '2': 'second',
  '3': 'third'
}

const keyToTarget: { [key: string]: string } = {
  '1': 'track',
  '2': 'relation'
}

interface Props {
  /** 刷新父级列表 */
  onRefresh: Function
  /** 父级值 */
  data: any
}

// 历史点
let HistoryMarker: any = null
// 历史线
let HistoryPolyline: any = null
// 历史标注
let HistoryText: any = []
// 船舶轨迹最后一个
let lastShip: null
// 船舶轨迹最后一个的框线
let lastShipRectangle: null

// 历史线（多目标）
let historyPolylineList: any[] = []

const TaskRealtimeCommand: React.FC<Props> = ({ onRefresh, data }) => {
  console.debug('TaskRealtimeCommand')

  const { id, modelId, targetCode } = data || {}

  const userInfo = useAppSelector(selectValue)
  const [clientWebsocket, setClientWebsocket] = useState<ClientWebsocket>()

  const { map2d } = useAppSelector(mapSelectValue)

  const [activeKey, setActiveKey] = useState<string>('1')

  const [activeContentKey, setActiveContentKey] = useState<string>('1')

  const [informationInvolved, setInformationInvolved] = useState<any[]>([])

  const [refresh, setRefresh] = useState<boolean>(false)

  const [wsAddMessage, setWsAddMessage] = useState<any>()
  const [wsDelMessage, setWsDelMessage] = useState<any>()

  // 行为分析
  const [behaviorAnalysis, setBehaviorAnalysis] = useState<any[]>([])
  // 跟踪目标
  const [targetList, setTargetList] = useState<any[]>([])
  // 关联目标
  const [trackingTarget, setTrackingTarget] = useState<any[]>([])
  // 实时轨迹点
  const [realTimeTrack, setRealTimeTrack] = useState<any[]>([])

  // 选择跟踪目标
  const [activeTarge, setActiveTargetList] = useState<string | null>(null)

  // 筛选后的行为分析
  const [activeBehaviorAnalysis, setActiveBehaviorAnalysis] = useState<any[]>([])
  // 筛选后的跟踪目标
  const [activeRealTimeTrack, setActiveRealTimeTrack] = useState<any[]>([])

  // 重新发送webscoket连接标识
  const [isReset, setIsReset] = useState<boolean>(true)

  // 建立webscoket连接
  useEffect(() => {
    let _clientWebsocket: ClientWebsocket
    try {
      _clientWebsocket = new ClientWebsocket(`${WEBSOCKET_URL}/channel`, userInfo.token)
      _clientWebsocket.onMessage(data => {
        const message = JSON.parse(data)
        // 接收响应
        if (message.code === 200) {
          // 行为分析记录
          if (message.module === '07' && message.cmd === '0703') {
            const res = message.data || []
            // 获取新增与删除的推送
            setWsAddMessage(res.filter((item: any) => item.optType === 1))
            setWsDelMessage(res.filter((item: any) => item.optType === 2))
          }
        }
      })
      setClientWebsocket(_clientWebsocket)
      return () => {
        _clientWebsocket?.close()
      }
    } catch (error) {
      console.error('连接websocket异常', error)
    }
  }, [userInfo.token])

  // 发送websocket消息
  useEffect(() => {
    if (clientWebsocket && id && isReset) {
      clientWebsocket.send(JSON.stringify({
        module: "07",
        cmd: "0701",
        data: {
          commandId: id,
          modelId,
        }
      }))
      setIsReset(false)
    }
  }, [clientWebsocket, id, isReset, modelId])

  useEffect(() => {
    targetCode && handleCommandCase(targetCode)
  }, [targetCode])

  // 发送停止请求
  useEffect(() => {
    return () => {
      clientWebsocket?.send(JSON.stringify({
        module: "07",
        cmd: "0702",
        data: {}
      }))
      handleDestroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientWebsocket])

  // 更新推送的新增数据
  useEffect(() => {
    if (!wsAddMessage?.length) {
      return
    }
    // dataType 1-预警 2-行为 3-轨迹点 4-跟踪目标 5-关联目标
    // 取跟踪目标
    setTargetList(val => {
      const data = wsAddMessage.filter((item: any) => item.dataType === 4)
      // 更新跟踪目标
      const oldData = val.filter(item => !data.map((v: any) => v.warnContent).includes(item.warnContent))
      return [...oldData, ...data]
    })

    // 取轨迹点
    setRealTimeTrack(val => {
      const data = wsAddMessage.filter((item: any) => item.dataType === 3)
      return [...val, ...data]
    })

    // 取预警与行为
    setBehaviorAnalysis(val => {
      // 用户选择目标后，筛选选中目标的预警与行为
      const data = wsAddMessage.filter((item: any) => [1, 2].includes(item.dataType))
      matching(data, riskLevelOptions, "riskLevel");
      data.map((item: any) => {
        // 组装经纬度
        item.lonLat = [item.longitude || "", item.latitude || ""]
          .filter((v) => v)
          .join(",");
        // key转换value
        matching([item.dealRecord], opinionTypeDict, "opinionType");
        return item;
      });
      return [...data, ...val]
    })

    // 取关联目标
    setTrackingTarget(val => {
      const data = wsAddMessage.filter((item: any) => item.dataType === 5)
      // 更新关联目标
      const oldData = val.filter(item => !data.map((v: any) => v.warnContent).includes(item.warnContent))
      return [...oldData, ...data]
    })

  }, [wsAddMessage])

  // 删除推送的目标数据
  useEffect(() => {
    if (!wsDelMessage?.length) {
      return
    }
    // dataType 1-预警 2-行为 3-轨迹点 4-跟踪目标 5-关联目标
    // 跟踪目标-按照推送删除目标
    setTargetList(val => {
      const delData = wsDelMessage.filter((item: any) => item.dataType === 4)
      const data = val.filter((item: any) => !delData.map((v: any) => v.warnContent).includes(item.warnContent))
      return [...data]
    })

    // 关联目标-按照推送删除目标
    setTrackingTarget(val => {
      const delData = wsDelMessage.filter((item: any) => item.dataType === 5)
      const data = val.filter((item: any) => !delData.map((v: any) => v.warnContent).includes(item.warnContent))
      return [...data]
    })

  }, [wsDelMessage])

  useEffect(() => {
    setActiveBehaviorAnalysis(behaviorAnalysis.filter((v: any) => activeTarge ? activeTarge === v.warnContent : true))
    setActiveRealTimeTrack(realTimeTrack.filter((v: any) => activeTarge ? activeTarge === v.warnContent : true))
  }, [activeTarge, behaviorAnalysis, realTimeTrack])

  // 绘制轨迹与标识
  useEffect(() => {
    const markerPolylineList = activeTarge ? activeRealTimeTrack : realTimeTrack
    const TextList = activeTarge ? activeBehaviorAnalysis : behaviorAnalysis
    handleDestroy()
    // dispatch(setSituationalAnalysis(false))
    if (map2d && markerPolylineList?.length) {

      const _historyPolylineList: any[] = []
      markerPolylineList.forEach(item => {
        const target = _historyPolylineList.find(ele => {
          const head: any = _.head(ele)
          return head.warnContent === item.warnContent
        })
        if (target) {
          target.push(item)
        } else {
          _historyPolylineList.push([item])
        }
      })

      if (_historyPolylineList.length === 1) {
        const markerLatLng = markerPolylineList.filter(item => Boolean(item.latitude && item.longitude)).map(item => {
          return {
            latLng: [Number(item.latitude), Number(item.longitude)]
          }
        })

        // 取第一个点为中心点
        // const centerPoint = markerLatLng?.length ? markerLatLng[markerLatLng.length - 1]?.latLng : (TextList?.length ? [TextList[TextList.length - 1].firstLat, TextList[TextList.length - 1].firstLng] : null)
        // centerPoint && map2d?.map.setView(centerPoint)
        // HistoryMarker.addTo(map2d.map);
        // 为第一个点设置框
        // HistoryRectangle = L.rectangle([centerPoint], {color: "#ff7800", weight: 1}).addTo(map);
        // HistoryRectangle.addTo(map2d.map);
        // 绘制线
        const latlngList = markerLatLng.map(item => item.latLng)
        HistoryPolyline = L.polyline(latlngList, {
          color: 'red',// 线的颜色
          weight: 1, // 线的粗细
          dashArray: '10', // 单条虚线长度
        })
        HistoryPolyline.addTo(map2d.map);
        // 将地图层级和定位根据线自适应调整
        // map2d.map.fitBounds(HistoryPolyline.getBounds());
      } else {
        _historyPolylineList.forEach((item, index) => {
          const markerLatLng = item.filter((ele: any) => Boolean(ele.latitude && ele.longitude)).map((ele: any) => {
            return {
              latLng: [Number(ele.latitude), Number(ele.longitude)]
            }
          })

          const latlngList = markerLatLng.map((ele: any) => ele.latLng)
          const layer = L.polyline(latlngList, {
            color: 'red',// 线的颜色
            weight: 1, // 线的粗细
            dashArray: '10', // 单条虚线长度
          })
          layer.addTo(map2d.map);
          historyPolylineList.push(layer)
          if (index === 0) {
            // 将地图层级和定位根据线自适应调整
            // map2d.map.fitBounds(layer.getBounds());
          }
        })
      }

      // 对同经纬度的行为名称进行合并
      const textAltList = _.values(_.groupBy(TextList.map(item => {
        item.check = item.latitude + item.longitude
        return item
      }), 'check')).map(itemLists => {
        const data: any = {}
        // 对相同时间相同预警行为名称进行去重
        const itemList = _.unionWith(itemLists, (item1, item2) => {
          return item1.warnTime === item2.warnTime && item1.monitorName === item2.monitorName
        })
        // 经纬度
        data.latitude = itemList[0].latitude
        data.longitude = itemList[0].longitude
        // 拼接多个行为名称
        data.infoList = itemList.map(info => {
          const { warnTime, speed, monitorName } = info
          return { warnTime, speed, monitorName }
        })
        return data
      })

      // 绘制标识
      textAltList.filter(item => Boolean(item.latitude && item.longitude)).map((item) => {
        const infoMarker = map2d.createInfoMarker({
          latLng: [item.latitude, item.longitude],
          content: <article className={styles.infoWrapper}>
            {
              item.infoList.map((childItem: any) => {
                return <>
                  <div>{childItem.warnTime}&nbsp;&nbsp;{childItem.speed ? `${childItem.speed}节` : ''}</div>
                  <div>{childItem.monitorName}</div>
                </>
              })
            }

          </article>
        })
        HistoryText.push(infoMarker)
        infoMarker.addTo(map2d.map)
        return item
      })

      const shipItem = _.last(markerPolylineList)
      const latLng = {
        lat: Number(shipItem.latitude),
        lng: Number(shipItem.longitude)
      }
      // 绘制船舶/图案
      if (shipItem?.contentType === 7) {
        const icon = getMapRadarTargetIcon({
          riskLevel: 0,
          caseBottom: 0,
          heading: shipItem.course
        })
        L.marker(latLng, { icon }).addTo(map2d.map)
      }
      else {
        // 修改船舶图标样式
        let color = '#25F076'
        switch (shipItem?.riskLevel) {
          case 1:
            color = '#ff2f25'
            break;
          case 2:
            color = '#FFA517'
            break;
          case 3:
            color = '#F4FB34'
            break;
          case 4:
            color = '#25F076'
            break;
          default:
            color = '#25F076'
            break;
        }
        lastShip = map2d.createShip({
          ...shipItem,
          ...latLng,
          speed: (shipItem.speed || 0) * 0.5144444444,
          // heading: Number(shipItem.heading || 0) === 511 ? shipItem.course : shipItem.heading * Math.PI / 180.0,
          heading: Number(shipItem.heading || 0) === 511 ? shipItem.course : (shipItem.heading || 0) * Math.PI / 180.0,

          course: (shipItem.course || 0) * Math.PI / 180.0,
          color,
          borderColor: '#404040'
        }).addTo(map2d.map)
      }
      map2d.map.setView(latLng)
      lastShipRectangle = L.marker(latLng, {
        icon: selectTargetIcon,
        offset: L.point(0, -4),
        pane: 'shadowPane'
      }).addTo(map2d.map)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBehaviorAnalysis, activeRealTimeTrack, activeTarge, behaviorAnalysis, realTimeTrack])

  // 通知更新反馈组件列表
  async function handleCommandProcess(id: number) {
    setRefresh(!refresh)
  }

  // 查询跟踪目标的案件档案
  async function handleCommandCase(targetCode: string) {
    const res = await queryCommandCase({ searchValue: targetCode })
    setInformationInvolved(res || [])
  }

  // 切换目标类型
  const onChange = (value: string) => {
    setActiveKey(value);
  };

  // 子类型
  const onChangeContent = (value: string) => {
    setActiveContentKey(value);
  };

  // 查看案件档案
  function handleOpenCaseInfo(record: any) {
    popup(<CaseArchiveInfo caseItem={record} />, { title: '查看案件档案详情', size: "fullscreen" })
  }

  // 任务反馈操作
  function openTaskFeedback() {
    popup(<TaskFeedback refreshTable={handleCommandProcess} id={id} />, { title: '任务反馈', size: 'small' })
  }

  async function openVideoImage(item: any) {
    // 获取船舶档案信息
    const typeToKey: { [key: number]: string } = {
      // 内容类型 6-MMSI 7-雷达目标 8-目标ID
      6: 'mmsi',
      7: 'radarNumber',
      8: 'targetId'
    }
    const para: { [key: string]: any } = {}
    console.log(item, 'item')
    para[typeToKey[item.contentType]] = item.warnContent
    const res = await getShipBaseInfo(para)
    if (res?.id) {
      popup(<div className={styles.viewGallery}><ShipViewGallery id={res.id} /></div>, { title: '视图查看', size: 'large' })
    }
    else {
      message.error('该目标暂无视图信息')
    }
  }

  /** 选择跟踪目标 */
  function handleChange(value: any) {
    setActiveTargetList(value || null)
  }

  // 销毁
  function handleDestroy() {
    // dispatch && dispatch(setSituationalAnalysis(true))
    HistoryMarker && map2d?.map.removeLayer(HistoryMarker)
    HistoryPolyline && map2d?.map.removeLayer(HistoryPolyline)
    HistoryText?.length && HistoryText.map((item: any) => {
      map2d?.map.removeLayer(item)
      return item
    })
    historyPolylineList.map((item: any) => {
      map2d?.map.removeLayer(item)
      return item
    })
    lastShip && map2d?.map.removeLayer(lastShip)
    lastShipRectangle && map2d?.map.removeLayer(lastShipRectangle)
    HistoryMarker = null
    HistoryPolyline = null
    HistoryText = []
    lastShip = null
    lastShipRectangle = null
    historyPolylineList = []
  }

  // 布控
  function handleOpenControl() {
    if (!targetList?.length) {
      message.warning('无可布控目标');
      return;
    }
    const params = {
      controlScope: "1",
      alarmConditionShipMmsis: targetList.map(item => item.warnContent).filter(v => v).join(","),
    }
    popupUI(<ShipAdd controlType={1} params={params} />, { title: '新增布控', size: "middle", })
  }

  // 建模/研判
  function handleJudgmentModeling(isModeling?: boolean) {
    if (!targetList?.length) {
      message.warning('无可研判目标');
      return;
    }
    const clueInfo = targetList.map(item => {
      return {
        codeType: item.contentType,
        codeValue: item.warnContent
      }
    })
    console.log(clueInfo, 'clueInfo')
    isModeling ? popup(<WisdomModel data={{ clueInfo }} />, { title: '智慧建模', size: 'fullscreen' }) : popup(<WisdomJudgment data={{ clueInfo, objType: 1, dataType: ['04'] }} />, { title: '智能研判', size: 'fullscreen' })
  }

  // 编辑目标
  function handleEdit() {
    popup(<TargetDetail targetList={targetList} confirmFunc={handleConfirm} />, { title: '编辑跟踪目标', size: 'small' })
  }

  // 修改目标后重置页面 重新发起ws通道连接
  async function handleConfirm(data: any[]) {
    // 检查目标是否有更新
    if (!_.isEqual(targetList.map(item => item.warnContent), data.map(item => item.warnContent))) {
      // 保存修改的目标数据
      await addEditCommanderCommand({ id, targetCode: data.map(item => item.warnContent).filter(v => v).join(',') })
      // 清空页面数据
      setBehaviorAnalysis([])
      setTargetList([])
      setTrackingTarget([])
      setRealTimeTrack([])
      // 修改刷新标识
      setIsReset(true)
    }
  }

  return (
    <article className={`${styles.wrapper} ${styles[`${keyToTarget[activeKey]}_bg`]} ${activeContentKey === '3' ? styles.margin_btm : ''}`}>
      <div className={styles.tabs}>
        {
          infoItems.map(item => {
            return <div className={styles.tabItem} key={item.value} onClick={() => onChange(item.value)}>
              <div className={`${styles.tabLabel} ${activeKey === item.value ? styles.active : ''}`}>{item.label}</div>
            </div>
          })
        }
      </div>
      {
        activeKey === '1' && <Space className={styles.btnBox}>
          <Button onClick={handleOpenControl}>布控</Button>
          <Button onClick={() => handleJudgmentModeling()}>研判</Button>
          <Button onClick={() => handleJudgmentModeling(true)}>建模</Button>
          <Button type="primary" onClick={handleEdit}>编辑</Button>
        </Space>
      }
      {
        activeKey === '1' && <div className={styles.trackBox}>
          <div className={styles.infoBox}>
            {
              targetList?.length ? targetList.map(item => {
                return <div className={styles.info} key={item.warnContent}>
                  <div className={styles.shipImg} onClick={() => openVideoImage(item)}>
                    <ImageSimple src={item.sourceUrl} width={'100%'} height={'100%'} preview={false} defaultSrc={shipDefSrc}/>
                  </div>
                  <div className={styles.name}>{`船名：${item.shipName || '--'}`}</div>
                  <div>{`${getLabelName(item.contentType)}：${item.warnContent}`}</div>
                  <div>{`航速：${item.speed ? `${item.speed}节` : '--'}`}</div>
                </div>
              }) : <XcEmpty />
            }
          </div>
        </div>
      }
      {
        activeKey === '2' && <div className={`${styles.trackBox} ${styles.infoBox}`}>
          {
            trackingTarget?.length ? trackingTarget.map(item => {
              return <div className={styles.info} key={item.name}>
                <div className={styles.relationImg}>
                  <ImageSimple src={item.sourceUrl} width={'100%'} height={'100%'} preview={false} />
                </div>
                <div className={styles.bottomTextBox}>
                  <div className={styles.name}>{item.warnContent}</div>
                  <div>{item.warnTime}</div>
                </div>
              </div>
            }) : <XcEmpty />
          }
        </div>
      }
      <div className={`${styles.contentBox} ${styles[`${keyToProps[activeContentKey]}_bg`]}`}>
        <div className={styles.tabs}>
          {
            contentItems.map(item => {
              return <div className={styles.tabItem} key={item.value} onClick={() => onChangeContent(item.value)}>
                <div className={`${styles.tabLabel} ${activeContentKey === item.value ? styles.active : ''}`}>{item.label}</div>
              </div>
            })
          }
        </div>
        {
          ['1', '2'].includes(activeContentKey) && <div className={styles.trackingBox}>
            <div className={styles.label}>跟踪目标</div>
            <Select
              value={activeTarge}
              allowClear
              onChange={handleChange}
              options={targetList.map(item => {
                item.value = item.warnContent
                item.label = item.warnContent
                return item
              })}
              placeholder={'请选择跟踪目标'}
              style={{ width: 200 }}
            />
          </div>
        }
        <div className={styles.content}>
          {
            // 行为分析记录
            activeContentKey === '1' && <div className={styles.analysisBox}>
              <BehaviorAnalysis behaviorAnalysis={activeBehaviorAnalysis} />
            </div>
          }
          {
            // 涉案信息
            activeContentKey === '2' && <div className={styles.tableBox}>
              <Row className={styles.labelRow}>
                <Col span={9}>目标</Col>
                <Col span={9}>案件名称</Col>
                <Col span={6}>操作</Col>
              </Row>
              {
                informationInvolved.map((item, index) => {
                  return <>
                    <Row className={index % 2 === 0 ? styles.rowCommon : styles.rowTowCommon}>
                      <Col span={9}>{item.targetCode}</Col>
                      <Col span={9}>{item.caseName}</Col>
                      <Col span={6}>
                        <Button type="link" onClick={() => handleOpenCaseInfo(item)}>{`查看档案`}</Button>
                      </Col>
                    </Row>
                  </>
                })
              }
            </div>
          }
          {
            // 反馈记录
            activeContentKey === '3' && <CommandFeedbackRecord id={id} refresh={refresh} />
          }
        </div>
        {activeContentKey === '3' && <div className={styles.bottomBtn}>
          <Button type="primary" onClick={openTaskFeedback}>任务反馈</Button>
        </div>}
      </div>
    </article>
  )
}

export default TaskRealtimeCommand