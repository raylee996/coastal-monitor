import { Descriptions } from "antd";
import { useState } from "react";
import styles from "./index.module.sass";


interface Data {
  modelName?: string
  eventName?: string
  firstTime?: string
  lastTime?: string
}

interface Props {
  data?: Data
}

const BehavirecordPopup: React.FC<Props> = ({ data }) => {
  console.debug('BehavirecordPopup')

  const [realData] = useState<Data>(() => {
    if (data) {
      return {
        modelName: '',
        eventName: '',
        firstTime: '',
        lastTime: '',
        ...data
      }
    } else {
      return {
        modelName: '',
        eventName: '',
        firstTime: '',
        lastTime: ''
      }
    }
  })


  return (
    <article className={`${styles.wrapper} core__popup-descriptions`}>
      <Descriptions size='small' column={1}>
        <Descriptions.Item label="模型" >{realData.modelName}</Descriptions.Item>
        <Descriptions.Item label="行为" >{realData.eventName}</Descriptions.Item>
        <Descriptions.Item label="开始时间" >{realData.firstTime}</Descriptions.Item>
        <Descriptions.Item label="结束时间" >{realData.lastTime}</Descriptions.Item>
      </Descriptions>
    </article>
  )
}

export default BehavirecordPopup