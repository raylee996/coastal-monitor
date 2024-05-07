import { Button } from "antd";
import { useState } from "react";
import ShipRelationFleet from "../ShipRelationFleet";
import ShipRelationPeer from "../ShipRelationPeer";
import ShipRelationPort from "../ShipRelationPort";
import ShipRelationShipowners from "../ShipRelationShipowners";
import styles from "./index.module.sass";

interface Props{
  id: any
  shipData?:any
}

const ShipRelationTabs: React.FC<Props> = ({id,shipData}) => {
  console.debug('ShipRelation')
  // tabs切换按钮index
  const [btnActive, setbtnActive] = useState('0');// 默认
  
  // 传递给同行关系组件的值
  const [shipRelationId] = useState(()=>{
    if(shipData.mmsi){
      return shipData.mmsi
    }else if(shipData.radarNumber){
      return shipData.radarNumber
    }else if(shipData.targetId){
      return shipData.targetId
    }else {
      return ''
    }
  })

  const tabItems = [
    {
      key: '0',
      label: '同行关系',
    },
    {
      key: '1',
      label: '同船东',
    },
    {
      key: '2',
      label: '同港口',
    },
    {
      key: '3',
      label: '同船队',
    }

  ]

  function RenderBox() {
    switch (btnActive) {
      case '0':
        // 同行关系
        return (<ShipRelationPeer id={shipRelationId} />)
      case '1':
        // 同船东
        return (<ShipRelationShipowners id={id} />)
      case '2':
        // 同港口
        return (<ShipRelationPort id={id}/>)
      case '3':
        // 同船队
        return (<ShipRelationFleet id={id} />)
      default:
        return null
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* <div className={styles.boxTitle}>船舶信息-关系图谱</div> */}
      <div className={styles.boxTabs}>
        {
          tabItems.map((item: any, index: any) => {
            return (
              <Button
                className={styles.tabsBtn}
                type={`${btnActive === `${index}` ? 'primary' : 'default'}`}
                onClick={() => { setbtnActive(`${index}`) }}
              >{item.label}</Button>
            )
          })
        }
      </div>

      {/* 渲染区 */}
      <div className={styles.result}>
        <RenderBox />
      </div>
    </div>
  )
}

export default ShipRelationTabs
