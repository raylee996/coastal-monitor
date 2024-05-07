import TableInterface from 'hooks/integrity/TableInterface'
import { getJudgeRecordGroupByList } from 'server/core/planManagement'
import JudgmentAndTargetCard from '../JudgmentAndTargetCard'
import styles from './index.module.sass'

interface Props {

}

const HighRiskTarget: React.FC<Props> = () => {
  console.debug('HighRiskTarget')


  return (
    <article className={styles.wrapper}>
      <TableInterface
        card={JudgmentAndTargetCard}
        request={getJudgeRecordGroupByList}
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

export default HighRiskTarget