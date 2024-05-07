import { warnStatusDict } from "helper/dictionary";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import styles from "./index.module.sass";
import { getWarningList } from "server/core/earlyWarning";
import WarningTypeCardItem from "./components/WarningTypeCardItem";
import WarningDetail from "./components/WarningDetail";
import { getDictDataByType } from "server/system";
import { exportWornFile } from "server/alarm";
import windowUI from "component/WindowUI";
import './index.sass';
import { useAppDispatch } from "app/hooks";
import { useSelector } from "react-redux";
import { currentParams, resetParams } from "slice/funMenuSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import dayjs, { Dayjs } from "dayjs";
import { Form, PaginationProps } from "antd";
import WarningVideo from "./components/WarningVideo";
import { YMDHms } from "helper";
import { WindowsResult } from "hooks/basis/Windowstill";


let detailWindow: WindowsResult

export interface WarningProp {
  /** 预警id */
  id: number
  /** 预警名称 */
  monitorName: string
  /** 预警时间 */
  warnTime: string
  /** 预警内容 */
  warnContent: string
  /** 预警类型 */
  warnType: string
  /**预警次数*/
  warnNum: string,
  /**预警状态*/
  status: string,
  /** 内容类型 */
  contentType: number
  /** 布控或建模id */
  monitorId: number
  /** 布控或建模类型 */
  monitorType: string
  /** 预警等级（对应布控的风险等级） 1-高风险 2-中风险 3-低风险 */
  riskLevel: number
  /** 区域id */
  areaId: string
  /** 设备类型 */
  deviceType: number
  /** 设备编号 */
  deviceCode: string
}

const warningInputs: any[] = [
  ['', 'datetime', InputType.dateTimeRange, {
    allowClear: true,
    style: { width: '360px' }
  }],
  ['', 'warnContent', {
    placeholder: '内容/名称/点位搜索',
    style: { width: '160px' },
    allowClear: true
  }],
  ['', 'monitorType', InputType.selectRemote, {
    request: () => getDictDataByType("monitor_type"),
    placeholder: '请选择布控模块',
    style: { width: '160px' }
  }],
  ['', 'warnTypes', InputType.selectRemote, {
    request: () => getDictDataByType("warn_type"),
    placeholder: '请选择预警类型',
    style: { width: '160px' },
    mode: 'multiple'
  }],
  [
    '', 'status', InputType.select, {
      dict: warnStatusDict,
      placeholder: '请选择状态',
      style: { width: '160px' }
    }],
]



const paginationProps: PaginationProps = {
  showQuickJumper: false,
  size: 'small'
}

const WarningModel: React.FC = () => {
  console.debug('WarningModel')


  const [queryForm] = Form.useForm()


  // 智慧建模跳转至此页面，全局变量currentParams中的modelName，作为默认值搜索
  const dispatch = useAppDispatch()
  const params = useSelector(currentParams)


  // 首次加载组件，获取modelName，用于默认搜索
  const [initWarnContent, setInitWarnContent] = useState<string>(params.modelName || '')
  const [initParams] = useState({
    datetime: [params.createTime ? dayjs(params.createTime) : dayjs().subtract(3, 'day'), dayjs()]
  })
  const [isReady, setIsReady] = useState(false)

  // 关闭组件，销毁currentParams
  useEffect(() => {
    return () => {
      if (isReady) {
        dispatch(resetParams())
      }
    }
  }, [dispatch, isReady])

  // 修改搜索内容
  useEffect(() => {
    if (params.modelName) {
      setInitWarnContent(val => {
        if (_.isEqual(val, params.modelName)) {
          return val
        } else {
          return params.modelName
        }
      })
    }
  }, [params])


  //模型列表点击切换
  const handleClick = useCallback(
    ([item]: WarningProp[]) => {
      if (item) {
        const params = queryForm.getFieldsValue()
        const [start, end]: [Dayjs, Dayjs] = params.datetime ? params.datetime : [null, null]
        // 视频告警
        if (item.monitorType === '05') {
          // 其他视频告警
          detailWindow = windowUI(<WarningVideo
            monitorId={item.monitorId}
            warnContent={item.warnContent}
            warnTypes={params.warnTypes ? params.warnTypes.join(',') : ''}
            startTime={start?.format(YMDHms)}
            endTime={end?.format(YMDHms)}
          />, {
            title: `视频预警`,
            key: '预警详情',
            width: '1330px',
            height: '800px',
            offset: [550, 40]
          })
        }
        else {
          detailWindow = windowUI(<WarningDetail
            id={item.warnContent}
            contentType={item.contentType}
            parentDate={item}
            startTime={start?.format(YMDHms)}
            endTime={end?.format(YMDHms)}
          />, {
            title: `预警详情`,
            key: '预警详情',
            width: '480px',
            height: '800px',
            offset: [1400, 40]
          })
        }
      }
    },
    [queryForm],
  )


  const cardOptions = useMemo(() => {
    if (params.alarmId) {
      return {
        onSelected: handleClick,
        isRadio: true,
        selectedId: params.alarmId
      }
    } else {
      return {
        onSelected: handleClick,
        isRadio: true,
        isSelectedFirst: true
      }
    }
  }, [handleClick, params])

  const queryData = useMemo(() => ({ warnContent: initWarnContent, ...initParams }), [initWarnContent, initParams])

  // 当列表为空时，清除详情
  const onTableData = useCallback(
    (list: any[]) => {
      setIsReady(true)
      if (list.length === 0 && detailWindow) {
        detailWindow.onUnmount()
        // windowUI(<WarningDetail id={'-1'} contentType={-1} parentDate={''} />, {
        //   title: `预警详情`,
        //   key: '预警详情',
        //   width: '480px',
        //   height: '800px',
        //   offset: [11400, 40]
        // })
        // windowUI(<WarningVideo />, {
        //   title: `视频预警`,
        //   key: '预警详情',
        //   width: '1330px',
        //   height: '800px',
        //   offset: [99550, 40]
        // })
      }
    },
    [],
  )

  // const tools = useMemo(() => [
  //   ['导出', {
  //     asyncClick: async () => {
  //       await exportWornFile(queryForm)
  //     }
  //   }]
  // ], [queryForm])

  const handelExport = useCallback(async () => {
    await exportWornFile(queryForm)
  }, [queryForm])

  const queryOptions = useMemo(() => {
    return {
      isShowReset: true,
      footerButtons: [
        {
          text: "导出",
          onClick: handelExport
        }
      ]
    }
  }, [handelExport])

  function handleReset() {
    queryForm.resetFields()
    queryForm.setFieldsValue({
      datetime: [dayjs().subtract(3, 'day'), dayjs()]
    })
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={`${styles.modelList} EarlyWarning__TableStyle`}>
          <TableInterface
            card={WarningTypeCardItem}
            // toolsRight={tools}
            request={getWarningList}
            cardOptions={cardOptions}
            queryInputs={warningInputs}
            queryData={queryData}
            queryOptions={queryOptions}
            queryForm={queryForm}
            paginationProps={paginationProps}
            onTableData={onTableData}
            onQueryReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}

export default WarningModel
