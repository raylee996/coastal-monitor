import React from "react";
import { Col, Row } from 'antd';
import styles from './index.module.sass'

interface Props {
  /** 案件详情数据 */
  data: any
}

const propData = [
  { label: '案件名称', prop: 'caseName', span: 24 },
  { label: '案件编号', prop: 'caseNo' },
  { label: '案情来源', prop: 'caseSourceName' },
  { label: '专案标识', prop: 'caseMarkName' },
  { label: '案情描述', prop: 'caseDescr', span: 24 },
  { label: '案件类别', prop: 'labelIdName' },
  { label: '发案地经纬度', prop: 'happenDimenName', span: 16 },
  { label: '案发时间', prop: 'happenTimeStr' },
  { label: '案发地区', prop: 'happenAreaFullName', span: 16 },
  { label: '发案地详址', prop: 'happenAddress', span: 24 },
  { label: '立案单位地区', prop: 'registerAreaFullName' },
  { label: '立案单位', prop: 'registerUnit', span: 16 },
  { label: '作案人数', prop: 'crimesPeoples', unit: '人' },
  { label: '作案手段', prop: 'crimesMeans' },
  { label: '作案特点', prop: 'crimesFeatures' },
  { label: '作案工具', prop: 'crimesTools', span: 24 },
  { label: '选择时机', prop: 'chooseOpportunity' },
  { label: '选择处所', prop: 'choosePremises', span: 16 },
  { label: '选择对象', prop: 'chooseObject' },
  { label: '选择物品', prop: 'chooseThing', span: 16 },
  { label: '死亡人数', prop: 'mortality', unit: '人' },
  { label: '受伤人数', prop: 'hurters', unit: '人' },
  { label: '损失价值', prop: 'lostValue', unit: '元' }
]

//案件基本信息
const CaseBaseInfo: React.FC<Props> = ({ data }) => {
  console.debug('CaseBaseInfo')

  return <article>
    <div className={styles.title}>案件基本信息</div>
    <Row className={styles.content}>
      {
        propData.map(item => {
          return <Col key={item.prop} span={item.span || 8} className={styles.itemBox}>
            <div className={styles.label}>{`${item.label}：`}</div>
            {
              data ? <div className={styles.text} title={data[item.prop]}>{(data[item.prop] || '--') + (item.unit || '')}</div> : <></>
            }
          </Col>
        })
      }
    </Row>
  </article>
}

export default CaseBaseInfo
