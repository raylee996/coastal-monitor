import { Button, Form, message, TableProps } from "antd";
import { importShip } from "api/ship";
import ExportFile from "component/ExportFile";
import ImportFile from "component/ImportFile";
import LabelManage from "component/LabelManage";
import TabsBtn from "component/TabsBtn";
import WisdomJudgment from "features/Core/components/WisdomJudgment";
import { shipDataTypeDict } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doGetDictTypeData } from "server/common";
import { getLabelTable } from "server/label";
import { doDelShip, doGetShipFocusTypeCount, getShipListTable } from "server/ship";
import ShipArchiveTableDetail from "../ShipArchiveDetail";
import ShipArchiveInfo from "../ShipArchiveInfo";
import AutoFollow from "./AutoFollow";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'
import _ from "lodash";
import nanshanSrc from 'images/ship/nanshan.png'
// import popupmini from "component/PopupMini";
import WindowDelet from "component/WindowDelet";
import popupUI from "component/PopupUI";


const queryInputs = [
  [
    '数据类型',
    'dataType',
    InputType.select, {
      dict: shipDataTypeDict,
      placeholder: '请选择',
      style: { width: "160px" },
      allowClear: false
    }
  ],
  ['船舶',
    'shipSearchValue',
    {
      placeholder: '请输入船名/MMSI/目标ID',
      allowClear: true,
      when: { dataType: 1 }
    }
  ],
  ['雷达批号',
    'radarSearchValue',
    {
      placeholder: '请输入雷达批号/目标ID',
      allowClear: true,
      when: { dataType: 2 }
    }
  ],
  [
    '船型',
    'shipType',
    InputType.selectRemote, {
      request: async () => {
        const vo = await doGetDictTypeData({ dictType: 'archive_ship_type' })
        return vo.data
      },
      style: { width: "160px" },
      when: { dataType: 1 }
    }
  ],
]

// 船舶列表类型
export enum ShipTableType {
  important,//重点船舶
  focus,//关注船舶
  ordinary,//普通船舶
}

interface Props {
  tableType?: ShipTableType
  onClosePopup?: Function
}

const queryInit = { dataType: 1, focusType: '' }

const ShipArchiveTable: React.FC<Props> = ({ tableType }) => {
  console.debug('ShipArchiveTable')


  const [form] = Form.useForm();
  const queryDataType = Form.useWatch('dataType', form) // 监听dataType值变化


  const tableRef = useRef<any>(null)

  const [tabData, setTabData] = useState<any[]>([])
  const [tabDataTemp, setTabDatatemp] = useState<any[]>()
  const [focusType, setFocusType] = useState<string | undefined>('')
  const [judgmentData, setJudgmentData] = useState<any>([]) // 研判需要的数据,用于判断是否选中研判数据
  const [labelNamesFilters, setLabelNamesFilters] = useState<{ text: string, value: number }[]>()


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const page = await getLabelTable({ type: 4 }, ctr)
      const _labelNamesFilters = page.data.map((item: any) => {
        return {
          text: item.labelName,
          value: item.id
        }
      })
      setLabelNamesFilters(_labelNamesFilters)
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [])

  // 查询船舶类型分类数量
  const handleFinishEdit = useCallback(
    async () => {
      if (queryDataType) {
        const vo = await doGetShipFocusTypeCount({ dataType: queryDataType })
        let _TabData = vo.map((ele: any) => ({
          name: ele.keyName,
          value: ele.key,
          num: ele.count,
          img: '',
          bgClass: ele.bgClass
        }))
        setTabData(_TabData)
        tableRef.current.onRefresh()
      }
    },
    [queryDataType]
  )


  const columns = useMemo(() => [
    ['照片', 'shipImgPathFirst', {
      itemProps: {
        width: '80px',
        render: (text: any, record: any) => {
          return (
            <div className={styles.imgBox}>
              {record.dataType === 1 && <ImageSimple src={record.shipImgPathFirst} defaultSrc={shipDefSrc} />}
              {record.dataType === 2 && <ImageSimple src={record.radarImgPath} defaultSrc={shipDefSrc} />}
              {record.isAuto === 4 && <img className={styles.nanshanAlt} alt="南山船舶" src={nanshanSrc} />}
            </div>
          )
        }
      }
    }],
    ['英文船名', 'enName', ColType.tooltip,],
    ['中文船名', 'cnName', ColType.tooltip,],
    ['船型', 'shipTypeName', ColType.tooltip, { itemProps: { width: '80px' } }],
    ['MMSI', 'mmsi', ColType.tooltip, {
      itemProps: {
        width: '140px'
      }
    }],
    ['目标ID', 'targetId', ColType.tooltip, {
      itemProps: {
        width: '140px'
      }
    }],
    (queryDataType === 2 ? ['雷达批号', 'radarNumber', { itemProps: { width: '180px' } }, ColType.tooltip] : ['', '', { itemProps: { width: '0px' } }]),
    ['船长/米', 'shipL', { itemProps: { width: '100px' } }],
    ['船宽/米', 'shipW', { itemProps: { width: '100px' } }],
    ['建档时间', 'createTime', ColType.tooltip, {
      itemProps: {
        width: '160px'
      }
    }],
    ['标签', 'labelNames', ColType.tooltip, {
      itemProps: {
        filters: labelNamesFilters,
      }
    }],
    ['船舶分类', 'focusTypeName', { itemProps: { width: '80px' } }],
    ['操作', '', {
      itemProps: {
        width: '140px',
        render: (text: any, record: any) => {
          function view() {
            const dataType = record.dataType === 1 ? 1 : 2
            popup(<ShipArchiveInfo id={record.id} dataType={dataType} />, { title: '查看船舶档案', size: "fullscreen" })
          }
          function edit() {
            let shipInfoData = JSON.parse(JSON.stringify(record))
            _.unset(shipInfoData, 'id')
            popup(<ShipArchiveTableDetail isSelect={true} type={UseType.edit} shipInfoData={shipInfoData} id={record.id} dataType={record.dataType} radarNumber={record.radarNumber} onFinish={handleFinishEdit} />, { title: '编辑船舶档案', size: "fullscreen" })

          }
          function del() {
            popupUI(<WindowDelet title={'确定删除档案吗？'} request={doDelShip} id={record} onSuccess={() => {
              handleFinishEdit()
            }} />, { title: '删除提示', size: 'auto' })
          }
          return (
            <>
              <Button type="link" onClick={view}>查看</Button>
              <Button type="link" onClick={edit}>编辑</Button>
              <Button type="link" onClick={del}>删除</Button>
            </>
          )
        }
      }
    }],
  ], [handleFinishEdit, labelNamesFilters, queryDataType])
  // 表格右侧功能键区
  const toolsRight = useMemo(() => {
    // ais与雷达均有操作按钮
    const commonTools = [
      ['研判', {
        onClick: () => {
          //跳转
          if (judgmentData.length === 0) {
            message.warning('请选择数据')
          } else {
            let clueInfo: any[] = []
            for (let i = 0; i < judgmentData.length; i++) {
              if (judgmentData[i].radarNumber) {
                clueInfo.push({
                  codeType: 7,
                  codeValue: judgmentData[i].radarNumber,
                  imageUrl: judgmentData[i].shipImgPath
                })
              } else {
                clueInfo.push({
                  codeType: 6,
                  codeValue: judgmentData[i].mmsi,
                  imageUrl: judgmentData[i].shipImgPath
                })
              }
            }

            popup(<WisdomJudgment data={{ clueInfo, objType: 1, dataType: ['04', '05'] }} />, { title: '智能研判', size: 'fullscreen' })
          }
        }
      }],
      ['标签管理', {
        onClick: () => {
          popup(<LabelManage type={4} hasSystem={true} />, { title: '标签管理', size: "middle" })
        }
      }]
    ]
    // ais独有
    const aisStartTools = [
      ['自动关注配置', {
        asyncClick: async () => {
          popupUI(<AutoFollow />, { title: '自动关注', size: 'auto' })
        },
        type: 'primary',
      }],
    ]
    const aisEndTools = [
      ['新增', {
        onClick: () => {
          popup(<ShipArchiveTableDetail type={UseType.edit} onFinish={handleFinishEdit} />, { title: '新增船舶档案', size: "fullscreen" })
        }
      }],
      ['导入', {
        onClick: () => {
          popupUI(<ImportFile api={importShip} templateUrl={'/archive/ship/down/template'} refreshTable={handleFinishEdit} />, { title: '导入', size: "mini" })

        }
      }],
      [<ExportFile url={'/archive/ship/export'} extra={focusType === '6' ? { isAuto: 4 } : { focusType }} targetRef={tableRef} targetForm={form} />, {}]
    ]
    return [...(queryDataType === 1 ? aisStartTools : []), ...commonTools, ...(queryDataType === 1 ? aisEndTools : [])]
  }, [focusType, form, handleFinishEdit, judgmentData, queryDataType])

  const handleChangeFocusType = useCallback(
    (data: any) => {
      //选择的船舶类型
      setFocusType(val => {
        if (val === data) {
          return undefined
        } else {
          return data
        }
      })
    },
    [],
  )

  const handleRowCheck = useCallback(
    (selectedRowKeys: any[], selectedRows: any[]) => {
      setJudgmentData(selectedRows)
    },
    []
  )


  useEffect(() => {
    async function main() {
      queryInit.dataType = queryDataType

      tableRef.current.onRefresh()

      // 查询船舶类型分类数量
      const vo = await doGetShipFocusTypeCount({ dataType: queryDataType })

      let _TabData = vo.map((ele: any) => ({
        name: ele.keyName,
        value: ele.key,
        num: ele.count,
        img: '',
        bgClass: ele.bgClass
      }))

      setTabData(_TabData)
    }

    if (queryDataType) {
      setTabData(val => {
        const result = val.map((ele: any) => ({ ...ele, num: 0 }))
        return result
      })
      main()
    }
  }, [queryDataType])

  useEffect(() => {
    if (tabData.length > 0) {
      let _TabData = tabData.map((ele: any) => ({
        ...ele,
        svgId: ele.value === '2' ? 'importid' : ele.value === '3' ? 'gzshipid' : ele.value === '4' ? 'yibanship' : 'naships',
        svgPic: ele.value === '2' ? require('images/dataCenter/port_ship.svga') :
          ele.value === '3' ? require('images/dataCenter/gz_ship.svga') :
            ele.value === '4' ? require('images/dataCenter/yb_ship.svga') : require('images/dataCenter/ns_ship.svga'),
        staticPic: ele.value === '2' ? require('images/dataCenter/shipport.png') :
          ele.value === '3' ? require('images/dataCenter/gzship.png') :
            ele.value === '4' ? require('images/dataCenter/yibanship.png') : require('images/dataCenter/nanship.png')
      }))
      setTabDatatemp(_TabData)
    }
  }, [tabData])


  const tableProps: TableProps<any> = useMemo(() => ({
    size: 'small',
    rowSelection: {
      type: 'checkbox',
      onChange: handleRowCheck,
      preserveSelectedRowKeys: true
    }
  }), [handleRowCheck])

  const extraParams = useMemo(() => ({
    tableType,
    focusType
  }), [tableType, focusType])

  function handleReset() {
    form.resetFields()
    form.setFieldsValue({
      dataType: 1
    })
    setFocusType(undefined)
  }

  return (
    <div className={styles.wrapper}>
      <TabsBtn
        type='1'
        data={tabDataTemp}
        onChange={handleChangeFocusType}
      />
      <TableInterface
        ref={tableRef}
        extraParams={extraParams}
        queryInit={queryInit}
        queryForm={form}
        columns={columns}
        queryInputs={queryInputs}
        toolsHeader={toolsRight}
        request={getShipListTable}
        tableProps={tableProps}
        onQueryReset={handleReset}
      />
    </div>
  )
}

export default ShipArchiveTable