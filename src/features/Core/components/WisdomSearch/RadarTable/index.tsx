import { DownloadOutlined } from "@ant-design/icons";
import { Form, message, TableProps } from "antd";
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import DramAreaInForm from "component/DramAreaInForm";
import popupUI from "component/PopupUI";
import XcEmpty from "component/XcEmpty";
import dayjs from "dayjs";
import { trackStatusDict } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel"
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import _ from "lodash";
import { useCallback, useMemo, useState } from "react";
import { exportSearchTrack, getAllSisdomSearchList } from "server/core/wisdomSearch"
import { WisdomProps } from ".."
import ShipAdd from "../../Control/ShipAdd";
import WisdomCommandDetail from "../../WisdomCommand/WisdomCommandDetail";
import WisdomJudgment from "../../WisdomJudgment";
import WisdomModel from "../../WisdomModel";
import DepositNotes from "../components/DepositNotes";
import SearchDetail from "../components/SearchDetails";
import TrajectoryAnalysis from "../components/TrajectoryAnalysis";
import styles from "./index.module.sass";
import "./index.sass";


const columns = [
  ['雷达批号', 'content'],
  ['航速/节', 'speed', {
    itemProps: {
      width: '120px',
    }
  }],
  ['航向', 'course', {
    itemProps: {
      width: '120px',
    }
  }],
  ['经纬度', 'LatLng'],
  ['点迹类型', 'trackStatusName', {
    itemProps: {
      width: '120px',
    }
  }],
  // ['大小', 'size'],
  ['采集时间', 'capTime'],
  ['目标ID', 'target_id', ColType.tooltip, {
    itemProps: {
      ellipsis: true
    }
  }],
  ['关联AIS', 'mmsi'],
]

const extraParams = { codeType: 7 }

export const RadarInputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: false
  }],
  ['区域', 'areaJsonList', InputType.component, {
    component: DramAreaInForm,
    inputProps: {
      placeholder: '请选择区域',
    },
    isNotCircle: true,
    isNotPolygon: true,
    isNotLine: true
  }],
  ['点位', 'pointJsonList', InputType.component, {
    component: AreaPointDrawFrom,
    inputProps: {
      size: 'middle',
      style: { width: '180px' }
    },
    pointProps: {
      isPoint: true,
      params: {
        deviceTypes: ['5'],
      }
    },
  }],
  ['点迹类型', 'trackStatus', InputType.select, { dict: trackStatusDict }],
  ['雷达目标', 'searchCondition', {
    placeholder: '请输入雷达批号/目标ID',
    allowClear: true
  }],
]

const RadarTable: React.FC<WisdomProps> = ({ params }) => {
  console.debug('RadarTable')


  const [form] = Form.useForm();


  const [active, setActive] = useState<any>()
  const [multipleActive, setMultipleActive] = useState<any[]>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>()
  const [queryInit] = useState(() => {
    if (params?.datetime) {
      const { datetime, ...othParams } = params
      const [sTime, eTime] = datetime
      return {
        datetime: [dayjs(sTime), dayjs(eTime)],
        ...othParams
      }
    } else {
      return {
        datetime: [dayjs().subtract(1, 'day'), dayjs()],
        ...params
      }
    }
  })
  const [total, setTotal] = useState(0)


  const handleJudgmentModeling = useCallback(
    (isModeling?: boolean) => {
      if (!multipleActive?.length) {
        message.warning(`请选择数据`);
        return;
      }
      const clueInfo = multipleActive.map(item => {
        return {
          codeType: item.codeType,
          codeValue: item.content
        }
      })
      isModeling ? popup(<WisdomModel data={{ clueInfo }} />, { title: '智慧建模', size: 'fullscreen' }) : popup(<WisdomJudgment data={{ clueInfo, objType: 1, dataType: ['05'] }} />, { title: '智能研判', size: 'fullscreen' })
    },
    [multipleActive],
  )


  const tools = useMemo(() => [
    ['布控', {
      onClick: () => {
        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
        const params = {
          controlScope: "1",
          alarmConditionShipMmsis: multipleActive.map(item => item.content).join(','),
        }
        popupUI(<ShipAdd controlType={1} params={params} />, { title: '新增布控', size: "middle", })
      }
    }],
    ['智能研判', {
      onClick: () => {
        handleJudgmentModeling()
      }
    }],
    ['智慧建模', {
      onClick: () => {
        handleJudgmentModeling(true)
      }
    }],
    ['实时指挥', {
      onClick: () => {
        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
        const latLngList = multipleActive.filter(item => Boolean(item.latitude && item.longitude))
        const defaultData = {
          targetCode: multipleActive.map(item => item.content).join(","),
          latLng: latLngList.length > 1 ? [{ lat: multipleActive[0].latitude, lng: multipleActive[0].longitude }] : null
        }
        popup(<WisdomCommandDetail defaultData={defaultData} />, { title: '新增任务', size: 'middle' })
      }
    }],
    ['轨迹分析', {
      onClick: () => {
        if (multipleActive?.length) {
          const targetList = _.uniqBy(_.filter(multipleActive, item => item.target_id), item => item.content)
          if (targetList.length) {
            const { datetime } = form.getFieldsValue()
            const params = datetime ? { datetime } : undefined
            popup(<TrajectoryAnalysis codeType={8} targetList={targetList} params={params} />, { title: '轨迹分析', size: 'fullscreen' })
          } else {
            message.warning(`数据无目标ID`);
          }
        } else {
          message.warning(`请选择数据`)
        }

        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
      }
    }],
    ['导出', {
      asyncClick: async () => {
        if (total > 100000) {
          message.warning(`限制最大导出10万条数据！`);
          return;
        }
        const queryParams = form.getFieldsValue()
        await exportSearchTrack({ codeType: 7, ...queryParams }, '智搜雷达列表')
      },
      icon: <DownloadOutlined />,
      type: "primary"
    }],
    ['存入我的便签', {
      onClick: () => {
        const queryParams = form.getFieldsValue()
        popup(<DepositNotes content={{ type: '2', queryParams }} total={total} taskName='雷达' />, { title: '存入我的便签', size: 'small' })
      },
      type: "primary"
    }]
  ], [form, handleJudgmentModeling, multipleActive, total])


  const handleChange = useCallback(
    (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setMultipleActive([...selectedRows])
      setSelectedRowKeys([...selectedRowKeys])
    },
    [],
  )


  const rowSelection = useMemo(() => ({
    selectedRowKeys,
    onChange: handleChange,
    getCheckboxProps: (record: any) => ({
      name: record.archive_id,
    }),
  }), [selectedRowKeys, handleChange])


  const onRequest = useCallback((result: any, resultNum: number) => {
    setActive(result?.length ? result[0] : null)
    setTotal(resultNum)
    handleChange([], [])
  }, [handleChange])


  const rightComponent = useMemo(() => {
    const component = (
      <div className={styles.detail}>
        {active ? <SearchDetail active={{ id: active?.content, ...(active || {}) }} /> : <XcEmpty />}
      </div>
    )
    return {
      component
    }
  }, [active])

  const tableProps = useMemo(() => {
    const result: TableProps<any> = {
      rowKey: (record) => `${record?.index}`,
      rowSelection: {
        ...rowSelection,
      },
      onRow: record => {
        return {
          onClick: (event: any) => {
            if (event.target.className !== "ant-checkbox-inner") {
              setActive(record)
            }
          }, // 点击行
        }
      },
      rowClassName: (record, index) => `ant-table-row ant-table-row-level-0 ${`${record.index}` === `${active?.index}` ? 'ant-table-row-selected-click' : ''} table-${index % 2 === 0 ? 'even' : 'odd'}`
    }
    return result
  }, [active, rowSelection])


  const handleFormReset = useCallback(
    () => {
      if (params?.datetime) {
        const { datetime } = params
        const [sTime, eTime] = datetime
        return {
          datetime: [dayjs(sTime), dayjs(eTime)]
        }
      } else {
        return {
          datetime: [dayjs().subtract(1, 'day'), dayjs()]
        }
      }
    },
    [params],
  )


  return (
    <article className={`${styles.wrapper} WisdomSearch__RadarTable`}>
      <TableInterface
        columns={columns}
        queryInputs={RadarInputs}
        queryForm={form}
        queryInit={queryInit}
        onTableData={onRequest}
        request={getAllSisdomSearchList}
        onFormReset={handleFormReset}
        extraParams={extraParams}
        toolsRight={tools}
        rightComponent={rightComponent}
        tableProps={tableProps}
      />
    </article>
  )
}

export default RadarTable