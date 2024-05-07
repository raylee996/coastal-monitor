import { useMemo } from "react";
import styles from "./index.module.sass";


interface Props {
  className?: string
  value?: number
}

const TotalShow: React.FC<Props> = ({ className, value }) => {
  console.debug('TotalShow')

  const articleClass = useMemo(() => className ? `${styles.wrapper} ${className}` : styles.wrapper, [className])

  return (
    <article className={articleClass}>
      <section className={styles.bkImg} />
      <section className={styles.content} />
      <section className={styles.value}>
        <div>{value}</div>
        <div>总计</div>
      </section>
    </article>
  )
}

export default TotalShow