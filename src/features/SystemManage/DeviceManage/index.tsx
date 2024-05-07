import {Col, Row, Tree, Button} from 'antd'
import windowstill from "hooks/basis/Windowstill";
import TableInterface from "hooks/integrity/TableInterface"
import { getUserTable } from "server/user";
import Direction from "./Directiontribut";
import styles from "./index.module.sass";
import { DownOutlined} from '@ant-design/icons'
import type {DataNode , TreeProps} from 'antd/es/tree'

const columns = [
    ['序号', 'id'],
    ['设备名称', 'devicename'],
    ['设备类型', 'devicetype'],
    ['设备编码', 'devicecode'],
    ['站点名称', 'statname'],
    ['设备地址', 'addr'],
    ['部门', 'dept'],
    [
        ['分配', (record: any) => {
            windowstill(<Direction />, { title: '分配设备' })
        }]
    ]
]


const DeviceDistribution: React.FC = () => {
    console.debug('DeviceDistribution')
    function showDirection() {
        windowstill(<Direction />, { title: '分配设备' })
    }

    const treeData: DataNode[] = [
        {
            title:'未分配设备',
            key:'1'
        },
        {
            title:'全部设备',
            key:'2',
            children:[
                {
                    title:'街道1',
                    key:'2-1'
                },{
                    title:'街道1',
                    key:'2-2'
                },{
                    title:'街道1',
                    key:'2-3'
                },{
                    title:'街道1',
                    key:'2-4'
                },
            ],
        }
    ]

    const onSelect:TreeProps['onSelect'] =(selectKeys,info)=>{
        console.log(selectKeys)
        console.log(info)
    }

    return (
        <article>
            <div className={styles.topCont}>
                <div>
                    注：未分配设备所有部门可查看，已分配设备支持所在部门及其上级部门查看
                </div>
                <div>
                    <Button onClick={showDirection}>分配</Button>
                </div>
            </div>
            <Row gutter={16}>
                <Col span={6}>
                    <Tree
                        showLine
                        switcherIcon={<DownOutlined/>}
                        defaultExpandedKeys={['2']}
                        onSelect={onSelect}
                        treeData={treeData}
                    />
                </Col>
                <Col span={18}>
                    <TableInterface
                        columns={columns}
                        request={getUserTable}
                    />
                </Col>
            </Row>
        </article>
    )
}

export default DeviceDistribution
