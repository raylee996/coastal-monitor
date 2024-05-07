import React from "react";
import styles from "../boatMan/index.module.sass";
import {Image} from "antd";

const RelativeCarItem: React.FC = () => {
  return <div style={{padding: '10px'}}>
    <div className={styles.items}>
      {/*大图标*/}
      <div className={styles.img}>
        <Image
          width={80}
          height={80}
          src="https://cdn.pixabay.com/photo/2022/07/31/20/32/volkswagen-7356817_960_720.jpg"
        />
      </div>
      {/*小图标之类的*/}
      <div className={styles.icons_text}>
        <div>
          <p>车牌：粤A12345</p>
        </div>
        <div className={styles.text}>
          <p>邮轮码头</p>
          <p>2022-12-30 17:14</p>
        </div>
      </div>
    </div>
  </div>
}

const RelativeCar: React.FC = () => {
  return <>
    <RelativeCarItem/>
    <RelativeCarItem/>
    <RelativeCarItem/>
    <RelativeCarItem/>
  </>
}

export default RelativeCar
