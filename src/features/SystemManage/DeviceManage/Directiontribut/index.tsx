import {Col, Row, Tree} from 'antd'
import { DownOutlined} from '@ant-design/icons'
import type {DataNode , TreeProps} from 'antd/es/tree'
import styles from "./index.module.sass";
const DeviceDirction: React.FC = () => {
    console.debug('DeviceDirction')
    const treeData: DataNode[] = [
        {
            title:'1',
            key:'1',
            children:[
                {
                    title:'1-1',
                    key:'1-1'
                }
            ],
        },
        {
            title:'2',
            key:'2',
            children:[
                {
                    title:'2-1',
                    key:'2-1'
                }
            ],
        }
    ]

    const onSelect:TreeProps['onSelect'] =(selectKeys,info)=>{
        console.log(selectKeys)
        console.log(info)
    }
    return (
        <article >
           <div>设备分配</div>
            <Row gutter={20}>
                <Col span={12}>
                    <div>设备名称：</div>
                    <div className={styles.leftcontents}></div>
                </Col>
                <Col span={12}>
                    <div>部门：</div>
                    <Tree
                        showLine
                        switcherIcon={<DownOutlined/>}
                        defaultExpandedKeys={['1']}
                        onSelect={onSelect}
                        treeData={treeData}
                    />
                </Col>
            </Row>
        </article>
    );
}

export default DeviceDirction;
