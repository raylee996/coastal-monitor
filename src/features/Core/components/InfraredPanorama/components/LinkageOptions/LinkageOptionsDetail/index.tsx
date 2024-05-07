import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { addEditDevicePanorama, queryDevice } from "server/core/infraredPanorama"
import './index.sass';

interface Props {
  /** 红扫设备id */
  panoramaId: number
  /** 刷新列表 */
  refresh: Function
  onClosePopup?: any
}

const Inputs = [
  ['区域名称', 'areaName', {
    isRequired: true,
    placeholder: '请输入区域名称',
    isRow: true,
  }],
  ['联动摄像头', 'linkageId', InputType.selectRemote, {
    request: () => queryDevice({ deviceTypes: ['1'], isLinkage: 1 }),
    placeholder: '请选择联动摄像头',
    isRow: true,
  }],
  ['P', 'pan', InputType.number, {
    style: {
      width: '100%'
    }
  }],
  ['T', 'tilt', InputType.number, {
    style: {
      width: '100%'
    }
  }],
  ['Z', 'zoom', InputType.number, {
    style: {
      width: '100%'
    }
  }],
]

const LinkageOptionsDetail: React.FC<Props> = ({ panoramaId, refresh, onClosePopup }) => {
  console.debug('LinkageOptionsDetail')

  async function handleFinish(params: any) {
    await addEditDevicePanorama({ ...params, panoramaId })
    onClosePopup && onClosePopup()
    refresh(panoramaId)
  }

  return (
    <article className={`Linkage__Options__DetailForm`}>
      <FormInterface
        inputs={Inputs}
        options={{
          column: 3,
          isShowReset: true
        }}
        formProps={{
          labelCol: {
            span: 6,
          }
        }}
        onFinish={handleFinish}
      />
    </article>
  )
}

export default LinkageOptionsDetail