import styles from "./index.module.sass";
import { CSSProperties, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react"
import ArrangeDispatch from "./components/WisdomCommand/component/ArrangeDispatch";
import TileSelect from "./components/TileSelect";
import Map2D, { MapTileType } from "helper/Map2D";
import SituationalAnalysis from "./components/SituationalAnalysis";
import { clearMap2D, setMap2D as setCoreMap2D } from "slice/coreMapSlice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectValue as selectUserInfo } from "slice/userInfoSlice";
import { clearTrack, selectIsShowCoreTrack } from "slice/coreTrackSlice";
import { setMessageShip, setMessageTrails } from "slice/websocketMessageSlice";
import { selectWebsocketSend } from "slice/websocketSendSlice";
import ClientWebsocket from "helper/websocket";
import { Button, Input, message, notification, Image } from "antd";
import WarnNotificationHeader from "./components/WarnNotificationHeader";
import WarnNotificationContent from "./components/WarnNotificationContent";
import FunMenu from "./components/FunMenu";
import FunPanel from "./components/FunPanel";
import ShipList from "./components/ShipList";
import DataPlayBack from "./components/DataPlayBack";
import WaterBayonet from "./components/WaterBayonet";
import InfraredPanorama from "./components/InfraredPanorama";
import WarningModel from "./components/WarningModel";
import intercom_src from "images/core/intercom.svg"
import autoJudgment_src from "images/core/autoJudgment.png"
import autoJudgmentActive_src from "images/core/autoJudgmentActive.png"
import windowUI from "component/WindowUI";
import { SearchOutlined } from "@ant-design/icons";
import _ from "lodash";
import { getDictName, WarnLevelDict } from "helper/dictionary";
import { currentIndex, currentShowPlanView, resetIndex, setIndex } from "slice/funMenuSlice";
import HocViewHistoryTrack from "./components/SituationalAnalysis/components/HocViewHistoryTrack";
import { sectorArr, sectorParams } from "slice/coreSectorSlice";
import { getPoints, getRelationImgSrc, getSearchResultContentText } from "helper";
import { selectTarget } from "slice/selectTargetSlice";
import MapToolContent from "./components/MapToolContent";
import HOCRealTimeMonitor from "./components/HOCRealTimeMonitor";
import { dmsFormatter } from "webgis/untils";
import WarnContinueFollow from "./components/WarnContinueFollow";
import HOCEntryExitRecords from "./components/HOCEntryExitRecords";
import useRealtimeVideo from "useHook/useRealtimeVideo";
import useVideoLinkage from "useHook/useVideoLinkage";
import { getDictDataByType } from "server/system";
import pinSrc from "images/core/gongju.png";
import { windowstillOffset } from "hooks/basis/Windowstill";
import Voice from "./components/Voice";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import ContingencyPlanShow from "./components/PlanManagement/ContingencyPlanShow";

// 扇形中间虚线线
let sectorMiddleDashLine: any = null

let sectorShapeList: any[] = []

let isFullscreen = false

interface SearchResult {
  key: string
  contentText: string
  layer: any
}

let handleOpenRealtimeWin: any
let handleOpenVideoLinkWin: any

const Core: React.FC = () => {
  console.debug('Core')


  const dispatch = useAppDispatch()


  const [api, contextHolder] = notification.useNotification({
    maxCount: 2,
    getContainer: () => {
      if (document.fullscreenElement) {
        return document.fullscreenElement as HTMLElement
      } else {
        return document.body
      }
    }
  })


  const selectedIndex = useAppSelector(currentIndex)
  const userInfo = useAppSelector(selectUserInfo)
  const websocketSend = useAppSelector(selectWebsocketSend)
  const isShowCoreTrack = useAppSelector(selectIsShowCoreTrack)
  const sector = useAppSelector(sectorParams) // 扇形

  const showPlanView = useAppSelector(currentShowPlanView)

  // 三个联动对应三个扇形
  const sectorList = useAppSelector(sectorArr)

  const mapRef = useRef<HTMLElement>(null)
  const windowstillRootRef = useRef<HTMLElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const [clientWebsocket, setClientWebsocket] = useState<ClientWebsocket>()
  const [mapType, setMapType] = useState(MapTileType.satellite)
  const [map2d, setMap2D] = useState<Map2D>()
  const [warnInfo, setWarnInfo] = useState<any>()
  const [panel, setPanel] = useState<ReactElement>()
  const [panelTitle, setPanelTitle] = useState('')
  const [isLargePanel, setIsLargePanel] = useState(false)
  const [searchText, setSearchText] = useState()
  const [isShowWarn, setIsShowWarn] = useState(false)
  const [showWarnLevel, setShowWarnLevel] = useState('')
  const [showWarnType, setShowWarnType] = useState('')
  const [searchResult, setSearchResult] = useState<any[]>([])
  const [isShowSearchResult, setIsShowSearchResult] = useState(false)

  // 实时视频
  handleOpenRealtimeWin = useRealtimeVideo()
  // 视频联动
  handleOpenVideoLinkWin = useVideoLinkage()

  //  打开预警图片
  const [isOpenWarningPreview, setIsOpenWarningPreview] = useState(false)
  const [previewSrc, setPreviewSrc] = useState('');
  const [relationSrc, setRelationSrc] = useState('')

  const [cssZIndex, setCssZIndex] = useState(0)
  const [isTool, setIsTool] = useState(false)


  const situationalStyle = useMemo<CSSProperties>(() => {
    const isShow = selectedIndex === 0
    windowstillOffset.z += 1
    return {
      contentVisibility: isShow ? 'visible' : 'hidden',
      zIndex: windowstillOffset.z
    }
  }, [selectedIndex])

  const warnToolClass = useMemo(() => isShowWarn ? styles.warnTool : `${styles.warnTool} ${styles.warnToolHide}`, [isShowWarn])

  useEffect(() => {
    setCssZIndex(windowstillOffset.z)
  }, [situationalStyle])

  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, mapType)

      L.control.mousePosition({
        position: 'bottomright',
        lngFirst: false,
        lngFormatter: (lng: number) => {
          const dms = dmsFormatter(lng)
          const val = _.floor(lng, 6)
          return `经度:${dms} [${val}]`
        },
        latFormatter: (lat: number) => {
          const dms = dmsFormatter(lat)
          const val = _.floor(lat, 6)
          return `纬度:${dms} [${val}]`
        }
      }).addTo(_map2d.map)

      setMap2D(_map2d)
      dispatch(setCoreMap2D(_map2d))
    }
    return () => {
      _map2d?.map?.remove()
      dispatch(clearMap2D())
      // dispatch(clearVideoLink())
    }
  }, [mapType, dispatch])

  // 建立websocket
  useEffect(() => {
    let _clientWebsocket: ClientWebsocket
    try {
      // 十分钟内没有数据则清空当前数据
      let timeOut: any
      _clientWebsocket = new ClientWebsocket(`${WEBSOCKET_URL}/channel`, userInfo.token)
      _clientWebsocket.onMessage(data => {
        // 使用全局状态广播消息
        const message = JSON.parse(data)
        if (message.code === 200) {
          if (message.module === '01' && message.cmd === '0101') {
            // dispatch(setMessageShip(message.data))
          } else if (message.module === '01' && message.cmd === '0103') {
            dispatch(setMessageShip(message.data))
            dispatch(setMessageTrails(message.data))
            timeOut && clearTimeout(timeOut)
            timeOut = setTimeout(() => {
              dispatch(setMessageShip(null))
              dispatch(setMessageTrails(null))
            }, 10 * 60 * 1000);
          } else if (message.module === '05' && message.cmd === '0502') {
            setWarnInfo(message.data)
          } else if (message.module === '05' && message.cmd === '0504') {
            // 提示是否继续跟踪联动

            // 继续跟踪
            const continueFollow = () => {
              _clientWebsocket.send(JSON.stringify({
                module: "05",
                cmd: "0504",
                data: {
                  ...message.data,
                  isContinue: true
                }
              }))
            }
            // 取消跟踪
            const cancelContinueFollow = () => {
              _clientWebsocket.send(JSON.stringify({
                module: "05",
                cmd: "0504",
                data: {
                  ...message.data,
                  isContinue: false
                }
              }))
            }
            const notificationKey = `open${Date.now()}`;
            const placement = isFullscreen ? 'topRight' : 'bottomRight'
            api.open({
              className: 'notification-ui',
              placement,
              duration: 10,
              key: notificationKey,
              message: <WarnNotificationHeader title={'联动跟踪'} />,
              description: <WarnContinueFollow
                notificationKey={notificationKey}
                notificationApi={api}
                continueFollow={continueFollow}
                cancelContinueFollow={cancelContinueFollow}
                count={10}
                data={message.data}
              />
            })
          }
          else if (message.module === '05' && message.cmd === '0505') {
            // 通知目标已进入或触发自动研判 打开预警目标自动研判页面并保持在高危目标tabs下
            windowUI(<ContingencyPlanShow activeKey={'1'} />, { title: '预警目标自动研判', key: 'ContingencyPlanShow', width: 400, height: 730, offset: [undefined, 145, 60] })
          }
        }
      })
      setClientWebsocket(_clientWebsocket)
    } catch (error) {
      console.error('连接websocket异常', error)
    }
    return () => {
      _clientWebsocket?.close()
    }
  }, [userInfo, dispatch, api])

  // 监听船舶信息发送websocket消息
  useEffect(() => {
    if (clientWebsocket && websocketSend.channel) {
      clientWebsocket.send(websocketSend.channel)
    }
  }, [clientWebsocket, websocketSend])

  useEffect(() => {
    return () => {
      // 切页面后取消选中
      if (selectedIndex !== -1) {
        dispatch(setIndex(-1))
      }
    }
  }, [dispatch, selectedIndex])

  useEffect(() => {
    let winRoot = windowstillRootRef.current
    return () => {
      if (winRoot) {
        const event = new Event('rootclear')
        winRoot.dispatchEvent(event)
      }
    }
  }, [])


  // 预警信息弹层，点击视频联动，选中当前对象
  const handleSelectTarget = useCallback((data: any) => {
    dispatch(selectTarget({ ...data }))
  }, [dispatch])


  useEffect(() => {
    const handleFullscreenchange = () => {
      if (document.fullscreenElement) {
        isFullscreen = true
      } else {
        isFullscreen = false
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenchange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenchange)
    }
  }, [])

  // 监听预警信息
  useEffect(() => {
    let hideTimer: any
    async function main() {
      // const warnInfo = {
      //   "msgType": 1,
      //   "riskLevel": 3,
      //   "warnType": "04",
      //   "latitude": 22.5374,
      //   "publicType": "1",
      //   "channel": "44030500101325397156",
      //   "msgId": "4:05:-:04:-:44030500101325097156:1688116654000",
      //   "deviceName": "人脸识别-前海海边公园西北靠海岸",
      //   "monitorType": "05",
      //   "warnTime": "2023-06-30 17:17:34",
      //   "eventName": "越线",
      //   "id": 166603,
      //   "relationInfo": "{\"action\":1,\"confidence\":0,\"detectLine\":[],\"downstairsLine\":[{\"x\":17,\"y\":7986},{\"x\":3716,\"y\":3944},{\"x\":5209,\"y\":2768},{\"x\":5998,\"y\":2290}],\"eventActionType\":0,\"eventDirection\":0,\"objectCenter\":{\"x\":4392,\"y\":3736},\"objectId\":9342,\"objectRect\":{\"bottom\":3960,\"left\":4352,\"right\":4432,\"top\":3512},\"objectType\":\"Human\",\"upstairsLine\":[{\"x\":222,\"y\":8168},{\"x\":3861,\"y\":4133},{\"x\":5303,\"y\":2958},{\"x\":6054,\"y\":2389}]}",
      //   "sameWarnCount": 0,
      //   "capTime": "2023-06-30 17:17:34",
      //   "warnContent": "44030500101325097156",
      //   "longitude": 113.88594,
      //   "deviceType": 1,
      //   "warnPic": "http://44.39.19.14:9009/coastal/2023/06/30/71342121-dddb-464c-b957-387a20156a9f_20230630171732A366.jpg",
      //   "monitorId": 4,
      //   "monitorName": "视频告警",
      //   "deviceCode": "44030500101325097156",
      //   "eventType": "04",
      //   "sendTime": 1688116652000,
      //   "createTime": 1688116655000,
      //   "shipType": "9"
      // }
      if (map2d && audioRef.current && warnInfo && !document.hidden) {
        const handleVideoWarn = (data: any) => {
          if (data.monitorType === '05' || data.monitorType === '0101') {
            // 实时视频
            handleOpenRealtimeWin({
              deviceCode: data.deviceCode,
              channel: data.channel
            })
          } else if (data.contentType === 7) {
            // 雷达联动
            handleOpenVideoLinkWin({
              targetType: 'radar',
              uniqueId: data.warnContent,
              fusionId: data.fusionId,
              lat: data.latitude,
              lng: data.longitude
            })
          } else {
            // ais联动
            handleOpenVideoLinkWin({
              targetType: 'ais',
              mmsi: data.warnContent,
              fusionId: data.fusionId,
              lat: data.latitude,
              lng: data.longitude,
              station: data.deviceCode
            })
          }
        }

        const handlePreview = (data: any) => {
          setPreviewSrc(data.warnPic)
          setIsOpenWarningPreview(true)
          getRelationImgSrc(data.warnPic, data.relationInfo).then(src => {
            setRelationSrc(src)
          })
        }

        const dict = await getDictDataByType('warn_type')
        const typeList = warnInfo.warnType.split(';')
        const typeNameList = typeList.map((val: string) => {
          const name = getDictName(dict, val)
          return name
        })
        const typeText = _.filter(typeNameList, ele => ele).toString()

        const placement = isFullscreen ? 'topRight' : 'bottomRight'

        api.open({
          className: 'notification-ui',
          placement,
          // duration: 0,
          message: <WarnNotificationHeader title={'实时预警'} />,
          description: <WarnNotificationContent
            data={warnInfo}
            typeText={typeText}
            selectTarget={handleSelectTarget}
            onVideoWarn={handleVideoWarn}
            onPreview={handlePreview}
          />
        })

        // 中级视频预警触发时，需要直接在地图上 弹出实时视频的单个视频播放界面。
        // 在全屏的情况，不自动弹出实时视频。
        /* if (warnInfo.riskLevel === 2 && (warnInfo.monitorType === '05' || warnInfo.monitorType === '0101') && !document.fullscreenElement) {
          // 实时视频
          handleOpenRealtimeWin({
            deviceCode: warnInfo.deviceCode,
            channel: warnInfo.channel
          })
        } */
        const text = getDictName(WarnLevelDict, warnInfo.riskLevel)

        setIsShowWarn(true)
        setShowWarnLevel(text)
        setShowWarnType(typeText)
        setWarnInfo(null)

        hideTimer = setTimeout(() => {
          setIsShowWarn(false)
        }, 10 * 1000);

        audioRef.current.play()
      }
    }
    main()
    return () => {
      clearTimeout(hideTimer)
    }
  }, [map2d, warnInfo, handleSelectTarget, dispatch, api])

  // 绘制扇形组
  useEffect(() => {

    if (map2d && sectorList) {
      for (let i = 0; i < sectorShapeList.length; i++) {
        sectorShapeList[i] && sectorShapeList[i].shape && map2d?.map.removeLayer(sectorShapeList[i].shape)
        sectorShapeList[i] && sectorShapeList[i].dashLine && map2d?.map.removeLayer(sectorShapeList[i].dashLine)
      }
      sectorShapeList = []
      for (let i = 0; i < sectorList.length; i++) {
        if (sectorList[i].showSector) {
          let points = getPoints(sectorList[i].center, sectorList[i].radius, sectorList[i].startAngle, sectorList[i].endAngle, sectorList[i].pointNum);
          points[points.length] = points[0];
          // 扇形
          let shape = L.polygon(points, { weight: 1 }).addTo(map2d.map)
          // 扇形中间虚线
          let middleDashLine = L.polyline([sectorList[i].center, points[Math.floor(points.length / 2)]], { color: '#1677ff', weight: 1 }).addTo(map2d.map)
          middleDashLine.setStyle({
            dashArray: [4, 6]
          })
          sectorShapeList.push({
            shape: shape,
            dashLine: middleDashLine,
            key: sectorList[i].key
          })
        }
      }
    }

    return () => {
      for (let i = 0; i < sectorShapeList.length; i++) {
        sectorShapeList[i] && sectorShapeList[i].shape && map2d?.map.removeLayer(sectorShapeList[i].shape)
        sectorShapeList[i] && sectorShapeList[i].dashLine && map2d?.map.removeLayer(sectorShapeList[i].dashLine)
      }
      sectorShapeList = []
    }
  }, [map2d, sectorList])

  // 绘制扇形
  useEffect(() => {
    let shape: any = null
    if (map2d) {
      if (sector && sector.showSector) {
        let points = getPoints(sector.center, sector.radius, sector.startAngle, sector.endAngle, sector.pointNum);
        points[points.length] = points[0];
        shape = L.polygon(points, { weight: 1 }).addTo(map2d.map)
        sectorMiddleDashLine = L.polyline([sector.center, points[Math.floor(points.length / 2)]], { color: '#1677ff', weight: 1 }).addTo(map2d.map)
        sectorMiddleDashLine.setStyle({
          dashArray: [4, 6]
        })
      } else {
        shape && map2d?.map.removeLayer(shape)
        sectorMiddleDashLine && map2d?.map.removeLayer(sectorMiddleDashLine)
      }
    }
    return () => {
      shape && map2d?.map.removeLayer(shape)
      sectorMiddleDashLine && map2d?.map.removeLayer(sectorMiddleDashLine)
    }
  }, [sector, dispatch, map2d])


  const handlePanel = useCallback((idx: number, title: string) => {
    dispatch(setIndex(idx))
    setPanelTitle(title)
    switch (idx) {
      case 1:
        setIsLargePanel(false)
        setPanel(<ShipList />)
        break;
      case 2:
        setIsLargePanel(false)
        setPanel(<WarningModel />)
        break;
      case 3:
        setIsLargePanel(true)
        setPanel(<DataPlayBack />)
        break;
      case 4:
        setIsLargePanel(true)
        setPanel(<HOCEntryExitRecords />)
        break;
      case 5:
        setIsLargePanel(true)
        setPanel(<WaterBayonet />)
        break;
      case 6:
        setIsLargePanel(true)
        setPanel(<InfraredPanorama />)
        break;
      case 7:
        setIsLargePanel(true)
        setPanel(<HOCRealTimeMonitor />)
        break;
      case 8:
        setIsLargePanel(false)
        setPanel(<Voice />)
        break;
      default:
        break;
    }
  }, [dispatch])

  function openArrangeDispatch() {
    windowUI(<ArrangeDispatch />, { title: '', key: '部署调度', width: '480px', height: '800px', offset: [1400, 80] })
  }

  // 打开预警目标自动研判
  function openAutoJudgment() {
    windowUI(<ContingencyPlanShow />, { title: '预警目标自动研判', key: 'ContingencyPlanShow', width: 400, height: 730, offset: [undefined, 145, 60] })
  }

  function handleChange(value: MapTileType) {
    setMapType(value)
  }

  function handleClosePanel() {
    dispatch(resetIndex())
    setPanel(undefined)
  }

  function handleSearchText({ target: { value } }: any) {
    if (_.isEmpty(value)) {
      setIsShowSearchResult(false)
    }
    setSearchText(value)
  }

  // 搜索
  const handleSearch = useCallback(
    () => {
      const _searchText = _.trim(searchText)
      if (map2d && _searchText) {

        const layers = _.values(map2d.map._layers)

        const filterExtraData = _.filter(layers, item => {
          return !!item.options.extraData
        })

        const targetList: SearchResult[] = []
        const deviceList: SearchResult[] = []
        const textList: SearchResult[] = []

        filterExtraData.forEach(item => {
          const extraData = item.options.extraData
          if (
            (extraData.mmsi && extraData.mmsi.includes(_searchText))
            || (extraData.shipName && extraData.shipName.includes(_searchText))
            || (extraData.batchNum && extraData.batchNum.includes(_searchText))
          ) {
            const target = {
              key: _.uniqueId('search'),
              contentText: getSearchResultContentText(extraData),
              layer: item
            }
            targetList.push(target)
          } else if (extraData.deviceCode) {
            if (extraData.group) {
              extraData.group.forEach((ele: any) => {
                if (ele.name.includes(_searchText)) {
                  const device = {
                    key: _.uniqueId('search'),
                    contentText: `设备: ${ele.name}`,
                    layer: item
                  }
                  deviceList.push(device)
                }
              })
            } else if (extraData.name.includes(_searchText)) {
              const device = {
                key: _.uniqueId('search'),
                contentText: `设备: ${extraData.name}`,
                layer: item
              }
              deviceList.push(device)
            }

          } else if (extraData.text && extraData.text.includes(_searchText)) {
            const text = {
              key: _.uniqueId('search'),
              contentText: `标签: ${extraData.text}`,
              layer: item
            }
            textList.push(text)
          }
        })

        const _searchResult = targetList.concat(deviceList, textList)

        if (_searchResult.length !== 0) {
          if (_searchResult.length === 1) {
            const [result] = _searchResult
            if (result.layer.options.extraData.mmsi) {
              dispatch(selectTarget({ mmsi: result.layer.options.extraData.mmsi }))
            } else if (result.layer.options.extraData.batchNum) {
              dispatch(selectTarget({ radar: result.layer.options.extraData.batchNum }))
            } else if (result.layer.options.extraData.deviceCode) {
              result.layer.openPopup()
            }
            map2d.map.flyTo(result.layer.getLatLng(), 18)
            setIsShowSearchResult(false)
          } else {
            setSearchResult(_searchResult)
            setIsShowSearchResult(true)
          }
        }
      } else {
        message.warning('请输入搜索内容')
      }
    },
    [map2d, dispatch, searchText]
  )

  function handleCloseTrack() {
    dispatch(clearTrack())
  }

  const handleSearchTarget = useCallback(
    (params: any) => {
      if (map2d) {

        if (params.layer.options.extraData.mmsi) {
          dispatch(selectTarget({ mmsi: params.layer.options.extraData.mmsi }))
        } else if (params.layer.options.extraData.batchNum) {
          dispatch(selectTarget({ radar: params.layer.options.extraData.batchNum }))
        } else if (params.layer.options.extraData.deviceCode) {
          params.layer.openPopup()
        }

        map2d.map.flyTo(params.layer.getLatLng(), 18)
      }
    },
    [dispatch, map2d]
  )


  // 预览预警图片
  const preview = useMemo(() => {
    return {
      src: relationSrc ? relationSrc : undefined,
      visible: isOpenWarningPreview,
      onVisibleChange: (is: boolean) => {
        setIsOpenWarningPreview(is)
        if (is === false) {
          setRelationSrc('')
        }
      }
    }
  }, [isOpenWarningPreview, relationSrc])

  const handelShowTool = useCallback(()=>{
    setIsTool(!isTool)
  },[isTool])


  return (
    <article className={`${styles.wrapper} core-wrapper`}>
      <div className={styles.wrapperContent}>
        <section className={styles.map} ref={mapRef} />

        <section className={styles.funMenu}>
          <FunMenu index={selectedIndex} onClick={handlePanel} />
        </section>

        <section style={situationalStyle}>
          <FunPanel children={<SituationalAnalysis mapType={mapType} />} onClose={handleClosePanel} title={'态势感知'} zIndex={cssZIndex} />
        </section>

        {selectedIndex > 0 && panel &&
          <FunPanel children={panel} onClose={handleClosePanel} title={panelTitle} isLarge={isLargePanel} />
        }

        <section className={styles.autoJudgmentIcon} onClick={openAutoJudgment}>
          <img src={showPlanView ? autoJudgmentActive_src : autoJudgment_src} alt="预警目标自动研判" />
        </section>

        <section className={styles.arrangeDispatch} onClick={openArrangeDispatch}>
          <img src={intercom_src} alt="" />
        </section>



        <section className={styles.mapSelect}>
          <TileSelect value={mapType} onChange={handleChange} />
        </section>

        <section className={styles.searchBox}>
          <div className={styles.search}>
            <Input className={styles.searchInp} placeholder='请输入搜索内容....' value={searchText} onChange={handleSearchText} onPressEnter={handleSearch} allowClear />
            <Button className={styles.searchIcon} icon={<SearchOutlined />} shape="circle" type="text" onClick={handleSearch} />
          </div>
          {isShowSearchResult &&
            <div className={styles.searchResult}>
              {searchResult.map(item =>
                <div className={styles.resultCard} key={item.key} onClick={() => handleSearchTarget(item)}>
                  {item.contentText}
                </div>
              )}
            </div>
          }
        </section>

        <section className={warnToolClass}>
          <span>发现</span>
          {showWarnLevel === '低风险' && <span className={styles.WarnContentLow}>[{showWarnLevel}]</span>}
          {showWarnLevel === '中风险' && <span className={styles.WarnContentMid}>[{showWarnLevel}]</span>}
          {showWarnLevel === '高风险' && <span className={styles.WarnContentHig}>[{showWarnLevel}]</span>}
          <span>{showWarnType}!</span>
        </section>

        <section className={styles.mapToolBox} onClick={handelShowTool}>
          {/* <Popover content={<MapToolContent />} placement="bottomRight">
            <i className={`${styles.mapToolIcon} iconfont icon-gerengongzuotai`} />
            <img className={styles.mapToolIcon} src={pinSrc} alt='工具' />
          </Popover> */}
          <img className={styles.mapToolIcon} src={pinSrc} alt='工具' />
          {isTool?<i className={styles.toolIon}><UpOutlined/></i>:<i className={styles.toolIon}><DownOutlined/></i>}
        </section>
        <section className={styles.mapToolcont} style={{display:isTool?'block':'none'}}>
          <MapToolContent />
        </section>
        {isShowCoreTrack &&
          <section className={styles.historyTrackCtrlBox}>
            <FunPanel className={styles.historyTrackCtrl} children={<HocViewHistoryTrack />} onClose={handleCloseTrack} title='历史轨迹' />
          </section>
        }

      </div>
      <aside id='windowstill-root' ref={windowstillRootRef} />
      <aside id='popup-root'></aside>
      <aside className={styles.warnAudio}>
        <audio src={warningMp3Src} ref={audioRef} />
      </aside>
      {contextHolder}
      <Image
        className={styles.image}
        src={previewSrc}
        preview={preview}
      />
    </article>
  )
}

export default Core
