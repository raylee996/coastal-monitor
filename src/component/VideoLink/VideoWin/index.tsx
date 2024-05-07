
import { Alert, Button, Checkbox, message, Spin } from 'antd'
import { useAppDispatch } from 'app/hooks'
import TimeCount from 'component/CameraControl/TimeCount'
import { YMD } from 'helper'
import Player from 'helper/player'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cameraControlAsync, changeLockTimeAsync, getRealtimeVideoUrlAsync, getVideoSrcByDeviceCodeAsync, seizeCameraAsync, shipTakePhotoAsync, startRecordingAsync, stopCameraLockAsync, stopRecordingAsync } from 'server/ship'
import { setSectorArr } from 'slice/coreSectorSlice'
import cameraImg from 'images/buttons/camera.svg'
import videoImg from 'images/buttons/video.svg'
import styles from './index.module.sass'
import { controlWinPositionInfo, selectedKey, selectVideoLinkDeviceList, setDeviceList, setSelectedKey } from 'slice/videoLinkSlice'
import { useAppSelector } from 'app/hooks';
import AudioView from 'component/AudioView'
import dayjs from 'dayjs'
import { getImageVideoPage } from 'server/common'
import popup from 'hooks/basis/Popup'
import { setNavigate } from 'slice/routerSlice'
import VideoControl from '../VideoControl'
import windowUI from 'component/WindowUI'
import { DragElement } from 'helper/common'
import SeizeTimeSelect from 'component/CameraControl/SeizeTimeSelect'
import JessibucaProPlayer from 'helper/player/JessibucaProPlayer'

interface videoInfoProps {
    //视频地址
    url?: string
    //是否显示视频
    isShowVideo: boolean
    //通道
    channel?: any
    //设备编码
    deviceCode?: any
    //资源锁
    lockId?: any
    // 其他属性
    [propName: string]: any
}

interface cameraPTZProps {
    coverRaduis: number
    latitude: number
    longitude: number
    maxAngle: number
    minAngle: number
}

interface IdsProps {
    mmsi?: string       //ais船舶mmsi
    uniqueId?: string   //雷达批号
    fusionId?: string  	//融合ID
}

interface Props {
    //全景视频信息
    allViewVideoInfo: videoInfoProps
    setAllViewVideoInfo?: Function
    // 摄像头ptz
    cameraPTZ?: cameraPTZProps
    //  联动目标信息
    targetInfo?: any
    // ids，用于初始显示mmsi或者雷达ID相关的信息
    ids?: IdsProps
    // 弹窗唯一标识,用于选中效果
    uniqueKey: string
    // 设备deviceCode，用于停止联动
    deviceCode?: any
    lockId?: any
    // 联动是否停止
    isStopedVideoLink?: boolean
    setIsStopedVideoLink?: Function
    onChangeWinTitle?: (title: string) => void
}
interface LocationXY {
    x: number
    y: number
}

// 防止多次点击录像按钮
let disableTakeVideo = false
// 录制全景定时器
let recordAllViewVideoTimer: any
// 录制全景视频文件id
let recordAllViewVideoFileId: any

// 全屏下，鼠标移动时需要显示控制面板，定时器
let showControlToolsTimer: any
let currentTime: number
let lastTime: number

let deviceName: string = ''

// 视频联动弹层内容
const VideoLinkWindow: React.FC<Props> = ({
    allViewVideoInfo,
    setAllViewVideoInfo,
    cameraPTZ,
    targetInfo,
    ids,
    uniqueKey,
    deviceCode,
    lockId,
    isStopedVideoLink,
    setIsStopedVideoLink,
    onChangeWinTitle
}) => {
    console.debug('VideoLinkWindow')


    const videoBoxRef = useRef<any>(null)
    const videoRef = useRef<HTMLDivElement>(null)
    const dragControlTools = useRef(null)

    const dispatch = useAppDispatch()
    // 当前选中的视频，弹窗key值
    const selectedVideoKey = useAppSelector(selectedKey)
    // 云台控制位置
    const controlWinPosition = useAppSelector(controlWinPositionInfo)

    // 全局打开的弹窗设备列表
    const VideoLinkDeviceList = useAppSelector(selectVideoLinkDeviceList)

    // 倒计时跟踪定时器
    const [timerCount, setTimerCount] = useState<number>(30)

    //录制全景视频
    const [recordAllViewVideo, setRecordAllViewVideo] = useState({
        //文件Id
        fileId: '',
        //时长
        time: '00:00:00',
        //是否显示录制按钮
        showTime: false,
    });
    const [isTakePhotoSuccess, setIsTakePhotoSuccess] = useState(false)
    const [isTakeVideoSuccess, setIsTakeVideoSuccess] = useState(false)

    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLocation, setIsLocation] = useState(false)
    const [beginXY, setBeginXY] = useState<LocationXY>()
    const [endXY, setEndXY] = useState<LocationXY>()

    // 全屏中是否显示控制面板
    const fullScreenControlTools = useRef<any>(null)
    const [isShowControlTools, setIsShowControlTools] = useState(false)

    // 联动需要的参数
    const [videoLinkData, setVideoLinkData] = useState<any>(null)
    // 判断当前控制的是联动还是实时视频
    const [isRealTimeVideo, setIsRealTimeVideo] = useState<boolean>(false)

    // 抢占时间
    const [seizeTime, setSeizeTime] = useState<number>(1800)

    deviceName = allViewVideoInfo?.deviceName || ''

    // 获取当前视频联动需要的参数
    useEffect(() => {
        for (let i = 0; i < VideoLinkDeviceList.length; i++) {
            if (VideoLinkDeviceList[i].key === uniqueKey && VideoLinkDeviceList[i].key) {
                setVideoLinkData(VideoLinkDeviceList[i].videoLinkData)
                if (VideoLinkDeviceList[i].videoLinkData) {
                    setIsRealTimeVideo(false)
                } else {
                    setIsRealTimeVideo(true)
                }
            }
        }
    }, [VideoLinkDeviceList, uniqueKey])

    // 当前联动的目标
    const [currentTargetInfo, setCurrentTargetInfo] = useState(() => {
        if (targetInfo) {
            return targetInfo.latLngList
        } else {
            if (ids) {
                let { mmsi, uniqueId, fusionId } = ids

                // 默认，有mmsi，显示mmsi。有融合ID，显示融合ID，有雷达ID，显示雷达ID
                if (mmsi) {
                    return {
                        trackId: mmsi,
                        speed: '--',
                        originCourse: '--',
                        otherDataType: 'radar'
                    }
                } else if (fusionId) {
                    return {
                        trackId: fusionId,
                        speed: '--',
                        originCourse: '--',
                        otherDataType: 'ais'
                    }
                } else {
                    return {
                        trackId: uniqueId,
                        speed: '--',
                        originCourse: '--',
                        otherDataType: 'radar'
                    }
                }
            } else {
                return {
                    trackId: '--',
                    speed: '--',
                    originCourse: '--',
                    otherDataType: 'ais'
                }
            }
        }

    })

    // 判断鼠标是否在全屏时的控制面板上
    const [isMouseInControlTools, setIsMouseInControlTools] = useState(false)

    // 是否跟踪，一打开默认是在跟踪的
    const [isFollow, setIsFollow] = useState(true)
    // 倒计时大小，不同于timerCount，这个不会减小，只用于记录总倒计时长
    const [timerCountNum, setTimerCountNum] = useState(30)


    // 判断鼠标是否在控制面板上
    useEffect(() => {
        let el = fullScreenControlTools.current
        function mouseMove(e: any) {
            e.stopPropagation()
            setIsMouseInControlTools(true)
            // 已经在控制面板上，就移除move事件，优化性能，不然拖动很费劲。
            el.removeEventListener('mousemove', mouseMove)
        }
        function mouseLeave(e: any) {
            e.stopPropagation()
            setIsMouseInControlTools(false)
            // 优化性能，不然拖动很费劲。
            el.addEventListener('mouseleave', mouseLeave)
        }
        if (el) {
            if (isMouseInControlTools) {
                el.addEventListener('mouseleave', mouseLeave)
            } else {
                el.addEventListener('mousemove', mouseMove)
            }
        }
        return () => {
            if (el) {
                el.removeEventListener('mousemove', mouseMove)
                el.removeEventListener('mouseleave', mouseLeave)
            }
        }
    }, [isMouseInControlTools])

    // 判断是否显示全屏控制面板逻辑：当前时间和上次移动时间相差5秒没动，则隐藏。
    useEffect(() => {
        let controlToolsContainer = videoBoxRef.current
        function mousemoveFn() {
            setIsShowControlTools(true)
            lastTime = new Date().getTime()
            showControlToolsTimer && clearInterval(showControlToolsTimer)
            showControlToolsTimer = setInterval(() => {
                currentTime = new Date().getTime();
                if (currentTime - lastTime > 5000) {
                    setIsShowControlTools(false)
                    lastTime = new Date().getTime()
                    showControlToolsTimer && clearInterval(showControlToolsTimer)
                    showControlToolsTimer = null
                }
            }, 1000)
        }
        if (isFullscreen && controlToolsContainer) {
            if (isMouseInControlTools) {
                setIsShowControlTools(true)
                showControlToolsTimer && clearInterval(showControlToolsTimer)
                controlToolsContainer && controlToolsContainer.removeEventListener('mousemove', mousemoveFn)
            } else {
                controlToolsContainer.addEventListener('mousemove', mousemoveFn)
            }
        } else {
            setIsShowControlTools(false)
            showControlToolsTimer && clearInterval(showControlToolsTimer)
            showControlToolsTimer = null
            controlToolsContainer && controlToolsContainer.removeEventListener('mousemove', mousemoveFn)
        }
        return () => {
            showControlToolsTimer && clearInterval(showControlToolsTimer)
            controlToolsContainer && controlToolsContainer.removeEventListener('mousemove', mousemoveFn)
        }
    }, [isFullscreen, isMouseInControlTools])

    useEffect(() => {
        let ele = videoBoxRef?.current
        let clientWidth = window.screen.width
        const resizeObserver = new ResizeObserver((entries: any) => {
            for (let entry of entries) {
                if (entry.contentRect.width < clientWidth - 20) {
                    // 非全屏
                    setIsFullscreen(false)
                } else {
                    setIsFullscreen(true)
                    setIsTakePhotoSuccess(false)
                    setIsTakeVideoSuccess(false)
                }
            }
        })
        if (ele) {
            resizeObserver.observe(ele)
        }
    }, [])


    //退出页面时，需要关闭定时器和视频录制
    useEffect(() => {
        window.onbeforeunload = () => {
            if (recordAllViewVideoTimer) {
                clearInterval(recordAllViewVideoTimer)
                stopRecordingAsync({ fileId: recordAllViewVideoFileId })
            }
            //  取消录像按钮置灰
            disableTakeVideo = false
        }
        return () => {
            if (recordAllViewVideoTimer) {
                clearInterval(recordAllViewVideoTimer)
                stopRecordingAsync({ fileId: recordAllViewVideoFileId })
            }
            //  取消录像按钮置灰
            disableTakeVideo = false
        };
    }, []);

    // 创建视频播放器
    useEffect(() => {
        let _player: Player
        if (videoRef.current && allViewVideoInfo?.url) {
            _player = new JessibucaProPlayer(videoRef.current, allViewVideoInfo.url, { isAutoPlay: true })
        }
        return () => {
            _player?.destroy()
        }
    }, [allViewVideoInfo])

    // 在摄像头处画扇形
    useEffect(() => {
        if (cameraPTZ) {
            dispatch(setSectorArr({
                center: [cameraPTZ.latitude, cameraPTZ.longitude],
                radius: cameraPTZ.coverRaduis / 100000 || 0.05, //默认为5000米
                startAngle: cameraPTZ.minAngle,
                endAngle: cameraPTZ.maxAngle,
                pointNum: 100,
                showSector: true,
                key: uniqueKey
            }))
        }
        return () => {
            dispatch(setSectorArr({
                showSector: false,
                key: uniqueKey
            }))
        }
    }, [cameraPTZ, dispatch, uniqueKey])

    // 跟踪倒计时
    useEffect(() => {
        let timer: NodeJS.Timer
        if (targetInfo && timerCountNum) {
            if (isStopedVideoLink) {
                setTimerCount(-1)
                setIsFollow(false)
            } else {
                setIsFollow(true)
                timer = setInterval(() => {
                    setTimerCount((num: number) => {
                        if (num <= 1) {
                            setIsFollow(false)
                            clearInterval(timer)
                            return -1
                        } else {
                            return num - 1
                        }
                    })
                }, 1000)
            }
        }
        return () => {
            timer && clearInterval(timer)
        }
    }, [isStopedVideoLink, targetInfo, timerCountNum])

    useEffect(() => {
        if (isStopedVideoLink) {
            message.warning(`${deviceName}联动已停止`)
        }
    }, [isStopedVideoLink])

    // 联动目标信息更新
    useEffect(() => {
        if (targetInfo) {
            setCurrentTargetInfo(targetInfo.latLngList[0])
        }
    }, [targetInfo])

    // 切换跟踪倒计时
    async function handleChangeTime(time: number) {
        setTimerCountNum(time)
        let result = await changeLockTimeAsync({
            deviceCode: allViewVideoInfo?.deviceCode,
            lockId: allViewVideoInfo?.lockId,
            ttl: time,
            controlType: allViewVideoInfo?.controlType,
        })
        if (result) {
            setTimerCount(time)
        }
    }

    // 切换抢占模式的时间
    function handleSeizeTimeChange(time: number) {
        setSeizeTime(time)
    }
    // 抢占模式
    async function handleSeize(e: any) {
        let ttl: number = 30
        // seizeFlag  参数，抢占模式  1是  0非
        let seizeFlag = 0
        if (e.target.checked) {
            ttl = seizeTime
            seizeFlag = 1
        }
        await seizeCameraAsync({
            ttl,
            seizeFlag,
            deviceCode: allViewVideoInfo?.deviceCode,
            controlType: 1
        })
    }

    // 切换暂停跟踪，继续跟踪
    async function handlerFollow() {
        if (isFollow) {
            // 停止联动
            await stopCameraLockAsync({
                deviceCode: deviceCode,
                lockId: lockId
            })
            // setTimerCount('已停止')
            setIsFollow(false)
            setIsStopedVideoLink && setIsStopedVideoLink(true)
        } else {
            // 继续跟踪
            let codeType = 6
            let codeValue = ''
            if (videoLinkData?.targetType === 'ais') {
                codeType = 6
                codeValue = videoLinkData?.mmsi || ''
            } else if (videoLinkData?.targetType === 'radar') {
                codeType = 7
                codeValue = videoLinkData?.uniqueId || ''
            }
            let linkage = await getRealtimeVideoUrlAsync({
                codeType,
                codeValue,
                fusionId: videoLinkData?.fusionId || '',
                latitude: videoLinkData?.lat,
                longitude: videoLinkData?.lng,
                station: videoLinkData?.station || '',
                mmsi: videoLinkData?.mmsi || '',
                batchNum: videoLinkData?.uniqueId || '',
                ttl: timerCountNum
            })

            if (linkage.code !== 200) {
                message.error(linkage.msg || '暂无可用的设备')
                return
            } else {
                setTimerCount(timerCountNum)
                setIsFollow(true)
            }
            // 修改弹窗信息
            dispatch(setDeviceList({
                key: uniqueKey,
                deviceCode: linkage.data.deviceCode,
                videoInfo: {
                    ...linkage.data,
                    url: linkage.data.vedioUrl,
                    deviceCode: linkage.data.deviceCode,
                    channel: linkage.data.channel,
                    lockId: linkage.data.lockId
                },
                videoLinkData: videoLinkData
            }))
            // 修改弹窗标题
            onChangeWinTitle && onChangeWinTitle(linkage.data.deviceName)
            setAllViewVideoInfo && setAllViewVideoInfo({
                ...linkage.data,
                url: linkage.data.vedioUrl
            })

            if (linkage.data.vedioUrl) {
                setIsStopedVideoLink && setIsStopedVideoLink(false)
            }
        }

    }

    //格式化时分秒，传入秒，返回时分秒
    function formatSeconds(time: any) {
        let result = parseInt(time)
        let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
        let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
        let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
        return `${h}:${m}:${s}`
    }
    //录像
    function takeVideo(e: any) {
        e.stopPropagation()
        setIsTakeVideoSuccess(false)
        setIsTakePhotoSuccess(false)

        if (disableTakeVideo) {
            message.error('正在录制中...')
            return;
        }
        disableTakeVideo = true
        //开始录制接口
        startRecordingAsync({
            channel: allViewVideoInfo && allViewVideoInfo.channel,
            deviceCode: allViewVideoInfo && allViewVideoInfo.deviceCode,
            lockId: allViewVideoInfo && allViewVideoInfo.lockId
        }).then(res => {
            //开始录制时间
            let startTime = new Date().getTime()
            setRecordAllViewVideo((val) => {
                return {
                    ...val,
                    fileId: res.fileId,
                    showTime: true
                }
            })
            recordAllViewVideoFileId = res.fileId
            //清除定时器
            if (recordAllViewVideoTimer) {
                clearInterval(recordAllViewVideoTimer)
            }
            recordAllViewVideoTimer = setInterval(() => {
                let endTime = new Date().getTime()
                setRecordAllViewVideo((val) => {
                    return {
                        ...val,
                        time: formatSeconds(parseInt(String((endTime - startTime) / 1000)))
                    }
                })
            }, 1000)
        })
    }

    //停止录制全景视频
    async function stopRecordingAllVideo(fileId: any) {
        setRecordAllViewVideo((val) => {
            return {
                ...val,
                showTime: false,
                time: '00:00:00'
            }
        })
        disableTakeVideo = false
        //清除定时器
        if (recordAllViewVideoTimer) {
            clearInterval(recordAllViewVideoTimer)
        }
        let vo = await stopRecordingAsync({ fileId })
        if (vo) {
            setIsTakeVideoSuccess(true)
            message.success('录像成功，视频保存在智搜-视频中')
        }
    }

    // 查看照片
    async function handleOpenPicture() {
        let imgArr: any = []
        let videoArr: any = []
        let startTime = dayjs().format(YMD) + ' 00:00:00'
        let endTime = dayjs().format(YMD) + ' 23:59:59'
        const imgRes = await getImageVideoPage({ pageNumber: 1, pageSize: 20, }, { type: 'image', fileType: '01', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
        const videoRes = await getImageVideoPage({ pageNumber: 1, pageSize: 10, }, { type: 'video', fileType: '02,03', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
        imgArr = imgRes.data
        videoArr = videoRes.data
        popup(<AudioView
            isActiveImage={true}
            videoList={videoArr?.filter((item: any) => ['02', '03'].includes(item.fileType))}
            imageList={imgArr?.filter((item: any) => item.fileType === '01')} />, { title: '图片查看', size: "auto" })
    }
    // 查看视频
    async function handleOpenVideo() {
        let imgArr: any = []
        let videoArr: any = []
        let startTime = dayjs().format(YMD) + ' 00:00:00'
        let endTime = dayjs().format(YMD) + ' 23:59:59'
        const imgRes = await getImageVideoPage({ pageNumber: 1, pageSize: 20, }, { type: 'image', fileType: '01', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
        const videoRes = await getImageVideoPage({ pageNumber: 1, pageSize: 10, }, { type: 'video', fileType: '02,03', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
        imgArr = imgRes.data
        videoArr = videoRes.data
        popup(<AudioView
            isActiveImage={false}
            videoList={videoArr?.filter((item: any) => ['02', '03'].includes(item.fileType))}
            imageList={imgArr?.filter((item: any) => item.fileType === '01')} />, { title: '视频查看', size: "auto" })
    }

    //拍照
    async function takePhoto(e: any) {
        e.stopPropagation()
        setIsTakeVideoSuccess(false)
        setIsTakePhotoSuccess(false)
        //全景视频拍照
        let vo = await shipTakePhotoAsync({
            channel: allViewVideoInfo && allViewVideoInfo.channel,
            deviceCode: allViewVideoInfo && allViewVideoInfo.deviceCode,
            lockId: allViewVideoInfo && allViewVideoInfo.lockId
        })
        if (vo.data.code === 200) {
            message.success('拍照成功')
            setIsTakePhotoSuccess(true)
        } else {
            message.error('拍照失败')
        }
    }
    // 查看历史视频
    function handleGoVideoList() {
        dispatch(setNavigate({
            path: '/dataCenter/collectionData',
            state: {
                activeKey: 'item-1',
                sourceDataActiveKey: '7',
                videoDataRadio: 1,
                deviceCode: allViewVideoInfo?.deviceCode
            }
        }))
    }

    // 双击全屏
    async function handleFull() {
        chooseCurrentVideo()
        let streamLevel = 0
        if (document.fullscreenElement === videoBoxRef.current) {
            document.exitFullscreen()
            setIsFullscreen(false)
            streamLevel = 1
        } else {
            videoBoxRef.current && videoBoxRef.current.requestFullscreen()
            setIsFullscreen(true)
            let el = dragControlTools.current
            new DragElement(el, true)
            streamLevel = 0
        }
        // 子码流，主码流切换。0:主码流, 1:子码流
        if (!targetInfo && isRealTimeVideo) {
            let videoInfo = await getVideoSrcByDeviceCodeAsync({
                deviceCode: allViewVideoInfo.deviceCode,
                channel: allViewVideoInfo.channel,
                streamLevel: streamLevel
            })

            if ((videoInfo && videoInfo.vedioUrl === allViewVideoInfo.url) || !videoInfo) {
                return
            }
            setAllViewVideoInfo && setAllViewVideoInfo({
                ...videoInfo,
                url: videoInfo.vedioUrl,
            })
        }
    }

    // 云台控制，双击不要退出全屏
    function handleDisableFull(e: any) {
        e.stopPropagation()
    }

    // 选中当前视频作为操作对象
    function chooseCurrentVideo() {
        // 当前视频是选中视频，则点击无效。
        // 所有高清枪机、车辆卡口、全景摄像机都不显示云台控制按钮以及操作面板
        if (selectedVideoKey === uniqueKey ||
            allViewVideoInfo.cameraType === 3 ||
            allViewVideoInfo.cameraType === 6 ||
            allViewVideoInfo.cameraType === 9 ||
            !allViewVideoInfo.url) {
            return
        }
        dispatch(setSelectedKey(uniqueKey))
        let isUseOldPosition = controlWinPosition.left > 0 && controlWinPosition.top > 0
        windowUI(<VideoControl />, {
            title: '云台控制',
            width: '400px',
            height: 'auto',
            offset: isUseOldPosition ? [controlWinPosition.left, controlWinPosition.top] : [1480, 470],
            key: 'cloudControlWin',
            onClose: () => {
                dispatch(setSelectedKey('null'))
            }
        })
    }

    const handleMouseDown = useCallback(
        (evt: any) => {
            setIsLocation(true)
            setBeginXY({
                x: evt.nativeEvent.offsetX,
                y: evt.nativeEvent.offsetY
            })
        },
        [],
    )

    const handleMouseMove = useCallback(
        (evt: any) => {
            if (isLocation) {
                setEndXY({
                    x: evt.nativeEvent.offsetX,
                    y: evt.nativeEvent.offsetY
                })
            }
        },
        [isLocation],
    )

    const handleMouseUp = useCallback(
        async () => {
            setIsLocation(false)
            setBeginXY(undefined)
            setEndXY(undefined)
            if (videoBoxRef.current && beginXY && endXY) {
                if (beginXY.x === endXY.x &&
                    beginXY.y === endXY.y) {
                    return
                }
                await cameraControlAsync({
                    channel: allViewVideoInfo.channel,
                    lockId: allViewVideoInfo.lockId,
                    deviceCode: allViewVideoInfo.deviceCode,
                    spixel: beginXY,
                    epixel: endXY,
                    width: videoBoxRef.current.clientWidth,
                    height: videoBoxRef.current.clientHeight,
                    controlType: 7,
                    startFlag: true,
                })
            }

        },
        [allViewVideoInfo, beginXY, endXY],
    )

    const locationStyle = useMemo(() => {
        if (beginXY && endXY) {
            let left = 0
            let width = 0
            if (beginXY.x > endXY.x) {
                left = endXY.x
                width = beginXY.x - endXY.x
            } else {
                left = beginXY.x
                width = endXY.x - beginXY.x
            }

            let top = 0
            let height = 0
            if (beginXY.y < endXY.y) {
                top = beginXY.y
                height = endXY.y - beginXY.y
            } else {
                top = endXY.y
                height = beginXY.y - endXY.y
            }

            return {
                top,
                left,
                width,
                height
            }
        } else {
            return undefined
        }
    }, [beginXY, endXY])

    const videoWrapperStyle = useMemo(() => {
        if (targetInfo) {
            return {
                height: 'calc( 100% - 90px )'
            }
        } else if (allViewVideoInfo?.cameraType === 3 ||
            allViewVideoInfo?.cameraType === 6 ||
            allViewVideoInfo?.cameraType === 9
        ) {
            return {
                height: '100%'
            }
        } else {
            return {
                height: 'calc( 100% - 50px )'
            }
        }
    }, [targetInfo, allViewVideoInfo])

    const timerText = useMemo(() => timerCount > 0 ? `${timerCount}秒` : '已停止', [timerCount])

    return <div className={styles.wrapper}>
        <div className={`${styles.videoWrapper} ${(selectedVideoKey === uniqueKey && allViewVideoInfo?.url) ? styles.activeVideo : ''}`}
            style={videoWrapperStyle}
            ref={videoBoxRef}
            onClick={chooseCurrentVideo}
            onDoubleClick={handleFull}>
            {allViewVideoInfo?.url && <div ref={videoRef} className={`${styles.videoRef}`}></div>}
            {allViewVideoInfo?.url === '' && <div className={styles.noVideo}><Spin size="large" tip="视频加载中" /></div>}
            {allViewVideoInfo?.url === undefined && <div className={styles.noVideo}>暂无视频信号</div>}
            {/* 视频录制中... */}
            {recordAllViewVideo.showTime && <div className={styles.recordVideo}>
                <span className={styles.stopVideo} onClick={() => stopRecordingAllVideo(recordAllViewVideo.fileId)} />
                <span>{recordAllViewVideo.time}</span>
            </div>}
            {isFullscreen && <div className={styles.closeAlt}>按Esc键退出全屏</div>}
            {/* 全屏悬浮云台控制 */}
            {(allViewVideoInfo?.cameraType !== 3 &&
                allViewVideoInfo?.cameraType !== 6 &&
                allViewVideoInfo?.cameraType !== 9
            ) && <div
                ref={fullScreenControlTools}
                className={styles.fullScreenControlTools}
                style={{ display: (isFullscreen && isShowControlTools) ? 'block' : 'none' }}
                onDoubleClick={handleDisableFull}
            >
                    <div className={styles.title} ref={dragControlTools}>
                        <span>云台控制</span>
                        <div className={styles.fullScreenIcons}>
                            <img src={cameraImg} alt="相机" onClick={takePhoto} title='拍照' />
                            <img src={videoImg} alt="视频" onClick={takeVideo} title='录像' />
                            {isTakePhotoSuccess && <div className={styles.takeSuccess}>
                                <Alert
                                    message="拍照成功"
                                    type="success"
                                    showIcon
                                    onClose={() => setIsTakePhotoSuccess(false)}
                                    closable
                                />
                            </div>}
                            {isTakeVideoSuccess && <div className={styles.takeSuccess}>
                                <Alert
                                    message="录像成功"
                                    type="success"
                                    showIcon
                                    onClose={() => setIsTakeVideoSuccess(false)}
                                    closable
                                />
                            </div>}
                        </div>
                    </div>
                    {(isFullscreen && isShowControlTools) && <div className={styles.videoWinControl}>
                        <VideoControl
                            handlerFollow={handlerFollow}
                            isFollow={isFollow}
                            handleChangeTime={handleChangeTime}
                            timerText={timerText}
                            timerCountNum={timerCountNum}
                            isNotShowPrecast={true}
                            isShowFollow={targetInfo && allViewVideoInfo?.url} />
                    </div>}
                </div>}
            {/* 3d定位 */}
            {allViewVideoInfo?.url && <>
                <div className={styles.locationBox}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                ></div>
                {locationStyle && <div className={styles.location} style={locationStyle}></div>}
            </>}

        </div>
        {(targetInfo && allViewVideoInfo?.url) && <div className={styles.checkBoxTime}>
            <div>
                <Checkbox.Group>
                    <Checkbox value="A">视频AI</Checkbox>
                </Checkbox.Group>
                <Button type='link' onClick={handlerFollow}>{isFollow ? '暂停跟踪' : '继续跟踪'}</Button>
            </div>
            <div className={styles.timeCount}>
                <div className={styles.time}>{timerText}</div>
                <TimeCount handleChange={handleChangeTime} isDisableSelect={!isFollow} value={timerCountNum} />
            </div>
        </div>}

        {(allViewVideoInfo?.url) && (allViewVideoInfo.cameraType !== 3 &&
            allViewVideoInfo.cameraType !== 6 &&
            allViewVideoInfo.cameraType !== 9
        ) && <div className={styles.controlAction}>
                {isTakePhotoSuccess && <div className={styles.takeSuccess}>
                    <Alert
                        message="拍照成功"
                        type="success"
                        showIcon
                        action={
                            <Button size="small" type="link" onClick={handleOpenPicture}>立即查看</Button>
                        }
                        onClose={() => setIsTakePhotoSuccess(false)}
                        closable
                    />
                </div>}
                {isTakeVideoSuccess && <div className={styles.takeSuccess}>
                    <Alert
                        message="录像成功"
                        type="success"
                        showIcon
                        action={
                            <Button size="small" type="link" onClick={handleOpenVideo}>立即查看</Button>
                        }
                        onClose={() => setIsTakeVideoSuccess(false)}
                        closable
                    />
                </div>}
                <div className={styles.icons}>
                    <img src={cameraImg} alt="相机" onClick={takePhoto} title='拍照' />
                    <img src={videoImg} alt="视频" onClick={takeVideo} title='录像' />
                </div>
                {allViewVideoInfo.deviceSource === 0 && <div className={styles.historyVideoBtn} onClick={handleGoVideoList}>历史视频</div>}
                <div className={styles.targetInfos}>
                    {targetInfo && <>
                        <div className={styles.radarNum}>
                            {currentTargetInfo?.otherDataType === 'radar' && <>雷达编号:{currentTargetInfo?.trackId || '--'}</>}
                            {currentTargetInfo?.otherDataType !== 'radar' && <>MMSI:{currentTargetInfo?.trackId || '--'}</>}
                        </div>
                        <div className={styles.speed}>
                            <span>航速:{(currentTargetInfo?.speed !== '--' && currentTargetInfo?.speed?.toFixed(2)) || '0.00'}节</span>
                            <span>航向:{(currentTargetInfo?.originCourse !== '--' && currentTargetInfo?.originCourse?.toFixed(2)) || '--'}</span>
                        </div>
                    </>}
                    {!targetInfo && isRealTimeVideo && <div className={styles.seizeTimeSelect}>
                        <Checkbox onChange={handleSeize}>抢占模式</Checkbox>
                        <SeizeTimeSelect handleChange={handleSeizeTimeChange} />
                    </div>
                    }
                </div>
                {/*所有高清枪机、车辆卡口、全景摄像机，都不显示云台控制按钮以及操作面板 */}
                <div
                    onClick={chooseCurrentVideo}
                    className={`${styles.cloudControlBtn} ${selectedVideoKey === uniqueKey ? styles.activeBtn : ''}`}
                >云台控制</div>
            </div>}

    </div>
}

export default VideoLinkWindow