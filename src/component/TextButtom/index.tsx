import { useCallback, useMemo } from 'react'
import styles from './index.module.sass'

interface Props {
  className?: string
  children: string
  onClick?: () => void
}

/** 简单的文本按钮组件，用于展示一小段可点击的文本内容 */
const TextButtom: React.FC<Props> = ({ className, children, onClick }) => {
  console.debug('TextButtom')


  const handleClick = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (onClick) {
        evt.stopPropagation()
        onClick()
      }
    },
    [onClick],
  )


  const articleClass = useMemo(() => className ? `${className} ${styles.wapper}` : styles.wapper, [className])


  return (
    <article className={articleClass} onClick={handleClick}>{children}</article>
  )
}

export default TextButtom