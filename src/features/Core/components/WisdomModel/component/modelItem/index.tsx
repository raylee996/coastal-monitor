import React from "react";
import styles from './index.module.sass'
import _ from "lodash";
import { TableCardProps } from "hooks/flexibility/CardPanel";


interface WisdomModelDataProps {
  /**预警标题*/
  title: string
  /**风险等级*/
  warningLevel: number,
  /** 是否开启*/
  enable: boolean
  /**预警条件*/
  warningCondition: string
  /**预警次数*/
  warningCount: number,

}


/*模型列表*/
const ModelItem: React.FC<TableCardProps<WisdomModelDataProps>> = ({ data, onSelect, activeData }) => {
  console.debug('ModelItem')

  const { title, warningLevel, enable, warningCondition, warningCount } = data

  //多选卡片
 /* const [isSelect, setIsSelect] = useState(false)
  useEffect(() => {
    const is = _.some(activeData,data)
    setIsSelect(is)
  }, [data, activeData])
  function handleClick() {
    onSelect && onSelect(!isSelect, data)
  }*/

  //单选卡片
  function handleClick() {
    onSelect && onSelect(true, data)
  }
  return (
    <div className={`${styles.wrapper} ${_.some(activeData,data) ? styles.active : styles.unActive}`} onClick={handleClick}>
      <div className={styles.modelTitle}>
        <div className={styles.modelTitleLeft}>
          {warningLevel === 1 && <span className={`${styles.dot} ${styles.red}`} />}
          {warningLevel === 2 && <span className={`${styles.dot} ${styles.orange}`} />}
          {warningLevel === 3 && <span className={`${styles.dot} ${styles.yellow}`} />}
          {title}
        </div>
        {enable && <div className={styles.modelEnable}>已开启</div>}
        {!enable && <div className={styles.modelDisable}>已关闭</div>}
      </div>
      <div className={styles.warningCondition}>预警条件：{warningCondition}</div>
      <div className={styles.warningCount}>预警次数：{warningCount}</div>
    </div>
  )
}

export default ModelItem
