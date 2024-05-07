import { Button } from "antd";
import ImageSimple from "hooks/basis/ImageSimple";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import styles from "./index.module.sass";
import './index.css'
import { TableCardProps } from "hooks/flexibility/CardPanel";
import { useMemo } from "react";
import shipDefSrc from 'images/default/ship.png'
import popup from "hooks/basis/Popup";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";


const ImageCard: React.FC<TableCardProps<any>> = ({ data, activeData, onSelect }) => {
  console.debug('ImageCard')

  const [isSelected, setIsSelected] = useState(false)




  useEffect(() => {
    const [actData] = activeData
    setIsSelected(_.isEqual(data, actData))
  }, [data, activeData])


  const handleClick = useCallback(
    () => {
      onSelect(true, data)
    },
    [data, onSelect],
  )

  // 打开信息编辑窗口
  const handleViewArchive = useCallback(
    () => {
      let props: any = {}
      if (data.tagCodeType === 7) {
        props = {
          dataType: 2,
          radarNumber: data.tagCode
        }
      } else {
        props = {
          dataType: 1,
          mmsi: data.tagCode
        }
      }
      popup(<ShipArchiveInfo {...props} />, { title: '查看船舶档案', size: "fullscreen" })
    },
    [data],
  )

  const time = useMemo(() => {
    if (data.followMinutes > 60) {
      return `${_.floor(data.followMinutes / 60)}时${data.followMinutes % 60}分钟`
    } else {
      return `${data.followMinutes}分钟`
    }
  }, [data])

  const contentStateClassName = useMemo(() => isSelected ? styles.contentAct : styles.contentDef, [isSelected])

  const name = useMemo(() => data.tagCodeType === 7 ? data.tagTargetId : data.tagCode, [data])

  return (
    <article className={styles.wrapper}>
      <section>
        <div className={`${styles.content} ${contentStateClassName} ShipArchiveInfo__ImageCard`} onClick={handleClick}>
          <ImageSimple src={data.path} preview={false} defaultSrc={shipDefSrc} />
          <div className={styles.topRight}>{time}</div>
          <div className={styles.bottom}>{name}</div>
        </div>
      </section>
      <footer>
        <Button type="link" onClick={handleViewArchive}>查看档案</Button>
      </footer>
    </article>
  )
}

export default ImageCard