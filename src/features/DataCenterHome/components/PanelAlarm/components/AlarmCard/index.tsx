import styles from "./index.module.sass";
import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback, useMemo } from "react";
import shipDefSrc from 'images/default/ship.png'
import { getDictName, ShipRiskDict } from "helper/dictionary";


interface Props {
  data: any
  onClick: (data: any) => void
}

const AlarmCard: React.FC<Props> = ({ data, onClick }) => {
  console.debug('AlarmCard')


  const riskLevelName = useMemo(() => {
    return getDictName(ShipRiskDict, data.riskLevel)
  }, [data])

  const address = useMemo(() => {
    if (data.monitorType === '05' || data.monitorType === '0101') {
      return data.deviceName
    } else {
      return data.address
    }
  }, [data])


  const handleClick = useCallback(() => {
    onClick(data)
  }, [data, onClick])


  return (
    <div className={styles.wrapper} >
      <div className={`${styles.card}  ${data.riskLevel === 1 ? styles.cardone : data.riskLevel === 2 ? styles.cardtwo : styles.cardthree}`}>

        <div className={`${styles.item} ${styles.cardImg}`}>
          <ImageSimple src={data.src} defaultSrc={shipDefSrc} width={'66px'} height={'66px'} style={{ border: "solid 1px #7d3132" }} />
        </div>

        <div className={`${styles.item} ${styles.cardInfo}`} onClick={handleClick}>

          <div className={`${styles.cardStatus} ${data.riskLevel === 1 ? styles.cardStatusone : data.riskLevel === 2 ? styles.cardStatustwo : styles.cardStatusthree}`}>{data.title}</div>

          {data.monitorType !== '05' &&
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>预警内容：</span>
              <span className={styles.cardValue}>{data.shipLicense}</span>
            </div>
          }

          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>风险等级：</span>
            <span className={styles.cardValue}>{riskLevelName}</span>
          </div>

          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>地点：</span>
            <span className={styles.cardValue}>{address}</span>
          </div>

          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>时间：</span>
            <span className={styles.cardValue}>{data.time}</span>
          </div>

        </div>
      </div>
    </div>
  )
}
export default AlarmCard