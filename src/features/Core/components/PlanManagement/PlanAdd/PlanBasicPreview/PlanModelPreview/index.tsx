import Flowgraph from "features/Core/components/WisdomModel/component/flowgraph"
import { useEffect, useState } from "react";
import { getModelDetailAsync } from "server/core/model";
import styles from './index.module.sass'

interface Props {
    modelId: string | number
}
// 模型预览
const PlanModelPreview: React.FC<Props> = ({ modelId }) => {
    console.debug('PlanModelPreview')
    const [modelData, setModelData] = useState<any>();
    useEffect(() => {
        if (modelId === undefined) {
            setModelData(null)
        } else {
            //获取详情
            getModelDetailAsync(modelId).then(res => {
                setModelData(res.originalJson)
            })
        }
    }, [modelId])

    return <article className={styles.wrapper}>
        <Flowgraph
            showCondition={false}
            data={modelData}
            isNotShowConditionParams={false}
            isNotShowRemoveBtn={true}
            isShowMask={true}
            isGraphCenter={true}
            graphHeight={'434px'}
        />
    </article>
}

export default PlanModelPreview