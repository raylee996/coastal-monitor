import React, {useState} from "react";
import styles from './index.module.sass'
import "../../../../../../dataCenter.sass";


interface ItemProps{
  //点击事件
  onClick: Function
  //激活状态
  activeStatus: boolean
}
// 航次Item
const SailInfoCenterItems: React.FC<ItemProps> = ({onClick,activeStatus}) => {
  return <div className={styles.item} onClick={()=>onClick()}>
    <div className={`${ activeStatus ? styles.active:''}`} style={{padding: '10px 40px'}}>
      <div className={styles.item_top}>
        <div className={styles.item_top_left}>
          <p className={`${styles.place}`}>盐田</p>
          <p>2022-10-30 10:25:23</p>
        </div>
        <div className={styles.item_top_center}>
          {/*<div style={{color:'#40a9ff'}}>在途</div>*/}
          <div>8h0m</div>
          <div className={styles.arrow}/>
          <div>18nm</div>
        </div>
        <div className={styles.item_top_right}>
          <p className={`${styles.place}`}>蛇口</p>
          <p>2022-10-31 12:25:23</p>
        </div>
      </div>
      <div className={styles.item_middle}></div>
      <div className={styles.item_bottom}>
        <div className={styles.item_bottom_left}>
          <p>航行：3h1m(18nm)</p>
        </div>
        <div className={styles.item_bottom_right}>
          <p>平均航速：6.1kn</p>
        </div>
      </div>
      <div className={styles.itemBottomLine}></div>
    </div>
  </div>
}

//航行信息的中间部分
const SailingInfoCenter: React.FC = () => {
  const [active, setActive] = useState(0);
  const [sailingList] = useState([
    {name:'item1'},
    {name:'item2'},
  ]);
  function handleClick(index:number){
    setActive(index)
  }
  return <>
    {sailingList.map((item,index)=>{
      return <SailInfoCenterItems
                activeStatus={ active === index }
                key={index}
                onClick={()=>handleClick(index)}/>
    })}
  </>
}

export default SailingInfoCenter
