import { Button, ConfigProvider } from "antd"
import { store } from "app/store"
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { ReactElement } from "react"
import { createRoot, Root } from "react-dom/client"
import { Provider } from "react-redux"
import zhCN from 'antd/lib/locale/zh_CN';
import ReactDOM from "react-dom"
import styles from "./index.module.sass";
import {
  CloseOutlined
} from "@ant-design/icons"
import _ from "lodash"


const rootEle = document.getElementById('root')
let windowstillRoot = document.getElementById('windowstill-root')

let isWinMoved: boolean = false; //用于判断弹窗是否执行了move事件

export const windowstillOffset = {
  x: 0,
  y: 0,
  z: 100,
  isAdd: true,
  count: 0
}

const windowsCache: {
  key: string
  root: Root
  onUnmount: () => void
}[] = []

type PxType = string | number | undefined

export interface DragParams {
  left: number
  top: number
}

export interface ResizeParams {
  width: number
  height: number
}

export type DraglistenFn = (params: DragParams) => void
export type ResizelistenFn = (params: ResizeParams) => void

interface WindowStyle {
  headerStyle?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
}

export interface WindowstillProps {
  /** 窗口标题 */
  title: string,
  /** 自定义key，当赋予key时，同一个key重复会覆盖上一个 */
  key?: string
  /** 窗口的自定义宽度，默认是800px */
  width?: string | number,
  /** 窗口的自定义高度，默认是600px */
  height?: string | number,
  /** 自定义zIndex */
  zIndex?: number
  /** 弹窗的自定义位置, [left, top, right] */
  offset?: PxType[]
  /** 自定义样式header,content样式 */
  style?: WindowStyle,
  /** 自定义头部栏元素 */
  Header?: React.FC<{ title: string, onClose: () => void }>
  /** 自定义内容栏背景元素 */
  Content?: React.FC<{ content: ReactElement }>
  /** 关闭窗口的回调 */
  onClose?: () => void
  /** 是否开启窗口大小自由拖动 */
  isResize?: boolean
}

interface Props extends WindowstillProps, Config {
  /** 卸载元素回调 */
  onUnmount: () => void
  /** 需要弹出展示的组件 */
  children: ReactElement,
}

/**
 * 本组件的使用需要先在app.tsx中定义附属节点，约定id是windowstill-root
 * */
const Windowstill: React.FC<Props> = ({
  title,
  onUnmount,
  children,
  width,
  height,
  zIndex,
  offset,
  style,
  Header,
  Content,
  onClose,
  initWidth,
  initHeight,
  minTop,
  isResize
}) => {
  console.debug('Windowstill')


  windowstillRoot = document.getElementById('windowstill-root')


  const wrapperRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const [resizelistenList, setResizelistenList] = useState<ResizelistenFn[]>([])
  const [resizeParams, setResizeParams] = useState<string>()
  const [draglistenList, setDraglistenList] = useState<DraglistenFn[]>([])
  const [dragParams, setDragParams] = useState<string>()

  const [winTitle, setWinTitle] = useState(title)


  const resizeParamsDeferred = useDeferredValue(resizeParams)
  const dragParamsDeferred = useDeferredValue(dragParams)


  const articleStyle = useMemo<React.CSSProperties>(() => {
    let left: PxType, top: PxType, right: PxType
    if (offset) {
      //自定义弹窗位置
      const [_left, _top, _right] = offset

      if (_left) left = _.isString(_left) ? _left : `${_left}px`
      if (_top) top = _.isString(_top) ? _top : `${_top}px`
      if (_right) right = _.isString(_right) ? _right : `${_right}px`

    } else {
      //默认左上角
      left = `${windowstillOffset.x}px`
      top = `${windowstillOffset.y}px`
    }
    return {
      width: width ? width : `${initWidth}px`,
      height: height ? height : `${initHeight}px`,
      left,
      top,
      right,
      resize: isResize ? 'both' : 'none',
      ...style?.wrapperStyle
    }
  }, [height, width, initWidth, initHeight, offset, style, isResize])


  /*关闭弹窗*/
  const handleClose = useCallback(
    () => {
      onClose && onClose()
      onUnmount()
    },
    [onClose, onUnmount],
  )


  /**设置初始位置和点击弹窗置顶*/
  useEffect(() => {
    const wrapperEle = wrapperRef.current

    const handleUpZIndex = () => {
      windowstillOffset.z += 1
      if (wrapperEle) {
        wrapperEle.style.zIndex = String(windowstillOffset.z)
      }
    }

    if (wrapperEle) {
      if (zIndex) {
        wrapperEle.style.zIndex = String(zIndex)
      } else {
        handleUpZIndex()
        wrapperEle.addEventListener('mousedown', handleUpZIndex)
      }
    }

    return () => {
      wrapperEle?.removeEventListener('mousedown', handleUpZIndex)
    }
  }, [zIndex])

  /**按住头部栏拖拽*/
  useEffect(() => {
    const wrapperEle = wrapperRef.current
    const headerEle = headerRef.current

    const nowOffset = { x: 0, y: 0 }
    const startOffset = { x: 0, y: 0 }

    let bodyWidth = document.body.clientWidth
    const wrapperWidth = wrapperEle ? Number(wrapperEle.style.width.replace('px', '')) : 0
    const maxLeftRight = bodyWidth - wrapperWidth
    let right: PxType
    if (offset) {
      right = offset[2]
    }
    // 浏览器resize时，动态改变bodyWidth
    function getBrowserWidth() {
      bodyWidth = window.innerWidth
    }
    window.addEventListener('resize', getBrowserWidth)

    function startDrag(evt: MouseEvent) {
      if (wrapperEle) {
        if (right) {
          nowOffset.x = Number(wrapperEle.style.right.replace('px', ''))
        } else {
          nowOffset.x = Number(wrapperEle.style.left.replace('px', ''))
        }
        nowOffset.y = Number(wrapperEle.style.top.replace('px', ''))
        startOffset.x = evt.pageX
        startOffset.y = evt.pageY
        isWinMoved = false
        rootEle?.addEventListener('mousemove', handleDrag)
      }
    }

    function handleDrag(evt: MouseEvent) {
      const x = _.subtract(evt.pageX, startOffset.x)
      const y = _.subtract(evt.pageY, startOffset.y)
      const xVal = right ? _.subtract(nowOffset.x, x) : _.add(nowOffset.x, x)
      const yVal = _.add(nowOffset.y, y)
      isWinMoved = true
      requestAnimationFrame(() => {
        if (wrapperEle) {
          if (right) {
            if (xVal < 0) {
              wrapperEle.style.right = '0px'
            } else if (xVal > (bodyWidth - Number(wrapperEle.style.width.replace('px', '')))) {
              wrapperEle.style.right = `${maxLeftRight}px`
            } else {
              wrapperEle.style.right = `${xVal}px`
            }
          } else {
            if (xVal < 0) {
              wrapperEle.style.left = '0px'
            } else if (xVal > (bodyWidth - Number(wrapperEle.style.width.replace('px', '')))) {
              wrapperEle.style.right = `0px`
            } else {
              wrapperEle.style.left = `${xVal}px`
            }
          }
          if (minTop && yVal < minTop) {
            wrapperEle.style.top = `${minTop}px`
          } else {
            wrapperEle.style.top = `${yVal}px`
          }
        }
      })
    }

    function endDrag() {
      rootEle?.removeEventListener('mousemove', handleDrag)
      const params = {
        left: wrapperRef.current?.offsetLeft,
        top: wrapperRef.current?.offsetTop
      }
      const paramsStr = JSON.stringify(params)
      // 弹窗移动了才执行此代码
      if (isWinMoved) {
        setDragParams(paramsStr)
        isWinMoved = false
      }
    }

    headerEle?.addEventListener('mousedown', startDrag)
    headerEle?.addEventListener('mouseup', endDrag)
    document.addEventListener('mouseup', endDrag)
    return () => {
      headerEle?.removeEventListener('mousedown', startDrag)
      headerEle?.removeEventListener('mouseup', endDrag)
      document.removeEventListener('mouseup', endDrag)
      window.removeEventListener('resize', getBrowserWidth)
    }
  }, [offset, minTop, children, handleClose])

  useEffect(() => {
    if (dragParamsDeferred) {
      const params = JSON.parse(dragParamsDeferred)
      draglistenList.forEach(fn => fn(params))
    }
  }, [dragParamsDeferred, draglistenList])


  // resize拖拽改变大小
  useEffect(() => {
    const wrapperEle = wrapperRef.current
    let obServer: ResizeObserver

    if (isResize && wrapperEle) {
      obServer = new ResizeObserver(() => {
        const params = {
          width: wrapperRef.current?.offsetWidth,
          height: wrapperRef.current?.offsetHeight,
        }
        const paramsStr = JSON.stringify(params)
        setResizeParams(paramsStr)
      })
      obServer.observe(wrapperEle)
    }
    return () => {
      if (isResize && wrapperEle && obServer) {
        obServer.unobserve(wrapperEle)
      }
    }
  }, [isResize])

  useEffect(() => {
    if (resizeParamsDeferred) {
      const params = JSON.parse(resizeParamsDeferred)
      resizelistenList.forEach(fn => fn(params))
    }
  }, [resizelistenList, resizeParamsDeferred])

  // 挂载根节点被清除后关闭挂载的弹窗
  useEffect(() => {
    const handleRootclear = () => {
      handleClose()
      windowstillOffset.z = 100
      // windowstillRoot = null
    }
    if (windowstillRoot) {
      windowstillRoot.addEventListener('rootclear', handleRootclear, false)
    }
    return () => {
      if (windowstillRoot) {
        windowstillRoot.removeEventListener('rootclear', handleRootclear, false)
      }
    }
  }, [handleClose])


  const handleAddResizeListener = useCallback(
    (cb: ResizelistenFn) => {
      setResizelistenList(val => {
        const is = val.some(item => item === cb)
        if (!is) {
          return [...val, cb]
        } else {
          return val
        }
      })
    },
    []
  )

  const handleRemoveResizeListener = useCallback(
    (cb: ResizelistenFn) => {
      setResizelistenList(val => {
        const idx = val.findIndex(item => item === cb)
        if (idx !== -1) {
          val.splice(idx, 1)
          return [...val]
        } else {
          return val
        }
      })
    },
    [],
  )

  const handleAddDragListener = useCallback(
    (cb: DraglistenFn) => {
      setDraglistenList(val => {
        const is = val.some(item => item === cb)
        if (!is) {
          return [...val, cb]
        } else {
          return val
        }
      })
    },
    []
  )

  const handleRemoveDragListener = useCallback(
    (cb: DraglistenFn) => {
      setDraglistenList(val => {
        const idx = val.findIndex(item => item === cb)
        if (idx !== -1) {
          val.splice(idx, 1)
          return [...val]
        } else {
          return val
        }
      })
    },
    [],
  )

  // 动态修改窗口的标题
  function handleChangeWinTitle(title: string) {
    setWinTitle(title)
  }


  const targetEle = useMemo(() => {
    const result = React.cloneElement(children, {
      onClosePopup: handleClose,
      onCloseWindow: handleClose,
      onResize: handleAddResizeListener,
      offResize: handleRemoveResizeListener,
      onDrag: handleAddDragListener,
      offDrag: handleRemoveDragListener,
      onChangeWinTitle: handleChangeWinTitle
    })
    return result
  }, [children, handleAddDragListener, handleAddResizeListener, handleClose, handleRemoveDragListener, handleRemoveResizeListener])


  if (windowstillRoot) {

    // const targetEle = React.cloneElement(children, {
    //   onClosePopup: handleClose,
    //   onCloseWindow: handleClose
    // })

    // windowstillRoot.addEventListener('rootclear', () => {
    //   handleClose()
    // }, false)

    return ReactDOM.createPortal(
      <article className={`${styles.wrapper} hooks__Windowstill-wrapper`} ref={wrapperRef} style={articleStyle} >
        {Header
          ? <header className={styles.customHeader} ref={headerRef} style={style?.headerStyle}>
            <Header title={winTitle} onClose={handleClose} />
          </header>
          : <header className={`${styles.header} hooks__Windowstill-header`} ref={headerRef} style={style?.headerStyle}>
            <div className={`${styles.title} hooks__Windowstill-header-title`}>
              <span className={styles.titleText} >{winTitle}</span>
            </div>
            <div className={`${styles.actions} hooks__Windowstill-actions`}>
              <Button className={styles.close} type="text" icon={<CloseOutlined />} onClick={handleClose} />
            </div>
          </header>
        }
        {Content
          ? <Content content={targetEle} />
          : <section className={`${styles.content} hooks__Windowstill-content`}>{targetEle}</section>
        }
      </article>,
      windowstillRoot
    );
  } else {
    console.error('窗口组件无法找到附属节点,id是windowstill-root')
    return null;
  }
}

export interface WindowsResult {
  /** 卸载函数 */
  onUnmount: () => void
}

/**弹窗展示组件, 组件隐式传入参数：onCloseWindow等*/
const windowstill = function (ele: ReactElement, props: WindowstillProps): WindowsResult {
  const container = document.createElement('div');
  const root = createRoot(container);

  windowstillOffset.count += 1
  // console.log('windowstill windowstillOffset', windowstillOffset)/

  function handleUnmount() {
    if (props.key) {
      _.remove(windowsCache, item => _.isEqual(item.key, props.key))
    }
    root.unmount();

    windowstillOffset.count -= 1
    if (windowstillOffset.count < 1) {
      windowstillOffset.z = 100
      windowstillOffset.count = 0
    }
    // console.log('windowstill windowstillOffset handleUnmount', windowstillOffset)
  }

  if (props.key) {
    const [target] = _.remove(windowsCache, item => _.isEqual(item.key, props.key))
    target && target.onUnmount()
    windowsCache.push({
      key: props.key,
      root,
      onUnmount: handleUnmount
    })
  }

  const windowstillProps = {
    ...config,
    ...props
  }

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ConfigProvider locale={zhCN}>
          <Windowstill
            onUnmount={handleUnmount}
            {...windowstillProps}
          >{ele}</Windowstill>
        </ConfigProvider>
      </Provider>
    </React.StrictMode>
  );

  return {
    onUnmount: handleUnmount
  }
}

/** 全局弹窗选项，可以被windowstill函数传入的配置项覆盖  */
interface Config {
  /** 弹出窗口初始定位位置，[x: left值, y：top值] */
  initPosition?: [number, number]
  /** 弹出窗口默认宽度 */
  initWidth?: string | number
  /** 弹出窗口默认高度度 */
  initHeight?: string | number
  /** 弹出窗口最上方的距离限制 */
  minTop?: number
}

// 全局配置项
let config: Config = {
  initPosition: [10, 10],
  initWidth: 800,
  initHeight: 600,
  minTop: 0
}

/** 全局配置弹窗选项 */
export const windowstillConfig = (_config: Config) => {
  config = {
    ...config,
    ..._config
  }

  const { initPosition } = config

  if (initPosition) {
    const [x, y] = initPosition
    windowstillOffset.x = x
    windowstillOffset.y = y
  }
}


export default windowstill
