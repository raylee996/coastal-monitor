import PopupBackground from "component/PopupBackground"
import PopupHeaderBackground from "component/PopupHeaderBackground"
import windowstill, { WindowstillProps } from "hooks/basis/Windowstill"
import { ReactElement } from "react"
import styles from "./index.module.sass";
import tit_icon from "images/popup/tit_icon.png"


interface HeaderProps {
  title: string
  onClose: () => void
}

const Header: React.FC<HeaderProps> = ({ title, onClose }) => {
  return (
    <article className={styles.headerWrapper}>
      <header className={styles.headerContent}>
        <div className={styles.winTitle}>
          <img src={tit_icon} alt={title} />
          <span>{title}</span>
        </div>
        <div className={styles.closeBtn} onClick={onClose}>×</div>
      </header>
      <PopupHeaderBackground />
    </article>
  )
}

interface ContentProps {
  content: ReactElement
}

const Content: React.FC<ContentProps> = ({ content }) => {
  return (
    <article className={styles.contentWrapper}>
      {content}
      <PopupBackground />
    </article>
  )
}


const windowUI = (ele: ReactElement, props: WindowstillProps) => {
  console.debug('windowUI')

  const style = {
    ...props.style,
    wrapperStyle: {
      ...props.style?.wrapperStyle,
      background: 'none'
    }
  }

  const realProps = {
    ...props,
    style,
    Header,
    Content
  }

  return windowstill(ele, realProps)
}

export default windowUI