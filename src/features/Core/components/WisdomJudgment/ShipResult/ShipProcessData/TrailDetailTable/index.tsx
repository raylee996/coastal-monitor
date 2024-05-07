import React from "react";
import TableInterface from "hooks/integrity/TableInterface";

interface Props {
  sourceData?: any
}

const TrailDetailTable: React.FC<Props> = ({sourceData}) => {
  const column = [
    ['序号', 'index'],
    ['数据内容', 'content'],
    ['航速/节', 'speed'],
    ['时间', 'capTime'],
    ['行为', 'codeTypeName'],
  ]
  return <>
    <TableInterface
      tableDataSource={sourceData}
      columns={column}/>
  </>
}

export default TrailDetailTable
