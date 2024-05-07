
import { getSystemlogDetail } from "server/system";
import styles from "./index.module.sass";
import React, { useState, useEffect } from 'react';
import { Col, Row, Table} from "antd";
import XcEmpty from '../../../../component/XcEmpty'
import './index.sass'

interface Props {
    id?:string,
    type?:string
  }
  const colums = [
    {
        title:'字段名',
        dataIndex:'key',
        key:'key',
        width:100,
    },
    {
        title:'修改前',
        dataIndex:'value1',
        key:'value1',
        width:200,
        ellipsis:true
    },
    {
        title:'修改后',
        dataIndex:'value2',
        key:'value2',
        width:200,
        ellipsis:true
    },
]

const LogSearchInfo:  React.FC<Props> = ({id,type}) => {
    console.debug('LogSearchInfo')
    const [list,setList] = useState<any>()
    useEffect(()=>{
        async function main() {
            const vo = await getSystemlogDetail(id)
            // console.log(vo)
            setList(vo)
        }
        main()
    },[id])
    
    return (
        <article className={`${styles.wrapper} loginfo`}>
            <div className={styles.topTitle}>
                <p>日志类型：{list&&list.lodDesc}</p>
                <p>{type}内容：</p>
            </div>
            {type==='修改'&&
                <>
                <Table columns={colums} dataSource={list?.data}/>
                </>
            }
            {
                type !=='修改'&&
                <div style={{marginBottom:'20px',marginTop:'10px'}}>
                    {list&&list.data.length?list.data.map((item:any)=>{
                        return (<>
                            <Row className={`${styles.rowTowCommon}`}>
                                <Col span={6} className={styles.borderCol}>{item.key}：</Col>
                                <Col span={16} className={styles.detailContent} title={item.value}>{item.key!=='密码'?item.value:'************' || '--'}</Col>
                            </Row>
                        </>)
                    }):<XcEmpty/>}
                    
                </div>
            }
        </article>
    )
}

export default LogSearchInfo