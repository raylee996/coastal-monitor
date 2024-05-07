import { Descriptions } from "antd";
import styles from "./index.module.sass";


export interface ShipPopupProps {
  name: string
  mmsi: string
  state: string
  speed: string | number
  course: string | number
  time: string
  lat: string | number
  lng: string | number
}

const ShipPopup: React.FC<ShipPopupProps> = ({ name, mmsi, state, speed, course, time, lat, lng }) => {
  console.debug('ShipPopup')

  return (
    <article className={`${styles.wrapper} core__popup-descriptions`}>
      <Descriptions className={styles.content} size='small' column={2}>
        <Descriptions.Item label="船名" span={2}>{name}</Descriptions.Item>
        <Descriptions.Item label="MMSI" span={2}>{mmsi}</Descriptions.Item>
        <Descriptions.Item label="状态" span={2}>{state}</Descriptions.Item>
        <Descriptions.Item label="航速(节)">{speed}</Descriptions.Item>
        <Descriptions.Item label="航向">{course}</Descriptions.Item>
        <Descriptions.Item label="经纬度" span={2}>{lng}/{lat}</Descriptions.Item>
        <Descriptions.Item label="更新时间" span={2}>{time}</Descriptions.Item>
      </Descriptions>
    </article>
  )
}

export default ShipPopup