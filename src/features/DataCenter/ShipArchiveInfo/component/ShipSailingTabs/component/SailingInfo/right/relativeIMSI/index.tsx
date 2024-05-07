import React from "react";
import TableInterface from "hooks/integrity/TableInterface";
import {graphqlShipRelativeIMSIList} from "../../../../../../../../../server/ship";

const columns = [
  ['IMSI', 'IMSI'],
  ['点位', 'position'],
  ['时间', 'time'],
]

const RelativeIMSITable: React.FC = () => {
  return <>
    <TableInterface
      columns={columns}
      request={graphqlShipRelativeIMSIList}
      paginationProps={{
        showSizeChanger: false,
        size:'small'
      }}
    />
  </>
}

export default RelativeIMSITable
