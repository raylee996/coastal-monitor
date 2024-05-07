import ImageSimple from 'hooks/basis/ImageSimple'
import styles from './index.module.sass'

interface Props {
    /** 数据 */
    data: any
}


const ShipContent: React.FC<Props> = ({ data }) => {


    return <article className={styles.wrapper}>
        <div className={styles.imageBox}>
            <ImageSimple src={data.picUrl} width={'100%'} height={'100%'} />
        </div>
        <div className={styles.content}>
            <div className={styles.topLable}>{[data.shipName, data.codeValue || '--'].filter(v => v).join(' / ')}</div>
            <div className={styles.lable}>{`船型：${data.shipTypeName || '--'}`}</div>
            <div className={styles.lable}>{`分类：${data.focusTypeName || '--'}`}</div>
        </div>
    </article>
}


export default ShipContent