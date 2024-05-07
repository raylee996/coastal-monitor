import { Button, RadioChangeEvent, SelectProps } from "antd";
import { getAreaList } from "server/core/controlManage";
import DrawRectangle from "component/DrawRectangle";
import popup from "hooks/basis/Popup";
import SelectRemote from "hooks/basis/SelectRemote";
import { useEffect, useState } from "react";

interface ISelectProps extends SelectProps {
  //走访信息组件
  onChange?: (e: RadioChangeEvent) => void
  /** 值 */
  value?: any
  /** 表单控件参数 */
  inputProps: any
}

/** 带新增按钮的select自定义组件 */
const AreaSelectRemote: React.FC<ISelectProps> = (props) => {
  console.debug('AreaSelectRemote', props)

  const { value, onChange, inputProps } = props

  const [activeId, setActiveId] = useState<number>();

  const [polygon, setPolygon] = useState<[number, number][]>([]);
  console.log(polygon, 'polygon')

  useEffect(() => {
    console.log(value, "value")
    setActiveId(value)
  }, [value])

  function onChangeData(data: { id: RadioChangeEvent }) {
    onChange && onChange(data.id)
  }

  function handleClick() {
    popup(<DrawRectangle setPolygon={setPolygon} activeId={activeId} onChangeData={onChangeData} />, { title: '区域管理', size: "large" })
  }

  function handleOnChange(value: RadioChangeEvent) {
    onChange && onChange(value)
  }

  return (
    <section style={{ display: 'flex' }}>
      <SelectRemote
        request={getAreaList}
        onChange={handleOnChange}
        {...inputProps}
      />
      <Button type="link" onClick={handleClick}>添加区域</Button>
    </section>
  )
}

export default AreaSelectRemote