import { CloseOutlined } from "@ant-design/icons";
import { Button, ConfigProvider } from "antd";
import { store } from "app/store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ReactElement, useRef } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import styles from "./index.module.sass";
import zhCN from 'antd/lib/locale/zh_CN';
import { createRoot } from "react-dom/client";
import tit_icon from "images/popup/tit_icon.png"
import PopupHeaderBackground from "component/PopupHeaderBackground";
import PopupBackground from "component/PopupBackground";

export interface PopupProps {
  /**弹出窗口标题 */
  title?: string
  /** 附加在容器上的样式类名 */
  className?: string
  /**窗口大小 */
  size?: 'fullscreen' | 'large' | 'middle' | 'small' | 'mini' | 'auto'
  /**自定义窗口样式 */
  style?: any
  /**弹窗关闭回调函数 */
  onCloseCallback?: () => void
  /** 自定义头部栏元素 */
  Header?: React.FC<{ title: string, onClose: () => void }>
  /** 自定义内容栏背景元素 */
  Content?: React.FC<{ content: ReactElement }>
}

interface Props extends PopupProps {
  /** 内容元素 */
  content: ReactElement
  /** 清除弹出层组件挂载函数 */
  onUnmount: () => void
  /** 提供回调给popup函数 */
  onCallBack: (param: any) => void
  /** 关闭弹出层的调用 */
  onClosePopup: () => void
}

/** 本组件的使用需要先在app.tsx中定义附属节点，约定id是popup-root */
const Popup: React.FC<Props> = ({
  content,
  onCallBack,
  onUnmount,
  onClosePopup,
  className,
  title,
  size,
  style,
  Header,
  Content
}) => {
  console.debug('Popup')

  const popupRoot = document.getElementById('popup-root');

  const wrapperRef = useRef(null)
  const contentRef = useRef(null)

  const [titleEle, setTitleEle] = useState<any>()
  const [contentClassName] = useState(() => {
    let result: any;
    switch (size) {
      case 'fullscreen':
        result = styles.contentFullscreen;
        break;
      case 'large':
        result = styles.contentLarge;
        break;
      case 'middle':
        result = styles.contentMiddle;
        break;
      case 'small':
        result = styles.contentSmall;
        break;
      case 'mini':
        result = styles.contentMini;
        break;
      case 'auto':
        result = styles.contentAuto;
        break;
      default:
        result = styles.contentSmall;
        break;
    }
    return className ? `${className} ${result}` : result
  })

  const handleClose = useCallback(() => {
    if (wrapperRef && contentRef) {
      const transformStr = 'translate(-50%, -50%)';
      const wrapperEle: any = wrapperRef.current;
      const contentEle: any = contentRef.current;
      let opacityVal = 1;
      let scaleVal = 1;
      const closeAnim = () => {
        wrapperEle.style.opacity = opacityVal;
        if (size === 'auto') {
          contentEle.style.transform = `${transformStr} scale(${scaleVal}, ${scaleVal})`;
        } else {
          contentEle.style.transform = `scale(${scaleVal}, ${scaleVal})`;
        }
        opacityVal -= 0.1;
        scaleVal -= 0.005;
        if (opacityVal > 0) {
          requestAnimationFrame(closeAnim);
        } else {
          onUnmount();
        }
      }
      requestAnimationFrame(closeAnim);
    } else {
      onUnmount();
    }
  }, [size, onUnmount])

  useEffect(() => {
    const is = (size === 'fullscreen' && document.body.scrollHeight > document.body.clientHeight)
    const old = document.body.style.overflow
    if (is) document.body.style.overflow = 'hidden'

    /**处理关闭回调 */
    onCallBack({
      handleAnimationClose: handleClose
    })

    return () => {
      if (is) {
        if (old) {
          document.body.style.overflow = old
        } else {
          document.body.style.removeProperty('overflow')
        }
      }
    }
  }, [size, handleClose, onCallBack])

  const contentEle = useMemo(() => {
    function handleTitleEle(param: any) {
      setTitleEle(param)
    }
    return React.cloneElement(content, {
      onClosePopup,
      onTitle: handleTitleEle
    })
  }, [content, onClosePopup])

  const realTitle = useMemo(() => titleEle || title || '', [titleEle, title])

  if (popupRoot) {
    return ReactDOM.createPortal(
      <article className={`${styles.wrapper} `} style={style} ref={wrapperRef}>

        <article className={`${contentClassName} `} ref={contentRef} onClick={evt => evt.stopPropagation()}>

          {Header ?
            <Header title={realTitle} onClose={handleClose} /> :
            <header className={styles.header}>
              <div className={styles.headerContent}>
                <img src={tit_icon} alt={realTitle} />
                <span>{realTitle}</span>
                <Button className={styles.off} type='text' icon={<CloseOutlined />} onClick={handleClose} />
              </div>
              <PopupHeaderBackground />
            </header>

          }

          {Content
            ? <Content content={contentEle} />
            : <section className={`${styles.body}`}>{contentEle}</section>
          }
          <PopupBackground />
        </article>

      </article>,
      popupRoot
    );
  } else {
    console.error('弹出窗口组件无法找到附属节点,id是popup-root')
    return null;
  }
}

/**
 * 这是与Popup组件搭配使用的弹出窗口方法, 隐式传入内容组件onClosePopup、onTitle函数
 * onClosePopup: () => void 手动关闭弹出窗口
 * onTitle: (title: any) => void 设置弹出窗口标题栏
 */
const popupmini = function (ele: ReactElement, props?: PopupProps) {
  const container = document.createElement('div');
  const root = createRoot(container);

  let handleAnimationClose: Function;

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ConfigProvider locale={zhCN}>
          <Popup
            content={ele}
            onUnmount={handleUnmount}
            onCallBack={handleCallBack}
            onClosePopup={handleClosePopup}
            {...props}
          />
        </ConfigProvider>
      </Provider>
    </React.StrictMode>
  )

  function handleCallBack(params: any) {
    handleAnimationClose = params.handleAnimationClose;
  }

  function handleClosePopup() {
    handleAnimationClose && handleAnimationClose();
  }

  function handleUnmount() {
    props && props.onCloseCallback && props.onCloseCallback()
    root.unmount();
  }
}

export default popupmini;
