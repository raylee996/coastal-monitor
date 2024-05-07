import { CheckOutlined, DeleteOutlined, EditOutlined, MinusOutlined, PlusCircleOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Slider, Space, Switch, Tabs } from "antd";
import { useAppDispatch, useAppSelector } from "app/hooks";
import SteeringWheel, { CameraOptionType, SteeringType } from "component/SteeringWheel";
import { screenTypeListData } from "helper";
import cacheMap from "helper/cache";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cameraOption, getAllCamera } from "server/device";
import { addPresetData, savePresetData, getAllPreset, editPresetName, delPresetData, getDefaultPresetByPlaceId } from "server/preset";
import { setSituationalAnalysis } from "slice/coreMapSlice";
import { selectMonitorStep, setMonitorStep } from "slice/monitorStepSlice";
import DeviceList, { DeviceListSearchData } from "./components/DeviceList";
import PatrolList from "./components/PatrolList";
import PlayerWindow, { DeviceAction } from "./components/PlayerWindow";
import styles from "./index.module.sass";


let setPlayerChannel: (val: string) => void



interface Props {
  /** 选中的设备deviceCode列表 */
  checkCameraList?: string[]
  /** 场所id */
  placeId?: number
  /** 预置位id */
  precastId?: number
  /** 是否不展示轮询列表 */
  isNotShowPatro?: boolean
  /** 是否不展示设备类型选项 */
  isNotShowTypeSelect?: boolean
  /** 监听预置位选择 */
  onChangePrecast?: (params: any, device: any) => Promise<any>
  onClosePopup?: () => void
}

const RealTimeMonitor: React.FC<Props> = ({ checkCameraList, placeId, precastId, isNotShowPatro, isNotShowTypeSelect, onChangePrecast, onClosePopup }) => {
  console.debug('RealTimeMonitor')


  const dispatch = useAppDispatch()

  const step = useAppSelector(selectMonitorStep)


  const videoBoxRef = useRef<HTMLElement>(null)


  // 默认展示9路视频
  const [screenType, setScreenType] = useState(() => {
    if (checkCameraList) {
      const x = checkCameraList.length
      const result = [1, 2, 3, 4, 6, 9, 16].find(val => x <= val)
      if (result) {
        return String(result)
      } else {
        return '9'
      }
    } else {
      const cacheScreenType: string = cacheMap.get('RealTimeMonitor.screenType')
      if (cacheScreenType) {
        return cacheScreenType
      } else {
        return '9'
      }
    }
  })
  const [allVideoList, setAllVideoList] = useState<any[]>([])
  const [playVideoList, setPlayVideoList] = useState<any[]>([])
  const [targetVideo, setTargetVideo] = useState<any>()
  const [lockList, setLockList] = useState<any[]>([])
  const [channel, setChannel] = useState('')
  const [isShowCtrlPanel, setIsShowCtrlPanel] = useState(false)
  const [activeKey, setActiveKey] = useState('1')
  const [search, setSearch] = useState<DeviceListSearchData>({
    source: 0
  })
  const [deviceAction, setDeviceAction] = useState<DeviceAction>()
  const [isShowScreenType, setIsShowScreenType] = useState(true)

  const [patroVideoList, setPatroVideoList] = useState<any[]>([])
  const [patroScreenType, setPatroScreenType] = useState('1')
  const [targetPatro, setTargetPatro] = useState<any>()
  const [patroMode, setPatroMode] = useState(1)
  const [isOpenPatro, setIsOpenPatro] = useState(true)

  const [precastName, setPrecastName] = useState('')
  const [precastList, setPrecastList] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selecPrecastId, setSelecPrecastId] = useState(precastId)
  const [editPrecastId, setEditPrecastId] = useState<number | undefined>()
  const [isPrecastLoading, setIsPrecastLoading] = useState(false)

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isFullMode, setIsFullMode] = useState(false)


  const screenTypeList = useMemo(() => {
    const result = _.cloneDeep(screenTypeListData)
    const target = result.find(item => item.alt === screenType)
    if (target) {
      target.curSrc = target.actSrc
    }
    return result
  }, [screenType])

  const patroScreenTypeList = useMemo(() => {
    const result = _.cloneDeep(screenTypeListData)
    const target = result.find(item => item.alt === patroScreenType)
    if (target) {
      target.curSrc = target.actSrc
    }
    return result
  }, [patroScreenType])

  const precastShowList = useMemo(() => precastList.map(item => ({
    ...item,
    isSelect: selecPrecastId === item.id,
    class: selecPrecastId === item.id ? styles.precastCardTarget : styles.precastCard
  })), [precastList, selecPrecastId])


  useEffect(() => {
    dispatch(setSituationalAnalysis(false))
    return () => {
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch])

  // 获取所有视频源列表
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      let _videoList = await getAllCamera({ placeId, ...search }, ctr)
      setAllVideoList(_videoList)
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [search, placeId])

  // 调整视频播放类型
  useEffect(() => {
    const count = Number(screenType)
    let _playVideoList: any[] = []

    if (checkCameraList) {
      const otherVideoList: any[] = []
      for (let i = 0; i < allVideoList.length; i++) {
        const item = allVideoList[i];
        if (checkCameraList.some(ele => ele === item.deviceCode)) {
          _playVideoList.push(item)
        } else {
          otherVideoList.push(item)
        }
      }
      if (_playVideoList.length < count) {
        const diff = count - _playVideoList.length
        const _otherVideoList = _.slice(otherVideoList, 0, diff)
        _playVideoList = _playVideoList.concat(_otherVideoList)
      } else if (_playVideoList.length > count) {
        _playVideoList = _.slice(_playVideoList, 0, count)
      }
    } else {
      const cachePlayVideoList = cacheMap.get('RealTimeMonitor.playVideoList')
      if (cachePlayVideoList && cachePlayVideoList.length === count) {
        let is = true
        for (let i = 0; i < cachePlayVideoList.length; i++) {
          const item = cachePlayVideoList[i];
          const result = allVideoList.find(ele => ele.deviceCode === item.deviceCode)
          if (_.isUndefined(result)) {
            is = false
            break
          }
        }
        if (is) {
          _playVideoList = cachePlayVideoList
        } else {
          _playVideoList = _.slice(allVideoList, 0, count)
        }
      } else {
        _playVideoList = _.slice(allVideoList, 0, count)
      }
    }

    const _head = _.head(_playVideoList)
    setPlayVideoList(_playVideoList)
    setTargetVideo(_head)
  }, [screenType, allVideoList, checkCameraList])

  // 设置分屏
  useEffect(() => {
    if (patroMode === 2) {
      const target = patroScreenTypeList.find(item => item.actSrc === item.curSrc)
      if (target) {
        setPatroScreenType(target.alt)
      }
    }
  }, [patroScreenTypeList, patroMode])

  // 根据场所id设置所有视频源到场所配置的默认预置位
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      if (placeId && playVideoList.length !== 0) {
        await getDefaultPresetByPlaceId(placeId, playVideoList, ctr)
      }
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [placeId, playVideoList])

  // 响应全屏模式
  useEffect(() => {
    let IsOpenPatroOld = true
    const handleFullscreenchange = () => {
      if (document.fullscreenElement === videoBoxRef.current) {
        const is = !!document.fullscreenElement
        setIsFullMode(is)
      }
      if (document.fullscreenElement) {
        setIsOpenPatro(val => {
          IsOpenPatroOld = val
          return false
        })
      } else {
        setIsOpenPatro(IsOpenPatroOld)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenchange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenchange)
    }
  }, [isFullMode])

  // 根据设备来源类型响应分配
  useEffect(() => {
    if (search.source === 0) {
      setIsShowScreenType(true)
    } else {
      setScreenType('1')
      setIsShowScreenType(false)
    }
  }, [search])


  // 双击设备列表选择新的播放设备
  const handleDeviceChange = useCallback((data: any) => {
    if (!lockList.some(item => _.isEqual(item, data.target))) {
      const idx = data.selectItems.findIndex((ele: any) => _.isEqual(ele, data.target))
      if (idx !== -1) {
        const _selectItems = _.clone(data.selectItems)
        _selectItems.splice(idx, 1, data.clickItem)
        setPlayVideoList(_selectItems)
        setTargetVideo(data.clickItem)
        cacheMap.set('RealTimeMonitor.playVideoList', _selectItems)
      }
    }
  }, [lockList])

  const handlePlayList = useCallback(
    (data: any[]) => {
      const count = Number(screenType)
      if (count !== data.length) {
        const _type = String(data.length)
        setScreenType(_type)
      }
      setPlayVideoList(data)
      cacheMap.set('RealTimeMonitor.playVideoList', data)
    },
    [screenType],
  )

  const getPresetList = useCallback(
    async () => {
      if (targetVideo) {
        const list = await getAllPreset(targetVideo.deviceCode, placeId)
        setPrecastList(list)
      } else {
        setPrecastList([])
      }
    },
    [targetVideo, placeId]
  )


  // 根据当前视频查询预置位
  useEffect(() => {
    async function main() {
      await getPresetList()
    }
    main()
  }, [getPresetList])


  const handleTargetPatro = useCallback((value: any) => setTargetPatro(value), [])
  const handlePatroVideoList = useCallback((value: any) => setPatroVideoList(value), [])
  const handlePatroScreenType = useCallback((value: any) => setPatroScreenType(value), [])
  const handlePatroMode = useCallback((value: any) => setPatroMode(value), [])
  const handleDeviceSearch = useCallback((value: DeviceListSearchData) => setSearch(value), [])


  const items = useMemo(() => {
    const result = [
      {
        label: '设备列表',
        key: '1',
        children: (
          <DeviceList
            list={allVideoList}
            checkList={playVideoList}
            target={targetVideo}
            isNotShowTypeSelect={isNotShowTypeSelect}
            onChange={handleDeviceChange}
            onSearch={handleDeviceSearch}
            onPlayList={handlePlayList}
          />
        ),
      },
    ]
    if (!isNotShowPatro) {
      result.push({
        label: '轮巡列表',
        key: '2',
        children: <PatrolList
          activeKey={activeKey}
          target={targetPatro}
          patroScreenType={patroScreenType}
          isOpenPatro={isOpenPatro}
          // onPatroTarget={value => setTargetPatro(value)}
          onPatroTarget={handleTargetPatro}
          onPatroVideoList={handlePatroVideoList}
          onPatroScreenType={handlePatroScreenType}
          onPatroMode={handlePatroMode}
        />,
      })
    }
    return result
  }, [allVideoList, playVideoList, targetVideo, isNotShowTypeSelect, handleDeviceChange, handleDeviceSearch, handlePlayList, isNotShowPatro, activeKey, targetPatro, patroScreenType, isOpenPatro, handleTargetPatro, handlePatroVideoList, handlePatroScreenType, handlePatroMode])

  const contentClass = useMemo(() => {
    let contentClassName: any = ''
    if (activeKey === '1') {
      contentClassName = _.get(styles, `content${screenType}`)
    } else {
      contentClassName = _.get(styles, `content${patroScreenType}`)
    }
    return `${styles.content} ${contentClassName}`
  }, [screenType, patroScreenType, activeKey])


  const panelClass = useMemo(() => {
    if (isShowCtrlPanel && activeKey === '1') {
      return styles.listPanel
    } else {
      return styles.listPanelOnly
    }
  }, [isShowCtrlPanel, activeKey])

  // 切换视频播放类型
  const handleSelectScreen = useCallback(
    (params: any) => {
      // 样式更新
      screenTypeList.forEach(item => { item.curSrc = item.defSrc })
      const target = screenTypeList.find(item => item.alt === params.alt)!
      target.curSrc = target.actSrc
      //播放类型（数量）
      setScreenType(params.alt)
      // 缓存
      cacheMap.set('RealTimeMonitor.screenType', params.alt)
    },
    [screenTypeList]
  )

  // 选择分屏类型
  const handleSelectPatroScreen = useCallback(
    (params: any) => {
      // 样式更新
      patroScreenTypeList.forEach(item => { item.curSrc = item.defSrc })
      const target = patroScreenTypeList.find(item => item.alt === params.alt)!
      target.curSrc = target.actSrc
      // 播放类型（数量）
      setPatroScreenType(params.alt)
      // 缓存
      cacheMap.set('RealTimeMonitor.patroScreenType', params.alt)
    },
    [patroScreenTypeList]
  )

  // 点击选择播放视频窗口
  const handleVideo = useCallback(
    async (device: any, _channel: string, set: (val: string) => void) => {
      setChannel(_channel)
      setPlayerChannel = set
      setTargetVideo(device)
    },
    []
  )

  // 点击选中轮巡组视频窗口
  const handlePatro = useCallback(
    (device: any) => {
      setTargetPatro(device)
    },
    []
  )

  // 方向控制
  const handleDirection = useCallback(
    async (type: SteeringType) => {
      setDeviceAction({
        step,
        steeringType: type
      })
      setIsMouseDown(true)
    },
    [step]
  )

  // 停止方向控制
  const handleStopDirection = useCallback(
    async () => {
      setDeviceAction({
        steeringType: SteeringType.stop
      })
      setIsMouseDown(false)
    },
    []
  )

  // 鼠标离开控制盘
  const handleLeaveDirection = useCallback(
    async () => {
      if (isMouseDown) {
        setDeviceAction({
          steeringType: SteeringType.stop
        })
      }
    },
    [isMouseDown],
  )

  // 变倍、聚焦、光圈设置
  const handleOption = useCallback(
    async (type: CameraOptionType, startFlag: boolean) => {
      setDeviceAction({
        step,
        startFlag,
        optionType: type
      })
    },
    [step]
  )

  // 步长设置
  const handleStep = useCallback(
    (param: number | null) => {
      param && dispatch(setMonitorStep(param))
    },
    [dispatch]
  )

  // 锁视频窗口
  const handleLock = useCallback(
    (param: any) => {
      setLockList(val => {
        const _lockList = _.clone(val)
        _lockList.push(param)
        return _lockList
      })
    },
    []
  )

  // 解锁视频窗口
  const handleUnLock = useCallback(
    (param: any) => {
      setLockList(val => {
        const _lockList = _.clone(val)
        _.remove(_lockList, item => _.isEqual(item, param))
        return _lockList
      })
    },
    []
  )

  // 视频窗口设置控制面版展示
  const handleShowPanel = useCallback(
    (is: boolean) => {
      setIsShowCtrlPanel(is)
    },
    []
  )

  // tabs切换
  const handleTabs = useCallback(
    (param: string) => {
      setActiveKey(param)
    },
    []
  )

  // 停止轮巡
  const handleStopPatro = useCallback(
    (param: boolean) => {
      setIsOpenPatro(param)
    },
    []
  )

  // 展示预置位弹窗
  const showPrecastModal = useCallback(() => setIsModalOpen(true), [])
  // 关闭预置位弹窗
  const handleCancelPrecast = useCallback(() => setIsModalOpen(false), [])

  // 新增预置位
  const handleAddPrecast = useCallback(
    async () => {
      try {
        setIsPrecastLoading(true)
        if (editPrecastId) {
          await editPresetName(editPrecastId, precastName)
          setEditPrecastId(undefined)
        } else {
          const params = {
            deviceCode: targetVideo.deviceCode,
            areaId: placeId,
            presetName: precastName
          }
          await addPresetData(params, targetVideo, channel)
        }
        await getPresetList()
        setIsModalOpen(false)
        setPrecastName('')
      } finally {
        setIsPrecastLoading(false)
      }
    },
    [placeId, targetVideo, precastName, channel, getPresetList, editPrecastId]
  )

  // 保存预置位
  const handleSavePrecast = useCallback(
    async (data: any) => {
      await savePresetData(data, targetVideo, channel)
      await getPresetList()
    },
    [targetVideo, channel, getPresetList]
  )

  // 选择预置位
  const handleSelectPrecast = useCallback(
    async (data: any) => {
      setSelecPrecastId(data.id)
      const params = {
        controlType: 6,
        ptzVo: {
          pan: data.pan,
          tilt: data.tilt,
          zoom: data.zoom
        }
      }
      await cameraOption(targetVideo, params, channel)
      if (onChangePrecast) {
        await onChangePrecast(data.id, targetVideo)
        await getPresetList()
      }
    },
    [targetVideo, channel, onChangePrecast, getPresetList]
  )

  // 编辑预置位
  const handleEditPrecast = useCallback(
    (data: any) => {
      setEditPrecastId(data.id)
      setPrecastName(data.presetName)
      setIsModalOpen(true)
    },
    []
  )

  // 删除预置位
  const handleDeletePrecast = useCallback(
    async (data: any) => {
      await delPresetData(data.id)
      await getPresetList()
    },
    [getPresetList]
  )

  // 通道更改
  const handleChannel = useCallback(
    (item: any) => {
      setChannel(item.channel)
      setPlayerChannel(item.channel)
    },
    [],
  )

  // 3D定位
  const handleLocation = useCallback(
    async (device: any, channel: string, params: any) => {
      const dto = {
        controlType: 7,
        startFlag: true,
        ...params
      }
      await cameraOption(device, dto, channel)
    },
    [],
  )

  // 全屏模式
  const handleFullMode = useCallback(
    () => {
      videoBoxRef.current?.requestFullscreen()
    },
    [],
  )


  const okButtonProps = useMemo(() => ({
    loading: isPrecastLoading
  }), [isPrecastLoading])


  return (
    <article className={styles.wrapper}>
      {activeKey === '1' &&
        <section className={styles.videoList}>
          <section className={contentClass} ref={videoBoxRef}>
            {playVideoList.map((item: any, index: number) =>
              <PlayerWindow
                index={index}
                className={styles.videoBox}
                key={item.id}
                device={item}
                target={targetVideo}
                action={deviceAction}
                screenType={screenType}
                onClick={handleVideo}
                onLock={handleLock}
                onUnLock={handleUnLock}
                onShowPanel={handleShowPanel}
                onLocation={handleLocation}
                onClosePopup={onClosePopup}
              />
            )}
          </section>
          {isShowScreenType &&
            <footer className={styles.listSelect}>
              <div className={styles.selectImgBox}>
                {screenTypeList.map(item => <img
                  key={item.alt}
                  className={styles.selectImg}
                  src={item.curSrc}
                  alt={item.alt}
                  onClick={() => handleSelectScreen(item)}
                />)}
              </div>
              <div>
                <Button onClick={handleFullMode} size='small'>全屏模式</Button>
              </div>
            </footer>
          }
        </section>
      }
      {activeKey === '2' &&
        <section className={styles.videoList}>
          <section className={contentClass} ref={videoBoxRef}>
            {patroVideoList.map((item: any) =>
              <PlayerWindow
                className={styles.videoBox}
                key={item.id}
                device={item}
                target={targetPatro}
                isPatro={true}
                isOpenPatro={isOpenPatro}
                onLocation={handleLocation}
                onClick={handlePatro}
              />
            )}
          </section>
          <footer className={styles.listSelect}>
            {patroMode === 2 && patroScreenTypeList.map(item => <img
              key={item.alt}
              className={styles.selectImg}
              src={item.curSrc}
              alt={item.alt}
              onClick={() => handleSelectPatroScreen(item)}
            />)}
            <Switch className={styles.stopPatro} checkedChildren="开启轮巡" unCheckedChildren="停止轮巡" checked={isOpenPatro} onChange={handleStopPatro} />
          </footer>
        </section>
      }
      <section className={styles.panel}>
        <section className={panelClass}>
          <Tabs
            className='tabs_ui'
            activeKey={activeKey}
            items={items}
            centered={true}
            onChange={handleTabs}
          />
        </section>
        {isShowCtrlPanel && activeKey === '1' &&
          <section className={styles.precast}>
            <header>
              <div>预置位</div>
              <PlusCircleOutlined title="新增当前查看的位置" className={styles.precastAdd} onClick={showPrecastModal} />
            </header>
            <section>
              <Modal
                title="预置位"
                transitionName=""
                centered={true}
                open={isModalOpen}
                okButtonProps={okButtonProps}
                onOk={handleAddPrecast}
                onCancel={handleCancelPrecast}>
                <Form.Item
                  label="设备名称">
                  <span>{targetVideo?.deviceName}</span>
                </Form.Item>
                <Form.Item
                  label="预置位名称">
                  <Input value={precastName} onChange={evt => setPrecastName(evt.target.value)} placeholder="请输入预置位名称" />
                </Form.Item>
              </Modal>
              {precastShowList && precastShowList.map(item =>
                <div className={item.class} key={item.id}>
                  <div className={styles.precastName} onDoubleClick={() => handleSelectPrecast(item)} title={item.presetName}>
                    {(item.isSelect || item.isPlaceDefaultPreset) && <CheckOutlined className={styles.precastCheck} />}
                    {item.isPlaceDefaultPreset && '默认-'}
                    {item.presetName}
                  </div>
                  <div>
                    <Space>
                      <SaveOutlined title="保存当前位置到该预置位" className={styles.precastAction} onClick={() => handleSavePrecast(item)} />
                      <EditOutlined title="编辑该预置位名称" className={styles.precastAction} onClick={() => handleEditPrecast(item)} />
                      <Popconfirm
                        title="确认删除预置位吗？"
                        onConfirm={() => handleDeletePrecast(item)}
                        okText="是"
                        cancelText="否"
                      >
                        <DeleteOutlined title="删除" className={styles.precastAction} />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              )}
            </section>
          </section>
        }
        {isShowCtrlPanel && activeKey === '1' &&
          <section className={styles.ctrBox}>
            <section className={styles.step}>
              <Row>
                <Col span={4}>步长:</Col>
                <Col span={20}>
                  <div className={styles.stepBox}>
                    <Slider className={styles.stepSlider} onChange={handleStep} min={1} max={100} value={step} />
                    <InputNumber className={styles.stepInputNumber} onChange={handleStep} min={1} max={100} value={step} size='small' />
                  </div>
                </Col>
              </Row>
            </section>

            <section className={styles.controlPanel}>
              <SteeringWheel onMouseDown={handleDirection} onMouseUp={handleStopDirection} onMouseLeave={handleLeaveDirection} onStop={handleStopDirection} />
            </section>

            <section className={styles.optionPanel}>
              <Row className={styles.actionRow} justify="center" align="middle">
                <Col span={12}>
                  {targetVideo && targetVideo.channelList &&
                    <div className={styles.light}>
                      {targetVideo.channelList.map((item: any) =>
                        <div
                          className={item.channel === channel ? styles.lightButAct : styles.lightBut}
                          key={item.channel}
                          onClick={() => { handleChannel(item) }}
                        >
                          {item.name}
                        </div>
                      )}
                    </div>
                  }
                </Col>
                <Col span={12}>
                  <Input.Group compact>
                    <Button type="primary" size="small" icon={<PlusOutlined />}
                      onMouseDown={() => handleOption(CameraOptionType.zoomIn, true)}
                      onMouseUp={() => handleOption(CameraOptionType.zoomIn, false)}
                    ></Button>
                    <span className={styles.actionLabel}>变倍</span>
                    <Button type="primary" size="small" icon={<MinusOutlined />}
                      onMouseDown={() => handleOption(CameraOptionType.zoomOut, true)}
                      onMouseUp={() => handleOption(CameraOptionType.zoomOut, false)}
                    ></Button>
                  </Input.Group>
                </Col>
              </Row>
              <Row className={styles.actionRow} justify="center" align="middle">
                <Col span={12}>
                  <Input.Group compact>
                    <Button type="primary" size="small" icon={<PlusOutlined />}
                      onMouseDown={() => handleOption(CameraOptionType.focusIn, true)}
                      onMouseUp={() => handleOption(CameraOptionType.focusIn, false)}
                    ></Button>
                    <span className={styles.actionLabel}>焦距</span>
                    <Button type="primary" size="small" icon={<MinusOutlined />}
                      onMouseDown={() => handleOption(CameraOptionType.focusOut, true)}
                      onMouseUp={() => handleOption(CameraOptionType.focusOut, false)}
                    ></Button>
                  </Input.Group>
                </Col>
                <Col span={12}>
                  <Input.Group compact>
                    <Button type="primary" size="small" icon={<PlusOutlined />}
                      onMouseDown={() => handleOption(CameraOptionType.apertureIn, true)}
                      onMouseUp={() => handleOption(CameraOptionType.apertureIn, false)}
                    ></Button>
                    <span className={styles.actionLabel}>光圈</span>
                    <Button type="primary" size="small" icon={<MinusOutlined />}
                      onMouseDown={() => handleOption(CameraOptionType.apertureOut, true)}
                      onMouseUp={() => handleOption(CameraOptionType.apertureOut, false)}
                    ></Button>
                  </Input.Group>
                </Col>
              </Row>
            </section>
          </section>
        }
      </section>
    </article>
  )
}

export default RealTimeMonitor