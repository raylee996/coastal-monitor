import React, {useEffect, useState} from "react";
import TableInterface from "hooks/integrity/TableInterface";
import _ from "lodash";
import {judgeResultListRelationAsync} from "../../../../../../../server/core/wisdomJudgment";
import popup from "hooks/basis/Popup";
import ArchiveInfo from "../../../../../../DataCenter/components/ArchiveInfo";
import {Button} from "antd";

interface Props{
  shipInfo?:any
  changeObj?: Function
}
const ShipResultRelationTable:React.FC<Props> = ({shipInfo,changeObj})=>{
  const [params, setParams] = useState<any>('');
  const [activeRowId, setActiveRowId] = useState(false);

  useEffect(() => {
    _.unset(shipInfo,'eventTypeArr')
    setParams({
      ...shipInfo,
      objType:1,
      srcTagCode:shipInfo.codeValue,
      srcCodeType: shipInfo.codeType
    })
   /*  setParams({
      modelId:'1615597136145375234',
      srcTagCode:'220220220',
      objType:1
    })*/
  }, [shipInfo]);
  const columns = [
    ['数据内容', 'tagCode'],
    ['数据类型', 'target'],
    ['关联类型', 'relationTypeNames'],
    ['关联说明', 'relationDetailNames'],
    ['行为', 'detailEventTypeNames'],
    ['操作', '',{
      itemProps: {
        width:'260px',
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={()=>{
                popup(<ArchiveInfo type={record.archiveType} id={record.archiveId} />,
                  {title:'档案',size:"fullscreen"})
              }}>查看档案</Button>
            </>
          )
        }
      }
    }],
  ]
  return<div  style={{height:'300px'}}>
    <TableInterface
      extraParams={{...params}}
      columns={columns}
      request={judgeResultListRelationAsync}
      paginationProps={{
        pageSize:3,
        showTotal: (total: number) => {
          return `总数 : ${total}`
        }
      }}
      tableProps={{
        onRow: record => {
          return {
            onClick: () => {
              changeObj && changeObj({targetType:record.targetType,targetValue:record.targetValue})
              setActiveRowId(record.targetValue)
            }, // 点击行
          }
        },
        rowClassName: (record, index) => `ant-table-row ant-table-row-level-0 ${record.targetValue === activeRowId ? 'ant-table-row-selected' : ''} table-${index % 2 === 0 ? 'even' : 'odd'}`
      }}
    />
  </div>
}

export default ShipResultRelationTable
