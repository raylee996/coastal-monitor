import React from "react";
import styles from './index.module.sass'

interface Props {
  title: string
  iconName?: string
  className?: string
}

/*前面带icon的标题*/
const Title: React.FC<Props> = ({ title, iconName, className }) => {

  const articleClass = className ? `${styles.littleTitle} ${className}` : styles.littleTitle

  return (
    <article className={articleClass}>
      {iconName ?
        <span className={`icon iconfont ${styles.iconColor} ${iconName}`} /> :
        <span className={`icon iconfont ${styles.iconColor} icon-zhuangshitubiao`} />}
      {title}
    </article>
  )
}

export default Title
