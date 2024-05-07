import { Col, Row, Button, Input, Popconfirm, Form, message } from 'antd'
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface"
import { getDeviceData, getStateListData, removeSiteData, removeDeviceList, getDictDataByType } from "server/system";
import DeviceDetail from '../DeviceDetail';
import style from './index.module.sass'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import { deviceListOptions } from "helper/dictionary";
import SiteAdd from './SiteAdd';
import { CloseOutlined, EditOutlined } from '@ant-design/icons'
import { ColType } from "hooks/flexibility/TablePanel";
import Title from "../../../component/Title";
import { exportDeviceTableFile } from 'server/device';
import WindowDelet from "component/WindowDelet";
import ImportFile from 'component/ImportFile';
import { importDeviceTable } from 'api/device';
// import popupmini from "component/PopupMini";
import popupUI from 'component/PopupUI';
import { CameraTypeDict } from 'helper/dictionary';


const tableProps = {
  rowKey: 'id'
}

const queryInputs = [
  ['设备类型', 'deviceType', InputType.selectRemote,
    {
      // dict: deviceListOptions,
      request: async () => getDictDataByType("device_type_02"),
      placeholder: '请选择设备类型',
      style: { width: '180px' }
    }
  ],
  ['摄像头类型', 'cameraType',
    InputType.select,
    {
      dict: CameraTypeDict,
      when: { deviceType: '1' }
    }
  ],
  ['设备', 'deviceNameOrCode',
    { placeholder: "请输入设备名称或设备编码" }
  ],
  ['位置', 'address',
    { placeholder: "请输入站点名称/杆体编号/设备地址" }
  ]
]

const DeviceManage: React.FC = () => {
  console.debug('DeviceManage')


  const [form] = Form.useForm()


  const tableRef = useRef<any>()


  const [siteName, setSiteName] = useState<string>()
  const [stateData, setStateData] = useState([
    { name: '测试', value: 1, active: false, id: 0 }
  ])
  const [tempID, setTempID] = useState<number>()
  const [tempIDs, setTempIDs] = useState<string>()

  const columns = useMemo(() => [
    // ['序号', 'deviceId'],
    ['设备名称', 'deviceName', ColType.tooltip],
    ['设备类型', 'deviceTypeName'],
    ['设备来源', 'deviceSourceName'],
    ['设备编码', 'deviceCode', ColType.tooltip],
    ['站点名称', 'siteName', ColType.tooltip],
    ['设备归属', 'location', ColType.tooltip],
    // ['设备地址', 'deviceAddr', ColType.tooltip],
    ['设备状态', 'statusName',{
      itemProps: {
        filters: [
          {text:'在线',value:1},
          {text:'离线',value:0},
        ],
      }
    }],
    [
      ['编辑', (record: any) => {
        popup(<DeviceDetail id={record.id} deviceSource={record.deviceSource} onSuccess={() => {
          tableRef.current.onRefresh()
          SiteData(siteName)
        }}></DeviceDetail>, { title: '编辑设备', size: "large" })
      }],
      ['删除', (record: any) => {
        removeList(record.id)
      }],
    ]
  ], [siteName])


  const showAdddevice = useCallback(
    () => {
      popup(<DeviceDetail onSuccess={() => {
        tableRef.current.onRefresh()
        SiteData(siteName)
      }}></DeviceDetail>, { title: '新增设备', size: 'large' })
    },
    [siteName]
  )

  const handleRefreshTable = useCallback(
    () => {
      tableRef.current.onRefresh()
    },
    []
  )



  const tools = useMemo(() => [
    ['新增', {
      onClick: () => {
        showAdddevice()
      },
      type: "primary"
    }],
    ['导入', {
      onClick: () => {
        popupUI(
          <ImportFile
            api={importDeviceTable}
            fileName='设备管理导入模板'
            templateUrl={'/admin/device/down/template'}
            refreshTable={handleRefreshTable}
          />,
          {
            title: '导入',
            size: "mini"
          }
        )

      }
    }],
    ['导出', {
      onClick: async () => {
        await exportDeviceTableFile(form)
      }
    }]
  ], [showAdddevice, handleRefreshTable, form])


  function handleSearch(text: string) {
    setSiteName(text)
  }

  function handelSelect(data: any) {
    let newModeList = JSON.parse(JSON.stringify(stateData))
    let arr: any = []
    newModeList.forEach((item: any) => {
      if (item.id === data.id) {
        item.active = !item.active;
        if (item.active) {
          setTempID(data.id)
        } else {
          setTempID(undefined)
        }
      }
    })
    newModeList.forEach((item: any) => {
      if (item.active) {
        arr.push(item.id)
      }
    })
    setTempIDs(arr.join(","))
    setStateData(newModeList)
  }

  function resetClick() {
    let newModeList = JSON.parse(JSON.stringify(stateData))
    newModeList.forEach((item: any) => {
      item.active = false;
    })
    setStateData(newModeList)
    setTempID(undefined)
    setTempIDs(undefined)
    tableRef.current.onRefresh()
  }

  async function SiteData(name: any) {
    const vo = await getStateListData({ siteName: name })
    setStateData(vo)
  }

  async function removeList(id: any) {
    popupUI(<WindowDelet title={'确定删除设备吗？'} request={removeDeviceList} id={{ id: id }} onSuccess={() => {
      message.success('删除成功！')
      tableRef.current.onRefresh()
    }} />, { title: '删除提示', size: 'auto' })
    // await removeDeviceList({ id: id })
    // tableRef.current.onRefresh()
  }

  // 站点列表
  useEffect(() => {
    async function main() {
      SiteData(siteName)
    }
    main()
  }, [siteName])

  function showAddSite() {
    popupUI(<SiteAdd onSuccess={() => {
      SiteData(siteName)
    }} />, { title: '新增站点', size: "auto" })
  }

  function showEditSite(data: any) {
    popupUI(<SiteAdd id={data.id} name={data.siteName} siteCode={data.siteCode} type={data.siteType} onSuccess={() => {
      SiteData(siteName)
    }} />, { title: '编辑站点', size: "auto" })
  }

  async function onConfirm(data: any) {
    await removeSiteData({ siteId: data.id })
    SiteData(siteName)
  }


  return (
    <article className={style.wrappers}>
      <Row gutter={16}>
        <Col span={4}>
          <Title title={'站点列表'} />
          <div>
            <p><Input.Search placeholder='请输入站点名称' allowClear enterButton onSearch={handleSearch} /></p>
            <p>
              <Button type={"primary"} onClick={showAddSite}>新增站点</Button>
              <Button style={{ marginLeft: '20px' }} onClick={resetClick}>取消选中</Button>
            </p>
            <div className={style.conts}>
              {stateData.map((item =>
                <div className={`${item.active ? style.active : style.noactive} ${style.hoves}`} key={item.name}>

                  <div onClick={() => handelSelect(item)} className={style.deviceName} title={item.name}>{item.name}</div>

                  {item.active && tempID === item.id && <div className={style.btns}>
                    <Popconfirm
                      title="确定删除站点吗？"
                      okText="确认"
                      cancelText="取消"
                      onConfirm={() => onConfirm(item)}
                    >
                      <CloseOutlined className={style.icons} style={{ marginRight: 10 }} />
                    </Popconfirm>

                    <EditOutlined className={style.icons} onClick={() => showEditSite(item)} />
                  </div>
                  }
                </div>
              ))}
            </div>
          </div>
        </Col>
        <Col span={20} className={style.rights}>
          <div className={style.wrapper}>
            <TableInterface
              ref={tableRef}
              queryForm={form}
              tableProps={tableProps}
              extraParams={{ siteIds: tempIDs }}
              columns={columns}
              queryInputs={queryInputs}
              toolsHeader={tools}
              request={getDeviceData}
            />
          </div>

        </Col>
      </Row>
    </article>
  )
}

export default DeviceManage
