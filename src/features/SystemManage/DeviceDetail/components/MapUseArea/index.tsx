import { Button } from "antd";
import popup from "hooks/basis/Popup";
import { useMemo } from "react";
import DramArea from "./components/DramArea";


interface Props {
  /** 绑定信息 */
  onChange?: Function
  value: any
  /** 最多能创建的图形数量，不传值或者为0时不限制 默认为1 */
  limit?: number
  /** 是否不支持编辑矩形 */
  isNotRectangle?: boolean
  /** 是否不支持编辑多边形 */
  isNotPolygon?: boolean
  /** 是否不支持编辑线条 */
  isNotLine?: boolean
  /** 是否不支持编辑圆形 */
  isNotCircle?: boolean
  /** 确认回调 */
  onConfirm: (value: string[]) => void
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
  /** 展示名称 */
  title?: string
}

const MapUseArea: React.FC<Props> = (props) => {
  console.debug('MapUseArea')


  const { value, onChange, title } = props


  function showPopup() {
    popup(<DramArea {...props} onConfirm={handleChange} />, { title: title || '地图选择', size: 'middle' })
  }


  function handleChange(params: any) {
    onChange && params?.length && onChange(params[0])
  }


  const active = useMemo(() => Boolean(value), [value])


  return (
    <div>
      <Button type="link" onClick={showPopup}>{title || '地图选择'}</Button>
      {active && <span style={{ color: '#ccc' }}>{`已${title || '选择'}`}</span>}
    </div>
  )
}

export default MapUseArea