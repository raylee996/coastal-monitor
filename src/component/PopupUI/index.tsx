import PopupBackground from "component/PopupBackground"
import PopupHeaderBackground from "component/PopupHeaderBackground"
import { ReactElement } from "react"
import styles from "./index.module.sass";
import tit_icon from "images/popup/tit_icon.png"
import popup, { PopupProps } from "hooks/basis/Popup";


interface HeaderProps {
  title: any
  onClose: () => void
}

const Header: React.FC<HeaderProps> = ({ title, onClose }) => {
  return (
    <article className={styles.headerWrapper}>
      <header className={styles.headerContent}>
        <img src={tit_icon} alt={title} />
        <span>{title}</span>
        <div onClick={onClose}>×</div>
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


const popupUI = (ele: ReactElement, props?: PopupProps) => {

  const realProps = {
    ...props,
    Header,
    Content
  }

  return popup(ele, realProps)
}

export default popupUI