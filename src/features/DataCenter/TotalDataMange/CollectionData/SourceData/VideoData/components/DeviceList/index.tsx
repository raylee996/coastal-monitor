import { PlaySquareOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import './index.css';
import {Input} from 'antd'


interface Props {
  /** 设备列表 */
  list: any[]
  /** 选择的设备列表 */
  checkList: any[]
  /** 选择更新 */
  onChange: Function
}

const DeviceList: React.FC<Props> = ({ list, checkList, onChange }) => {
  console.debug('DeviceList')

  const [deviceList, setDeviceList] = useState<any[]>([])
  const [selectItems] = useState<any[]>([])

  useEffect(() => {
    const _deviceList = list.map(item => ({
      ...item,
      isSelect: false
    }))
    setDeviceList(_deviceList)
  }, [list])

  useEffect(() => {
    setDeviceList(val => {
      val.forEach(ele => {
        const _isSelect = checkList.some(item => item.id === ele.id)
        ele.isSelect = _isSelect
      })
      return [...val]
    })
  }, [checkList])

  function handleDoubleClick(item: any) {
    console.debug(item)
    onChange(selectItems)
  }

  return (
    <article className={styles.wrapper}>
      <Input placeholder="请输入设备名称搜索"/>
      {deviceList.map(item =>
        <section
          className={styles.item}
          key={item.id}
          onDoubleClick={() => handleDoubleClick(item)}>
          <div className={styles.itemName}>{item.name}</div>
          {item.isSelect && <div className={styles.itemIcon}><PlaySquareOutlined /></div>}
        </section>
      )}
    </article>
  )
}

export default DeviceList