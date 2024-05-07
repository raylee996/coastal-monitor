import React from "react";
import TableInterface from "hooks/integrity/TableInterface";
interface Props{
  tableData?:any,
}
const PeopleCarTrailTable:React.FC<Props> = ({tableData})=>{
  const columns = [
    ['序号', 'index'],
    ['数据内容', 'content'],
    ['地址', 'capAddress'],
    ['时间', 'capTime'],
  ]

  return<>
    <TableInterface
      columns={columns}
      tableDataSource={tableData}
      paginationProps={{
        showTotal: (total: number) => {
          return `总数 : ${total}`
        }
      }}
    />
  </>
}

export default PeopleCarTrailTable
