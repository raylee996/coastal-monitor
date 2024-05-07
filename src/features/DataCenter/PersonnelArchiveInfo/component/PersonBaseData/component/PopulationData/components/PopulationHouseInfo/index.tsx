
import { houseTypeDict } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doAddEditPersonHouse, doDelPersonHouse, doGetPersonHouseList } from "server/personnel";
import PopulationHouseDetail from "./component/PopulationHouseDetail";
import styles from "./index.module.sass";

/**个人档案 -> 个人信息 -> 人口信息 -> 房产信息 */
interface IPopulationHouseInfo {
    id?: any
}
const PopulationHouseInfo: React.FC<IPopulationHouseInfo> = (props) => {
    const { id } = props
    const tableRef = useRef<any>(null)

    const formInputs: any = [
        [
            '房产名称',
            'houseName',
            {
                placeholder: '请输入',
                isRequired: true,
                maxLength: 50
            }
        ],
        [
            '房产类型',
            'houseType',
            InputType.select,
            {
                dict: houseTypeDict,
                placeholder: '请输选择',
                style: {
                    width: '180px'
                }
            }
        ],
        [
            '地址',
            'houseAddr',
            {
                placeholder: '请输入',
                isRequired: true,
                maxLength:100
            }
        ],
        [
            '购买时间',
            'buyTime',
            InputType.date
        ],
        [
            '持有人',
            'masters',
            {
                placeholder: '请输入'
            }
        ]
    ]

    // 房产信息
    const columns = [
        ['房产名称', 'houseName'],
        ['房产类型', 'houseTypeName'],
        ['地址', 'houseAddr'],
        ['购买时间', 'buyTime'],
        ['持有人', 'masters'],
        [
            ['编辑', (record: any) => {
                //打开信息编辑窗口
                popup(<PopulationHouseDetail request={doAddEditPersonHouse} formInputs={formInputs} extraParams={{ id: record.id, personId: id }} id={record.id} onFinish={refreshTable}/>, { title: '编辑', size: "middle" })
            }],
            ['删除', async (record: any) => {
                await doDelPersonHouse(record.id)
                refreshTable()
            }, ActionType.confirm]
        ]

    ]

    const toolsRight: any = [
        ['新增', {
            onClick: () => {
                popup(<PopulationHouseDetail request={doAddEditPersonHouse} formInputs={formInputs} extraParams={{ personId: id }} onFinish={refreshTable}/>, { title: '新增', size: "middle" })
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
                request={doGetPersonHouseList}
            />
        </div>
    )
}

export default PopulationHouseInfo