import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback } from "react"
import styles from "./index.module.sass";


interface Props {
  data: any
  onClick: (data: any) => void
}

const CarCard: React.FC<Props> = ({ data, onClick }) => {
  console.debug('CarCard', data)


  const handleClick = useCallback(() => {
    onClick(data)
  }, [data, onClick])


  return (
    <article className={styles.wrapper} >
      <section>
        <ImageSimple className={styles.img} src={data.picUrls} />
      </section>
      <section className={styles.data} onClick={handleClick}>
        <div className={styles.info}>
          <div>车牌:</div>
          <div>{data.plateNo}</div>
        </div>
        <div className={styles.info}>
          <div>地点:</div>
          <div>{data.deviceName}</div>
        </div>
        <div className={styles.info}>
          <div>时间:</div>
          <div>{data.capTime}</div>
        </div>
      </section>
    </article>
  )
}

export default CarCard