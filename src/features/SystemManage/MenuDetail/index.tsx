import { FormInstance } from "antd";
import { menuStatusDict, menuTypeDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { addMenuData, editMenuData, getMenuCascader, getMenuData } from "server/user";
import styles from "./index.module.sass";

const inputs = [
  ['上级菜单', 'parentId', InputType.cascaderRemote, {
    remote: getMenuCascader,
    changeOnSelect: true
  }],
  ['菜单类型', 'menuType', InputType.radio, {
    dict: menuTypeDict
  }],
  ['权限字符串', 'perms', {
    itemProps: {
      tooltip: '用于权限判断的字符串值'
    },
    isRequired: true
  }],
  ['菜单名称', 'menuName', {
    isRequired: true
  }],
  ['显示顺序', 'orderNum', InputType.number,  {
    isRequired: true
  }],
  ['组件路径', 'component', {
    itemProps: {
      tooltip: '用于对应前端路由'
    },
    isRequired: true
  }],
  ['路由地址', 'path', {
    itemProps: {
      tooltip: '用于对应后台接口路由'
    },
    isRequired: true
  }],
  ['菜单状态', 'status', InputType.radio, {
    dict: menuStatusDict
  }]
]

interface Props {
  onClosePopup?: Function
  onSuccess?: Function
  id?: number
  type?: UseType
}

const MenuDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('MenuDetail')

  async function handleFinish(params: any) {
    if (id) {
      await editMenuData(params)
    } else {
      await addMenuData(params)
    }
    onSuccess && onSuccess()
    onClosePopup && onClosePopup()
  }

  function handleFill(form: FormInstance) {
    form.setFieldsValue({
      menuName: Mock.Random.ctitle(),
      perms: Mock.Random.word(),
      component: Mock.Random.string(),
      path: Mock.Random.string(),
      orderNum: Mock.Random.integer(10, 1000)
    })
  }

  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={id}
        getRequest={getMenuData}
        formType={type}
        inputs={inputs}
        initData={{
          menuType: 'M',
          status: '0'
        }}
        formProps={{ labelCol: { span: 7 } }}
        onAsyncFinish={handleFinish}
        onFill={handleFill}
      />
    </article>
  )
}

export default MenuDetail