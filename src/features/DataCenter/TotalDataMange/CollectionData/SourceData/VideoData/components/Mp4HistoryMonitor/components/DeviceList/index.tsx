import { PlaySquareOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import styles from "./index.module.sass";
import './index.css';
import { Input } from "antd";


interface Props {
  /** 设备列表 */
  list: any[]
  /** 选择的设备列表 */
  checkList?: any[]
  /** 选中的设备 */
  target?: any
  /** 选择更新 */
  onChange: (data: any) => void
  /** 搜索 */
  onSearch: (text: string) => void
}

const DeviceList: React.FC<Props> = ({ list, checkList, target, onChange, onSearch }) => {
  console.debug('DeviceList')


  const [deviceList, setDeviceList] = useState<any[]>([])
  const [selectItems, setSelectItems] = useState<any[]>([])


  useEffect(() => {
    const _deviceList = list.map(item => ({
      ...item,
      isSelect: false
    }))
    setDeviceList(_deviceList)
  }, [list])

  useEffect(() => {
    if (checkList) {
      setDeviceList(val => {
        val.forEach(ele => {
          const _isSelect = checkList.some(item => item.id === ele.id)
          ele.isSelect = _isSelect
        })
        return [...val]
      })
      setSelectItems(checkList)
    }
  }, [checkList])

  useEffect(() => {
    if (target) {
      setDeviceList(val => {
        val.forEach(ele => {
          if (ele.id === target.id) {
            ele.isTarget = true
          } else {
            ele.isTarget = false
          }
        })
        return [...val]
      })
    }
  }, [target])


  const handleDoubleClick = useCallback(
    (item: any) => {
      if (!selectItems.some(ele => ele.id === item.id)) {
        onChange({
          selectItems,
          target,
          clickItem: item
        })
      }
    },
    [selectItems, target, onChange],
  )

  const handleSearch = useCallback(
    (value: string) => {
      onSearch(value)
    },
    [onSearch],
  )

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <Input.Search
          placeholder='按设备名称或者编码搜索'
          size="small"
          onSearch={handleSearch}
        />
      </header>
      <section className={styles.content}>
        {deviceList.map(item =>
          <section
            className={item.isTarget ? styles.itemTarget : styles.item}
            key={item.id}
            onDoubleClick={() => handleDoubleClick(item)}>
            {item.isSelect && <div className={styles.itemIcon}><PlaySquareOutlined /></div>}
            <div className={styles.deviceName} title={item.deviceName}>{item.deviceName}</div>
          </section>
        )}
      </section>
    </article>
  )
}

export default DeviceList