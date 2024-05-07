import ControlNumber from "./ControlNumber"
import ControlTrend from "./ControlTrend"
import CircleData from './component'
import { Row, Col } from 'antd'
import { doGetStatisticsCountByCategory, doGetStatisticsCountByTarget, doGetStatisticsWarningByCategory, doGetStatisticsWarningByTarget } from "server/statistics"

const WarnTotal: React.FC = () => {
     console.debug('WarnTotal')
     
     return (
          <article >
               <ControlNumber />
               <ControlTrend />
               <Row gutter={20} style={{ marginTop: '10px' }}>
                    <Col span={12}>
                         <CircleData title='人员布控分类统计' extraParams={{ controlCategory: 2 }} request={doGetStatisticsCountByCategory} />
                    </Col>
                    <Col span={12}>
                         <CircleData title='人员预警分类统计' extraParams={{ monitorType: "0101" }} request={doGetStatisticsWarningByCategory}/>
                    </Col>
               </Row>
               <Row gutter={20} style={{ marginTop: '10px' }}>
                    <Col span={12}>
                         <CircleData title='船舶布控分类统计' extraParams={{ controlCategory: 1 }} request={doGetStatisticsCountByCategory} />
                    </Col>
                    <Col span={12}>
                         <CircleData title='船舶预警分类统计' extraParams={{ monitorType: "0104,03" }} request={doGetStatisticsWarningByCategory}/>
                    </Col>
               </Row>
               <Row gutter={20} style={{ marginTop: '10px' }}>
                    <Col span={12}>
                         <CircleData title='布控对象统计' extraParams={{}} request={doGetStatisticsCountByTarget} />
                    </Col>
                    <Col span={12}>
                         <CircleData title='预警对象统计' extraParams={{}} request={doGetStatisticsWarningByTarget} />
                    </Col>
               </Row>

          </article>
     )
}

export default WarnTotal