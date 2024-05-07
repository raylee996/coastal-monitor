import React from "react";
import styles from "./index.module.sass";
import {Button, Image} from "antd";
import {IMAGE_FALL_BACK} from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import ArchiveInfo from "../../../../../../DataCenter/components/ArchiveInfo";

interface Props{
  peopleCarInfo?:any
}
const PeopleCarDetailTop:React.FC<Props> = ({peopleCarInfo})=>{
  //查看档案
  function viewArchive(){
    let archiveId = peopleCarInfo.archiveId
    let archiveType:any = 2
    switch (peopleCarInfo.archiveType) {
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
    popup(<ArchiveInfo type={archiveType} id={archiveId} />,
      {title:'档案',size:"fullscreen"})
  }
  return<div className={styles.wrapper}>
    <div className={styles.ShipInfo}>
      <div className={styles.img}>
        <Image
          width={80}
          height={80}
          fallback={IMAGE_FALL_BACK}
          src={peopleCarInfo.path}
        />
      </div>
      <div className={styles.content}>
        <div>{peopleCarInfo.target} </div>
        <div className={styles.blueFont} onClick={viewArchive}>查看档案</div>
      </div>
    </div>
    <div className={styles.behavior}>
      <span>行为:</span>
      {
        peopleCarInfo.eventTypeArr && peopleCarInfo.eventTypeArr.map((item:any,index:number)=>(
          <Button className={styles.tags} key={index}>{item}</Button>
        ))
      }
    </div>
  </div>
}

export default React.memo(PeopleCarDetailTop)
