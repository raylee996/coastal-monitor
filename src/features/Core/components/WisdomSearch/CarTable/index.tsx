import { DownloadOutlined } from "@ant-design/icons";
import { Form, message } from "antd";
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import popupUI from "component/PopupUI";
import XcEmpty from "component/XcEmpty";
import dayjs from "dayjs";
import popup from "hooks/basis/Popup";
import { CardOptions } from "hooks/flexibility/CardPanel";
import { InputType } from "hooks/flexibility/FormPanel"
import TableInterface, { TableInterfaceRefProps } from "hooks/integrity/TableInterface"
import _ from "lodash";
import { useCallback, useMemo, useRef, useState } from "react";
import { getCarColor, getCarMake, getCarType, getPlateColor } from "server/car";
import { exportSearchTrack, getAllSisdomSearchList } from "server/core/wisdomSearch"
import { WisdomProps } from ".."
import PersonDetail from "../../Control/PersonDetail";
import WisdomJudgment from "../../WisdomJudgment";
import WisdomModel from "../../WisdomModel";
import DepositNotes from "../components/DepositNotes";
import SearchDetail from "../components/SearchDetails";
import TrajectoryAnalysis from "../components/TrajectoryAnalysis";
import CarTableCardItem from "./components/CarTableCardItem";
import styles from "./index.module.sass";


export const CarInputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: false
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
        businessFunctions: ['4'],
        deviceTypes: ['1']
      }
    },
  }],
  ['车牌', 'carNumber'],
  [
    '车牌颜色',
    'plateColor',
    InputType.selectRemote,
    {
      request: getPlateColor,
      allowClear: true
    }
  ],

  [
    '车身颜色',
    'carColor',
    InputType.selectRemote,
    {
      request: getCarColor,
      allowClear: true
    }
  ],
  [
    '车品牌',
    'carBrand',
    InputType.selectRemote,
    {
      request: getCarMake,
      allowClear: true
    }
  ],
  [
    '车型',
    'carType',
    InputType.selectRemote,
    {
      request: getCarType,
      allowClear: true,
      width: 160
    }
  ],
]

const extraParams = { codeType: 1 }
const paginationProps = { pageSize: 9 }

const CarTable: React.FC<WisdomProps> = ({ params }) => {
  console.debug('CarTable')


  const tableRef = useRef<TableInterfaceRefProps>(null)


  const [form] = Form.useForm();


  const [active, setActive] = useState<any>()
  const [multipleActive, setMultipleActive] = useState<any[]>()
  // const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>()
  // const [total, setTotal] = useState(0)


  const queryInit = useMemo(() => {
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
  }, [params])


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
      isModeling ? popup(<WisdomModel data={{ clueInfo }} />, { title: '智慧建模', size: 'fullscreen' }) : popup(<WisdomJudgment data={{ clueInfo, objType: 2, dataType: ['02'] }} />, { title: '智能研判', size: 'fullscreen' })
    },
    [multipleActive],
  )

  const handleRefresh = useCallback(
    () => {
      setMultipleActive([])
    },
    [],
  )

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


  const tools = useMemo(() => [
    ['布控', {
      onClick: () => {
        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
        const personCtrlJson = {
          carConditionDto: {
            controlScope: 1,
            licensePlates: multipleActive.map(item => item.content).join(',')
          }
        }
        popupUI(<PersonDetail params={{ personCtrlJson }} />, { title: '新增布控', size: "middle", })
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
    // ['实时指挥', {
    //   onClick: () => {
    //     if (!multipleActive?.length) {
    //       message.warning(`请选择数据`);
    //       return;
    //     }
    //     popup(<WisdomCommandDetail />, { title: '新增任务', size: 'middle' })
    //   }
    // }],
    ['轨迹分析', {
      onClick: () => {
        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
        const targetList = _.uniqBy(multipleActive.map(item => item.content).filter(v => v), item => item.content)
        const { datetime } = form.getFieldsValue()
        const params = datetime ? { datetime } : undefined
        popup(<TrajectoryAnalysis codeType={1} targetList={targetList} params={params} />, { title: '轨迹分析', size: 'fullscreen' })
      }
    }],
    ['导出', {
      asyncClick: async () => {
        const total = tableRef.current?.getTotal()
        if (total && total > 100000) {
          message.warning(`限制最大导出10万条数据！`);
          return;
        }
        const queryParams = form.getFieldsValue()
        await exportSearchTrack({ codeType: 1, ...queryParams }, '智搜车辆列表')
      },
      icon: <DownloadOutlined />,
      type: "primary"
    }],
    ['存入我的便签', {
      onClick: () => {
        const queryParams = form.getFieldsValue()
        const total = tableRef.current?.getTotal()
        popup(<DepositNotes content={{ type: '5', queryParams }} total={total} taskName='车辆' />, { title: '存入我的便签', size: 'small' })
      },
      type: "primary"
    }]
  ], [form, handleJudgmentModeling, multipleActive])


  // const rowSelection = useMemo(() => ({
  //   selectedRowKeys,
  //   onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
  //     setSelectedRowKeys(selectedRowKeys)
  //     setMultipleActive(selectedRows)
  //   },
  //   getCheckboxProps: (record: any) => ({
  //     disabled: record.name === 'Disabled User', // Column configuration not to be checked
  //     name: record.name,
  //   }),
  // }), [selectedRowKeys])


  // const onRequest = useCallback(
  //   (result: any[], resultNum: number) => {
  //     setActive(result?.length ? result[0] : null)
  //     setTotal(resultNum)
  //   },
  //   [],
  // )


  const cardOptions = useMemo<CardOptions>(() => {

    const handleSelected = (list: any[]) => {
      setMultipleActive(list)
    }

    const handleRadio = (data: any) => {
      setActive(data)
    }

    return {
      isFlex: true,
      onSelected: handleSelected,
      onRadio: handleRadio,
      isRadioFirst: true
    }
  }, [])

  const rightComponent = useMemo(() => {
    return {
      component: <div className={styles.detail}>
        {active ? <SearchDetail active={{ id: active?.content, ...(active || {}) }} /> : <XcEmpty />}
      </div>
    }
  }, [active])

  // const tableProps = useMemo<TableProps<any>>(() => ({
  //   rowSelection: {
  //     ...rowSelection,
  //   },
  //   onRow: record => {
  //     return {
  //       onClick: event => {
  //         setActive(record)
  //       }, // 点击行
  //     }
  //   },
  //   rowClassName: (record, index) => `ant-table-row ant-table-row-level-0 ${`${record.content}#${record.capTime}` === `${active?.content}#${active?.capTime}` ? 'ant-table-row-selected' : ''} table-${index % 2 === 0 ? 'even' : 'odd'}`
  // }), [active?.capTime, active?.content, rowSelection])


  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        cardOptions={cardOptions}
        card={CarTableCardItem}
        queryInputs={CarInputs}
        queryInit={queryInit}
        queryForm={form}
        // onTableData={onRequest}
        request={getAllSisdomSearchList}
        onRefresh={handleRefresh}
        onFormReset={handleFormReset}
        extraParams={extraParams}
        toolsRight={tools}
        rightComponent={rightComponent}
        paginationProps={paginationProps}
      // tableProps={tableProps}
      />
    </article>
  )
}

export default CarTable