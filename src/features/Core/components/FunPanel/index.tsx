import { ReactElement, useCallback, useEffect, useMemo, useState } from "react"
import styles from "./index.module.sass";
import tit_icon from "images/popup/tit_icon.png"
import PopupBackground from "component/PopupBackground";
import PopupHeaderBackground from "component/PopupHeaderBackground";
import { windowstillOffset } from "hooks/basis/Windowstill";

interface Props {
  className?: string
  isLarge?: boolean
  title?: string
  children?: ReactElement
  onClose?: () => void
  zIndex?: number
}

const FunPanel: React.FC<Props> = ({ className, isLarge, title, children, onClose, zIndex }) => {
  console.debug('FunPanel')


  const [articleStyle, setArticleStyle] = useState<React.CSSProperties>(() => {
    windowstillOffset.z += 1
    return {
      zIndex: windowstillOffset.z
    }
  })


  const articleClass = useMemo(() => {
    const wrapperClass = isLarge ? styles.wrapperLarge : styles.wrapper
    return className ? `${wrapperClass} ${className}` : wrapperClass
  }, [isLarge, className])


  const handleClose = useCallback(
    () => {
      onClose && onClose()
    },
    [onClose],
  )

  const handleMouseDown = useCallback(
    () => {
      windowstillOffset.z += 1
      setArticleStyle({ zIndex: windowstillOffset.z })
    },
    [],
  )

  useEffect(() => {
    if (zIndex) {
      setArticleStyle({
        zIndex
      })
    }
  }, [zIndex])



  return (
    <article className={articleClass} style={articleStyle} onMouseDown={handleMouseDown}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <img className={styles.headerImg} src={tit_icon} alt={title} />
          <span>{title}</span>
          <div className={styles.off} onClick={handleClose}>×</div>
        </div>
        <PopupHeaderBackground />
      </header>
      <section>{children}</section>
      <PopupBackground />
    </article>
  )
}

export default FunPanel