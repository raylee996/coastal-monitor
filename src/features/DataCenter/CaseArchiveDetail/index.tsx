import SelectLatLng from "component/SelectLatLng"
import { caseMarkDict } from "helper/dictionary"
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { doUploadFile } from "server/common"
import { addEditAreaServeItem, getAreaList, getCaseArchiveDetail } from "server/dataCenter/caseArchive"
import { getLabelListSelect } from "server/label"
import { getDictDataByType } from "server/system"
import styles from "./index.module.sass";
import { isNumbers } from "helper/validate";

interface ICaseArchiveDetail {
  /** 案件id */
  id?: string
  /** 配置表单类型 */
  type?: UseType
  onClosePopup?: Function
  onFinish?: Function
}

const CaseArchiveDetail: React.FC<ICaseArchiveDetail> = (props) => {
  console.debug('CaseArchiveDetail')
  const { type, id, onClosePopup, onFinish } = props

  const formInputs: any = [
    ['案件名称', 'caseName', {
      isRow: true,
      placeholder: '请输入案件名称',
      isRequired: true,
      maxLength: 100,
    }],
    ['案件编号', 'caseNo', {
      placeholder: '请输入案件编号',
      isRequired: true,
      maxLength: 20,
      // itemProps: { rules: [isNumbers] }
    }],
    [
      '案情来源',
      'caseSource',
      InputType.selectRemote, {
        request: () => getDictDataByType("archive_case_source"),
        placeholder: '请选择案情来源',
        isRequired: true,
      }
    ],
    [
      '专案标识',
      'caseMark',
      InputType.select, {
        dict: caseMarkDict,
        placeholder: '请选择专案标识',
        isRequired: true,
      }
    ],
    ['案情描述', 'caseDescr', InputType.textArea, {
      placeholder: '请输入案情描述',
      isRequired: true,
      isRow: true,
      maxLength: 1000,
    }],
    [
      '案件类别',
      'labelId',
      InputType.selectRemote, {
        request: () => getLabelListSelect({ type: 8 }),
        placeholder: '请选择案件类别',
        isRequired: true,
      }
    ],
    ['发案地经纬度', 'happenDimen', InputType.component, {
      component: SelectLatLng,
    }
    ],
    ['发案时间', 'happenTime', InputType.dateTimeRange],
    [
      '发案地地区',
      'happenRegion',
      InputType.cascaderRemote,
      {
        remote: getAreaList,
        colNum: 2
      }
    ],
    ['发案地详址', 'happenAddress', {
      placeholder: '请输入发案地详址',
      maxLength: 80,
    }],
    [
      '立案单位地区',
      'registerRegion',
      InputType.cascaderRemote,
      {
        remote: getAreaList,
        colNum: 2,
      }
    ],
    ['立案单位', 'registerUnit', {
      placeholder: '请输入立案单位',
      maxLength: 100,
    }],
    ['作案人数', 'crimesPeoples', {
      placeholder: '请输入作案人数',
      suffix: '人',
      maxLength: 3,
      itemProps: { rules: [isNumbers] }
    }],
    ['作案手段', 'crimesMeans', {
      placeholder: '请输入作案手段',
      maxLength: 100,
    }],
    ['作案特点', 'crimesFeatures', {
      placeholder: '请输入作案特点',
      maxLength: 100,
    }],
    ['作案工具', 'crimesTools', {
      placeholder: '请输入作案工具',
      isRow: true,
      style: { width: '26.8%' },
      maxLength: 100,
    }],
    ['选择时机', 'chooseOpportunity', {
      placeholder: '请输入选择时机',
      maxLength: 100,
    }],
    ['选择住所', 'choosePremises', {
      placeholder: '请输入选择住所',
      maxLength: 100,
    }],
    ['选择对象', 'chooseObject', {
      placeholder: '请输入选择对象',
      maxLength: 100,
    }],
    ['选择物品', 'chooseThing', {
      placeholder: '请输入选择物品',
      isRow: true,
      style: { width: '26.8%' },
      maxLength: 10,
    }],
    ['死亡人数', 'mortality', {
      placeholder: '请输入死亡人数',
      suffix: '人',
      maxLength: 3,
      itemProps: { rules: [isNumbers] }
    }],
    ['受伤人数', 'hurters', {
      placeholder: '请输入受伤人数',
      suffix: '人',
      maxLength: 3,
      itemProps: { rules: [isNumbers] }
    }],
    ['损失价值', 'lostValue', {
      placeholder: '请输入损失价值',
      suffix: '元',
      maxLength: 11,
      itemProps: { rules: [isNumbers] }
    }],
    ['图片信息', 'imgUrls',
      InputType.uploadImg,
      ShowType.image,
      {
        isRow: true,
        maxCount: 9,
        useType: UseType.edit,
        uploadImgFn: doUploadFile,
        showMessage: true
      }
    ],
    ['视频信息', 'videoUrls',
      InputType.uploadVideo,
      ShowType.video,
      {
        isRow: true,
        maxCount: 9,
        useType: UseType.edit,
        uploadVideoFn: doUploadFile,
        showMessage: true,
      }
    ],
  ]

  async function handleFinish(data: any) {
    console.debug('handle Finish')
    await addEditAreaServeItem(data)
    onFinish && onFinish()
    onClosePopup && onClosePopup()
  }

  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={id}
        inputs={formInputs}
        formType={type}
        formProps={{
          labelCol: {
            span: 6,
          }
        }}
        options={{
          submitText: '确认',
          column: 3,
          isShowReset: true
        }}
        getRequest={async () => {
          const vo = await getCaseArchiveDetail({ id })
          return vo
        }}
        onFinish={handleFinish}
      />
    </article>
  )
}

export default CaseArchiveDetail