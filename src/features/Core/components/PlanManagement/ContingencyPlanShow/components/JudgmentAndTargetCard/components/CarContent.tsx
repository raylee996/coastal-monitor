import ImageSimple from 'hooks/basis/ImageSimple'
import styles from './index.module.sass'

interface Props {
    /** 数据 */
    data: any
}


const CarContent: React.FC<Props> = ({ data }) => {


    return <article className={styles.wrapper}>
        <div className={styles.imageBox}>
            <ImageSimple src={data.picUrl} width={'100%'} height={'100%'} />
        </div>
        <div className={styles.content}>
            <div className={styles.topLable}>{`车牌号：${data.licensePlate}`}</div>
            <div className={styles.lable}>{`车型：${data.vehicleTypeName}`}</div>
            <div className={styles.lable}>{`车主：${data.userName}`}</div>
        </div>
    </article>
}


export default CarContent