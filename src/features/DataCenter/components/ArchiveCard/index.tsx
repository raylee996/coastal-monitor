import { Button } from "antd";
import ImageSimple from "hooks/basis/ImageSimple";
import styles from "./index.module.sass";


interface Props {
  mark?: string
  title?: string
  src?: string
  onClick?: () => void
  onArchive?: () => void
}

const ArchiveCard: React.FC<Props> = ({ mark, title, src, onClick, onArchive }) => {
  console.debug('ArchiveCard')

  function handleArchive() {
    onArchive && onArchive()
  }

  function handleClick() {
    onClick && onClick()
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.box} onClick={handleClick}>
        <div className={styles.img}>
          <ImageSimple src={src} width='100%' height='100%' preview={false}/>
        </div>
        {mark && <div className={styles.mark}>{mark}次</div>}
        {title && <div className={styles.title}>{title}</div>}
      </section>
      <footer>
        <Button type="link" onClick={handleArchive}>查看档案</Button>
      </footer>
    </article>
  )
}

export default ArchiveCard