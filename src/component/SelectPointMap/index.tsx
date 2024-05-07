import { Button, Select, SelectProps } from "antd";
import { DefaultOptionType } from "antd/lib/select";
import popup from "hooks/basis/Popup";
import { useEffect, useState } from "react";
import { getPointListAsync } from "server/device";
import { getPlaceDeviceDictByType } from "server/place";
import PointMap from "./component/PointMap";
import styles from "./index.module.sass";


interface Option extends DefaultOptionType {
  type: string | number
  lat: number
  lng: number
}

interface Props extends Omit<SelectProps, 'onChange' | 'value'> {
  /** 点位过滤类型，数组传入支持多选，默认全部类型 */
  typeList?: string[]
  /** select ant组件原始参数 */
  selectProps?: SelectProps
  /** 设置值 */
  value?: any[]
  /** 值更新回调 */
  onChange?: (values: any[]) => void
  /*根据业务功能过滤 1-视频 2-视频联动 3-人脸识别 4-车辆识别 5-船舶结构化 6-视频告警  如：[3,4]*/
  businessFunctions?: number[]
  /** 场所id */
  placeId?: number
  /** 设备点位类型 */
  deviceType?: number
  /** 是否使用deviceCode作为value值 */
  isDeviceCode?: boolean
}

const SelectPointMap: React.FC<Props> = ({ value, typeList, selectProps, placeId, deviceType, onChange, businessFunctions, isDeviceCode }) => {
  console.debug('SelectPointMap')


  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [realvalue, setRealvalue] = useState<any[]>(value || [])


  //赋初始值
  useEffect(() => {
    if (value) {
      setRealvalue(value)
    }
  }, [value]);


  useEffect(() => {
    async function main() {
      try {
        let vo: any
        setLoading(true)
        if (placeId && deviceType) {
          vo = await getPlaceDeviceDictByType(placeId, deviceType)
        } else {
          vo = await getPointListAsync({ typeList, businessFunctions })
        }
        if (isDeviceCode) {
          const _vo = vo.map((item: any) => ({ ...item, value: item.deviceCode }))
          setOptions(_vo)
        } else {
          setOptions(vo)
        }
      } finally {
        setLoading(false)
      }
    }
    main()
  }, [placeId, deviceType, typeList, businessFunctions, isDeviceCode])

  function handleChange(params: string[]) {
    onChange && onChange(params)
    setRealvalue(params)
  }

  function handleMap() {
    popup(<PointMap data={options} value={realvalue} typeList={typeList} onConfirm={handleChange} />, { title: '选择点位', size: 'large' })
  }

  return (
    <article className={styles.wrapper}>
      <Select
        className={styles.select}
        placeholder='请选择点位'
        options={options}
        mode={"multiple"}
        maxTagCount={3}
        maxTagTextLength={4}
        loading={loading}
        value={realvalue}
        allowClear
        showSearch
        optionFilterProp="children"
        onChange={handleChange}
        {...selectProps}
      />
      <Button type="link" onClick={handleMap}>地图选择</Button>
    </article>
  )
}

export default SelectPointMap
