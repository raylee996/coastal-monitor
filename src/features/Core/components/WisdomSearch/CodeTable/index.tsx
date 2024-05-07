import { DownloadOutlined } from "@ant-design/icons";
import { Form } from "antd";
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import XcEmpty from "component/XcEmpty";
import dayjs from "dayjs";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel"
import TableInterface from "hooks/integrity/TableInterface"
import { useEffect, useState } from "react";
import { exportSearchTrack, getAllSisdomSearchList } from "server/core/wisdomSearch"
import { WisdomProps } from ".."
import DepositNotes from "../components/DepositNotes";
import SearchDetail from "../components/SearchDetails";
// import TrajectoryAnalysis from "../components/TrajectoryAnalysis";
import styles from "./index.module.sass";

const columns = [
  ['IMSI', 'imsi'],
  ['IMEI', 'imei'],
  ['MAC', 'mac'],
  ['手机号', 'phone'],
  ['归属地', 'QCellCore'],
  ['运营商', 'operator'],
  ['点位', 'point'],
  ['采集时间', 'createTime'],
]

export const CodeInputs: any[] = [
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
    }
  }],
  ['数据类型', 'codeType', InputType.select, {
    dict: [
      { name: "IMSI", value: 2 },
      { name: "IMEI", value: 3 },
      { name: "MAC", value: 4 },
      { name: "手机", value: 5 },
    ],
    style: { width: '80px' },
    allowClear: false
  }],
  ['', 'searchCondition']
]

const CodeTable: React.FC<WisdomProps> = ({ params }) => {
  console.debug('CodeTable')

  const [active, setActive] = useState<any>()

  const [form] = Form.useForm();

  const tools: any = [
    ['布控', {
      onClick: (record: any) => {
        console.log(record, 'record')
      }
    }],
    ['智能研判', {
      onClick: (record: any) => {
        console.log(record, 'record')
      }
    }],
    ['轨迹分析', {
      onClick: (record: any) => {
        console.log(record, 'record')
        // popup(<TrajectoryAnalysis />, { title: '轨迹分析', size: 'fullscreen' })
      }
    }],
    ['导出', {
      asyncClick: async () => {
        const queryParams = form.getFieldsValue()
        await exportSearchTrack({ codeType: 2, ...queryParams }, '智搜侦码列表')
      },
      icon: <DownloadOutlined />,
      type: "primary"
    }],
    ['存入我的便签', {
      onClick: (record: any) => {
        console.log(record, 'record')
        const queryParams = form.getFieldsValue()
        popup(<DepositNotes content={{ type: 'code', codeType: 2, radioValue: 3, ...queryParams }} />, { title: '存入我的便签', size: 'small' })
      },
      type: "primary"
    }]
  ]

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  useEffect(() => {
    getListOne()
  }, [])

  useEffect(() => {
    form && params && form.setFieldsValue(params)
  }, [form, params]);

  async function getListOne() {
    // IMSI
    const res = await getAllSisdomSearchList({ pageSize: 1, pageNumber: 1 }, { codeType: 2 })
    setActive(res?.data?.length ? res.data[0] : null)
  }

  return (
    <article className={styles.wrapper}>
      <TableInterface
        columns={columns}
        queryInputs={CodeInputs}
        queryInit={{ codeType: 2, datetime: [dayjs().subtract(1, 'day'), dayjs()] }}
        queryData={params}
        queryForm={form}
        request={getAllSisdomSearchList}
        toolsRight={tools}
        rightComponent={{
          component: <div className={styles.detail}>
            {active ? <SearchDetail active={{ id: active?.content, ...(active || {}) }} /> : <XcEmpty />}
          </div>
        }}
        tableProps={{
          rowSelection: {
            ...rowSelection,
          },
          onRow: record => {
            return {
              onClick: event => {
                setActive(record)
              }, // 点击行
            }
          },
          rowClassName: (record, index) => `ant-table-row ant-table-row-level-0 ${`${record.content}#${record.capTime}` === `${active?.content}#${active?.capTime}` ? 'ant-table-row-selected' : ''} table-${index % 2 === 0 ? 'even' : 'odd'}`
          // rowClassName: (record, index) => `${record.content}#${record.capTime}` === `${active?.content}#${active?.capTime}` ? 'addRadioStyle' : 'cancelCheckboxStyle'
        }}
      />
    </article>
  )
}

export default CodeTable