
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doAddEditPersonSocial, doDelPersonSocial, doGetPersonSocialList } from "server/personnel";
import PopulationInsuranceDetail from "./component/PopulationInsuranceDetail";
import styles from "./index.module.sass";



/**个人档案 -> 个人信息 -> 人口信息 -> 社保信息 */
interface IPopulationInsuranceInfo {
    id?: any
}
const PopulationInsuranceInfo: React.FC<IPopulationInsuranceInfo> = (props) => {
    const { id } = props
    const tableRef = useRef<any>(null)

    const formInputs: any = [
        [
            '账号',
            'cardAccount',
            {
                placeholder: '请输入',
                maxLength: 20,
                isRequired: true
            }
        ],
        [
            '缴纳单位名称',
            'organizationName',
            {
                placeholder: '请输入',
                maxLength: 50,
                isRequired: true
            }
        ],
        [
            '公司账号',
            'companyAccount',
            {
                placeholder: '请输入',
                maxLength: 20,
                isRequired: true
            }
        ],
        [
            '开始年月',
            'beginDate',
            InputType.date,
            {
                picker: "month",
                format: 'YYYY-MM',
                isRequired: true
            }
        ],
        [
            '停止年月',
            'endDate',
            InputType.date,
            {
                picker: "month",
                format: 'YYYY-MM'
            }
        ]
    ]

    // 社保信息
    const columns = [
        ['账号', 'cardAccount'],
        ['缴纳单位名称', 'organizationName'],
        ['公司账号', 'companyAccount'],
        ['开始年月', 'beginDate'],
        ['停止年月', 'endDate'],
        [
            ['编辑', (record: any) => {
                //打开信息编辑窗口
                popup(<PopulationInsuranceDetail request={doAddEditPersonSocial} formInputs={formInputs} extraParams={{ personId: id }} id={record.id} onFinish={refreshTable} />, { title: '编辑', size: "middle" })
            }],
            ['删除', async (record: any) => {
                await doDelPersonSocial(record.id)
                refreshTable()
            }, ActionType.confirm]
        ]

    ]

    const toolsRight: any = [
        ['新增', {
            onClick: () => {
                popup(<PopulationInsuranceDetail request={doAddEditPersonSocial} formInputs={formInputs} extraParams={{ personId: id }} onFinish={refreshTable} />, { title: '新增', size: "middle" })
            },
            type:'primary'
        }]
    ]


    // 刷新列表
    function refreshTable() {
        tableRef.current.onRefresh()
    }
    return (
        <div className={styles.wrapper}>
            <div className={styles.box}>
                <TableInterface
                    ref={tableRef}
                    columns={columns}
                    extraParams={{ personId: id }}
                    toolsRight={toolsRight}
                    request={doGetPersonSocialList}
                />
            </div>

        </div>
    )
}


export default PopulationInsuranceInfo
