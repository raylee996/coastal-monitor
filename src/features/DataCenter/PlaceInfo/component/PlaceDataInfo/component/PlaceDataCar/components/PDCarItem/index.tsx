
import ImageSimple from "hooks/basis/ImageSimple";
import styles from "./index.module.sass";
import './index.sass'


interface Props {
  data?: any
  onSelect?: any
}

const PDCarItem: React.FC<Props> = ({ data, onSelect }) => {
  console.debug('PDCarItem')


  return (
    <div className={styles.wrapper} onClick={() => {
      onSelect(true, data)
    }}>
       <div className={styles.imgBox}>
        <ImageSimple className={styles.img1} src={data.path} />
        <ImageSimple className={styles.img2} src={data.path2} />
      </div>
      <div className={styles.content}>
        <p className={styles.text} title={data.car_typeName}>{`车牌：${data.content || '--'}`}</p>
        <p className={styles.text} title={data.car_typeName}>{`车型：${data.vehicleTypeName || '--'}`}</p>
        <p className={styles.text} title={data.capAddress}>{`地点：${data.capAddress || '--'}`}</p>
        <p className={styles.text} title={data.capTime}>{data.capTime}</p>
      </div>
    </div>
  )
}


export default PDCarItem