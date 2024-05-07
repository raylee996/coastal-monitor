
import popup from "hooks/basis/Popup";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doAddEditPersonBank, doDelPersonBank, doGetPersonBankList } from "server/personnel";
import PopulationBankDetail from "./component/PopulationBankDetail";
import styles from "./index.module.sass";



/**个人档案 -> 个人信息 -> 人口信息 -> 银行卡信息 */
interface IPopulationBankInfo {
    id?: any
}
const PopulationBankInfo: React.FC<IPopulationBankInfo> = (props) => {
    const { id } = props
    const tableRef = useRef<any>(null)

    const formInputs: any = [

        [
            '开户行名称',
            'bankName',
            {
                placeholder: '请输入',
                isRequired: true,
                maxLength: 50
            }
        ],
        [
            '账号',
            'cardAccount',
            {
                placeholder: '请输入',
                isRequired: true,
                maxLength: 20
            }
        ]
    ]
    // 银行卡信息
    const columns = [
        ['开户行名称', 'bankName'],
        ['账号', 'cardAccount'],
        [
            ['编辑', (record: any) => {
                //打开信息编辑窗口
                popup(<PopulationBankDetail request={doAddEditPersonBank} formInputs={formInputs} extraParams={{ id: record.id, personId: id }} id={record.id} onFinish={refreshTable} />, { title: '编辑', size: "middle" })
            }],
            ['删除', async (record: any) => {
                await doDelPersonBank(record.id)
                refreshTable()
            }, ActionType.confirm]
        ]

    ]
    const toolsRight: any = [
        ['新增', {
            onClick: () => {
                //跳转至人员档案
                popup(<PopulationBankDetail request={doAddEditPersonBank} formInputs={formInputs} extraParams={{ personId: id }} onFinish={refreshTable} />, { title: '新增', size: "middle" })
            },
            type:'primary'
        }]
    ]

    // 刷新列表
    function refreshTable() {
        tableRef.current.onRefresh()
    }
    return (
        <div className={styles.box}>
            <TableInterface
                ref={tableRef}
                columns={columns}
                toolsRight={toolsRight}
                request={doGetPersonBankList}
            />
        </div>
    )
}


export default PopulationBankInfo
