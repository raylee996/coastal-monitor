import { ClockCircleOutlined } from '@ant-design/icons'
import XcEmpty from 'component/XcEmpty'
import { clueContentDict, getDictName } from 'helper/dictionary'
import styles from './index.module.sass'

interface Props {
  /** 行为分析数据 */
  behaviorAnalysis?: any[]
}

const BehaviorAnalysis: React.FC<Props> = ({ behaviorAnalysis }) => {
  console.debug('BehaviorAnalysis')

  const returnBg = (level: number) => {
    let src = ''
    switch (level) {
      case 1:
        src = 'high'
        break;
      case 2:
        src = 'medium'
        break;
      case 3:
        src = 'low'
        break;
      case 4:
        src = 'no'
        break;
      default:
        src = 'no'
        break;
    }
    return `url(${require(`images/core/wisdomCommand/${src}Risk.png`)})`
  }

  return (
    <article className={styles.wrapper}>
      {
        behaviorAnalysis?.length ? behaviorAnalysis.map(item => {
          return <div key={item.id} className={styles.cardBox}>
            <div className={styles.cardItem}>
              <div className={styles.topBox}>
                <div><span className={styles.icon}><ClockCircleOutlined /></span>{item.warnTime}&nbsp;&nbsp;{item.speed ? `${item.speed}节` : ''}</div>
                <div className={styles.level} style={{ backgroundImage: returnBg(item.riskLevel) }}>{item.riskLevelName}</div>
              </div>
              <div>{`${getDictName(clueContentDict, item.contentType) || '目标'}：${item.warnContent || '--'}`}</div>
              {item.monitorName && <div className={`${styles.textBold} ${styles.textColor}`}>{`${item.dataType === 1 ? '预警名称' : '行为'}：${item.monitorName}`}</div>}
              {item.warnAddr && <div>{`预警地点：${item.warnAddr}`}</div>}
              <div>{`经纬度：${item.lonLat || '--'}`}</div>
              {item.plan && <div>{`预案：${item.plan}`}</div>}
              {item.handle && <div>{`处置：${item.handle}`}</div>}
              {
                item.dealRecord && <div className={styles.dealRecord}>
                  <div>{`处理意见：${item.dealRecord.opinionTypeName}`}</div>
                  <div>{`备注：${item.dealRecord.remark}`}</div>
                  <div>{`处理人：${item.dealRecord.createName}`}</div>
                  <div>{`处理时间：${item.dealRecord.createTime}`}</div>
                </div>
              }
            </div>
            <div className={styles.line}></div>
          </div>
        }) : <XcEmpty />
      }
    </article>
  )
}

export default BehaviorAnalysis