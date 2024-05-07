import { Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";


interface Props {
  /** 图标默认展示 */
  defSrc: string
  /** 图标鼠标悬浮展示 */
  hovSrc: string
  /** 图标选中展示 */
  actSrc: string
  /** 受控属性选中状态 */
  isSel: boolean
  /** 元素title属性 */
  title?: string
  /** 鼠标移入事件 */
  onEnter?: () => void
  /** 鼠标移出事件 */
  onLeave?: () => void
  /** 鼠标点击事件 */
  onClick: () => void
}

const MenuButton: React.FC<Props> = ({ defSrc, hovSrc, actSrc, isSel, title, onEnter, onLeave, onClick }) => {
  console.debug('MenuButton')

  const [isSelected, setIsSelected] = useState(false)
  const [iconSrc, setIconSrc] = useState(defSrc)

  const classText = useMemo(() => isSelected ? styles.wrapperAct : styles.wrapperDef, [isSelected])

  useEffect(() => {
    if (isSel) {
      setIconSrc(actSrc)
    } else {
      setIconSrc(defSrc)
    }
    setIsSelected(isSel)
  }, [isSel, actSrc, defSrc])

  function handleEnter() {
    !isSelected && setIconSrc(hovSrc)
    onEnter && onEnter()
  }

  function handleLeave() {
    !isSelected && setIconSrc(defSrc)
    onLeave && onLeave()
  }

  return (
    <div className={classText}>
      <Tooltip title={title} placement="right" color='rgba(7, 32, 55, 0.7)'>
        <div className={styles.cusours} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={onClick}>
          <img className={styles.icon} src={iconSrc} alt='功能' />
        </div>
      </Tooltip>
    </div>
  )
}

export default MenuButton