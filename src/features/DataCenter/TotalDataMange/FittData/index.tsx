import CommonData from '../component'
import { Row, Col, Card, Select } from 'antd'
import XcEcharts from "../../../../hooks/flexibility/EchartPanel";
const FittData: React.FC = () => {
    console.debug('FittData')
    const selectOption=[
        {id: 0,label:'测试1',value:1},
        {id: 1,label:'测试2',value:2},
        {id: 2,label:'测试3',value:3}
    ]
    
    const warnEchart ={
        tooltip: {
            trigger: 'item',
        },
        legend: {
            orient: 'vertical',
            left: 'right',
            top:'8%',
            itemHeight: 12
        },
        series: [
            {
                // name: '拟合信息',
                type: 'pie',
                radius: '50%',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center',
                        rich: {
                            totalText: {
                                fontSize: 12,
                                lineHeight: 20,
                                color: '#797979'
                            },
                            totalNumber: {
                                fontSize: 16,
                                color: '#4F6EF3'
                            }
                        }
                    },
                    emphasis: {
                        show: true
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 423, name: '二维拟合' },
                    { value: 1234, name: '三维拟合' },
                    { value: 4124, name: '四维拟合' },
                ]
            }
        ]
    }
    const controlEchart = {
        title:{
            text:'',
            left:'center'
        },
        xAxis:{
            type:"category",
            data:[1,2,3,4,5,6,7]
        },
        yAxis:{
            type:'value'
        },
        series:[
            {data:[2,3,4,5,6,7,8],type:'bar'}
        ]
    }

    return (
        <article >
           <CommonData title="拟合数量" type={1}/>
           <Row gutter={20} style={{marginTop:10}}>
               <Col span={12}>
                   <Card title="近一年拟合趋势" extra={
                       <Select style={{width:120}} options={selectOption}></Select>
                   }>
                    <div style={{height:'300px'}}>
                        <XcEcharts option={controlEchart} />
                    </div>   
                       
                   </Card>

               </Col>
               <Col span={12}>
                    <Card title="近一年拟合分布">
                        <div style={{height:'300px'}}>
                            <XcEcharts option={warnEchart} />
                        </div>   
                    </Card>
               </Col>
           </Row>

        </article>
    )
}

export default FittData