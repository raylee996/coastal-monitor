
import styles from './index.module.sass'
interface Props {
  
  labelName?:string
  noteContent?:string
  times?:string
  
}

const searchNotes: React.FC<Props> = ({labelName,noteContent,times}) => {
    
    return (
      <article style={{width:500,height:300,padding:10}}>
        <div className={styles.notesBox}>
            <p><span>分类：</span>{labelName || '--'}</p>
            <div className={styles.contBox}>内容：{noteContent || '--'}</div>
            <p>操作时间：{times || '--'}</p>
        </div>
      </article>
    )
  }
  
export default searchNotes