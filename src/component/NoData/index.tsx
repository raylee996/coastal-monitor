import { useEffect, useState } from "react";
import styles from "./index.module.sass";

interface INoData {
  imgSrc?: any,
  text?: any
  component?: any
}
const NoData: React.FC<INoData> = (props) => {
  const { imgSrc, text, component } = props
  const [type, setType] = useState<any>('text')

  useEffect(() => {
    if (imgSrc && imgSrc.length !== 0) {
      setType("img")
    } else if (text && text.length !== 0) {
      setType("text")
    } else if (component) {
      setType("component")
    } else {
      setType('text')
    }
  }, [imgSrc, text, component])

  return (
    <div className={styles.wrapper}>
      {
        type === "img" && <div className={styles.content}><img alt="" src={imgSrc} width={"80px"} height={'160px'} /></div>
      }
      {
        type === "text" && <div className={styles.content}>{text}</div>
      }
      {
        type === "component" && <div className={styles.content}>{component}</div>
      }

    </div>
  )
}

// 组件属性默认值
NoData.defaultProps = {
  text: '暂无数据',
}

export default NoData