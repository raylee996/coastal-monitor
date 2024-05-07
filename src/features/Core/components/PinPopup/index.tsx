import { Button, Popconfirm } from "antd";
import { useCallback } from "react";
import styles from "./index.module.sass";


interface Props {
  id?: number
  layer?: any
  onClear?: (id?: number) => void
}

const PinPopup: React.FC<Props> = ({ id, layer, onClear }) => {
  console.debug('PinPopup')


  const handleConfirm = useCallback(
    () => {
      layer && layer.remove()
      onClear && onClear(id)
    },
    [onClear, id, layer],
  )


  return (
    <article className={styles.wrapper}>
      <Popconfirm
        title="删除标记？"
        onConfirm={handleConfirm}
        okText="确认"
        cancelText="取消"
      >
        <Button type="link">删除</Button>
      </Popconfirm>
    </article>
  )
}

export default PinPopup