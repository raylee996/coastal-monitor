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
      <section className={styles.content}>
        <span>{value}</span>
      </section>
    </article>
  )
}

export default TotalShow