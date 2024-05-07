
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doAddEditPersonCar, doDelPersonCar, doGetPersonCarList } from "server/personnel";
import { getDictDataByType } from "server/system";
import PopulationVehicleDetail from "./component/PopulationVehicleDetail";
import styles from "./index.module.sass";



/**个人档案 -> 个人信息 -> 人口信息 -> 车辆信息 */
interface IPopulationVehicleInfo {
    id?: any
}
const PopulationVehicleInfo: React.FC<IPopulationVehicleInfo> = (props) => {
    const { id } = props
    const tableRef = useRef<any>(null)

    const formInputs: any = [
        [
            '车牌号',
            'licensePlate',
            {
                placeholder: '请输入',
                isRequired: true
            }
        ],
        [
            '类型',
            'carType',
            InputType.selectRemote,
            {
                request: () => getDictDataByType("archive_car_type"),
                placeholder: '请选择',
                width: '240px'
            }
        ],
        [
            '估值',
            'carAssessment',
            InputType.number,
            {
                placeholder: '请输入',
                style: { width: '240px' },
                prefix: "￥"
            }
        ],
        [
            '购买时间',
            'buyTime',
            InputType.date
        ],
        [
            '其它',
            'other',
            {
                placeholder: '请输入'
            }
        ]
    ]

    // 车辆信息
    const columns = [
        ['车牌号', 'licensePlate'],
        ['类型', 'carTypeName'],
        ['估值', 'carAssessment'],
        ['购买时间', 'buyTime'],
        ['其它', 'other'],
        [
            ['编辑', (record: any) => {
                //打开信息编辑窗口
                popup(<PopulationVehicleDetail request={doAddEditPersonCar} formInputs={formInputs} extraParams={{ id: record.id, personId: id }} id={record.id} onFinish={refreshTable} />, { title: '编辑', size: "middle" })
            }],
            ['删除', async (record: any) => {
                await doDelPersonCar(record.id)
                refreshTable()
            }, ActionType.confirm]
        ]
    ]

    const toolsRight: any = [
        ['新增', {
            onClick: () => {
                popup(<PopulationVehicleDetail request={doAddEditPersonCar} formInputs={formInputs} extraParams={{ personId: id }} onFinish={refreshTable} />, { title: '新增', size: "middle" })
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
                request={doGetPersonCarList}
            />
        </div>
    )
}


export default PopulationVehicleInfo
