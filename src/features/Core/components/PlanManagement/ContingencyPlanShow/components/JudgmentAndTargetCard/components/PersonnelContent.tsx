import ImageSimple from 'hooks/basis/ImageSimple'
import styles from './index.module.sass'

interface Props {
    /** 数据 */
    data: any
}


const PersonnelContent: React.FC<Props> = ({ data }) => {

    return <article className={styles.wrapper}>
        <div className={styles.imageBox}>
            <ImageSimple src={data.picUrl} width={'100%'} height={'100%'} />
        </div>
        <div className={styles.content}>
            <div className={styles.topLable}>{`姓名：${data.userName}`}</div>
            <div className={styles.lable}>{`性别：${data.genderName}`}</div>
            <div className={styles.lable}>{`身份证：${data.idCard}`}</div>
            <div className={styles.lable}>{`车辆：${data.licensePlate}`}</div>
        </div>
    </article>
}


export default PersonnelContent