import React from "react";
import TableInterface from "hooks/integrity/TableInterface";
import {getShipSailingDetailListAsync} from "../../../../../../../../server/ship";

const columns = [
  ['动态', 'id'],
  ['时间', 'time'],
  ['港口', 'lan'],
]

const GoThroughPortTable:React.FC = ()=>{
  return<>
    <TableInterface
      columns={columns}
      request={getShipSailingDetailListAsync}
    />
  </>
}

export default GoThroughPortTable
