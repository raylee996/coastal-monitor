import React, { useEffect, useState } from "react";
import styles from './index.module.sass'
import { Button } from "antd";
import { qureyAnalyzeTaskList } from "server/dataCenter/caseArchive";
import ShipResult from "features/Core/components/WisdomJudgment/ShipResult";
import PeopleCarResult from "features/Core/components/WisdomJudgment/PeopleCarResult";
import popup from "hooks/basis/Popup";
import XcEmpty from "component/XcEmpty";

interface Props {
  /**选中的案件 */
  caseItem?: any
}

//案件分析记录
const CaseAnalysisRecord: React.FC<Props> = ({ caseItem }) => {
  console.debug('CaseAnalysisRecord')

  const [recordList, setRecordList] = useState<any[]>()

  useEffect(() => {
    if (!caseItem.id) return
    async function main() {
      const res = await qureyAnalyzeTaskList({ caseId: caseItem.id + "" })
      setRecordList(res || [])
    }
    main()
  }, [caseItem.id])

  function handleClick(record: any) {
    if (record.objType === '1') {
      popup(<ShipResult record={record} />, { title: '查看结果(船舶)', size: 'large' })
    } else {
      popup(<PeopleCarResult record={record} />, { title: '查看结果(人车)', size: 'large' })
    }
  }

  return <div className={styles.wrapper}>
    {
      recordList?.length ? recordList.map(item => {
        return <div className={styles.recordItem} key={item.id}>
          <p className={styles.recordTitle}>任务名称：{item.modelName || "--"}</p>
          <div className={styles.recordContent}>
            <span>任务状态：{item.statusName || '--'}</span>
            <span>模型：{item.mname || '--'}</span>
            <span>结果数量：{item.resultNum || '--'}</span>
            <span>创建时间：{item.createTime || '--'}</span>
          </div>
          <div className={styles.viewResult}>
            <Button type={"primary"} onClick={() => handleClick(item)}>查看结果</Button>
          </div>
        </div>
      }) : <XcEmpty />
    }
  </div>
}

export default CaseAnalysisRecord
