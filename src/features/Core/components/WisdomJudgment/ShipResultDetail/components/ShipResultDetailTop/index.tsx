import React from "react";
import styles from "./index.module.sass";
import {Button, Image, message} from "antd";
import {IMAGE_FALL_BACK} from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import ArchiveInfo from "../../../../../../DataCenter/components/ArchiveInfo";

interface Props {
  shipInfo?: any
}

const ShipResultDetailTop: React.FC<Props> = ({shipInfo}) => {
  //查看档案
  function viewArchive(){
    let archiveId = shipInfo.archiveId
    let archiveType:any = 1
    switch (shipInfo.archiveType) {
      case '0':
        archiveType = 2;
        break
      case '1':
        archiveType = 3;
        break
      case '3':
        archiveType = 1;
        break
    }
    if(!archiveId){
      message.error('暂无档案')
      return
    }
    popup(<ArchiveInfo type={archiveType} id={archiveId} />, {title:'档案',size:"fullscreen"})
  }
  return <div className={styles.wrapper}>
    <div className={styles.ShipInfo}>
      <div className={styles.img}>
        <Image
          width={80}
          height={80}
          fallback={IMAGE_FALL_BACK}
          src={shipInfo.path}
        />
      </div>
      <div className={styles.content}>
        <div>{shipInfo.target} </div>
        <div>船型: {shipInfo.shipType}</div>
        <div className={styles.blueFont} onClick={viewArchive}>查看档案</div>
      </div>
    </div>
    <div className={styles.behavior}>
      <span>行为:</span>
      {
        shipInfo.eventTypeArr && shipInfo.eventTypeArr.map((item: any, index: number) => (
          <Button className={styles.tags} size={"small"} key={index}>{item}</Button>
        ))
      }
    </div>
  </div>
}

export default React.memo(ShipResultDetailTop)
