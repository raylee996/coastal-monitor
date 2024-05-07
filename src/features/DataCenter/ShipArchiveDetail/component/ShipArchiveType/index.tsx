import { Radio, RadioChangeEvent } from "antd";
import { shipTypeDict } from "helper/dictionary";
import React, { useEffect } from "react";
import { useState } from "react";
import styles from "./index.module.sass";


interface ShipArchiveTypeProps {
  /** 数据项 */
  data?: any
  option?: any
  /** 是否显示统计数字 */
  hasNum?: boolean
  defaultValue?: any
  onFinish?: any
  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void
}



// 船舶分类
const ShipArchiveType: React.FC<ShipArchiveTypeProps> = ({ data, value, hasNum, onFinish, onChange, defaultValue }) => {
  console.debug("ShipArchiveType")
  
  const [val, setVal] = useState(value === undefined ? defaultValue : value)
  const [shipTableType, setShipTableType] = useState<any>(shipTypeDict)

  useEffect(() => {
    if (data) {
      setShipTableType(data)
    }
  }, [data])

  function handleOnChange({ target: { value } }: RadioChangeEvent) {
    setVal(value)

    onFinish && onFinish(value)
    onChange && onChange(value)
  }

  return (
    <div className={styles.wrapper}>
      <Radio.Group value={val} defaultValue={defaultValue} onChange={handleOnChange}>
        {
          shipTableType.map((item: any, index: number) => {
            return (
              <React.Fragment key={'ship_table_type_' + index}>
                <Radio.Button value={item.value}>{item.name} {hasNum ? `(${item.num})` : null}</Radio.Button>
              </React.Fragment>
            )
          })
        }
      </Radio.Group>
    </div>
  )
}
ShipArchiveType.defaultProps = {
  defaultValue: 2
}
export default ShipArchiveType