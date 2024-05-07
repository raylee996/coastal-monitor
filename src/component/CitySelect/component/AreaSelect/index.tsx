import { Select } from "antd";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { doGetSysAreaList } from "server/common";
import styles from "./index.module.sass";
const { Option } = Select;


interface ISelect {
  /**下拉项类型，如省：10、城市：20、区：30 */
  level: any

  /**父CODE */
  parentCode: any

  /**额外参数 */
  extra?: any

  /**默认值 */
  defaultValue?: any

  /**option配置项 */
  valise?: any
  onFinish?: any
  onClear?: any

  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void
}

const AreaSelect = forwardRef((props: ISelect, ref) => {
  console.debug("CitySelect")

  const { defaultValue, level, parentCode, onFinish, onChange, onClear, valise } = props

  const [myDefaultValue, setMyDefaultValue] = useState(defaultValue)

  const [option, setOption] = useState<any>([{
    value: '',
    label: '',
  }])


  useEffect(() => {
    // 请求数据的传参

    // 获取下拉数据
    (async function getData() {
      if (parentCode === undefined) {
        setOption([])
      }
      else {
        let dto: any = {
          level: level
        }

        // 北京，天津，上海，重庆
        if (parentCode === "110000" || parentCode === "120000" || parentCode === "310000" || parentCode === "500000" ) {
          // 如果省份是北，天津，上海
          if (level === 2) {
            dto.level = 1
            dto.code = parentCode
          } else {
            dto.level = 3
            dto.parentCode = parentCode
          }
        } else {
          dto.parentCode = parentCode
        }
        if ((level === 2 && parentCode === '') || (level === 3 && parentCode === '')) {
          setOption([])
        } else {
          const vo = await doGetSysAreaList(dto)
          setOption(vo.data)
        }

      }
    }())

  }, [parentCode, level])


  // 下拉选择事件
  function handleChange(data?: any) {
    console.log('myDefaultValue = ' + myDefaultValue)
    setMyDefaultValue(data)
    onChange && onChange(data)
    onFinish && onFinish(data)
  }

  function handleClear() {
    setMyDefaultValue('')
    onChange && onChange('')
    onClear && onClear('')
  }

  function resetOption() {
    setOption([])
    setMyDefaultValue('')
  }

  useImperativeHandle(ref,
    () => ({
      resetOption,
    }))

  return (
    <div className={styles.wrapper}>
      <Select
        allowClear
        value={myDefaultValue}
        onChange={handleChange}
        onClear={handleClear}
      >
        {
          option && option.map((item: any, pIndex: number) => {
            return (
              <React.Fragment key={"province_" + pIndex}>
                <Option value={item[valise.value]} label={item[valise.label]}>
                  <div className="demo-option-label-item">
                    {item[valise.label]}
                  </div>
                </Option>
              </React.Fragment>
            )
          })
        }
      </Select>
    </div>
  )
})

AreaSelect.defaultProps = {
  defaultValue: '',
  valise: {
    label: 'name',
    value: 'code'
  }
}

export default AreaSelect