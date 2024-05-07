import { Button } from "antd"
import TableInterface from "hooks/integrity/TableInterface";
import { useMemo } from "react"
import "./index.sass";

interface Props {
  /** 表格数据 */
  dataSource?: any[]
}

const RelationCode: React.FC<Props> = ({ dataSource }) => {
  console.debug('RelationCode')

  const columns = useMemo(() => {
    return [
      ['MMSI', 'mmis'],
      ['关联次数', 'relationNum'],
      ['归属地', 'belongArea'],
      ['操作', '', {
        itemProps: {
          width: '90px',
          render: (text: any, record: any) => {
            return (
              <Button type={"link"} onClick={() => openModelAdd(record)}>查看档案</Button>
            )
          }
        }
      }],
    ]
  }, [])

  function openModelAdd(record: any) {

  }

  return (
    <section className={'RelationCode__table'}>
      <TableInterface
        columns={columns}
        tableProps={{ dataSource }}
        isNotPagination={true}
      />
    </section>
  )
}

export default RelationCode