import { FormProps, Pagination, PaginationProps, TableProps } from "antd"
import TableTools, { TableToolsOption } from "hooks/basis/TableTools";
import CardPanel, { CardOptions, CardPanelProps, TableCardProps } from "hooks/flexibility/CardPanel";
import _ from "lodash";
import React, { ReactElement, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import FormPanel, { PanelOptions } from "../../flexibility/FormPanel"
import TablePanel, { TableOptions } from "../../flexibility/TablePanel"
import styles from "./index.module.sass";

export interface PageInfo {
  pageSize: number
  pageNumber: number
}

export interface TableInfo {
  data: any[],
  total: number
}

interface ComponentOptions {
  /** 自定义组件 */
  component: ReactElement
  /** 容器宽度 */
  width?: string | number
}

interface RequestParams {
  signal: AbortController
}

interface Props {
  /** 表格表头配置项 [表头、键名[ColType：类型、{itemProps：ColumnType, ...自定义配置项}]] */
  columns?: any[]
  /** 表格的异步请求数据函数 */
  request?: (pageInfo: PageInfo, params: RequestParams, signal: AbortController) => Promise<TableInfo>
  /** 表格的异步请求函数的额外参数 */
  extraParams?: any
  /** 是否必须有额外参数才执行request请求 */
  isMustExtraParams?: boolean
  /** 表格查询表单配置项 */
  queryInputs?: any[]
  /** 查询表单初始值 */
  queryInit?: any
  /** 查询表单data值，区别于queryInit,可以动态修改查询值*/
  queryData?: any
  /** 查询表单原始参数 */
  queryProps?: FormProps
  /** 查询表单配置项 */
  queryOptions?: PanelOptions
  /** 查询表单实例 */
  queryForm?: any
  /** 是否重置数据不使用查询表单初始值  */
  isResetNotInit?: boolean
  /** 监听列表展示的分页数据回调，包括异步请求、全量数据 */
  onTableData?: (data: any[], total: number) => void
  /** 监听表单提交 */
  onQuerySubmit?: (data: any, extra?: any) => void
  /** 监听重置表单 */
  onQueryReset?: () => void
  /** 监听刷新、查询、重置 */
  onRefresh?: () => void
  /** 自定义查询表单重置函数，返回需要设置的查询数据 */
  onFormReset?: () => any

  /** antd表格原始参数 */
  tableProps?: TableProps<any>
  /** 表格配置项 */
  tableOptions?: TableOptions
  /** 表格数据，用于设置表格数据以及分页数据 */
  tableInfo?: TableInfo
  /** 表格数据，用于传入全量数据并启用分页 */
  tableDataSource?: any[]

  /** 左侧工具栏 */
  tools?: TableToolsOption[]
  /** 右侧工具栏 */
  toolsRight?: TableToolsOption[]
  /** 搜索栏目右侧工具栏，当搜索栏存在时才展示，没有搜索栏请使用其他tools */
  toolsHeader?: TableToolsOption[]

  /** 分页器antd原始参数 */
  paginationProps?: PaginationProps
  /** 是否不展示分页器 */
  isNotPagination?: boolean

  /** 卡片表格，隐式传入卡片组件参数，选中事件需要组件内调用onSelect函数
   * @onSelect(是否选中：Boolean，数据项：any)=>void
   * @activeData：any[] 选中的项，当isRadio为true时数组内只有一项
   * @data：any 数据项，遍历数组用于展示的数据项
   * */
  card?: React.FC<TableCardProps<any>>
  /** 卡片表格自定义扩展配置项 */
  cardOptions?: CardOptions
  /** 卡片表格配置项 */
  cardProps?: CardPanelProps

  /** 样式类名 */
  className?: string
  /** 左侧自定义组件 */
  leftComponent?: ComponentOptions
  /** 右侧自定义组件 */
  rightComponent?: ComponentOptions

  /** 是否实时刷新表格数据 */
  isRefreshTableRealTime?: boolean
  /** 实时刷新表格时长，单位毫秒。1000代表一秒 */
  refreshTableTime?: number
}

export interface TableInterfaceRefProps {
  /** 
   * 刷新表格
   * @param is 是否刷新到第一页
   */
  onRefresh: (is?: boolean) => void,
  /** 获取查询参数据 */
  getDto: () => any
  /** 获取表单的查询条件值 */
  getFormDto: () => any
  /** 获取表格数据总数 */
  getTotal: () => number
}

const TableInterface = React.forwardRef<TableInterfaceRefProps, Props>(({
  columns,
  request,
  extraParams,
  isMustExtraParams,
  tableOptions,
  tableProps,
  tableInfo,
  tableDataSource,
  paginationProps,
  queryInputs,
  queryData,
  queryForm,
  onQuerySubmit,
  onTableData,
  onRefresh,
  onQueryReset,
  onFormReset,
  isResetNotInit,
  tools,
  toolsRight,
  toolsHeader,
  queryInit,
  queryProps,
  queryOptions,
  isNotPagination,
  card,
  cardOptions,
  cardProps,
  className,
  leftComponent,
  rightComponent,
  isRefreshTableRealTime,
  refreshTableTime
}, ref) => {
  console.debug('TableInterface')


  const formRef = useRef<any>(null)
  const cardPanelRef = useRef<HTMLElement>(null)


  const [localTableProps, setLocalTableProps] = useState<TableProps<any>>(tableProps || {})
  const [localCardProps, setLocalCardProps] = useState<CardPanelProps>(cardProps || {})
  const [dataSource, setDataSource] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)
  const [queryParams, setQueryParams] = useState<any>(queryData || queryInit || {})
  const [realFormOptions] = useState<PanelOptions>({
    isShowItemButton: true,
    isNotShowFooter: true,
    isShowReset: true,
    submitText: '查询',
    ...queryOptions
  })
  const [realFormProps] = useState<FormProps>({
    layout: 'inline',
    ...queryProps
  })
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageNumber: paginationProps?.current || 1,
    pageSize: paginationProps?.pageSize || 10
  })
  const [realClassName, setRealClassName] = useState<string>(className || '')
  const [realExtraParams, setRealExtraParams] = useState<any>(extraParams)
  const [filtersParams, setFiltersParams] = useState<any>()
  const [formName] = useState(() => {
    const uniqueId = _.uniqueId()
    return `FormName_${uniqueId}`
  })

  const [tableChunkData, setTableChunkData] = useState<any[][]>()

  // 实时刷新表格
  useEffect(() => {
    let ctr: AbortController
    let timer: any
    if (isRefreshTableRealTime) {
      timer && clearInterval(timer)
      timer = null
      timer = setInterval(() => {
        async function main() {
          if (request && (isMustExtraParams ? !_.isEmpty(realExtraParams) : true)) {
            try {
              ctr = new AbortController()
              const vo = await request(pageInfo, { ...queryParams, ...realExtraParams, ...filtersParams }, ctr)
              // 前后数据一样就不替换表格数据
              if (_.isEqual(vo.data, dataSource)) {
                return
              }
              onTableData && onTableData(vo.data, vo.total)
              setDataSource(vo.data)
              setTotal(vo.total)
              if (cardPanelRef.current) {
                cardPanelRef.current.scrollTop = 0
              }
              if (vo.data.length === 0 && pageInfo.pageNumber > 1) {
                setPageInfo(val => ({ ...val, pageNumber: --val.pageNumber }))
              }
            } catch (error) {
              console.error('表格数据请求异常', error)
            }
          }
        }
        main()
      }, refreshTableTime ? refreshTableTime : 6000)
    }

    return () => {
      timer && clearInterval(timer)
      timer = null
      ctr && ctr.abort()
    }
  }, [dataSource, filtersParams, isMustExtraParams, isRefreshTableRealTime, onTableData, pageInfo, queryParams, realExtraParams, refreshTableTime, request])


  useEffect(() => {
    setQueryParams((val: any) => {
      if (_.isUndefined(queryData) || _.isEqual(val, queryData)) {
        return val
      } else {
        return queryData
      }
    })
  }, [queryData])

  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (request && (isMustExtraParams ? !_.isEmpty(realExtraParams) : true)) {
        try {
          ctr = new AbortController()
          setLocalTableProps(val => ({ ...val, loading: true }))
          setLocalCardProps(val => ({ ...val, isLoading: true }))
          setTableChunkData(undefined)
          setDataSource([])
          setTotal(0)
          onTableData && onTableData([], 0)
          const vo = await request(pageInfo, { ...queryParams, ...realExtraParams, ...filtersParams }, ctr)
          onTableData && onTableData(vo.data, vo.total)
          setDataSource(vo.data)
          setTotal(vo.total)
          if (cardPanelRef.current) {
            cardPanelRef.current.scrollTop = 0
          }
          if (vo.data.length === 0 && pageInfo.pageNumber > 1) {
            setPageInfo(val => ({ ...val, pageNumber: --val.pageNumber }))
          }
        } catch (error) {
          console.error('表格数据请求异常', error)
        } finally {
          setLocalTableProps(val => ({ ...val, loading: false }))
          setLocalCardProps(val => ({ ...val, isLoading: false }))
        }
      }
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [request, pageInfo, queryParams, realExtraParams, filtersParams, isMustExtraParams, onTableData])

  useEffect(() => {
    setRealClassName(val => {
      let result = val
      if (className && className !== val) {
        result = className
      }
      return result
    })
  }, [className])

  useEffect(() => {
    setRealExtraParams((val: any) => {
      let result = val
      if (!_.isEqual(extraParams, val)) {
        result = extraParams
        setPageInfo((val) => {
          return {
            ...val,
            pageNumber: 1
          }
        })
      }
      return result
    })
  }, [extraParams])

  /** 监听antd表格原始参数 */
  useEffect(() => {
    setLocalTableProps(val => ({ ...val, ...tableProps }))
  }, [tableProps])

  /** 监听表格数据设置 */
  useEffect(() => {
    if (tableInfo) {
      setDataSource(tableInfo.data)
      setTotal(tableInfo.total)
    }
  }, [tableInfo])

  /** 全量数据的分页实现 */
  useEffect(() => {
    if (!_.isUndefined(tableDataSource)) {
      if (tableDataSource.length > 0) {
        setPageInfo(val => {
          const _tableChunkData = _.chunk(tableDataSource, val.pageSize)
          setTableChunkData(_tableChunkData)
          return { ...val, pageNumber: 1 }
        })
        setTotal(tableDataSource!.length)
      } else {
        setTableChunkData(undefined)
        setDataSource([])
        setTotal(0)
        onTableData && onTableData([], 0)
      }
    }
  }, [tableDataSource, pageInfo.pageSize, onTableData])

  useEffect(() => {
    if (!_.isUndefined(tableChunkData)) {
      const index = pageInfo.pageNumber - 1
      const targetData = tableChunkData[index]
      if (targetData && targetData.length > 0) {
        setDataSource(targetData)
        onTableData && onTableData(targetData, total)
      }
    }
  }, [tableChunkData, pageInfo, onTableData, total])

  /** 监听卡片表格配置参数 */
  useEffect(() => {
    setLocalCardProps(val => ({ ...val, ...cardProps }))
  }, [cardProps])


  const handleRefresh = useCallback(
    (is?: boolean) => {
      setPageInfo(val => {
        let pageNumber = val.pageNumber
        if (is) {
          pageNumber = 1
        }
        return { ...val, pageNumber: pageNumber }
      })
      onRefresh && onRefresh()
    },
    [onRefresh]
  )

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setPageInfo({
        pageNumber: page,
        pageSize,
      })
    },
    [],
  )

  const handleFinish = useCallback(
    (params: any) => {
      setQueryParams(params)
      setPageInfo(val => ({ ...val, pageNumber: 1 }))
      onQuerySubmit && onQuerySubmit(params, realExtraParams)
      onRefresh && onRefresh()
    },
    [onQuerySubmit, onRefresh, realExtraParams]
  )

  const handleReset = useCallback(
    () => {
      if (onFormReset) {
        const data = onFormReset()
        setQueryParams(data)
        queryForm.resetFields()
      } else {
        const data = isResetNotInit ? {} : (queryInit || {})
        setQueryParams(data)
        isResetNotInit && queryForm.resetFields()
      }
      setPageInfo(val => ({ ...val, pageNumber: 1 }))
      onQueryReset && onQueryReset()
    },
    [onFormReset, isResetNotInit, queryInit, queryForm, onQueryReset]
  )

  const handleShowTotal = useCallback(
    (total: number) => {
      return `总数:${total}`
    },
    []
  )

  const handleFilters = useCallback((filters: any) => {
    setFiltersParams(filters)
    setPageInfo(val => ({ ...val, pageNumber: 1 }))
  }, [])


  /** 导出刷新函数 */
  useImperativeHandle(
    ref,
    () => ({
      onRefresh: handleRefresh,
      getDto() {//点击【查询】按钮后获取参数据
        return {
          ...pageInfo,
          ...queryParams,
          ...realExtraParams
        }
      },
      getFormDto() {
        return formRef.current.getDto() // 获取的表格的查询条件值
      },
      getTotal() {
        return total
      }
    }),
    [handleRefresh, pageInfo, queryParams, realExtraParams, total]
  )


  return (
    <article className={`${styles.wrapper} hooks__TableInterface ${realClassName}`}>
      {queryInputs &&
        <header>
          <div className={styles.query}>
            <FormPanel
              name={formName}
              inputs={queryInputs}
              initData={queryInit}
              formData={queryParams}
              formProps={realFormProps}
              form={queryForm}
              options={realFormOptions}
              onFinish={handleFinish}
              onReset={handleReset} />
          </div>
          {toolsHeader && <div><TableTools options={toolsHeader} style={{ marginLeft: 8 }} /></div>}
        </header>}
      {(tools || toolsRight) &&
        <section className={styles.tools}>
          <div className={styles.toolsLeft}>
            {tools && <TableTools options={tools} style={{ marginRight: 8 }} />}
          </div>
          <div className={styles.toolsRight}>
            {toolsRight && <TableTools options={toolsRight} style={{ marginLeft: 8 }} />}
          </div>
        </section>
      }
      <section className={styles.outerContent}>
        {
          leftComponent && leftComponent.component
        }
        <section className={styles.tableContentBox}>
          {columns &&
            <section className={styles.tableContent}>
              <TablePanel
                columns={columns}
                dataSource={dataSource}
                tableProps={localTableProps}
                options={tableOptions}
                onFilters={handleFilters} />
            </section>
          }
          {card &&
            <section className={styles.contentCard} ref={cardPanelRef}>
              <CardPanel
                component={card}
                dataSource={dataSource}
                onRefresh={handleRefresh}
                options={cardOptions}
                {...localCardProps} />
            </section>
          }
          <footer>
            <div className={styles.footerTools} />
            {!isNotPagination &&
              <div className={styles.footerPagination}>
                <Pagination
                  showTotal={handleShowTotal}
                  current={pageInfo.pageNumber}
                  total={total}
                  showQuickJumper={true}
                  showSizeChanger={true}
                  onChange={handlePaginationChange}
                  {...paginationProps}
                  pageSize={pageInfo.pageSize}
                />
              </div>
            }
          </footer>
        </section>
        {rightComponent && rightComponent.component}
      </section>
    </article>
  )
})

export default TableInterface
