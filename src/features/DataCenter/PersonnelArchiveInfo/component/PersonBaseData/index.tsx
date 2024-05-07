
import { Tabs } from "antd";
import common from "helper/common";
import { useCallback, useMemo, useState } from "react";
import BaseData from "./component/BaseData";
import FaceData from "./component/FaceData";
import PopulationData from "./component/PopulationData";
import RelationData from "./component/RelationData";
import styles from "./index.module.sass";

interface IPersonBaseData {
    id: any
    personInfo?: any
    /** 菜单定位key */
    pageKey?: string
}


const PersonBaseData: React.FC<IPersonBaseData> = ({ id, personInfo, pageKey }) => {
    console.debug('ShipCaseData')

    const items = useMemo(() => [
        ...[{ label: '基本信息', key: 'item-0', children: <BaseData id={id} /> }], // 船舶信息-基本信息
        ...personInfo && !common.isNull(personInfo.personType) && personInfo.personType !== 4 ? [{ label: '人口信息', key: 'item-1', children: <PopulationData id={id} /> }] : [], // 船舶信息-船员信息
        { label: '关系图谱', key: 'item-2', children: <RelationData id={id} /> }, // '关系图谱'
        { label: '人脸库', key: 'item-3', children: <FaceData id={id} /> }, // '视图库'
    ], [id, personInfo])

    const [key, setKey] = useState<string>(pageKey || 'item-0')

    const handleChange = useCallback(
        (val: string) => {
            setKey(val)
        },
        [],
    )

    return (
        <article className={styles.wapper}>
            {/* <div>人员详情</div> */}
            <Tabs items={items} type="card" className={'dc-tabs-card'} tabPosition='top' activeKey={key} onChange={handleChange}>
            </Tabs>
        </article>
    )
}

export default PersonBaseData
