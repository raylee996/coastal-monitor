import { Form, FormProps, Pagination } from "antd";
import { taskStatusDict } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import TableTools from "hooks/basis/TableTools";
import CardPanel from "hooks/flexibility/CardPanel";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import { PageInfo } from "hooks/integrity/TableInterface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { queryCommanderCommandList } from "server/core/wisdomCommand";
import WisdomCommandCardItem from "./component/WisdomCommandCardItem";
import styles from "./index.module.sass";
import WisdomCommandDetail from "./WisdomCommandDetail";
import './index.sass';


const formProps: FormProps = { layout: 'inline' }
const options = {
  isShowItemButton: true,
  isNotShowFooter: true,
  isShowReset: true,
  submitText: '搜索'
}
const TableToolsStyle = { marginLeft: 8 }

const Inputs: any[] = [
  ['', 'search', {
    placeholder: '请输入任务名称/跟踪目标',
    itemProps: {},
    allowClear: true,
    style: { width: '200px' }
  }],
  ['', 'isMine', InputType.radio, {
    dict: [
      { name: '全部任务', value: "false" },
      { name: '我的任务', value: "true" },
    ]
  }],
  [
    '状态', 'taskStateId', InputType.select, { // 1.进行中 2.待分配 3.已完成
      dict: taskStatusDict,
      placeholder: '请选择任务状态',
      style: { width: '180px' }
    }],
]

const queryInit = { isMine: "false" }

const WisdomCommand: React.FC = () => {
  console.debug('WisdomCommand')


  const tableRef = useRef<any>();


  const [form] = Form.useForm();


  const [data, setData] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageNumber: 1,
    pageSize: 10
  });
  const [total, setTotal] = useState<number>(0);


  // 刷新表格数据
  const refreshTable = useCallback(
    () => {
      tableRef.current?.onRefresh()
    },
    [],
  )


  const tools = useMemo(() => [
    ['新增任务', {
      onClick: () => {
        popup(<WisdomCommandDetail refreshTable={refreshTable} />, { title: '新增任务', size: 'middle' })
      },
      type: "primary"
    }],
  ], [refreshTable])


  // 模型列表点击切换
  const handleClick = useCallback(
    (e: any) => {
      console.log(e, "e")
    },
    [],
  )

  function handlePaginationChange(page: number, pageSize: number) {
    setPageInfo({
      pageNumber: page,
      pageSize,
    })
  }


  useEffect(() => {
    async function main() {
      const res = await queryCommanderCommandList({
        pageNumber: 1,
        pageSize: 10
      }, queryInit);
      setData(res?.data || []);
      setTotal(res?.total)
    }
    main()
  }, [])


  // 查询条件
  async function handleFinish(params: any) {
    setPageInfo(val => ({ ...val, pageNumber: 1 }))
    const res = await queryCommanderCommandList(pageInfo, params);
    setData(res?.data || []);
    setTotal(res?.total)
  }

  // 重置查询条件
  function handleReset() {
    setPageInfo(val => ({ ...val, pageNumber: 1 }))
  }

  function handleRefresh(is?: boolean) {
    setPageInfo(val => {
      let pageNumber = val.pageNumber
      if (is) {
        pageNumber = 1
      }
      return { ...val, pageNumber: pageNumber }
    })
  }

  const cardPanelOptions = useMemo(() => {
    return { onSelected: handleClick }
  }, [handleClick])

  return (
    <article className={styles.wrapper}>
      <div className="WisdomCommand__TableStyle">
        <FormPanel
          inputs={Inputs}
          initData={queryInit}
          formProps={formProps}
          form={form}
          options={options}
          onAsyncFinish={handleFinish}
          onReset={handleReset} />
      </div>
      <div className={styles.btn}>
        <TableTools options={tools} style={TableToolsStyle} />
      </div>
      <div className={styles.table}>
        <CardPanel
          component={WisdomCommandCardItem}
          dataSource={data}
          onRefresh={handleRefresh}
          options={cardPanelOptions}
        />
      </div>
      <div className={styles.pagination}>
        <Pagination
          current={pageInfo.pageNumber}
          pageSize={pageInfo.pageSize}
          total={total}
          showQuickJumper={true}
          showSizeChanger={true}
          onChange={handlePaginationChange}
        />
      </div>
    </article>
  )
}

export default WisdomCommand