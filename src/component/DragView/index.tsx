
import { useEffect, useState } from "react";
import styles from "./index.module.sass";


interface IDragView {

  title?: string
  style?: any
  content?: any
  children?: any
}

const DragView: React.FC<IDragView> = (props) => {
  const { title, content, style } = props
  const [myStyle, setMyStyle] = useState<any>({})
  // const [viewShow, setViewShow] = useState(true)

  useEffect(() => {
    setMyStyle((oldVal: any) => {
      let val = { ...oldVal, ...style }

      if (style.left) {
        val.left = style.left
      }
      if (style.right) {
        val.right = style.right
      }
      if (style.top) {
        val.top = style.top
      }
      if (style.bottom) {
        val.bottom = style.bottom
      }
      return val
    })

  }, [style])

 /*  function handleShowView() {
    setViewShow(!viewShow)
  } */

  return (
    <div className={styles.wrapper} style={{ ...myStyle }}>
      <div className={styles.titlePanel}>
        <div className={styles.title}>{title}</div>
        {/* <div className={styles.close} onClick={handleShowView}><span className={`iconfont icon-guanbi ${styles.icon}`}></span></div> */}
      </div>
      <div className={styles.contentPanel}>
        {content}
      </div>
    </div>
  )
}


DragView.defaultProps = {
  title: '标题',
  style: {
    width: '200px',
    height: '300px'
  }
}
export default DragView
