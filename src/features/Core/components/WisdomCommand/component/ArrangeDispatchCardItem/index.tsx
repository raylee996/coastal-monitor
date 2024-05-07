import { CloseCircleOutlined, EditOutlined } from "@ant-design/icons";
import { Popconfirm, Space } from "antd";
import popup from "hooks/basis/Popup";
import { TableCardProps } from "hooks/flexibility/CardPanel"
import ArrangeDispatchDetail from "../ArrangeDispatchDetail";
import styles from "./index.module.sass";

const ArrangeDispatchCardItem: React.FC<TableCardProps<any>> = (props) => {
  console.debug('ArrangeDispatchCardItem')

  const { data, onRefresh } = props

  const { id, address, name, msg, people, statusName } = data || {}

  function del(data: any) {

  }

  function hanleClick(data: any) {
    popup(<ArrangeDispatchDetail refreshTable={onRefresh} defaultData={data} />, { title: '编辑部署', size: 'middle' })
  }

  return (
    <article className={styles.wrapper} data-value={id}>
      <div className={styles.flex}>
        <div>{address || '--'}</div>
        <Space className={styles.btn}>
          <EditOutlined onClick={() => hanleClick(data)} />
          <Popconfirm title="确定要删除吗?" onConfirm={() => del(data)}>
            <CloseCircleOutlined />
          </Popconfirm>
        </Space>
      </div>
      <div className={styles.flex}>
        <div>{`人员：${people || '--'}`}</div>
        <div>{statusName}</div>
      </div>
      <div>{`任务名称：${name || '--'}`}</div>
      <div>{`任务描述：${msg || '--'}`}</div>
    </article>
  )
}

export default ArrangeDispatchCardItem