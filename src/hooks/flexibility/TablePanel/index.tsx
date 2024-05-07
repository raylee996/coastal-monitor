import { Button, Divider, Empty, Popconfirm, TableProps, Tag, Tooltip } from "antd"
import Table, { ColumnType, TablePaginationConfig } from "antd/lib/table"
import styles from "./index.module.sass";
import './index.css'
import _ from "lodash"
import React, { Key, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageSimple from "hooks/basis/ImageSimple";
import SwitchRemote from "hooks/basis/SwitchRemote";
import viewer from "hooks/basis/Viewer";
import { FilterDropdownProps, FilterValue, SorterResult, TableCurrentDataSource, TableRowSelection } from "antd/es/table/interface";


interface GlobalConfig {
  /** 空数据组件 */
  EmptyDataComponent?: ReactNode
  /** 是否展示行号 */
  isShowRowNumber?: boolean
  /** 自定义表头过滤配置面板 */
  filterDropdown?: React.FC<FilterDropdownProps>
}

const globalConfig: GlobalConfig = {
  EmptyDataComponent: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
  isShowRowNumber: false
}

export const tablePanelConfig = (config: GlobalConfig) => {
  if (config.EmptyDataComponent) {
    globalConfig.EmptyDataComponent = config.EmptyDataComponent
  }
  if (config.isShowRowNumber) {
    globalConfig.isShowRowNumber = config.isShowRowNumber
  }
  if (config.filterDropdown) {
    globalConfig.filterDropdown = config.filterDropdown
  }
}

const articleClass = `${styles.wrapper} hooks__TablePanel`
const tableClass = `${styles.tableComponent} hooks__tableComponent`

const rowClassName = (record: any, index: number) => {
  return index % 2 === 0 ? 'table-even' : 'table-odd'
}

const locale = {
  emptyText: () => globalConfig.EmptyDataComponent
}

const scroll = {
  y: 0
}

export enum ColType {
  default = 1,

  /**
   * 图片，自定义配置
   * width：样式宽度
   * height：样式高度
   */
  image,

  /**
   * 图片相册模式，自定义配置
   * @param imageList string[] 图片集合
   * @param target number|null 大图展示默认图片index 字段非必传，默认值为0，选中展示第一张图片
   */
  imagePreview,

  /**
   * 多行展示，自定义配置
   * width: 样式宽度
   * list: [
   *  ['表头', '键名'],
   *  ['表头', '键名']
   * ]
   */
  multiple,

  /**
   * 自定义组件，自定义配置
   * component: React.FC<{
   *  text
   *  record
   * }>
   */
  component,

  /**
   * 展示开关，异步远程请求return数据类型必须是boolean类型
   *
   * @param remote async (checked: boolean, record: any) => boolean 异步远程请求
   * @param checkedChildren ReactNode|string 默认文本-开启
   * @param unCheckedChildren ReactNode|string 默认文本-关闭
   */
  switch,

  /**
   * 使用标签展示内容
   * @param list [text, color][]（可选项）当不传入配置时展示默认的标签
   * @param color （可选项）默认标签展示的颜色
   */
  tag,

  /**
   * 展示颜色背景
   * @param getColor (record: any) => string 返回颜色字符串值
   */
  backgroundColor,

  /**
   * 使用Tooltip组件展示省略内容
   */
  tooltip
}

export enum ActionType {
  default = 50,
  confirm
}

function renderColumn(colType: ColType, option: any) {
  let result: ColumnType<any> = {}
  switch (colType) {
    case ColType.image:
      result.render = (text: string) => (text ? <ImageSimple width={option.width || 60} height={option.height || 60} src={text} /> : '')
      break;
    case ColType.imagePreview:
      result.render = (imgList: string[]) => {
        return <>
          <ImageSimple width={option.width || 60} height={option.height || 60} src={imgList[0]} />
          {
            imgList?.length > 1 && <div className={styles.btnStyle} onClick={() => viewer({ imgList })}>查看更多</div>
          }
        </>
      }
      break;
    case ColType.multiple:
      result.render = (text: string, record: any) => (
        <article className={styles.multiple} style={{ width: option.width || 'auto' }}>
          {option.list.map((item: string[], index: number) =>
            <section
              key={index}>
              <div>{item[0]}:</div>
              <div>{record[item[1]] ? record[item[1]] : '--'}</div>
            </section>
          )}
        </article>
      )
      break;
    case ColType.component:
      result.render = (text: string, record: any) => (<option.component text={text} record={record} />)
      break;
    case ColType.switch:
      result.render = (text: boolean, record: any) => (<SwitchRemote data={record} remote={option.remote} value={text} checkedChildren={option.checkedChildren} unCheckedChildren={option.unCheckedChildren} />)
      break;
    case ColType.tag:
      const valueColorList = option.list || []
      result.render = (text: string) => (<Tag color={valueColorList.some(([_text]: string[]) => _text === text) ? valueColorList.find(([_text]: string[]) => _text === text)[1] : option.color}>{text}</Tag>)
      break;
    case ColType.backgroundColor:
      result.render = (text: string, record: any) => (<Tag color={option.getColor ? option.getColor(record) : undefined}>{text}</Tag>)
      break;
    case ColType.tooltip:
      result.ellipsis = { showTitle: false }
      result.render = (text: string) => (<Tooltip title={text}><div className={styles.tooltip}>{text}</div></Tooltip>)
      break;
    default:
      break;
  }
  return result
}

/** 支持扩展 */
export interface TableOptions {
  /** 是否展示表格序号 */
  isShowRowNumber?: boolean
  /** 默认选中项的 key 数组 */
  defaultSelectedRowKeys?: Key[]
  /** 指定选中项的 key 数组，需要和 onChange 进行配合 */
  /** 点击表格行的快捷函数回调入口，使用时展示单选样式 */
  onRowClick?: (record: any, index?: number) => void
  /** 单选表格数据 */
  onRadioClick?: (record: any) => void
}

interface Props {
  /** 表格表头配置项 [表头、键名[ColType：类型、{itemProps：ColumnType, ...自定义配置项}]] */
  columns: any[]
  /** 数据数组 */
  dataSource?: any[]
  /** antd表格原始参数 */
  tableProps?: TableProps<any>
  /** 自定义表格配置项 */
  options?: TableOptions
  /** 监听表头过滤 */
  onFilters?: (filters: any) => void
}

const TablePanel: React.FC<Props> = ({ columns, dataSource, tableProps, options, onFilters }) => {
  console.debug('TablePanel')


  const tableRef = useRef<HTMLDivElement>(null)


  const [realColumns, setRealColumns] = useState<ColumnType<any>[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(() => {
    return options?.defaultSelectedRowKeys ? options.defaultSelectedRowKeys : []
  })


  // 监听表格表头配置项，结构出表格表头项配置信息
  useEffect(() => {
    if (columns.length > 0) {
      const _realColumns: ColumnType<any>[] = []
      if (_.has(options, 'isShowRowNumber') ? options?.isShowRowNumber : globalConfig.isShowRowNumber) {
        _realColumns.push({
          title: '序号',
          key: 'tableRowNumber',
          width: 60,
          render: (text: string, record: any, index: number) => <span>{index + 1}</span>
        })
      }
      columns.forEach(item => {
        if (_.isArray(item)) {
          if (item.some(ele => !_.isArray(ele))) {
            const [title, key] = item
            let colType: ColType = ColType.default
            let itemProps: ColumnType<any> = {};
            let inputProps: any = {}
            for (let i = 2; i < item.length; i++) {
              const target: any = item[i];
              if (ColType[target]) {
                colType = target
              } else {
                itemProps = _.isEmpty(target.itemProps) ? {} : _.cloneDeep(target.itemProps)
                inputProps = _.cloneDeep(target)
                _.unset(inputProps, 'itemProps')
              }
            }
            const result = renderColumn(colType, inputProps)
            const column = {
              title,
              dataIndex: key,
              key,
              ...result,
              ...itemProps
            }
            if (itemProps.filters && !itemProps.filterDropdown && globalConfig.filterDropdown) {
              column.filterDropdown = globalConfig.filterDropdown
            }
            _realColumns.push(column)
          } else {
            // 二维数组，表示操作
            const buttons: any[] = []
            item.forEach((opt: any[]) => {
              const [name] = opt
              let actionType: ActionType = ActionType.default
              let options: any = {}
              let handle: any = () => { }
              for (let i = 1; i < opt.length; i++) {
                const target = opt[i];
                if (ActionType[target]) {
                  actionType = target
                } if (_.isFunction(target)) {
                  handle = target
                } else {
                  options = target
                }
              }
              buttons.push({
                name,
                handle,
                actionType,
                options
              })
            })
            _realColumns.push({
              title: '操作',
              dataIndex: 'tableActions',
              key: 'tableActions',
              render: (text: string, record: any) => {
                return (
                  <nav>
                    {buttons.map((but: any, idx: number) =>
                      <span key={but.name}>
                        <span >
                          {but.actionType === ActionType.default &&
                            <Button className={styles.tableActionButton} type="link" onClick={() => but.handle(record)}>{but.name}</Button>
                          }
                          {but.actionType === ActionType.confirm &&
                            <Popconfirm
                              title={`是否确认${but.name}`}
                              onConfirm={() => but.handle(record)}
                              okText="是"
                              cancelText="否"
                              {...but.options}
                            >
                              <Button className={styles.tableActionButton} type="link">{but.name}</Button>
                            </Popconfirm>
                          }
                        </span>
                        {idx !== buttons.length - 1 &&
                          <Divider type="vertical" />
                        }
                      </span>
                    )}
                  </nav>
                )
              }
            })
          }
        } else {
          _realColumns.push(item)
        }
      })
      setRealColumns(_realColumns)
    }
  }, [columns, options])

  // 翻页滚动条返回顶部
  useEffect(() => {
    if (tableRef.current) {
      const tableBodyDivEle = tableRef.current.querySelector('.ant-table-body')
      if (tableBodyDivEle) {
        tableBodyDivEle.scrollTop = 0
      }
    }
  }, [dataSource])


  const rowKey = useMemo(() => tableProps?.rowKey || 'id', [tableProps])

  const rowSelection = useMemo<TableRowSelection<any> | undefined>(() => {
    if (options) {
      if (options.onRowClick) {
        return {
          type: 'radio',
          selectedRowKeys,
          renderCell: () => <div></div>
        }
      }
      if (options.onRadioClick) {

        const handleRadioChange = (_selectedRowKeys: Key[], selectedRows: any[]) => {
          const [record] = selectedRows
          setSelectedRowKeys(_selectedRowKeys)
          options.onRadioClick!(record)
        }

        return {
          type: 'radio',
          selectedRowKeys,
          onChange: handleRadioChange
        }
      }
    } else {
      return undefined
    }
  }, [options, selectedRowKeys])

  const handleRow = useCallback(
    (record: any, index?: number) => {
      return options?.onRowClick ? {
        onClick() {
          let _key = _.isFunction(rowKey) ? rowKey(record) : rowKey
          const keyVal = record[_key]
          options.onRowClick!(record, index)
          setSelectedRowKeys([keyVal])
        }
      } : {}
    },
    [options, rowKey],
  )

  const handleChange = useCallback((
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
    extra: TableCurrentDataSource<any>) => {
    onFilters && onFilters(filters)
  }, [onFilters])


  return (
    <article className={articleClass}>
      <Table
        ref={tableRef}
        className={tableClass}
        rowKey={rowKey}
        dataSource={dataSource}
        columns={realColumns}
        pagination={false}
        scroll={scroll}
        rowClassName={rowClassName}
        locale={locale}
        rowSelection={rowSelection}
        onRow={handleRow}
        onChange={handleChange}
        {...tableProps} />
    </article>
  )
}


export default TablePanel

