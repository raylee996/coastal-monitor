import TableInterface from 'hooks/integrity/TableInterface'
import { getJudgeRecordList } from 'server/core/planManagement'
import JudgmentAndTargetCard from '../JudgmentAndTargetCard'
import styles from './index.module.sass'


interface Props {

}

const JudgmentRecord: React.FC<Props> = () => {
  console.debug('JudgmentRecord')

  return (
    <article className={styles.wrapper}>
      <TableInterface
        card={JudgmentAndTargetCard}
        request={getJudgeRecordList}
        isRefreshTableRealTime={true}
        refreshTableTime={3000}
        paginationProps={{
          showQuickJumper: false,
          size: 'small'
        }}
      />
    </article>
  )
}

export default JudgmentRecord