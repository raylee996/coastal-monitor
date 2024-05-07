import { Button } from "antd";
import ImageSimple from "hooks/basis/ImageSimple";
import _ from "lodash";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import './index.css'
import { TableCardProps } from "hooks/flexibility/CardPanel";
import popup from "hooks/basis/Popup";
import common from "helper/common";
import CarArchiveInfo from "features/DataCenter/CarArchiveInfo";
// import { useMemo } from "react";

// 关联-车辆档案
const RelevanceCarCard: React.FC<TableCardProps<any>> = ({ data, activeData, onSelect }) => {
  console.debug('ImageCard')
  
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    const [actData] = activeData
    setIsSelected(_.isEqual(data, actData))
  }, [data, activeData])

  function handleClick() {
    onSelect(true, data)
  }
  

  const contentStateClassName = isSelected ? styles.contentAct : styles.contentDef
  
  function handleShowRecord(data:any){
    // 显示档案
    if(common.isNull(data.archiveId)){
      common.showMessage({msg:'档案ID缺失',type:'error'})
      return
    }
    popup(<CarArchiveInfo carId={data.archiveId} />, { title: '车辆档案详情', size: "fullscreen" })

  }

  return (
    <article className={styles.wrapper}>
      <section>
        <div className={`${styles.content} ${contentStateClassName} ShipArchiveInfo__ImageCard`} onClick={handleClick}>
          <ImageSimple src={data.path} preview={false} />
          <div className={styles.topRight}>{data.relationCount}次</div>
          <div className={styles.bottom}>{data.mmsi}</div>
        </div>
      </section>
      <footer>
        <Button type="link" onClick={()=>{handleShowRecord(data)}}>查看档案</Button>
      </footer>
    </article>
  )
}

export default RelevanceCarCard