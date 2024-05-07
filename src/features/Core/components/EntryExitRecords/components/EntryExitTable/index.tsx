import { Form, FormInstance, message, TableProps } from "antd";
import XcEmpty from "component/XcEmpty";
import dayjs from "dayjs";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import { isEntryPortDict } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import { ActionType, ColType } from "hooks/flexibility/TablePanel";
import TableInterface, { PageInfo, TableInfo } from "hooks/integrity/TableInterface"
import { useCallback, useMemo, useRef, useState } from "react";
import { getAllEntryExitPort } from "server/core/entryExitRecords";
import { getShipBaseInfo } from "server/ship";
import RecordsDetail from "../RecordsDetail";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'
import TrajectoryAnalysis from "features/Core/components/WisdomSearch/components/TrajectoryAnalysis";
import { DayjsPair } from "hooks/hooks";
import { doDelShipList } from "server/search";


interface Props {
  /** 外部api */
  request?: (pageInfo: PageInfo, params: any) => Promise<TableInfo>
  /** 外部额外请求参数 */
  requestParams?: any
  tableForm?: FormInstance<any>
  isShowPlaceSelect?: boolean
  /** 初始化查询数据 */
  queryInitData?: any
}

const EntryExitTable: React.FC<Props> = ({
  request,
  requestParams,
  tableForm,
  isShowPlaceSelect,
  queryInitData
}) => {
  console.debug('EntryExitTable')


  const TableRef = useRef<any>(null)


  const [form] = Form.useForm(tableForm);
  const formPlaceId = Form.useWatch('placeId', form)


  const [active, setActive] = useState<any>()
  const [queryFormInit] = useState(queryInitData ? queryInitData : { datetime: [dayjs().hour(0).minute(0).second(0), dayjs()] })


  const controlInputs = useMemo(() => {
    const result: any[][] = []
    if (isShowPlaceSelect) {
      result.push(['港口', 'placeId', InputType.selectRemote, {
        request: getAllEntryExitPort,
        placeholder: '请选择港口',
        style: {
          width: '120px'
        }
      }])
    }
    result.push(
      ['进出港', 'isEntry', InputType.select, {
        dict: isEntryPortDict,
        style: { width: '140px' }
      }],
      ['船舶', 'searchValue', {
        placeholder: 'MMSI/船名',
        allowClear: true,
        style: { width: '140px' }
      }],
      ['时间', 'datetime', InputType.dateTimeRange, {
        style: { width: '340px' }
      }]
    )
    return result
  }, [isShowPlaceSelect])


  const handleMapShow = useCallback(
    (record: any) => {
      // 进出港记录未融合上轨迹时 不开轨迹回放
      if (!record?.codeValue) {
        message.error('该记录暂无轨迹信息！')
        return
      }
      const datetime: DayjsPair = [dayjs(record.capTime).subtract(1, 'h'), dayjs(record.capTime).add(1, 'h')]
      const params = { datetime }
      popup(
        <TrajectoryAnalysis
          codeType={record.codeType}
          targetList={[record]}
          params={params}
        />, {
        title: '轨迹回放',
        size: 'fullscreen'
      })
    },
    []
  )

  const openShipInfo = useCallback(
    async (record: any) => {
      const typeToKey: { [key: number]: any } = {
        // 内容类型 6-MMSI 7-雷达目标 8-目标ID
        6: { key: 'mmsi', api: getShipBaseInfo },
        7: { key: 'radarNumber', api: getShipBaseInfo },
        8: { key: 'targetId', api: getShipBaseInfo },
      }
      if (Object.keys(typeToKey).map(String).includes(record?.codeType + "")) {
        const para: { [key: string]: any } = {}
        para[typeToKey[record?.codeType].key] = record?.codeValue
        const vo = await typeToKey[record?.codeType].api(para)
        // 判断是否可查询到船舶档案信息
        if (vo?.id) {
          popup(<ShipArchiveInfo id={vo.id} dataType={vo.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
        } else {
          message.warning('该目标无档案！')
        }
      }
      else {
        message.warning('该船舶暂无档案！')
      }
    },
    [],
  )

  const handleRequest = useCallback(
    (data: any[]) => {
      setActive(data?.length ? data[0] : null)
    },
    [],
  )
  const deleteShipInfo = useCallback(
    async (data: any) => {
      await doDelShipList({ id: data.id })
      TableRef.current.onRefresh()
    }, [])


  const columns = useMemo(() => {
    const baseA = [
      ['照片', 'picUrl', ColType.image, {
        itemProps: {
          render: (text: any, record: any) => {
            return (
              <ImageSimple width={60} height={60} src={record.picUrl} defaultSrc={shipDefSrc} />
            )
          }
        }
      }],
      ['船名', 'shipName'],
      ['MMSI/雷达批号', 'codeValue'],
      ['船型', 'shipTypeName'],
      ['进港/出港', 'isEntryName'],
      ['港口', 'placeName'],
    ]
    const baseB = [
      ['时间', 'capTime'],
      [
        ['轨迹回放', (record: any) => handleMapShow(record)],
        ['档案', (record: any) => openShipInfo(record)],
        ['删除', ActionType.confirm, (record: any) => deleteShipInfo(record)],
      ]
    ]
    const baseC = [
      ['置信度', 'fitRate']
    ]

    if (formPlaceId === '67') {
      return [...baseA, ...baseC, ...baseB]
    } else {
      return [...baseA, ...baseB]
    }
  }, [formPlaceId, handleMapShow, openShipInfo, deleteShipInfo])


  const rightComponent = useMemo(() => {
    return {
      component: (
        <div className={styles.detail}>
          {active ? <RecordsDetail active={active} /> : <XcEmpty />}
        </div>
      )
    }
  }, [active])

  const tableProps = useMemo<TableProps<any>>(() => {
    return {
      rowKey: (record) => `${record?.id}`,
      onRow: record => {
        return {
          onClick: (event: any) => {
            setActive(record)
          }, // 点击行
        }
      },
      rowClassName: (record, index) => `ant-table-row ant-table-row-level-0 ${`${record.id}` === `${active?.id}` ? 'ant-table-row-selected-click' : ''} table-${index % 2 === 0 ? 'even' : 'odd'}`
    }
  }, [active])

  return (
    <article className={`${styles.wrapper} table__selected__style`}>
      <TableInterface
        ref={TableRef}
        columns={columns}
        queryInputs={controlInputs}
        queryForm={form}
        queryInit={queryFormInit}
        request={request}
        onTableData={handleRequest}
        extraParams={requestParams}
        rightComponent={rightComponent}
        tableProps={tableProps}
      />
    </article>
  )
}

export default EntryExitTable