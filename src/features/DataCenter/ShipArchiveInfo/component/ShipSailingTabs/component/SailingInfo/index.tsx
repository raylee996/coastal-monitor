import React from 'react';
import styles from './index.module.sass'
import SailingInfoLeft from "./left";
import SailingInfoCenter from "./center";
import SailInfoRight from "./right";
import "../../../../../dataCenter.sass";


//航行信息
const SailingInfo:React.FC = ()=> {
  return (
    <div className={styles.wrapper}>

      <div className={styles.left}>
        <SailingInfoLeft/>
      </div>
      <div className={styles.center}>
        <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>进出港记录</div>
        <SailingInfoCenter/>
      </div>
      <div className={styles.right}>
        <SailInfoRight/>
      </div>
    </div>
  );
}

export default SailingInfo;
