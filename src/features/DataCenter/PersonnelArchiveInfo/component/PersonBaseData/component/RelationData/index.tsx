
import { Button } from "antd";
import Title from "component/Title";
import XcEchartsNode from "component/XcEchartsNode";
import popup from "hooks/basis/Popup";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef, useState } from "react";
import { getShipPeerTable } from "server/ship";
import Condition from "./components/Condition";
import RelationAdd from "./components/RelationAdd";

import styles from "./index.module.sass";


interface IRelationData {
    id: any
}

const RelationData: React.FC<IRelationData> = (props) => {
    console.debug('RelationData')
    const tableRef = useRef<any>(null)

    // tabs切换按钮index
    const [btnActive, setbtnActive] = useState<any>('0');// 默认
    const tabItems = [
        { label: '同行关系', key: 'item-0' },
        { label: '亲属关系', key: 'item-1' },
        { label: '朋友关系', key: 'item-2' },
        { label: '同学关系', key: 'item-3' },
        { label: '同事关系', key: 'item-4' },
        { label: '战友关系', key: 'item-5' }
    ]

    // 同行关系
    const columns = [
        ['序号', 'index'],
        ['数据类型', 'peerDataType'],
        ['自身数据', 'peerData'],
        ['伴随数据', 'shipName'],
    ]
    // 非同行关系
    const columns1 = [
        ['序号', 'myData'],
        ['关系类型', 'peerDataType'],
        ['身份', 'peerData'],
        ['姓名', 'peerTimes'],
        ['性别', 'peerTimes'],
        ['身份证号', 'peerTimes'],
        ['出生日期', 'peerTimes'],
        ['手机号', 'peerTimes'],
        ['IMSI', 'peerTimes'],
        [
            ['编辑', (record: any) => {

            }],
            ['删除', (record: any) => {

            }],
        ]
    ]

    function handleFinish(param?: any) {
        //筛选条件
    }

    // 表格右侧功能键区
    const toolsRight: any = [
        ['导入', {
            onClick: () => {
                //   popup(<><ImportFile api={"importPlaceList"} templateUrl={'/archive/place/down/template'} /></>, { title: '导入', size: "middle" })
            }
        }],
        ['新增', {
            onClick: () => {
                popup(<RelationAdd />, {
                    title: '新增',
                    size: "middle",
                    onCloseCallback: () => {
                        tableRef.current.onRefresh()
                    }
                })
            }
        }]
    ]

    return (
        <article className={styles.wapper}>
            <div className={styles.boxTabs}>
                {
                    tabItems.map((item: any, index: any) => {
                        return (
                            <Button className={styles.tabsBtn}
                                type={`${btnActive === `${index}` ? 'primary' : 'default'}`}
                                onClick={() => {
                                    setbtnActive(`${index}`)
                                }}
                            >{item.label}</Button>
                        )
                    })
                }
            </div>

            <Condition
                active={btnActive}
                defaultOpenKeys={["item-0"]}
                onFinish={handleFinish}
            />

            <div className={styles.boxEchartsNode}>
                <XcEchartsNode />
            </div>

            <div className={styles.panel}>
                <div className={styles.panelContent}>
                    <TableInterface
                        ref={tableRef}
                        columns={btnActive === '0' ? columns : columns1}
                        toolsRight={btnActive !== '0' ? toolsRight : []}
                        tools={[<Title title="数据详情" />]}
                        request={getShipPeerTable}
                    />
                </div>
            </div>
        </article>
    )
}

export default RelationData