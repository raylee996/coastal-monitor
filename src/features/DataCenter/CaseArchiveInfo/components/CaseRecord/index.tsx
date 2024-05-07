import { CloseOutlined } from "@ant-design/icons";
import { Button, message, Modal, Popconfirm, Space } from "antd";
import AudioView from "component/AudioView";
import popupUI from "component/PopupUI";
import dayjs from "dayjs";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import SelectRemote from "hooks/basis/SelectRemote"
import { InputType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import { DayjsPair } from "hooks/hooks";
import TableInterface from "hooks/integrity/TableInterface"
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react"
// import { getControlDict } from "server/alarm";
import { getCaseRecordModelList, getCaseModelListDict, getCaseRecordTableData, setCaseRecordModelList } from "server/case"
import RecallMap from "./components/RecallMap";
import styles from "./index.module.sass";


const inputs = [
  // ['布控类别', 'monitorType', InputType.selectRemote, {
  //   request: getControlDict,
  //   style: { width: '150px' }
  // }],
  ['预警内容', 'warnContent'],
  ['预警时间', 'datetimeRange', InputType.dateTimeRange],
]

interface Props {
  id: number
}

const CaseRecord: React.FC<Props> = ({ id }) => {
  console.debug('CaseRecord')


  const [extraParams, setExtraParams] = useState<any>()
  const [isOpenModelSelect, setIsOpenModelSelect] = useState(false)
  const [selectRemoteValue, setSelectRemoteValue] = useState<any>()
  const [selectRemoteOptionValue, setSelectRemoteOptionValue] = useState<any>()
  const [modelTags, setModelTags] = useState<any[]>([])
  const [queryInit] = useState({ datetimeRange: [dayjs().subtract(1, 'd'), dayjs()] })
  const [queryRange, setQueryRange] = useState<DayjsPair>()


  const columns = useMemo(() => {
    // 打开视图信息
    function openAudio(e: any, arr: any[], activeImg: boolean) {
      e.stopPropagation();
      if (!arr?.length) {
        message.error('暂无可查看视图信息')
        return
      }
      popup(<AudioView isActiveImage={activeImg} videoList={arr?.filter(item => ['02', '03'].includes(item.fileType))} imageList={arr?.filter(item => item.fileType === '01')} />, { title: '视图查看', size: "auto" })
    }

    return [
      ['预警时间', 'warnTime'],
      ['预警内容', 'warnContent'],
      ['风险等级', 'riskLevelName'],
      ['预警类别', 'monitorTypeName'],
      ['布控名称', 'monitorName'],
      // ['预警类型', 'eventName'],
      ['预警设备', 'deviceName'],
      ['预警地址', 'warnAddr'],
      ['经纬度', 'lnglat'],
      ['图片', 'warnPic', ColType.image],
      ['视频', 'videoUrl', {
        itemProps: {
          render: (text: any, record: any) => {
            return (<>
              {
                record.videoUrl ? <ImageSimple className={styles.videoImg} onClick={(e) => openAudio(e, record.standFiles, false)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.videoUrl?.picUrl} /> : '--'
              }
            </>)
          }
        }
      }],
      [
        ['回溯', (record: any) => {
          console.log(record)
          popupUI(<RecallMap record={record} range={queryRange} />, { title: '回溯', size: 'fullscreen' })
        }]
      ]
    ]
  }, [queryRange])


  // 获取已关联模型
  useEffect(() => {
    async function main() {
      const params = {
        caseId: id
      }
      const vo = await getCaseRecordModelList(params)
      if (vo.ids.length) {
        setExtraParams({
          monitorIds: vo.ids
        })
        setModelTags(vo.list)
      }
    }
    main()
    return () => {

    }
  }, [id])


  // 删除关联模型
  const handleDeleteMode = useCallback(
    async (item: any) => {
      const result = [...modelTags]
      _.remove(result, ele => ele.value === item.value)
      const modelIds = result.map((ele: any) => ele.value)
      await setCaseRecordModelList(id, modelIds)
      setExtraParams({
        monitorIds: modelIds.join(',')
      })
      setModelTags(result)
    },
    [id, modelTags],
  )

  // 展示选择关联模型
  const handleOpenModelSelect = useCallback(
    () => {
      const result = modelTags.map(item => item.value)
      setSelectRemoteValue(result)
      setIsOpenModelSelect(true)
    },
    [modelTags],
  )

  // 关闭展示关联模型
  const handleSelectCancel = useCallback(
    () => {
      setIsOpenModelSelect(false)
    },
    [],
  )

  // 确认选择关联模型
  const handleSelectConfirm = useCallback(
    async () => {
      const modelIds = selectRemoteOptionValue.map((ele: any) => ele.value)
      await setCaseRecordModelList(id, modelIds)
      setExtraParams({
        monitorIds: modelIds.join(',')
      })
      setModelTags(selectRemoteOptionValue)
      handleSelectCancel()
    },
    [handleSelectCancel, id, selectRemoteOptionValue],
  )

  // 响应选择模型数据变更
  const handleChangeModel = useCallback(
    (val: any, opts: any) => {
      setSelectRemoteValue(val)
      setSelectRemoteOptionValue(opts)
    },
    [],
  )

  // 表格查询提交
  const onQuerySubmit = useCallback(
    ({ datetimeRange }: any) => {
      setQueryRange(datetimeRange)
    },
    [],
  )



  return (
    <article className={styles.wrapper}>
      <header>
        <div className={styles.label}>
          已关联模型:
        </div>
        <div className={styles.selectBox}>
          <Space>
            {modelTags.map(item =>
              <div className={styles.selectLabel} key={item.value}>
                <span>{item.name}</span>
                <Popconfirm
                  title="确认删除关联模型吗?"
                  onConfirm={() => handleDeleteMode(item)}
                >
                  <Button size="small" type="text" icon={<CloseOutlined />} />
                </Popconfirm>
              </div>
            )}
            <Button className={styles.selectBut} size='small' onClick={handleOpenModelSelect}>关联模型</Button>
          </Space>
        </div>
      </header>

      <section className={styles.TableBox}>
        <TableInterface
          queryInputs={inputs}
          queryInit={queryInit}
          extraParams={extraParams}
          isMustExtraParams={true}
          columns={columns}
          request={getCaseRecordTableData}
          onQuerySubmit={onQuerySubmit}
        />
      </section>

      <Modal title="选择关联模型"
        open={isOpenModelSelect}
        onOk={handleSelectConfirm}
        onCancel={handleSelectCancel}
        maskClosable={false}
      >
        <SelectRemote
          className={styles.select}
          request={getCaseModelListDict}
          mode='tags'
          value={selectRemoteValue}
          onChange={handleChangeModel}
        />
      </Modal>

    </article>
  )
}

export default CaseRecord