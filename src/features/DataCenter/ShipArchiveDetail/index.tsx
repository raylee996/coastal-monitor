import { Form } from "antd";
import LabelSelect from "component/LabelManage/components/LabelSelect";
import XcRadios from "component/XcRadios";
import { commonTFDict, shipTypeDict } from "helper/dictionary";
import { InputType, PanelOptions, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { doGetDictTypeData } from "server/common";
import { uploadShipArchiveImg } from "server/file";
import { doAddEditShip, getShipInfoData } from "server/ship";
import InputMmsi from "./component/InputMmsi";
import styles from "./index.module.sass";


const options: PanelOptions = {
  submitText: '确认',
  column: 3,
  isShowClear: true
}

const initData = {
  focusType: 2
}

const formProps = {
  labelCol: {
    span: 6,
  }
}

interface IShipDetail {
  /** 表单状态，新增,编辑 */
  type?: UseType
  id?: string
  isSelect?: boolean
  onClosePopup?: Function
  onFinish?: Function
  /** 数据类型 1-AIS 2-雷达 */
  dataType?: number
  /** 雷达编号 */
  radarNumber?: string

  // 船舶所有信息
  shipInfoData?: any
}

// let timer: any
let aisId: string

const ShipArchiveDetail: React.FC<IShipDetail> = ({ type, id, onClosePopup, onFinish, dataType, radarNumber, isSelect, shipInfoData }) => {
  console.debug('ShipArchiveDetail')


  const [form] = Form.useForm();


  const [disaMmsi, setDisaMmsi] = useState(false)
  const [otherParams, setOtherParams] = useState<any>()
  const [isRadarPage, setIsRadarPage] = useState<boolean>(false)
  const [shipInfo, setShipInfo] = useState<any>()


  // 获取mmsi数据更新from表单
  const handleMMSIInfo = useCallback(async (e: any, key: string) => {
    // 为空不执行
    if (!e) {
      return;
    }
    const val = Object.prototype.toString.call(e) === '[object String]' ? e : e?.target?.value
    // 非雷达编辑不执行该操作
    if (disaMmsi || type !== UseType.edit || !isRadarPage || !val) {
      return
    }
    // 查ais-info 更新from表单值
    // timer && clearTimeout(timer)
    // timer = setTimeout(async () => {
    let para: { [key: string]: string } = {}
    para[key] = val
    const vo = await getShipInfoData(para)
    if (vo?.id) {
      const formData = form.getFieldsValue()
      form.setFieldsValue({ ...formData, ...vo })
      // 记录查到的ais id
      aisId = vo.id
    }
    // }, 2000);
  }, [disaMmsi, form, isRadarPage, type])

  // 上传图片
  const doUploadFile = useCallback(
    async (file: any) => {
      const mmsi = form.getFieldValue('')
      return await uploadShipArchiveImg(file, mmsi, shipInfo)
    },
    [form, shipInfo],
  )


  const formInputs = useMemo(() => [
    [
      '船舶分类',
      'focusType',
      InputType.component,
      {
        component: XcRadios,
        option: { data: shipTypeDict },
        isRow: true,
      }
    ],
    ['中文船名', 'cnName', {
      placeholder: '请输入',
      maxLength: 100,
      onBlurFunc: (e: any) => handleMMSIInfo(e, 'cnName')
    }
    ],
    ['MMSI', 'mmsi', InputType.component, {
      component: InputMmsi,
      targetId: id,
      type,
      form,
      extra: { disaMmsi },
      maxLength: 50,
      onBlurFunc: (e: any) => handleMMSIInfo(e, 'mmsi')
    }
    ],
    [
      '船舶类型',
      'shipType',
      InputType.selectRemote, {
        request: async () => {
          const vo = await doGetDictTypeData({ dictType: 'archive_ship_type' })
          return vo.data
        },
      }
    ],
    [
      '南山船舶',
      'isNanShan',
      InputType.radio, {
        dict: commonTFDict
      }
    ],
    [
      '作业类型',
      'jobType',
      InputType.selectRemote, {
        request: async () => {
          const vo = await doGetDictTypeData({ dictType: 'archive_job_type' })
          return vo.data
        },
      }
    ],
    ['呼号', 'callSign', {
      placeholder: '请输入',
      maxLength: 50,
    }],
    ['IMO', 'imo', {
      placeholder: '请输入',
      maxLength: 50,

    }],
    ['船长', 'shipLong',
      InputType.number,
      {
        placeholder: '请输入',
        precision: 2,
        style: { width: '100%' }
      }
    ],
    ['船宽', 'shipWide',
      InputType.number,
      {
        placeholder: '请输入',
        precision: 2,
        style: { width: '100%' }
      }
    ],
    ['吃水', 'draftDepth', InputType.number,
      {
        placeholder: '请输入',
        precision: 2,
        style: { width: '100%' }
      }
    ],

    ['船主', 'shipowner', {
      placeholder: '请输入',
      maxLength: 200,
    }],

    ['船主证件号码', 'shipownerIdcard', {
      placeholder: '请输入',
      maxLength: 18,
    }],

    ['船主电话', 'shipownerPhone', {
      placeholder: '请输入',
      maxLength: 50,
    }],

    ['船上负责人', 'principal', {
      placeholder: '请输入',
      maxLength: 50,
    }],

    ['负责人证件号码', 'principalIdcard', {
      placeholder: '请输入',
      maxLength: 50,
    }],

    ['负责人电话', 'principalPhone', {
      placeholder: '请输入',
      maxLength: 50,
    }],

    ['备案派出所', 'recordPoliceOffice', {
      placeholder: '请输入',
      maxLength: 100,
    }],

    ['所属分局', 'branch', {
      placeholder: '请输入',
      maxLength: 100,
    }],

    ['船舶管理公司', 'mtgCompany', {
      placeholder: '请输入',
      maxLength: 200,
    }],

    ['船舶经营公司', 'cobCompany', {
      placeholder: '请输入',
      maxLength: 200,
    }],

    ['船舶DOC公司', 'docCompany', {
      placeholder: '请输入',
      maxLength: 200,
    }],

    ['船舶注册公司', 'regCompany', {
      placeholder: '请输入',
      maxLength: 200,
    }],

    ['技术管理公司', 'techCompany', {
      placeholder: '请输入',
      maxLength: 200,
    }],

    ['总吨', 'grossTonnage', InputType.number,
      {
        placeholder: '请输入',
        precision: 2,
        style: { width: '100%' }
      }],

    ['船籍', 'registry', {
      placeholder: '请输入',
      maxLength: 50,
    }],

    ['造船厂', 'shipyard', {
      placeholder: '请输入',
      maxLength: 50,
    }],
    ['净吨', 'netTonnage', InputType.number,
      {
        placeholder: '请输入',
        precision: 2,
        style: { width: '100%' }
      }],
    ['船籍港', 'registryPort', {
      placeholder: '请输入',
      maxLength: 50,
    }],

    ['造船地点', 'buildSite', {
      placeholder: '请输入',
      maxLength: 200,
    }],
    ['载重吨', 'deadWeight', InputType.number,
      {
        placeholder: '请输入',
        precision: 2,
        style: { width: '100%' }
      }
    ],
    ['船级社', 'classificationSociety', {
      placeholder: '请输入',
      maxLength: 200,
    }],

    [
      '造船日期', 'buildDate', InputType.date,
      {
        style: { width: '100%' }
      }
    ],
    ['排水量', 'displacement', InputType.number,
      {
        placeholder: '请输入',
        precision: 2,
        style: { width: '100%' }
      }
    ],
    ['经济航速', 'economicSpeed', InputType.number,
      {
        placeholder: '请输入',

        style: { width: '100%' }
      }],
    ['最大船速', 'maximumSpeed', InputType.number,
      {
        placeholder: '请输入',

        style: { width: '100%' }
      }],

    ['船身照片', 'shipImgPathList',
      InputType.uploadPicture,
      {
        isRow: true,
        maxCount: 2,
        onUpload: doUploadFile
      }
    ],
    [
      '标签',
      'labelIds',
      InputType.component,
      {
        component: LabelSelect,
        type: 4,
        isFilter: true,// 是否过滤标签值，false:加载全部标签值
        optionMode: 2,// 下拉值类型是自定义格式
        placeholder: '请输入',
        isSelect: isSelect,
        style: { width: "360px" }
      }
    ]
  ], [disaMmsi, form, handleMMSIInfo, id, type, isSelect, doUploadFile])


  useEffect(() => {
    if (type === UseType.edit && dataType) {
      // 更新雷达标识
      setIsRadarPage(dataType === 2)
      // 保存 dataType 和 radarNumber
      setOtherParams(() => {
        // 编辑ais 加dataType参数； 编辑雷达 加dataType + radarNumber
        const res: any = { dataType };
        dataType === 2 && radarNumber && (res.radarNumber = radarNumber);
        return res
      })
    }
  }, [dataType, radarNumber, type])


  const handleFinish = useCallback(
    async (data: any) => {
      const _id = id
      if (!_id) {
        // 新增
        const vo = await doAddEditShip({ ...data })
        if (vo.code === 200 || vo.includes('成功')) {
          // common.showMessage({ msg: '新增成功', type: 'success' })
          onFinish && onFinish()
          onClosePopup && onClosePopup() // 关闭POPUP
        }
      } else { // 编辑
        const { id, ...para } = data
        // 编辑雷达且没有查询到mmsi时 去掉id
        // 编辑时，需要把原来所有的信息带过去，即shipInfoData
        const vo = await doAddEditShip({
          ...shipInfoData,
          ...para,
          ...otherParams,
          ...aisId ? { id: aisId } : {},
          ...dataType === 1 ? { id } : {}
        })
        if (vo.code === 200 || vo.includes('成功')) {
          // common.showMessage({ msg: '更新成功', type: 'success' })
          onFinish && onFinish()
          onClosePopup && onClosePopup() // 关闭POPUP
        }
      }
    },
    [dataType, id, onClosePopup, onFinish, otherParams, shipInfoData],
  )

  const handleClose = useCallback(
    () => {
      onClosePopup && onClosePopup()
    },
    [onClosePopup],
  )

  const getRequest = useCallback(
    async () => {
      const vo = await getShipInfoData({ id, dataType })
      setDisaMmsi(vo.disaMmsi)
      setShipInfo(vo)
      return vo
    },
    [id, dataType],
  )


  return (
    <article className={styles.addShip}>
      <FormInterface
        queryForm={form}
        id={id}
        inputs={formInputs}
        formType={type}
        formProps={formProps}
        initData={initData}
        options={options}
        getRequest={getRequest}
        onFinish={handleFinish}
        onClose={handleClose}
      />
    </article>
  )
}

export default ShipArchiveDetail