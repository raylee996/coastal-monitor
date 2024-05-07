import { CloseOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import { useCallback, useState } from "react";
import styles from "./index.module.sass";


interface Props {
  content: string
  onClose: () => void
}

const TextMarkerContent: React.FC<Props> = ({ content, onClose }) => {
  console.debug('TextMarkerContent')


  const [isShowClose, setIsShowClose] = useState(false)
  const [isRemoveIng, setIsRemoveIng] = useState(false)


  const handleEnter = useCallback(
    () => {
      setIsShowClose(true)
    },
    []
  )

  const handleLeave = useCallback(
    () => {
      if (!isRemoveIng) {
        setIsShowClose(false)
      }
    },
    [isRemoveIng],
  )

  const handleRemove = useCallback(
    () => {
      setIsRemoveIng(true)
    },
    []
  )


  const handleCancel = useCallback(
    () => {
      setIsRemoveIng(false)
      setIsShowClose(false)
    },
    []
  )


  const handleConfirm = useCallback(
    () => {
      setIsRemoveIng(false)
      setIsShowClose(false)
      onClose()
    },
    [onClose]
  )


  return (
    <article className={styles.wrapper} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <span>{content}</span>
      {isShowClose &&
        <Popconfirm
          title='删除标记?'
          okText='确认'
          cancelText='取消'
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        >
          <CloseOutlined className={styles.textInfoClose} onClick={handleRemove} />
        </Popconfirm>
      }
    </article>
  )
}

export default TextMarkerContent