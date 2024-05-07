import SelectLatLng from "component/SelectLatLng";
import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface"
import { useEffect, useState } from "react";
import { getAllUserList } from "server/system";
import styles from './index.module.sass'

interface Props {
  refreshTable?: Function
  onClosePopup?: Function,
  //编辑默认值
  defaultData?: any
}

const Inputs = [
  ['任务名称', 'name', InputType.input, {
    placeholder: '请输入任务名称',
    isRequired: true,
  }],
  ['任务说明', 'caseMsg', InputType.textArea, {
    placeholder: '请输入任务说明',
    rows: 4
  }],
  ['任务地点', 'name', InputType.input, {
    placeholder: '请输入任务地点',
  }],
  ['经纬度', 'latLng', InputType.component, {
    component: SelectLatLng,
  }],
  ['人员', 'approveDeptId', InputType.cascaderRemote,
    {
      request: getAllUserList,
      placeholder: '请选择责任人',
    }
  ],
]

const ArrangeDispatchDetail: React.FC<Props> = ({ refreshTable, onClosePopup, defaultData }) => {
  console.debug('ArrangeDispatchDetail')

  const [formData, setFormData] = useState<any>();

  function onFinish() {
    //关闭弹窗
    onClosePopup && onClosePopup();
    //刷新表格
    refreshTable && refreshTable()
  }

  useEffect(() => {
    defaultData && setFormData(defaultData)
  }, [defaultData])

  return (
    <article className={styles.wrapper}>
      <FormInterface
        initData={formData}
        onFinish={onFinish}
        inputs={Inputs}
        formProps={{
          labelCol: {
            span: 3,
          }
        }}
        options={{
          isShowReset: true,
        }} />
    </article>
  )
}

export default ArrangeDispatchDetail