import styles from "./index.module.sass";
import TableInterface from "hooks/integrity/TableInterface"
import { useEffect, useMemo, useState } from "react"
import { getShipInfoWarnList } from "server/ship"
import { PaginationProps, TableProps } from "antd";
import { useAppDispatch } from "app/hooks";
import windowUI from "component/WindowUI";
import WarningDetail from "../WarningModel/components/WarningDetail";


const tableProps: TableProps<any> = {
  size: 'small'
}

const paginationProps: PaginationProps = {
  showQuickJumper: false,
  showSizeChanger: false,
  size: 'small',
  pageSize: 5
}

const columns = [
  ['预警时间', 'warnTime'],
  ['预警地点', 'warnAddr', {
    itemProps: {
      render: (text: any, record: any) => {
        // console.log(record)
        let latLng = record.longitude + ',' + record.latitude
        return text ? text : latLng
      }
    }
  }],
  ['类型', 'warnTypeName', { itemProps: { width: 60 } }],
  ['等级', 'riskLevelName', { itemProps: { width: 60 } }],
  // [
  //   ['预警回溯', (record: any) => {
  //     windowstill(<TargetWarnDetail data={record} />, {
  //       title: `预警详情`,
  //       key: '预警详情',
  //       width: '480px',
  //       height: 'auto',
  //       offset: [1400, 160]
  //     })
  //   }],
  // ]
]

interface Props {
  mmsi?: any
  /**雷达批号 */
  batchNum?: any
  /** 融合id */
  targetId?: any
  /** 预警信息截至时间 */
  endTime?: string
}

const WarningTable: React.FC<Props> = ({ mmsi, batchNum, targetId, endTime }) => {
  console.debug('WarningTable')

  const dispatch = useAppDispatch()

  const [active, setActive] = useState<any>()

  const extraParams = useMemo(() => {
    let result: any = undefined
    if (targetId) {
      result = { targetId }
    } else if (mmsi) {
      result = { mmsi }
    } else if (batchNum) {
      result = { batchNum }
    }
    if (endTime) {
      result = { ...result, endTime }
    }
    return result
  }, [mmsi, batchNum, targetId, endTime])

  const tableOptions = useMemo(() => ({
    onRowClick(record: any) {
      setActive(record)
    }
  }), [])

  useEffect(() => {
    active && windowUI(<WarningDetail id={active.warnContent} contentType={active.contentType} parentDate={active} />, { title: `预警详情`, key: '预警详情', width: '480px', height: '800px', offset: [1400, 40] })
  }, [active, dispatch])

  return (
    <article className={styles.wrapper}>
      <TableInterface
        extraParams={extraParams}
        request={getShipInfoWarnList}
        columns={columns}
        tableProps={tableProps}
        paginationProps={paginationProps}
        tableOptions={tableOptions}
      />
    </article>
  )
}

export default WarningTable