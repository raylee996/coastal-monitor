import { TableCardProps } from "hooks/flexibility/CardPanel"
import { Checkbox } from "antd";
import styles from "./index.module.sass"
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import _ from "lodash";
import ImageSimple from "hooks/basis/ImageSimple";
import "../../../wisdomSearchUtils.sass"
import { useCallback } from "react";

const CarTableCardItem: React.FC<TableCardProps<any>> = ({
  index,
  data,
  activeData,
  radioData,
  onSelect,
  onRadio
}) => {
  console.debug('CarTableCardItem')


  const onChange = useCallback(
    ({ target: { checked } }: CheckboxChangeEvent) => {
      onSelect && onSelect(checked, data)
    },
    [data, onSelect],
  )

  const onclick = useCallback(
    () => {
      onRadio && onRadio(data)
    },
    [data, onRadio],
  )


  return (
    <article className={`${styles.wrapper} ${(index + 1) % 3 === 0 ? styles.delMarginLeft : ''} ${_.isEqual(radioData, data) ? 'card__active' : 'card__unActive'}`} data-value={data} onClick={onclick}>
      <div className={styles.imgBox}>
        <div className={styles.smallImg}><ImageSimple src={data.path} width={'100%'} height={'100%'} /></div>
        <div className={styles.bigImg}><ImageSimple src={data.path2} width={'100%'} height={'100%'} /></div>
      </div>
      <div className={styles.content}>
        <div className={styles.text}>{`车牌：${data.content || '--'}`}</div>
        <div className={styles.text} title={data.vehicleTypeName}>{`车型：${data.vehicleTypeName || '--'}`}</div>
        <div className={styles.text} title={data.capAddress}>{`点位：${data.capAddress || '--'}`}</div>
        <div className={styles.text} title={data.capTime}>{`时间：${data.capTime}`}</div>
      </div>
      <Checkbox checked={_.find(activeData, data)} onChange={onChange} />
    </article>
  )
}

export default CarTableCardItem