import { Empty, Spin } from "antd"
import _, { String } from "lodash"
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import styles from "./index.module.sass";


interface Config {
  /** 空数据组件 */
  EmptyDataComponent?: ReactNode
}

const globalConfig: Config = {
  EmptyDataComponent: <Empty className={styles.empty} image={Empty.PRESENTED_IMAGE_SIMPLE} />
}

export const cardPanelConfig = (config: Config) => {
  if (config.EmptyDataComponent) {
    globalConfig.EmptyDataComponent = config.EmptyDataComponent
  }
}


/** 隐式传入卡片组件参数*/
export interface TableCardProps<T> {
  /** 用于for循环的key */
  key: React.Key | null | undefined | String
  /** for循环的下标 */
  index: number
  /** 数据项 */
  data: T
  /** 通过onSelect选中的项数组，适用于复选框的单选多选*/
  activeData: T[]
  /** 当前单选的数据 */
  radioData: any
  /** 适用于复选选中事件的回调 */
  onSelect: (isSelect: boolean, data: T) => void
  /** 适用于单选选中事件的回调 */
  onRadio: (data: T) => void
  /** 表格的刷新函数回调，is: 是否重置分页页号*/
  onRefresh: (is?: boolean) => void
  /** 卡片组件操作的回调函数，在TableInterface上cardOptions里配置onCardActions监听 */
  onAction: (type: string, data?: any) => void

}


export interface CardOptions {
  /** 是否单选,true时单选，需要对子组件进行选中与否显示时，接收activeData比较确认是否选中*/
  isRadio?: boolean
  /** 默认选中第一个*/
  isSelectedFirst?: boolean
  /** 默认选中值的id */
  selectedId?: number | string
  /** 是否单选选中第一个 */
  isRadioFirst?: boolean
  /** 是否启动弹性布局 */
  isFlex?: boolean
  /** 监听选定的项，函数参数是选中项的数组，当isRadio为true时将返回单个项的数组  */
  onSelected?: (list: any[]) => void
  /** 监听表格操作项回调 */
  onCardActions?: (type: string, data: any) => void
  /** 监听点击单选 */
  onRadio?: (data: any) => void
}

export interface CardPanelProps {
  /** 是否加载中 */
  isLoading?: boolean
  /** 加载的提示信息 */
  tipLoading?: string
}


interface Props extends CardPanelProps {
  /** 自定义卡片内容 */
  component: React.FC<TableCardProps<any>>
  /** 数据数组 */
  dataSource: any[]
  /** 刷新表格函数 */
  onRefresh: (is?: boolean) => void
  /** 自定义扩展功能配置项 */
  options?: CardOptions
}

const CardPanel: React.FC<Props> = ({
  dataSource,
  onRefresh,
  options,
  isLoading,
  tipLoading,
  ...otherProps
}) => {
  console.debug('CardPanel')


  const [activeData, setActiveData] = useState<any[]>([])
  const [radioData, setRadioData] = useState<any[]>([])


  // 卡片选中逻辑
  const handleSelect = useCallback((is: boolean, record: any) => {
    if (options) {
      setActiveData(_selectedItems => {
        let result = [..._selectedItems]
        if (is) {
          if (options.isRadio) {
            result = is ? [record] : []
          } else {
            if (!result.some(val => _.isEqual(val, record))) {
              result.push(record)
            }
          }
        } else {
          _.remove(result, val => _.isEqual(val, record))
        }
        if (options.onSelected) {
          options.onSelected(result)
        }
        return result
      })
    }
  }, [options])


  // 响应默认选择第一个
  useEffect(() => {
    if (!_.isEmpty(dataSource)) {
      const result = _.head(dataSource)
      if (options && options.isSelectedFirst && options.onSelected) {
        handleSelect(true, result)
      }
      if (options && options.isRadioFirst && options.onRadio) {
        options.onRadio(result)
        setRadioData(result)
      }
    }
  }, [handleSelect, dataSource, options]);

  // 响应默认选中id
  useEffect(() => {
    if (options?.selectedId && !_.isEmpty(dataSource)) {
      const result = dataSource.find(item => item.id === options.selectedId)
      if (result) {
        if (options.onSelected) {
          handleSelect(true, result)
        }
        if (options.onRadio) {
          options.onRadio(result)
          setRadioData(result)
        }
      }
    }
  }, [handleSelect, dataSource, options]);


  const handleAction = useCallback(
    (type: string, data: any) => {
      options?.onCardActions && options.onCardActions(type, data)
    },
    [options],
  )

  const handleRadio = useCallback(
    (data: any) => {
      if (options?.onRadio) {
        options.onRadio(data)
        setRadioData(data)
      }
    },
    [options],
  )


  const isLoad = useMemo(() => _.isUndefined(isLoading) ? false : isLoading, [isLoading])

  const realClassName = useMemo(() => options?.isFlex ? styles.wrapperFlex : styles.wrapper, [options])


  return (
    <article className={`${realClassName} hooks__CardPanel`}>
      {dataSource?.length > 0
        ? dataSource.map((record, index) =>
          <otherProps.component
            key={record.id ? record.id : index}
            index={index}
            data={record}
            activeData={activeData}
            radioData={radioData}
            onRefresh={onRefresh}
            onSelect={handleSelect}
            onAction={handleAction}
            onRadio={handleRadio}
          />
        )
        : isLoad
          ? <div className={styles.loading}><Spin tip={tipLoading} /></div>
          : globalConfig.EmptyDataComponent
      }
    </article>
  )
}


export default CardPanel
