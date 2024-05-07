import React from "react";
import {Tabs} from "antd";
import BoatMan from "./boatMan";
import RelativeFace from "./relativeFace";
import RelativeCar from "./relativeCar";
import RelativeIMSI from "./relativeIMSI";

const SailInfoRight:React.FC = ()=>{
  const items = [
    { label: '船员信息', key: 'item-1', children: <BoatMan/> }, // 务必填写 key
    { label: '关联人脸', key: 'item-2', children: <RelativeFace/> },
    { label: '关联车辆', key: 'item-3', children: <RelativeCar/> },
    { label: '关联侦码', key: 'item-4', children: <RelativeIMSI/> },
  ];
  return<>
    <Tabs items={items} type={'card'}/>
  </>
}

export default SailInfoRight
