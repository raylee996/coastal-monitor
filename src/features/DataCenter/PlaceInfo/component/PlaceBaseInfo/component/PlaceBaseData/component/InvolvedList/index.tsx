
import { placeRemoveCase } from "api/place";
import CaseArchiveInfo from "features/DataCenter/CaseArchiveInfo";
import popup from "hooks/basis/Popup";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doAddPlaceCase, doGetPlaceCaseList } from "server/place";
import AddCase from "../AddCase";
import styles from "./index.module.sass";
import Title from "../../../../../../../../../component/Title";

interface IInvolvedList {
    /**重点场所ID */
    id: any
}

const InvolvedList: React.FC<IInvolvedList> = (props) => {
    console.debug('InvolvedList')
    const { id } = props
    const tableRef = useRef<any>(null)
    // 涉案信息
    const caseColumns = [
        ['案件编号', 'caseNo'],
        ['案件名称', 'caseName'],
        ['发案时间', 'happenTimeStart'],
        ['涉案地详址', 'happenAddress'],
        ['接警单位', 'registerUnit'],
        ['案件描述', 'caseDescr'],
        [
            ['查看档案', (record: any) => {
                // 跳转查看档案详情页
                popup(<CaseArchiveInfo caseItem={record} />, { title: '查看案件档案详情', size: "fullscreen" })
            }],
            ['取消关联', async (record: any) => {
                await placeRemoveCase({
                    caseBaseId: record.id, // 案件ID
                    focusPlaceId: id // 场所ID
                })
                handleRefreshTable()

            }, ActionType.confirm]
        ]
    ]

    const queryInputs = [
        ['案件',
            'searchValue',
            {
                placeholder: '请输入案件编号/名称',
                allowClear: true,
            },
            
        ]
    ]

    // 表格右侧功能键区
    const toolsRight: any = [
        ['新增案件', {
            onClick: () => {
                popup(<AddCase placeId={id} onFinish={handleAddCaseFinish} />, { title: '新增案件', size: "large" })
            },
            type: 'primary',
        }]
    ]

    // 新增案件确定按钮
    async function handleAddCaseFinish(data?: any) {
        if (data.length === 0) {
            return false
        }
        //新增案件
        await doAddPlaceCase({
            ids: data,// 选择的案件IDS
            id // 场所ID
        })
        handleRefreshTable()
    }

    //刷新表格
    function handleRefreshTable() {
        tableRef.current.onRefresh()
    }

    return (
        <article className={styles.wrapper}>
            <div className={styles.boxData}>
                <div className={styles.boxTitle}>
                <Title title={'涉案信息'}/>
                </div>
                <div className={styles.boxContent}>
                    <TableInterface
                        ref={tableRef}
                        extraParams={{ "focusPlaceId": id }}
                        queryInputs={queryInputs}
                        toolsRight={toolsRight}
                        columns={caseColumns}
                        request={doGetPlaceCaseList}
                    />
                </div>
            </div>
        </article>
    )
}

export default InvolvedList
