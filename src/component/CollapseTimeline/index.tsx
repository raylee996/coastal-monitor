import { Collapse } from "antd"
import styles from "./index.module.sass";
import './index.css'
import XcEmpty from "component/XcEmpty";

type Day = {
  /** key值 */
  key: string;
  /** 记录id */
  progressId: number
  /** 时间日期 */
  time: string;
  /** 日期内容 */
  text?: string
}

interface Month {
  /** key */
  key: string
  /** 月 */
  title: string
  /** 日集合 */
  children: Day[]
}

export interface TimeCollapse {
  /** key */
  key: string
  /** 年 */
  title: string
  /** 月集合 */
  children: Month[]
}

interface Props {
  /** 时间轴数据 */
  timeList: TimeCollapse[]
  /** 选中目标 */
  activeCollapse?: string[]
  /** 选中目标 */
  activeId?: number
  /** 选中目标 */
  setActiveId: Function
}

const { Panel } = Collapse;

const CollapseTimeline: React.FC<Props> = ({ timeList, activeCollapse, activeId, setActiveId }) => {
  console.debug('CollapseTimeline')

  // 切换时间
  function selectCurrentTime(index: number) {
    setActiveId(index)
  }

  return (
    <article>
      {
        timeList?.length ? timeList.map(item => {
          return (
            <Collapse accordion defaultActiveKey={activeCollapse} key={item.key}>
              <p className={styles.yearTitle}>{`${item.title}年`}</p>
              {
                item.children?.length && item.children.map((monthItem) => {
                  return (
                    <Panel header={`${monthItem.title}月`} key={monthItem.key} className={`collapse-plane`}>
                      {
                        monthItem.children?.length && monthItem.children.map((dayItem, dayIndex) => {
                          return (
                            <div className={`${styles.timeBox} ${dayIndex % 2 === 0 ? styles.odd : styles.even} ${activeId === dayItem.progressId ? styles.leftTimeActive : ''}`}
                              key={dayIndex}
                              onClick={() => selectCurrentTime(dayItem.progressId)}>
                              <p className={styles.leftTime}>{dayItem.time}</p>
                              <p className={styles.leftTime}>{dayItem.text}</p>
                            </div>
                          )
                        })
                      }
                    </Panel>
                  )
                })
              }
            </Collapse>
          )
        }) : <XcEmpty />
      }
    </article>
  )
}

export default CollapseTimeline