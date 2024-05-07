import { TableCardProps } from "hooks/flexibility/CardPanel"
import styles from "./index.module.sass"
import _ from "lodash";
import ImageSimple from "hooks/basis/ImageSimple";
import Checkbox from "antd/es/checkbox/Checkbox";
import { useCallback } from "react";


const ImageDataCard: React.FC<TableCardProps<any>> = ({ index, data, onSelect, radioData, onAction }) => {
  console.debug('ImageDataCard')


  const onclick = useCallback(
    () => {
      onSelect && onSelect(true, data)
    },
    [data, onSelect],
  )

  // 勾选CheckBox
  const handleChange = useCallback(
    (e: any) => {
      if (e.target.checked) {
        onAction && onAction('checked', data)
      } else {
        onAction && onAction('unchecked', data)
      }
    },
    [data, onAction],
  )

  // 预览用id来获取当前预览的位置，不能用index
  const handlePreview = useCallback(
    (id: string) => {
      onAction && onAction('preview', id)
    },
    [onAction],
  )


  return (
    <article className={`${styles.wrapper} ${(index + 1) % 4 === 0 ? styles.delMarginLeft : ''} ${_.isEqual(radioData, data) ? styles.active : styles.unActive}`} data-value={data} onClick={onclick}>
      <div className={styles.imgBox}>
        <Checkbox className={styles.checkbox} onChange={handleChange} />
        <ImageSimple className={styles.img} width={120} height={70} src={data.path} preview={false} onClick={() => handlePreview(data.id)} />
      </div>
      <div className={styles.content}>
        <div className={styles.text} title={data.deviceName}>{`设备：${data.deviceName || '--'}`}</div>
        {data.codeTypeName && <div className={styles.text} title={data.capTime}>{data.codeTypeName}：{data.content}</div>}
        {/* <p className={styles.text} title={data.capAddress}>{`点位：${data.capAddress || '--'}`}</p> */}
        <div className={styles.text} title={data.capTime}>时间：{data.capTime}</div>
      </div>
    </article>
  )
}

export default ImageDataCard