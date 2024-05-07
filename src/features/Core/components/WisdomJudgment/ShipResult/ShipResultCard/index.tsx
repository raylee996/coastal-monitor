import React, {useEffect, useState} from "react";
import {Button, Image} from 'antd'
import styles from './index.module.sass'
import popup from "hooks/basis/Popup";
import ShipResultDetail from "../../ShipResultDetail";
import {shipResultCardFormat} from "../../../../../../server/core/wisdomJudgment";
import {IMAGE_FALL_BACK} from "hooks/basis/ImageSimple";

interface Props {
  data?:any
}
const ShipResultCard:React.FC<Props> = ({data})=>{
  const [cardInfo, setCardInfo] = useState<any>({
    path:'',
    target:'',
    eventTypeArr:[]
  });
  useEffect(() => {
    shipResultCardFormat(data).then(res=>{
      setCardInfo(res)
    })
  }, [data]);

  function openDetail(cardInfo:any){
    popup(<ShipResultDetail data={cardInfo}/>,{title:'查看',size:'fullscreen'})
  }

  return<div className={styles.card}>
    <div className={styles.cardItem}>
      <div className={styles.img}>
        <Image
          width={80}
          height={80}
          fallback={IMAGE_FALL_BACK}
          src={cardInfo.path}
        />
      </div>
      <div className={styles.content}>
        <div>{cardInfo.target}</div>
        <div style={{marginBottom:'6px'}}>
          {
            cardInfo.eventTypeArr.map((item:any,index:number)=>(
              <Button className={styles.tags} size={"small"} key={index}>{item}</Button>
            ))
          }
        </div>
        <Button type={"primary"} size={"middle"} onClick={()=>openDetail(cardInfo)}>查看</Button>
      </div>
    </div>
  </div>
}

export default ShipResultCard
