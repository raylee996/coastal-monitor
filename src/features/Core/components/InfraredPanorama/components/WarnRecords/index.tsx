import { Empty } from "antd";
import ClientWebsocket from "helper/websocket";
import ImageSimple from "hooks/basis/ImageSimple";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
interface Props {
  data: any
}

const WarnCard: React.FC<Props> = ({ data }) => {
  console.debug('WarnCard')

  const { time, areaName, imgData, targetDistance, targetCenterPoint } = data

  return (
    <article className={styles.card}>
      <section className={styles.content}>
        <div className={styles.imgs}>
          <ImageSimple src={imgData} />
        </div>
        <div className={styles.info}>
          <div>{`时间：${time}`}</div>
          <div>{`区域：${areaName}`}</div>
          <div>{`坐标：${targetCenterPoint}`}</div>
          {/* <div>{`俯仰：${equipAngle}`}</div> */}
          <div>{`距离：${targetDistance}米`}</div>
        </div>
      </section>
    </article>
  )
}

interface WarnRecordsProps {
  /** 选中的红外全景设备id */
  clientWebsocket?: ClientWebsocket
}

const WarnRecords: React.FC<WarnRecordsProps> = ({ clientWebsocket }) => {
  console.debug('WarnRecords')

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    clientWebsocket?.onMessage(data => {
      const message = JSON.parse(data)
      // 接收响应
      if (message.code === 200) {
        // 红外全景预警信息
        if (message.module === '08' && message.cmd === '0804') {
          const res = message.data
          res?.targetDataList?.length && setData(() => {
            return [...res.targetDataList.map((item: any) => {
              // 通用字段，时间-角度
              item.time = res?.alarmTime || "";
              item.equipAngle = res?.equipAngle || 0;
              // 拼接坐标
              item.targetCenterPoint = [
                item.targetCenterPointX || 0,
                item.targetCenterPointY || 0,
              ].join(",");
              return item;
            })]
          })
        }
      }
    })
  }, [clientWebsocket])

  return (
    <article className={styles.wrapper}>
      {
        data?.length ? data.map(item => <WarnCard key={item.id} data={item} />) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }
    </article>
  )
}

export default WarnRecords