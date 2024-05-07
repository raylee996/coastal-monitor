
import styles from './index.module.sass'

interface Props {
    titles?:any
    subTitle?:any
    iconName?: string
    className?: string
}

const TitleAdd: React.FC<Props> = ({titles,subTitle,iconName,className}) => {
  console.debug('TitleAdd')
  const articleClass = className ? `${styles.littleTitle} ${className}` : styles.littleTitle
  return (
      <div className={articleClass}>
        {iconName ?
            <span className={`icon iconfont ${styles.iconColor} ${iconName}`} /> :
            <span className={`icon iconfont ${styles.iconColor} icon-zhuangshitubiao`} />}
        {titles}
        {subTitle?
            <span style={{fontSize: '14px',marginLeft: '10px',color:' #a6cdff'}}>{subTitle}</span>:''
        }
      </div>
  )
}

export default TitleAdd