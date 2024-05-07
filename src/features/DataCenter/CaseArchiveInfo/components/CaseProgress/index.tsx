import { Button, Space } from "antd";
import CollapseTimeline, { TimeCollapse } from "component/CollapseTimeline";
import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
import { useEffect, useState } from "react";
import { queryCaseProgressDetail, qureyCaseProgressTimeLineList } from "server/dataCenter/caseArchive";
import CaseProgressDetail from "./CaseProgressDetail";
import styles from "./index.module.sass";
import Title from "../../../../../component/Title";

interface CaseProgressProps {
  /**选中的案件 */
  caseItem?: any
}

const CaseProgress: React.FC<CaseProgressProps> = ({ caseItem }) => {
  console.debug('CaseProgress')

  const [activeId, setActiveId] = useState<number>()

  const [activeParentKey, setActiveParentKey] = useState<string>()

  const [timeList, setTimeList] = useState<TimeCollapse[]>([])

  const [showBtn, setShowBtn] = useState<boolean>(true)

  useEffect(() => {
    caseItem?.id && resetForm(caseItem?.id)
  }, [caseItem?.id])

  function handleAddClick(type?: string) {
    popup(<CaseProgressDetail
      useType={type ? UseType.edit : UseType.add}
      caseId={caseItem?.id}
      id={type ? activeId : null}
      getRequest={queryCaseProgressDetail}
      resetForm={resetForm} />, {
      title: `${type ? '编辑' : '新增'}进展`, size: "middle"
    })
  }

  async function resetForm(caseId: number) {
    const res = await qureyCaseProgressTimeLineList({ caseId })
    setTimeList(res?.data || [])
    setActiveId(res?.activeId)
    setActiveParentKey(res?.activeParentKey)
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.topTitle}>
        <div className={styles.titleWidt} title={caseItem.caseName}>{`案件名称：${caseItem.caseName || '--'}`}</div>
        {
          <Space>
            {showBtn ? <Button type="primary" onClick={() => handleAddClick()}>新增进展</Button> : <></>}
            {showBtn && timeList?.length ? <Button type="primary" onClick={() => handleAddClick('edit')}>编辑进展</Button> : <></>}
          </Space>
        }
      </div>
      <div className={styles.content}>
        <div className={styles.timeline}>
          <CollapseTimeline
            timeList={timeList}
            activeCollapse={activeParentKey ? [activeParentKey] : []}
            activeId={activeId}
            setActiveId={setActiveId} />
        </div>
        <div className={styles.detail}>
          <div className={styles.label}>
            <Title title={'进展信息'} />
          </div>
          <div className={styles.detailBox}>
            <CaseProgressDetail
              useType={UseType.show}
              caseId={caseItem?.id}
              id={activeId}
              getRequest={queryCaseProgressDetail}
              setShowBtn={setShowBtn} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default CaseProgress