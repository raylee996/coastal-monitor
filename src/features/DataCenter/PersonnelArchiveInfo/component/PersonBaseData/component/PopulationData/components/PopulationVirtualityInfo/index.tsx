
// import { virtualTypeDict } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doAddEditPersonVirtual, doDelPersonVirtual, doGetPersonVirtualList } from "server/personnel";
import { getDictDataByType } from "server/system";
import PopulationVirtualityDetail from "./component/PopulationVirtualityDetail";
import styles from "./index.module.sass";



/**个人档案 -> 个人信息 -> 人口信息 -> 虚拟信息 */
interface IPopulationVirtualityInfo {
    id?: any
}
const PopulationVirtualityInfo: React.FC<IPopulationVirtualityInfo> = (props) => {
    const { id } = props
    const tableRef = useRef<any>(null)
    
    const formInputs: any = [
        [
            '类型',
            'type',
            InputType.selectRemote,
            { request: () => getDictDataByType("virtual_type") }           
        ],
        [
            '账号',
            'account',
            {
                placeholder: '请输入',
                isRequired: true
            }
        ],

        [
            '昵称',
            'nickName',
            {
                placeholder: '请输入'
            }
        ]
    ]

    // 虚拟信息
    const columns = [
        ['类型', 'typeName'],
        ['账号', 'account'],
        ['昵称', 'nickName'],
        [
            ['编辑', (record: any) => {
                //打开信息编辑窗口
                popup(<PopulationVirtualityDetail  request={doAddEditPersonVirtual} formInputs={formInputs} extraParams={{ id: record.id, personId: id }} id={record.id} onFinish={refreshTable} />, { title: '编辑', size: "middle" })
            }],
            ['删除', async (record: any) => {
                await doDelPersonVirtual(record.id)
                refreshTable()
            }, ActionType.confirm]
        ]

    ]

    const toolsRight: any = [
        ['新增', {
            onClick: () => {
                popup(<PopulationVirtualityDetail request={doAddEditPersonVirtual}  formInputs={formInputs} extraParams={{ personId: id }} onFinish={refreshTable}/>, { title: '新增', size: "middle" })
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
                request={doGetPersonVirtualList}
            />
        </div>
    )
}


export default PopulationVirtualityInfo
