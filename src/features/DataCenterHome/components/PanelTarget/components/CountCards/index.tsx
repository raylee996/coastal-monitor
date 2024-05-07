import { useMemo } from "react";
import styles from "./index.module.sass";
// import SvgPic from 'component/SvgaPic'

interface Props {
  className?: string
  classId?: string
  srcs: string
  value: number | string
  label: string
  onClick?: () => void
}

const CountCards: React.FC<Props> = ({ className, srcs, value, label, onClick ,classId}) => {
  console.debug('CountCard')
  
  
  const articleClass = useMemo(() => className ? `${styles.wrapper} ${className}` : styles.wrapper, [className])
  
  return (
    <article className={articleClass} onClick={onClick}>
      <header>{value}</header>
      <section>
        <img alt="" src={srcs}/>
        <div className={styles.picsvga}>
          {/* <SvgPic isClear={true} pic={srcs} svagid={classId} option={{height:'50px',width:'50px'}}/> */}
        </div>
      </section>
      <footer>{label}</footer>
    </article>
  )
}

export default CountCards