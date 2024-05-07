import { Button, PaginationProps, Popconfirm, TableProps } from "antd"
import windowUI from "component/WindowUI"
import { ColType } from "hooks/flexibility/TablePanel"
import TableInterface from "hooks/integrity/TableInterface"
import { useCallback, useMemo, useRef } from "react"
import { delTTSContentAsync, queryTTSContentListAsync } from "server/device"
import AddVideoContent from "../components/AddVideoContent"
import ListenMusic from "../components/ListenMusic"


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
const VoiceContent: React.FC<Props> = ({ getRecord }) => {
    const tableRef = useRef<any>(null)

    // 试听
    const playAudio = useCallback(
        (url: string, name: string) => {
            windowUI(<ListenMusic audioUrl={url} audioName={name} />, {
                title: '试听',
                offset: [770, 180],
                width: '400px',
                height: '400px',
                key: '试听'
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
        ['内容', 'content'],
        ['操作', '', ColType.tooltip, {
            itemProps: {
                width: getRecord ? '130px' : '100px',
                render: (text: any, record: any) => {
                    return (<>
                        <Button type={"link"} onClick={() => playAudio(record.url, record.content)}>试听</Button>
                        {getRecord && <Button type={"link"} onClick={() => handleGetRecord(record)}>引用</Button>}
                        {/* {!getRecord && <> */}
                        {<>
                            <Popconfirm title="确定要删除吗?" onConfirm={() => handleDelContent(record)}>
                                <Button type={"link"} >删除</Button>
                            </Popconfirm>
                        </>}

                    </>
                    )
                }
            }
        }]
    ], [getRecord, handleGetRecord, playAudio])

    // 删除内容
    function handleDelContent(record?: any) {
        delTTSContentAsync(record.id)
        tableRef.current.onRefresh()
    }

    // 打开新增面板
    const handleOpenAdd = useCallback(
        () => {
            windowUI(<AddVideoContent refreshTable={handleRefreshTable} />, {
                title: '上传音频',
                offset: [770, 180],
                width: '400px',
                height: '400px',
                key: '上传音频'
            })
        },
        [],
    )


    const queryOptions = useMemo(() => {
        return {
            isShowReset: false,
            footerButtons: [
                {
                    text: "上传",
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
        extraParams={{ type: 2 }}
        request={queryTTSContentListAsync}
        queryInputs={queryInputs}
        columns={columns}
        queryOptions={queryOptions}
        paginationProps={paginationProps}
        tableProps={tableProps}
    />
}

export default VoiceContent