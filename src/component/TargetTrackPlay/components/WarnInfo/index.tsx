import styles from "./index.module.sass";


interface Props {
  text: string
}

const WarnInfo: React.FC<Props> = ({ text }) => {
  console.debug('WarnInfo')


  return (
    <article className={styles.wapper}>{text}</article>
  )
}

export default WarnInfo