import { Descriptions } from "antd";
import styles from "./index.module.sass";


interface Props {
  number: string
  speed: string
  course: string
  time: string
  lat: number
  lng: number
}

const RadarPopup: React.FC<Props> = ({ number, speed, course, time, lat, lng }) => {
  console.debug('RadarPopup')

  return (
    <article className={`${styles.wrapper} core__popup-descriptions`}>
      <Descriptions className={styles.content} size='small' column={2}>
        <Descriptions.Item label="雷达批号" span={2}>{number}</Descriptions.Item>
        <Descriptions.Item label="航速(节)">{speed}</Descriptions.Item>
        <Descriptions.Item label="航向">{course}</Descriptions.Item>
        <Descriptions.Item label="经纬度" span={2}>{lng}/{lat}</Descriptions.Item>
        <Descriptions.Item label="更新时间" span={2}>{time}</Descriptions.Item>
      </Descriptions>
    </article>
  )
}

export default RadarPopup