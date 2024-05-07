import { DownloadOutlined } from "@ant-design/icons";
import { Form, message, TableProps } from "antd";
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import popupUI from "component/PopupUI";
import XcEmpty from "component/XcEmpty";
import dayjs from "dayjs";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel"
import TableInterface from "hooks/integrity/TableInterface"
import { useCallback, useMemo, useRef, useState } from "react"
import { exportSearchTrack, getAllSisdomSearchListPerson } from "server/core/wisdomSearch"
// import { getDictDataByType } from "server/system";
import { WisdomProps } from "..";
import PersonDetail from "../../Control/PersonDetail";
// import ShipAdd from "../../Control/ShipAdd";
import DepositNotes from "../components/DepositNotes";
import SearchDetail from "../components/SearchDetails";
import TrajectoryAnalysis from "../components/TrajectoryAnalysis";
import styles from "./index.module.sass";
import "./index.sass";
import { defaultImgPeople } from "helper/common";
import _ from "lodash";


const columns = [
  ['证件照片', 'picUrl', {
    itemProps: {
      width: '80px',
      render: (text: any, record: any) => {
        return (
          <div className={styles.imgBox}>
            <ImageSimple src={record.picUrl} defaultSrc={defaultImgPeople} />
          </div>
        )
      }
    }
  }],
  ['抓拍照片', 'contrastUrl', {
    itemProps: {
      width: '80px',
      render: (text: any, record: any) => {
        return (
          <div className={styles.imgBox}>
            <ImageSimple src={record.contrastUrl} defaultSrc={defaultImgPeople} />
          </div>
        )
      }
    }
  }],
  ['比对结果', 'contrastResult'],
  ['姓名', 'name'],
  ['性别', 'sexName'],
  ['身份证号', 'cardId'],
  ['民族', 'nation'],
  ['住址', 'address'],
  ['签发机发', 'organization'],
  ['有效期限', 'licenseDate'],
  ['设备名称', 'deviceName'],
  ['采集时间', 'capTime'],
]

const extraParams = { codeType: 12 }

export const personInputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: false,
    style: { width: '338px' }
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
        deviceTypes: ['4'],
      }
    },
  }],
  ['关键字', 'searchCondition', {
    placeholder: '请输入身份证号/姓名',
    allowClear: true
  }],
]

const PersonTable: React.FC<WisdomProps> = ({ params }) => {
  console.debug('PersonTable')


  const AISTableRef = useRef<any>(null)


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



  const tools = useMemo(() => [
    ['布控', {
      onClick: () => {
        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
        let data: any = []
        multipleActive.forEach((item: any) => {
          data.push({ idCard: item.cardId })
        })
        const personCtrlJson = {
          personConditionDto: {
            controlScope: 1,
            idCardList: data,
            faceDtoList: [],
            focusPersonList: []
          }
        }

        popupUI(<PersonDetail params={{ personCtrlJson }} />, { title: '新增布控', size: "middle", })
      }
    }],
    ['轨迹分析', {
      onClick: () => {
        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
        const targetList = _.uniqBy(multipleActive.map(item => item.cardId).filter(v => v), item => item.content)
        const { datetime } = form.getFieldsValue()
        const params = datetime ? { datetime } : undefined
        popup(<TrajectoryAnalysis codeType={12} targetList={targetList} params={params} />, { title: '轨迹分析', size: 'fullscreen' })
      }
    }],
    ['导出', {
      asyncClick: async () => {
        if (total > 100000) {
          message.warning(`限制最大导出10万条数据！`);
          return;
        }
        const queryParams = form.getFieldsValue()
        await exportSearchTrack({ codeType: 12, ...queryParams }, '智搜身份证列表')
      },
      icon: <DownloadOutlined />,
      type: "primary"
    }],
    ['存入我的便签', {
      onClick: (record: any) => {
        const queryParams = form.getFieldsValue()
        popup(<DepositNotes content={{ type: '7', queryParams }} total={total} taskName='身份证' />, { title: '存入我的便签', size: 'small' })
      },
      type: "primary"
    }]
  ], [form, multipleActive, total])


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


  const onRequest = useCallback((result: any[], resultNum: number) => {
    setActive(result?.length ? result[0] : null)
    setTotal(resultNum)
    handleChange([], [])
  }, [handleChange])


  const rightComponent = useMemo(() => {
    return {
      component: <div className={styles.detail}>
        {active ? <SearchDetail active={{ id: active?.content, ...(active || {}) }} /> : <XcEmpty />}
      </div>
    }
  }, [active])

  const tableProps = useMemo<TableProps<any>>(() => {
    return {
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
    <article className={`${styles.wrapper} WisdomSearch__AISTable`}>
      <TableInterface
        ref={AISTableRef}
        columns={columns}
        queryInputs={personInputs}
        queryForm={form}
        queryInit={queryInit}
        onTableData={onRequest}
        request={getAllSisdomSearchListPerson}
        onFormReset={handleFormReset}
        extraParams={extraParams}
        toolsRight={tools}
        rightComponent={rightComponent}
        tableProps={tableProps}
      />
    </article>
  )
}

export default PersonTable