import { PlusOutlined } from '@ant-design/icons'
import Link from 'antd/es/typography/Link'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { selectValue, set } from 'slice/planConfigSlice'
import ActionContent, { initData1 } from '../ActionContent'
import styles from './index.module.sass'


interface Props {
  /** 搭配所有节点使用变量提升 */
  eventIds: string[]
  /** 标题 */
  title?: string
}

const DealWith: React.FC<Props> = ({ eventIds, title }) => {
  console.debug('DealWith')

  const dispatch = useAppDispatch()
  const planConfig = useAppSelector(selectValue)

  const [dataList, setDataList] = useState<{
    eventId: string
    eventName: string
    actions: any[]
  }[]>([])

  useEffect(() => {
    const result = _.filter(planConfig, ele => eventIds.includes(ele.eventId))
    setDataList(result)
  }, [eventIds, planConfig])

  function handleAdd(idx: number) {
    const _planConfig = _.clone(planConfig)
    const target = _.cloneDeep(dataList[idx])
    const targetIdx = _planConfig.findIndex(ele => ele.eventId === target.eventId)
    target.actions.unshift({ uniqueId: _.uniqueId(), data: { type: '1', ...initData1 } })
    _planConfig.splice(targetIdx, 1, target)
    dispatch(set(_planConfig))
  }

  function handleDelete(index: number, idx: number) {
    const _planConfig = _.clone(planConfig)
    const target = _.cloneDeep(dataList[index])
    const targetIdx = _planConfig.findIndex(ele => ele.eventId === target.eventId)
    target.actions.splice(idx, 1)
    _planConfig.splice(targetIdx, 1, target)
    dispatch(set(_planConfig))
  }

  function handleChange(index: number, idx: number, params: any) {
    const _planConfig = _.clone(planConfig)
    const target = _.cloneDeep(dataList[index])
    const targetIdx = _planConfig.findIndex(ele => ele.eventId === target.eventId)
    target.actions[idx].data = params
    _planConfig.splice(targetIdx, 1, target)
    dispatch(set(_planConfig))
  }

  return (
    <article className={styles.wrapper}>

      {title && <header>{title}</header>}

      <section className={styles.contentBox}>
        {dataList.map((item, index) => (
          <section className={styles.content} key={item.eventId}>
            <header>
              <span>{item.eventName}</span>
              <Link onClick={() => handleAdd(index)}><PlusOutlined />添加处理</Link>
            </header>
            <section className={styles.actions}>
              {item.actions.map((ele, idx) =>
                <ActionContent
                  key={ele.uniqueId}
                  data={ele.data}
                  onDelete={() => handleDelete(index, idx)}
                  onChange={params => handleChange(index, idx, params)}
                />
              )}
            </section>
          </section>
        ))}
      </section>

    </article>
  )
}

export default DealWith