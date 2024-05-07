import { useMemo } from "react";
import styles from "./index.module.sass";


interface Props {
  className?: string
  src: string
  value: number | string
  label: string
  onClick?: () => void
}

const CountCard: React.FC<Props> = ({ className, src, value, label, onClick }) => {
  console.debug('CountCard')
  
  
  const articleClass = useMemo(() => className ? `${styles.wrapper} ${className}` : styles.wrapper, [className])

  return (
    <article className={articleClass} onClick={onClick}>
      <header>{value}</header>
      <section>
        <img src={src} alt="" />
      </section>
      <footer>{label}</footer>
    </article>
  )
}

export default CountCard