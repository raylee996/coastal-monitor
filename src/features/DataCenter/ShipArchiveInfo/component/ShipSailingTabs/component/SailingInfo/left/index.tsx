import React, {useState} from "react";
import styles from './index.module.sass'
import './index.css'
import { Collapse } from 'antd';
import "../../../../../../dataCenter.sass";



const { Panel } = Collapse;
const SailingInfoLeft:React.FC = ()=>{
  const [activeIndex, setActiveIndex] = useState(0);
  const timeList = [
    {time:'2022-12-30 13:25'},
    {time:'2022-12-29 12:11'},
    {time:'2022-12-28 15:08'},
    {time:'2022-12-27 22:23'},
    {time:'2022-12-26 10:29'},
    {time:'2022-12-25 16:32'},
  ]

  //点击当前时间
  function selectCurrentTime(index:number){
    setActiveIndex(index)
  }
  return<div className={styles.wrapper}>
    <Collapse accordion defaultActiveKey={['12']} className="dc-collapse">
      <p className={`${styles.yearTitle} collapse-title`}>2022年</p>
      <Panel header="十二月" key="12"  className={`collapse-plane`}>
        {
          timeList.map((item,index)=>{
            return <p className={`${styles.leftTime} ${activeIndex===index ? styles.leftTimeActive:''}` }
                      key={index}
                      onClick={()=>selectCurrentTime(index)}>{item.time}</p>
          })
        }
      </Panel>
      <Panel header="十一月" key="11">
        <p>2</p>
      </Panel>
      <Panel header="十月" key="10">
        <p>2</p>
      </Panel>
      <Panel header="九月" key="9">
        <p>2</p>
      </Panel>
      <Panel header="八月" key="8">
        <p>2</p>
      </Panel>
      <Panel header="七月" key="7">
        <p>2</p>
      </Panel>
      <Panel header="六月" key="6">
        <p>2</p>
      </Panel>
    </Collapse>
  </div>
}

export default SailingInfoLeft
