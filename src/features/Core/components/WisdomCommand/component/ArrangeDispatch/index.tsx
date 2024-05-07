import { Button } from "antd";
import { taskStatusDict } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef, useState } from "react";
import { getWarningList } from "server/core/earlyWarning";
import ArrangeDispatchCardItem from "../ArrangeDispatchCardItem";
import ArrangeDispatchDetail from "../ArrangeDispatchDetail";
import styles from "./index.module.sass";

const infoItems = [
  { label: '对讲调度', value: '1' },
  { label: '警力部署', value: '2' },
]

const dispatchList = [
  { id: 1, src: '', status: '0', statusName: '空闲中' },
  { id: 2, src: '', status: '1', statusName: '调度中', name: '查某' },
  { id: 3, src: '', status: '2', statusName: '已连接', name: '张某', time: '00:34:12', },
  { id: 4, src: '', status: '2', statusName: '已连接', name: '李某', time: '00:34:12', },
  { id: 5, src: '', status: '2', statusName: '已连接', name: '张某', time: '00:34:12', },
  { id: 6, src: '', status: '2', statusName: '已连接', name: '李某', time: '00:34:12', },
  { id: 7, src: '', status: '2', statusName: '已连接', name: '李某', time: '00:34:12', },
]

const Inputs: any[] = [
  [
    '', 'task', InputType.select, {
      dict: taskStatusDict,
      placeholder: '请选择任务',
      style: { width: '120px' }
    }],
  [
    '', 'status', InputType.select, {
      dict: taskStatusDict,
      placeholder: '请选择状态',
      style: { width: '120px' }
    }],
]

const ArrangeDispatch: React.FC = () => {
  console.debug('ArrangeDispatch')

  const [activeKey, setActiveKey] = useState<string>('1')

  const tableRef = useRef<any>();

  const onChange = (value: string) => {
    setActiveKey(value);
  };

  // 刷新列表
  function refreshTable() {
    tableRef?.current?.onRefresh()
  }

  const tools: any = [
    ['新增', {
      onClick: () => {
        popup(<ArrangeDispatchDetail refreshTable={refreshTable} />, { title: '新增部署', size: 'middle' })
      },
      type: "primary"
    }],
  ]

  return (
    <article className={`${styles.wrapper} ${activeKey === '1' ? styles.first_bg : styles.second_bg}`}>
      <div className={`${styles.tabs}`}>
        {
          infoItems.map(item => {
            return <div
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`${styles.tabsItem} ${item.value === activeKey ? styles.active : styles.unActive}`}
            >
              {item.label}
            </div>
          })
        }
      </div>
      <div className={styles.content}>
        {
          activeKey === '1' && <div className={styles.dispatch}>
            {
              dispatchList.map(item => {
                return <div className={styles.itemBox}>
                  <div className={styles.itemContent}>
                    {/* 头部内容 */}
                    <div className={styles.topBox}>
                      {item.status === '2' ?
                        <>
                          <div className={styles.name}>{item.name}</div>
                          <div className={styles.time}>{item.time}</div>
                        </>
                        : <div className={`${styles.status} ${item.status === '0' ? styles.freeBg : styles.dispatchBg}`}>{item.statusName}</div>
                      }
                    </div>
                    {/* 中间图标 */}
                    <div className={styles.middleBox}>
                      {item.status === '2' ?
                        <>
                          <div className={styles.soundWave}></div>
                          <div className={styles.soundIcon}>
                            <span className={`icon iconfont icon-luyin ${styles.icon}`} />
                          </div>
                        </> :
                        <div className={styles.status}>
                          {item.status === '0' ? <span className={`icon iconfont icon-xinzeng`} /> : item.name}
                        </div>
                      }
                    </div>
                  </div>
                  {/* 底部按钮 */}
                  {item.status === '2' && <div className={styles.btnBox}>
                    <Button type="link">视频</Button>
                    <Button type="link">静音</Button>
                    <Button type="link">挂断</Button>
                  </div>}
                </div>
              })
            }
          </div>
        }
        {
          activeKey === '2' && <div className={styles.table}>
            <TableInterface
              ref={tableRef}
              card={ArrangeDispatchCardItem}
              request={getWarningList}
              queryInputs={Inputs}
              tools={tools}
              queryOptions={{
                isShowReset: true
              }}
              isNotPagination={true}
            />
          </div>
        }
      </div>
    </article>
  )
}

export default ArrangeDispatch