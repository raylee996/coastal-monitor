import ImageSimple from "hooks/basis/ImageSimple";
import styles from "./index.module.sass";


const PersonGallery: React.FC = (props: any) => {
    const { data } = props
    
    return (
        <div className={styles.panel}>
            <div className={styles.imgBox}>
                <div className={styles.imgItem}>
                    <ImageSimple width={'98px'} height={'98px'} src={data.path1} />
                </div>
                <div className={styles.imgItem}>
                    <ImageSimple width={'179px'} height={'98px'} src={data.path2} />
                </div>
            </div>
            <div className={styles.txt}>点位：<span>{data.device_code}</span></div>
            <div className={styles.txt}>时间：<span>{data.cap_time}</span></div>
        </div>
    )
}

export default PersonGallery
