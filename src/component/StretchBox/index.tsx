import { MinusCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import styles from "./index.module.sass";


interface IStretchBox {
  /**自定义style */
  customStyle?: any
  head?: any
  headTitle?: any
  /**是否有关闭按钮 */
  hasClose?: any
  closeTxt?: any
  closeComponent?: any
  component?: any
  onFinish?: any
  onClose?: any
}

const StretchBox: React.FC<IStretchBox> = (props) => {
  console.debug("StretchBox")
  const { customStyle, head, headTitle, hasClose, closeTxt, closeComponent, component, onFinish, onClose } = props


  const [myCustomStyle, setMyCustomStyle] = useState(customStyle)
  const [panelStyle, setPanelStyle] = useState({})
  // const [panelState, setPanelState] = useState(true)
  const [panelState, setPanelState] = useState(true)

  function handleClose() {
    onFinish && onFinish("")
    onClose && onClose()
  }

  function handleFold() {
    let fold = !panelState
    setPanelState(fold)
    if (fold) {
      // 展开
      setPanelStyle({ display: '' })
      setMyCustomStyle({ ...myCustomStyle, ...customStyle })
    } else {
      // 合上
      setPanelStyle({ display: 'none' })
      setMyCustomStyle({ ...myCustomStyle, width: '20px', height: '10px' })
    }
  }

  return (
    <div className={styles.wrapper} style={myCustomStyle}>
      {
        panelState === false ?
          <div className={styles.btnShrink} onClick={handleFold}>
            <span className={`${styles.btnShrinkIcon} iconfont icon-guanli`}></span>
          </div>
          :
          <div className={styles.panel} style={panelStyle}>
            {head ?
              <div className={styles.head}>
                <div className={styles.headTitle}>{headTitle}</div>
                {hasClose ?
                  <>
                    <div className={styles.btnBox}>
                      {
                        closeComponent && <div className={styles.btns} onClick={handleClose}>
                          {closeComponent ? closeComponent : { closeTxt }}
                        </div>
                      }


                      <div className={styles.btns} onClick={handleFold}>
                        <MinusCircleOutlined />
                      </div>
                    </div>
                  </>
                  : null
                }
              </div>
              : null
            }

            <div className={styles.content}>
              {component ? component : null}
            </div>
          </div>
      }





    </div>
  )
}
StretchBox.defaultProps = {
  customStyle: {},
  hasClose: false,
  closeTxt: '关闭',
  head: true,
  headTitle: 'title'
}

export default StretchBox