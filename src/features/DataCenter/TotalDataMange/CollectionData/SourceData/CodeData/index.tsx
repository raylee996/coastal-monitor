
import TableInterface from "hooks/integrity/TableInterface"
import {  getAllSisdomSearchList } from "server/core/wisdomSearch"
import { InputType } from "hooks/flexibility/FormPanel"
import AreaPointDrawFrom from "component/AreaPointDrawFrom";


const CodeData: React.FC = () => {
    console.debug('CodeData')
    
    const CodeInputs: any[] = [
        ['时间范围', 'datetime', InputType.dateTimeRange, {
          allowClear: false
        }],
        ['点位', 'pointJsonList', InputType.component, {
          component: AreaPointDrawFrom,
          inputProps: {
            size: 'middle',
            style: { width: '180px' }
          },
          pointProps: {
            isPoint: true,
          }
        }],
        ['数据类型', 'codeType', InputType.select, {
          dict: [
            { name: "IMSI", value: 2 },
            { name: "IMEI", value: 3 },
            { name: "MAC", value: 4 },
            { name: "手机", value: 5 },
          ],
          style: { width: '80px' },
          allowClear: false
        }],
        ['', 'searchCondition']
      ]

    const columns = [
        // ['序号', 'id'],
        ['IMSI', 'imsi'],
        ['IMEI', 'imei'],
        ['MAC', 'mac'],
        ['手机号', 'phone'],
        ['点位', 'point'],
        ['地址', 'addr'],
        ['时间', 'createTime']
    ]
    
    return (
        <article style={{marginTop:10}}>
           
            <TableInterface
                columns={columns}
                queryInputs={CodeInputs}
                queryInit={{ codeType: 2 }}
                
                request={getAllSisdomSearchList}
            />
        </article>
    )
}

export default CodeData