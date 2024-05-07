import React from "react";
import { Tabs } from "antd";
import styles from './index.module.sass'
import AisShip from "./AisShip";
import RadarTarget from "./RadarTarget";


//情指中心船舶列表
const ShipList: React.FC = () => {
  const items = [
    { label: 'AIS船舶', key: 'item-0', children: <AisShip /> },
    { label: '雷达目标', key: 'item-1', children: <RadarTarget /> },
  ];
  return <>
    <article className={styles.wrapper}>
      <Tabs type='card' className="core-tabs-card" items={items} />
    </article>
  </>
}

export default ShipList
