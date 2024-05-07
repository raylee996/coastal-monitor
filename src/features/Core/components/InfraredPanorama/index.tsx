import { AppstoreFilled } from "@ant-design/icons";
import { Button, Popover, Select, Space } from "antd";
import { useAppDispatch, useAppSelector } from "app/hooks";
import popupUI from "component/PopupUI";
import SpinLoading from "component/SpinLoading";
import dayjs from "dayjs";
import { YMDHms } from "helper";
// import { session } from "helper/storage";
import ClientWebsocket from "helper/websocket";
import popup from "hooks/basis/Popup";
import SelectRemote from "hooks/basis/SelectRemote"
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { addDeviceInitialPosition, editDeviceInitialPosition, queryDevice, queryDeviceInitialPosition, queryHistoryData } from "server/core/infraredPanorama";
import { getInfraredPanorama } from "server/device"
import { setSituationalAnalysis } from "slice/coreMapSlice";
import { currentParams } from "slice/funMenuSlice";
import { selectValue } from "slice/userInfoSlice";
import LinkageOptions from "./components/LinkageOptions";
import Panorama from "./components/Panorama";
import PlayOptions from "./components/PlayOptions";
import WarnRecords from "./components/WarnRecords";
import styles from "./index.module.sass";


// const rootEle = document.getElementById('root')

let startX: number = 0
let setLeft: number = 0

// 更新前的设备id
let oldDeviceId: number | null
// 框选图片范围的初始位置是否已设置过 用于判断保存位置调用新增还是编辑接口
let leftPosition: any
// 当前最新的框位置
let setLeftList: number[] | null

type Options = { value: number; label: string; code: number }

interface Props {
  onTitle?: (param: any) => void
}

const InfraredPanorama: React.FC<Props> = ({ onTitle }) => {
  console.debug('InfraredPanorama')


  const dispatch = useAppDispatch()


  const params = useAppSelector(currentParams)
  const userInfo = useAppSelector(selectValue)


  const imageBoxRef = useRef<HTMLElement>(null)
  // const canvasARef = useRef<HTMLCanvasElement>(null)
  // const canvasBRef = useRef<HTMLCanvasElement>(null)
  // const canvasCRef = useRef<HTMLCanvasElement>(null)
  // const canvasDRef = useRef<HTMLCanvasElement>(null)
  const imgARef = useRef<HTMLImageElement>(null)
  const imgBRef = useRef<HTMLImageElement>(null)
  const imgCRef = useRef<HTMLImageElement>(null)
  const imgDRef = useRef<HTMLImageElement>(null)


  const [clientWebsocket, setClientWebsocket] = useState<ClientWebsocket>()
  const [imageUrl, setImageUrl] = useState<string>('')
  const [boxLeft, setboxLeft] = useState<number[]>([0, 0, 0, 0])
  // const [boxLeft, setboxLeft] = useState<number[]>(() => {
  //   const _boxLeft = session('InfraredPanorama.boxLeft')
  //   if (_boxLeft) {
  //     return _boxLeft
  //   } else {
  //     return [0, 0, 0, 0]
  //   }
  // })
  const [downEvt, setDownEvt] = useState<any>()
  // 时间设置
  const [playType, setPlayType] = useState<{ type: number, range: string[] | undefined }>({
    type: 1,
    range: undefined
  })
  const [deviceOptions, setDeviceOptions] = useState<Options[]>([])
  const [activeDeviceId, setActiveDeviceId] = useState<number>(0)
  const [activeDeviceCode, setActiveDeviceCode] = useState<number>(0)
  const [isHistory, setIsHistory] = useState<boolean>(false)
  const [historyList, setHistoryList] = useState<any[]>([])
  const [imageTime, setImageTime] = useState<string>('')
  const [startIndex, setStartIndex] = useState<number>()
  const [isLoading, setIsLoading] = useState(false)

  // 顶部图片高度
  const [imageBoxHeight, setImageBoxHeight] = useState<number>(0)

  // 本框全屏标识字段
  const [fullFlag, setFullFlag] = useState<string>('')

  const TitleElement = useMemo(() => (
    <div className={styles.title}>
      <div>红外周扫</div>
      <div>当前设备:</div>
      <div><SelectRemote request={getInfraredPanorama} /></div>
    </div>
  ), [])


  // 查询初始位置设置
  const getInitialPosition = useCallback(async (deviceId: number) => {
    const data = await queryDeviceInitialPosition(deviceId)
    // 保存数据 如未设置则将设备id放入 用于新增使用
    leftPosition = data || { deviceId }
    // 更新初始位置信息
    // setboxLeft(() => {
    //   const LeftList = data?.graph ? JSON.parse(data.graph) : [0, 0, 0, 0]
    //   // 更新记录的框位置
    //   setLeftList = LeftList
    //   return LeftList
    // })
    // 未设置位置信息的不更新位置
    data?.graph && setboxLeft(() => {
      const LeftList = JSON.parse(data.graph)
      // 更新记录的框位置
      setLeftList = LeftList
      return LeftList
    })
  }, [])

  // 保存初始位置设置
  const setInitialPosition = useCallback(async (deviceId: number, leftList: number[]) => {
    // 最后保存位置与已设置位置相同则不调用接口保存
    if (_.isEqual(leftList, leftPosition?.graph ? JSON.parse(leftPosition?.graph) : [])) {
      return
    }
    // 保存位置
    deviceId && saveInitialPosition(deviceId, leftList)
  }, [])

  useEffect(() => {
    dispatch(setSituationalAnalysis(false))
    return () => {
      dispatch(setSituationalAnalysis(true))
      // setboxLeft(val => {
      //   session('InfraredPanorama.boxLeft', val)
      //   return val
      // })
    }
  }, [dispatch])

  // 获取设置框选范围的初始位置
  useEffect(() => {
    activeDeviceId && getInitialPosition(activeDeviceId)
    // 切换更新前一个设备的框位置
    setboxLeft(val => {
      oldDeviceId && setInitialPosition(oldDeviceId, val)
      return val
    })
  }, [activeDeviceId, getInitialPosition, setInitialPosition])

  useEffect(() => {
    return () => {
      // 关闭页面时调用接口保存位置信息
      // 保存位置
      leftPosition?.deviceId && saveInitialPosition(leftPosition.deviceId, setLeftList || [])
      // 重置
      leftPosition = null
      oldDeviceId = null
      setLeftList = null
    }
  }, [])

  // 历史图片播放更改index
  useEffect(() => {
    let timer: any
    if (startIndex && startIndex >= 0 && historyList?.length - 1 > startIndex) {
      setTimeout(() => {
        const item = historyList[startIndex]
        setImageUrl(item?.picUrl)
        let time = dayjs(item?.capTime).format(YMDHms)
        setImageTime(time)
        setStartIndex(startIndex + 1)
      }, 3000)
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [historyList, startIndex])


  // 获取红外全景历史图片
  const getHistoryImage = useCallback(async () => {
    if (!activeDeviceCode) {
      return
    }
    let time: { [key: string]: string } = {
      startTime: playType?.range && playType?.range[0] ? dayjs(playType?.range[0]).format('YYYY-MM-DD HH:mm:ss') : dayjs().subtract(18, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      endTime: playType?.range && playType?.range[1] ? dayjs(playType?.range[1]).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    const res = await queryHistoryData({ deviceCode: activeDeviceCode, ...time });
    res.records?.length && setHistoryList(res.records)
  }, [activeDeviceCode, playType?.range]);


  // 设置popup标题
  useEffect(() => {
    onTitle && onTitle(TitleElement)
  }, [onTitle, TitleElement])


  // 开始进行图片渲染
  const handleDrawCanvas = useCallback(
    (ele: HTMLImageElement | null, _setLeft: number, boxWidth: number, clientWidth: number,) => {
      if (ele) {
        ele.style.transform = `translateX(-${(_setLeft / boxWidth) * 100}%)`
      }
    },
    [],
  )


  /**拖拽*/
  // useEffect(() => {
  //   let startX = 0
  //   // let _canvasRef: HTMLCanvasElement | null = null
  //   let setLeft: number
  //   // let boxWidth: number

  //   // 自定义映射
  //   const keyToIndex: { [key: string]: any } = {
  //     'panoramaABut': { ref: canvasARef?.current, index: 0 },
  //     'panoramaBBut': { ref: canvasBRef?.current, index: 1 },
  //     'panoramaCBut': { ref: canvasCRef?.current, index: 2 },
  //     'panoramaDBut': { ref: canvasDRef?.current, index: 3 },
  //   }


  //   if (downEvt && rootEle) {
  //     if (downEvt.target.style && downEvt.target.style.left) {
  //       startX = Number(downEvt.target.style.left.replace('px', ''))
  //     }
  //     rootEle.addEventListener('mousemove', handleDrag)
  //     rootEle.addEventListener('mouseup', handleRender)
  //   }


  //   function handleDrag(evt: any) {
  //     const xDiff = evt.pageX - downEvt.pageX
  //     const leftVal = _.add(startX, xDiff)
  //     const boxWidth = imageBoxRef?.current?.offsetWidth || 0
  //     // 超出左右范围不更新位置
  //     setLeft = leftVal >= 0 ? (leftVal > (boxWidth - downEvt.target.clientWidth) ? (boxWidth - downEvt.target.clientWidth) : leftVal) : 0
  //     downEvt.target.style.left = `${setLeft}px`
  //   }

  //   function handleRender() {
  //     const attributes = downEvt.target.dataset.value
  //     // 获取需要展示图片的canvas对象
  //     // _canvasRef = keyToIndex[attributes].ref
  //     // 记录用户拖动的left距离
  //     setboxLeft(val => {
  //       val[keyToIndex[attributes].index] = setLeft
  //       return [...val]
  //     })
  //     // 开始进行图片渲染
  //     // handleDrawCanvas(_canvasRef, setLeft, boxWidth, downEvt.target.clientWidth, imageUrl)
  //   }


  //   return () => {
  //     rootEle?.removeEventListener('mousemove', handleDrag)
  //     rootEle?.removeEventListener('mouseup', handleRender)
  //   }
  // }, [downEvt])

  useEffect(() => {
    [
      { current: imgARef.current, clientWidth: 240, setLeft: boxLeft[0] },
      { current: imgBRef.current, clientWidth: 80, setLeft: boxLeft[1] },
      { current: imgCRef.current, clientWidth: 80, setLeft: boxLeft[2] },
      { current: imgDRef.current, clientWidth: 80, setLeft: boxLeft[3] },
    ].map(item => {
      handleDrawCanvas(item.current, item.setLeft, imageBoxRef?.current?.offsetWidth || 0, item.clientWidth)
      return item
    })
  }, [boxLeft, handleDrawCanvas])

  useEffect(() => {
    // 获取红外全景设备
    async function main() {
      const res = await queryDevice({ deviceTypes: ['7'] })
      const data = (res || []).map((item: any) => {
        const { id, name, deviceCode } = item
        return {
          value: id,
          label: name,
          code: deviceCode
        }
      })
      setDeviceOptions(data)

      if (params?.deviceCode) {
        setActiveDeviceCode(params.deviceCode)
        // 未传id时通过code查询id
        if (!params?.id) {
          const result = data.find((item: any) => item.code === params.deviceCode)
          result?.value && setActiveDeviceId(result.value)
        } else {
          setActiveDeviceId(params.id)
        }
      } else if (res?.length) {
        setActiveDeviceId(res[0].id)
        setActiveDeviceCode(res[0].deviceCode)
      }
    }
    main()
  }, [params])

  // 建立webscoket连接
  useEffect(() => {
    let _clientWebsocket: ClientWebsocket
    try {
      _clientWebsocket = new ClientWebsocket(`${WEBSOCKET_URL}/channel`, userInfo.token)
      _clientWebsocket.onMessage(async data => {
        setIsLoading(false)
        const message = JSON.parse(data)
        // 接收响应
        if (message.code === 200) {
          // 红外全景实时图片
          if (message.module === '08' && message.cmd === '0803') {
            let image: any = new Image()
            image.src = message.data?.imgUrl
            image.onload = function () {
              setImageUrl(message.data.imgUrl)
            }

            let formatTime = dayjs(message.data?.time).format(YMDHms)
            setImageTime(formatTime || '')

            // 为完整显示后端图片，根据红外全景推送图片宽高比设置图片高度
            const boxWidth = imageBoxRef?.current?.offsetWidth || 0
            setImageBoxHeight(boxWidth * message.data?.height / message.data?.width)
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

  // 发送停止请求
  useEffect(() => {
    return () => {
      closeWebsocket(clientWebsocket)
    }
  }, [clientWebsocket])

  // 全景切换模式 type 1-实时播放 webscoket 2-回放
  useEffect(() => {
    // 是否调整为历史回放
    setIsHistory(playType?.type === 2)

    if (playType?.type === 1) {
      setStartIndex(-1)
      setIsLoading(true)
      // 发送websocket消息
      clientWebsocket && activeDeviceCode && clientWebsocket.send(JSON.stringify({
        module: "08",
        cmd: "0801",
        data: {
          deviceCode: activeDeviceCode,
        }
      }))
    } else if (playType?.type === 2) {
      closeWebsocket(clientWebsocket)
      getHistoryImage()
      setStartIndex(0)
    }
  }, [activeDeviceCode, clientWebsocket, getHistoryImage, playType])

  // 请求停止Websocket推送
  function closeWebsocket(clientWebs: ClientWebsocket | undefined) {
    clientWebs?.send(JSON.stringify({
      module: "08",
      cmd: "0802",
      data: {}
    }))
  }

  const content = useMemo(() => {

    function handleLinkageOptions() {
      popupUI(<LinkageOptions panoramaId={activeDeviceId} />, { title: '联动配置', size: 'middle' })
    }

    function handlePanorama() {
      popup(<Panorama imageUrl={imageUrl} />, { title: '全景图', size: 'fullscreen' })
    }

    function handleWarnRecords() {
      popup(<WarnRecords clientWebsocket={clientWebsocket} />, { title: '预警记录', size: 'middle' })
    }

    function handlePlayOptions() {
      popup(<PlayOptions data={playType} onChange={data => setPlayType(data)} />, { title: '播放设置', size: 'auto' })
    }

    return (
      <Space direction="vertical" >
        <Button type="link" onClick={handleLinkageOptions}>联动配置</Button>
        <Button type="link" onClick={handlePanorama}>全景图</Button>
        <Button type="link" onClick={handleWarnRecords}>预警记录</Button>
        <Button type="link" onClick={handlePlayOptions}>播放设置</Button>
      </Space>
    )
  }, [activeDeviceId, clientWebsocket, imageUrl, playType])



  // 切换设备
  const changeDevice = useCallback(
    (value: number) => {
      const result = deviceOptions.find(item => item.value === value)
      if (result) {
        setActiveDeviceCode(result.code)
      }
      setActiveDeviceId((oldVal) => {
        oldVal && (oldDeviceId = oldVal)
        return value
      })
    },
    [deviceOptions],
  )

  const handleBoxMove = useCallback(
    (evt: any) => {
      if (downEvt) {
        const xDiff = evt.pageX - downEvt.pageX
        const leftVal = _.add(startX, xDiff)
        const boxWidth = imageBoxRef?.current?.offsetWidth || 0
        // 超出左右范围不更新位置
        setLeft = leftVal >= 0 ? (leftVal > (boxWidth - downEvt.target.clientWidth) ? (boxWidth - downEvt.target.clientWidth) : leftVal) : 0
        downEvt.target.style.left = `${setLeft}px`
      }
    },
    [downEvt],
  )

  const handleBoxUp = useCallback(
    () => {
      if (downEvt) {
        const attributes = downEvt.target.dataset.value
        const keyToIndex: { [key: string]: any } = {
          'panoramaABut': { ref: imgARef?.current, index: 0 },
          'panoramaBBut': { ref: imgBRef?.current, index: 1 },
          'panoramaCBut': { ref: imgCRef?.current, index: 2 },
          'panoramaDBut': { ref: imgDRef?.current, index: 3 },
        }
        setboxLeft(val => {
          val[keyToIndex[attributes].index] = setLeft
          // 更新记录的框位置
          setLeftList = [...val]
          return [...val]
        })
        setDownEvt(undefined)
      }
    },
    [downEvt],
  )

  const handleDown = useCallback(
    (evt: any) => {
      // evt.stopPropagation();
      // evt.preventDefault();
      startX = Number(evt.target.style.left.replace('px', ''))
      setDownEvt(evt)
    },
    [],
  )

  const windStyleA = useMemo(() => ({ left: boxLeft[0] }), [boxLeft])
  const windStyleB = useMemo(() => ({ left: boxLeft[1] }), [boxLeft])
  const windStyleC = useMemo(() => ({ left: boxLeft[2] }), [boxLeft])
  const windStyleD = useMemo(() => ({ left: boxLeft[3] }), [boxLeft])


  // 图片框双击事件
  function handleDoubleClick(value: string) {
    setFullFlag(fullFlag === value ? '' : value)
  }

  // 调用接口保存位置信息
  async function saveInitialPosition(deviceId: number, leftList: number[]) {
    // 保存位置
    const data = {
      deviceId,
      useType: 3,
      graph: leftList?.length ? JSON.stringify(leftList.map((item, index) => {
        const lastWidth = index ? 1590 : 1750
        return item >= lastWidth ? lastWidth : item
      })) : ''
    }
    leftPosition?.id ?
      await editDeviceInitialPosition({ ...data, id: leftPosition.id }) :
      await addDeviceInitialPosition({ ...data })
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.device}>
        <div className={styles.lable}>当前设备</div>
        <Select
          className={styles.select}
          style={{ width: '300px' }}
          options={deviceOptions}
          value={activeDeviceId}
          onChange={changeDevice}
        />
      </div>

      <section ref={imageBoxRef} className={styles.panorama} style={imageBoxHeight ? { height: `${imageBoxHeight}px` } : {}} onMouseMove={handleBoxMove} onMouseUp={handleBoxUp}>
        <div className={styles.imageBox}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* <ImageSimple className={styles.image} src={imageUrl} width={'1830px'} height={'100%'} preview={false} isLoad={true} /> */}
        </div>
        <div className={styles.panoramaABut} data-value={'panoramaABut'} onMouseDown={handleDown} style={windStyleA}></div>
        <div className={styles.panoramaBBut} data-value={'panoramaBBut'} onMouseDown={handleDown} style={windStyleB}></div>
        <div className={styles.panoramaCBut} data-value={'panoramaCBut'} onMouseDown={handleDown} style={windStyleC}></div>
        <div className={styles.panoramaDBut} data-value={'panoramaDBut'} onMouseDown={handleDown} style={windStyleD}></div>
        <div className={styles.textBox}>
          {/* 时间与回放提示 */}
          <div>{imageTime}</div>
          {
            isHistory ? <div className={styles.playbackText}>视频回放</div> : <></>
          }
        </div>

      </section>
      <section className={styles.panoramaBox}>
        <div
          className={`${styles.topBox} ${fullFlag === 'A' ? styles.fullBox : ''} ${fullFlag && fullFlag !== 'A' ? styles.hideBox : ''}`}
          title={`双击${fullFlag === 'A' ? '取消' : ''}全屏`}
          onDoubleClick={() => handleDoubleClick('A')}
        >
          <img className={styles.imgContent} ref={imgARef} src={imageUrl} alt='' />
        </div>
        <div
          className={`${styles.bottomLeftBox} ${fullFlag === 'B' ? styles.fullBox : ''} ${fullFlag && fullFlag !== 'B' ? styles.hideBox : ''}`}
          title={`双击${fullFlag === 'B' ? '取消' : ''}全屏`}
          onDoubleClick={() => handleDoubleClick('B')}
        >
          <img className={styles.imgContent} ref={imgBRef} src={imageUrl} alt='' />
        </div>
        <div
          className={`${styles.bottomMiddleBox} ${fullFlag && fullFlag === 'C' ? styles.fullBox : ''} ${fullFlag && fullFlag !== 'C' ? styles.hideBox : ''}`}
          title={`双击${fullFlag === 'C' ? '取消' : ''}全屏`}
          onDoubleClick={() => handleDoubleClick('C')}
        >
          <img className={styles.imgContent} ref={imgCRef} src={imageUrl} alt='' />
        </div>
        <div className={`${styles.bottomRightBox} ${fullFlag && fullFlag === 'D' ? styles.fullBox : ''} ${fullFlag && fullFlag !== 'D' ? styles.hideBox : ''}`}
          title={`双击${fullFlag === 'D' ? '取消' : ''}全屏`}
          onDoubleClick={() => handleDoubleClick('D')}
        >
          <img className={styles.imgContent} ref={imgDRef} src={imageUrl} alt='' />
        </div>
      </section>
      <Popover content={content} placement="bottomRight">
        <Button className={styles.menu} icon={<AppstoreFilled />} >更多</Button>
      </Popover>
      {isLoading && <SpinLoading />}
    </article>
  )
}

export default InfraredPanorama