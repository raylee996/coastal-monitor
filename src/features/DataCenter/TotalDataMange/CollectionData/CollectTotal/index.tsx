import styles from "./index.module.sass";
import CodeData from "./CodeData"
import ComponentEchart from './ComponentEchart'

const CollectTotal: React.FC = () => {
    console.debug('CollectionData')

    return (
        <article className={styles.wrapper}>
            <CodeData />
            <ComponentEchart title="AIS数据统计" device="3" type={'4'} />
            <ComponentEchart title="雷达数据统计" device="4" type={'5,6'} isShowFusion={true} />
            <ComponentEchart title="人脸数据统计" device="1" type={'1'} businessFunction={3} />
            <ComponentEchart title="车牌数据统计" device="2" type={'1'} businessFunction={4} />
        </article>
    )
}

export default CollectTotal