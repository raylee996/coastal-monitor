import { FormInstance } from "antd";
import { menuStatusDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { addDeptData, editDeptData, getDeptCascader, getDeptData } from "server/user";
import styles from "./index.module.sass";

const inputs = [
  ['上级部门', 'parentId', InputType.cascaderRemote, {
    remote: getDeptCascader,
    changeOnSelect: true
  }],
  ['部门名称', 'deptName',{
    isRequired: true
  }],
  ['部门编号', 'deptCode',{
    isRequired: true
  }],
  ['负责人', 'leader'],
  ['负责人联系电话', 'phone'],
  ['显示顺序', 'orderNum', InputType.number,  {
    isRequired: true
  }],
  ['部门状态', 'status', InputType.radio, {
    dict: menuStatusDict
  }],
  ['备注', 'remark', InputType.textArea],
]

interface Props {
  onClosePopup?: Function
  onSuccess?: Function
  id?: number
  type?: UseType
}

const DeptDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('DeptDetail')

  async function handleFinish(params: any) {
    if (id) {
      await editDeptData(params)
    } else {
      await addDeptData(params)
    }
    onSuccess && onSuccess()
    onClosePopup && onClosePopup()
  }

  function handleFill(form: FormInstance) {
    form.setFieldsValue({
      deptName: Mock.Random.ctitle(),
      deptCode: Mock.Random.string('number', 8),
      leader: Mock.Random.cname(),
      phone: Mock.Random.string('number', 11),
      orderNum: Mock.Random.integer(10, 1000),
      remark: Mock.Random.word()
    })
  }

  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={id}
        getRequest={getDeptData}
        formType={type}
        inputs={inputs}
        initData={{
          status: '0'
        }}
        formProps={{ labelCol: { span: 7 } }}
        onAsyncFinish={handleFinish}
        onFill={handleFill}
      />
    </article>
  )
}

export default DeptDetail