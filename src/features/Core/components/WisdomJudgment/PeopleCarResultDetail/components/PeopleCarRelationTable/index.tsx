import React, {useEffect, useState} from "react";
import TableInterface from "hooks/integrity/TableInterface";
import {
  judgeResultListRelationAsync,
} from "../../../../../../../server/core/wisdomJudgment";
import _ from "lodash";
import {Button} from "antd";
import popup from "hooks/basis/Popup";
import ArchiveInfo from "../../../../../../DataCenter/components/ArchiveInfo";

interface Props{
  peopleCarInfo?:any
  changeObj?: Function
}
const PeopleCarRelationTable:React.FC<Props> = ({peopleCarInfo,changeObj})=>{
  const [params, setParams] = useState<any>('');
  const [activeRowId, setActiveRowId] = useState(false);

  useEffect(() => {
    _.unset(peopleCarInfo,'eventTypeArr')
    setParams({
      ...peopleCarInfo,
      objType:2,
      srcTagCode:peopleCarInfo.codeValue,
      srcCodeType: peopleCarInfo.codeType
    })
  /*  setParams({
      modelId:'1620966056683397122',
      srcTagCode:'1620966056792449026_23',
      objType:2
    })*/
  }, [peopleCarInfo]);

  const columns = [
    ['数据内容', 'tagCode'],
    ['数据类型', 'target'],
    ['关联类型', 'relationTypeNames'],
    ['最后出现时间', 'lastTime'],
    ['最后地址', 'lastAddress'],
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
  return<div style={{height:'300px'}}>
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

export default PeopleCarRelationTable
