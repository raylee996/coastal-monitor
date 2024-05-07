
import PlanConfigBlackName from "../PlanConfigBlackName";
import PlanConfigCarPerson from "../PlanConfigCarPerson";
import PlanConfigModel from "../PlanConfigModel";
import PlanConfigPlace from "../PlanConfigPlace";
import PlanConfigShip from "../PlanConfigShip";
import PlanConfigVideo from "../PlanConfigVideo";

interface Props {
    // 基本信息
    basicInfo: any
    // 地图对象
    mapObj: any,
    // 获取模型节点EventId
    getModelEventId?: (eventId: string) => void
}
// 模型配置的顶部预览部分
const PlanTopPreview: React.FC<Props> = ({
    basicInfo,
    mapObj,
    getModelEventId
}) => {

    // 获取智慧建模的eventId
    function handleEventId(eventId: string) {
        getModelEventId && getModelEventId(eventId)
    }

    return <article>
        {/* 船舶布控 */}
        {basicInfo.monitorType === '0104' && <PlanConfigShip basicInfo={basicInfo} map2D={mapObj} />}

        {/* 人车布控 */}
        {basicInfo.monitorType === '0101' && <PlanConfigCarPerson basicInfo={basicInfo} map2D={mapObj} />}

        {/* 黑名单 */}
        {basicInfo.monitorType === '06' && <PlanConfigBlackName basicInfo={basicInfo} />}

        {/* 智慧建模 */}
        {basicInfo.monitorType === '03' && <PlanConfigModel basicInfo={basicInfo} map2D={mapObj} getEventId={handleEventId} />}

        {/* 视频预警 */}
        {basicInfo.monitorType === '05' && <PlanConfigVideo basicInfo={basicInfo} map2D={mapObj} />}

        {/* 重点场所 */}
        {basicInfo.monitorType === '04' && <PlanConfigPlace basicInfo={basicInfo} map2D={mapObj} />}
    </article>
}

export default PlanTopPreview
