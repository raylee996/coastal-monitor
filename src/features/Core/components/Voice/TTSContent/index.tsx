import { Button, Popconfirm, } from "antd"
import { PaginationProps } from "antd/lib/pagination";
import { TableProps } from "antd/lib/table";
import windowUI from "component/WindowUI";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useMemo, useRef } from "react";
import { delTTSContentAsync, queryTTSContentListAsync } from "server/device";
import AddTTSContent from "../components/AddTTSContent";

const queryInputs: any[] = [
    ['', 'content', {
        placeholder: '内容',
        style: { width: '200px' },
        allowClear: true
    }]
]

interface Props {
    getRecord?: (record: any) => void
}

const paginationProps: PaginationProps = {
    showQuickJumper: false,
    size: 'small'
}
const tableProps: TableProps<any> = {
    size: 'small'
}
const TTSContent: React.FC<Props> = ({ getRecord }) => {

    const tableRef = useRef<any>(null)

    // 打开编辑面板
    const handleEdit = useCallback(
        (record: any) => {
            windowUI(<AddTTSContent refreshTable={handleRefreshTable} record={record} />, {
                title: '编辑TTS内容',
                offset: [770, 180],
                width: '400px',
                height: 'auto',
                key: '新增TTS内容'
            })
        },
        [],
    )

    // 引用内容
    const handleGetRecord = useCallback(
        (record: any) => {
            getRecord && getRecord(record)
        },
        [getRecord],
    )

    const columns = useMemo(() => [
        ['内容', 'content', ColType.tooltip],
        ['操作', '', {
            itemProps: {
                width: getRecord ? '130px' : '100px',
                render: (text: any, record: any) => {
                    return (<div>
                        {getRecord && <Button type={"link"} onClick={() => handleGetRecord(record)}>引用</Button>}
                        {/* {!getRecord && <> */}
                        {<>
                            <Button type={"link"} onClick={() => handleEdit(record)}>编辑</Button>
                            <Popconfirm title="确定要删除吗?" onConfirm={() => handleDelContent(record)}>
                                <Button type={"link"} >删除</Button>
                            </Popconfirm>
                        </>}
                    </div >
                    )
                }
            }
        }]
    ], [getRecord, handleEdit, handleGetRecord])

    // 删除内容
    function handleDelContent(record?: any) {
        delTTSContentAsync(record.id)
        tableRef.current.onRefresh()
    }


    // 打开新增面板
    const handleOpenAdd = useCallback(
        () => {
            windowUI(<AddTTSContent refreshTable={handleRefreshTable} />, {
                title: '新增TTS内容',
                offset: [770, 180],
                width: '400px',
                height: 'auto',
                key: '新增TTS内容'
            })
        },
        [],
    )

    const queryOptions = useMemo(() => {
        return {
            isShowReset: false,
            footerButtons: [
                {
                    text: "新增",
                    onClick: handleOpenAdd
                }
            ]
        }
    }, [handleOpenAdd])

    // 刷新表格
    function handleRefreshTable() {
        tableRef.current.onRefresh()
    }

    return <TableInterface
        ref={tableRef}
        extraParams={{ type: 1 }}
        request={queryTTSContentListAsync}
        queryInputs={queryInputs}
        columns={columns}
        queryOptions={queryOptions}
        paginationProps={paginationProps}
        tableProps={tableProps}
    />
}

export default TTSContent