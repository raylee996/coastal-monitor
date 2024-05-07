import { Button, Radio, RadioChangeEvent, Space } from "antd"
import { useState } from "react"
import { editShipType } from "server/ship"
import styles from "./index.module.sass";


interface Props {
  /** 船舶档案id */
  id?: number
  /** 船舶重点关注一般类型 */
  focusType?: number
  /** 成功回调 */
  onFinish?: (type: number) => void
  onClosePopup?: () => void
}

const ShipChangeType: React.FC<Props> = ({ id, focusType, onFinish, onClosePopup }) => {
  console.debug('ShipChangeType')

  const [defaultValue] = useState(focusType || 4)
  const [value, setValue] = useState(defaultValue)

  const [isLoading, setIsLoading] = useState(false)

  function handleChange(param: RadioChangeEvent) {
    setValue(param.target.value)
  }

  function handleCancel() {
    onClosePopup && onClosePopup()
  }

  async function handleConfirm() {
    if (id) {
      setIsLoading(true)
      await editShipType(id, value)
      setIsLoading(false)
      onFinish && onFinish(value)
      onClosePopup && onClosePopup()
    }
  }

  return (
    <article className={styles.wrapper}>
      <section>
        <Radio.Group onChange={handleChange} defaultValue={defaultValue}>
          <Radio value={2}>重点&nbsp;<i className={` fa fa-square`} aria-hidden="true" style={{ color: 'rgb(190, 37, 240)' }}></i></Radio>
          <Radio value={3}>关注&nbsp;<i className={` fa fa-square`} aria-hidden="true" style={{ color: 'rgb(70, 204, 255)' }}></i></Radio>
          <Radio value={4}>一般&nbsp;<i className={` fa fa-square`} aria-hidden="true" style={{ color: 'rgb(37, 240, 118)' }}></i></Radio>
        </Radio.Group>
      </section>
      <footer>
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button loading={isLoading} onClick={handleConfirm}>确认</Button>
        </Space>
      </footer>
    </article>
  )
}

export default ShipChangeType