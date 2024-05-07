import { TableCardProps } from "hooks/flexibility/CardPanel"
import styles from "./index.module.sass"
import _ from "lodash";
import ImageSimple from "hooks/basis/ImageSimple";

const CarTableCardItem: React.FC<TableCardProps<any>> = ({ data, radioData }) => {
  console.debug('CarTableCardItem')


  return (
    <article className={`${styles.wrapper} ${_.isEqual(radioData, data) ? styles.active : styles.unActive}`} data-value={data}>
      <div className={styles.imgBox}>
        <ImageSimple className={styles.img1} src={data.path} />
        <ImageSimple className={styles.img2} src={data.path2} />
      </div>
      <div className={styles.content}>
        <p className={styles.text} title={data.car_typeName}>{`车牌：${data.content || '--'}`}</p>
        <p className={styles.text} title={data.car_typeName}>{`车型：${data.vehicleTypeName || '--'}`}</p>
        <p className={styles.text} title={data.capAddress}>{`点位：${data.capAddress || '--'}`}</p>
        <p className={styles.text} title={data.capTime}>{data.capTime}</p>
      </div>
    </article>
  )
}

export default CarTableCardItem