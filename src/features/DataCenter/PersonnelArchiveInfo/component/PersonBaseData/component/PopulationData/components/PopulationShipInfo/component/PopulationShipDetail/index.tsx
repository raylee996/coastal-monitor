
import XcRadios from "component/XcRadios";
import DataListChoose from "features/DataCenter/components/DataListChoose";
import { positionStatusDict } from "helper/dictionary";
import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useState } from "react";
import { doGetPersonShipSailorInfo } from "server/personnel";
import { getShipListTable } from "server/ship";
import styles from "./index.module.sass";

/**个人档案 -> 个人信息 -> 人口信息 -> 表格内表单 */
interface IPopulationShipDetail {
    id?: any
    data?: any
    request?: any
    // formInputs?: any
    initData?: any
    extraParams?: any
    onClosePopup?: Function
    onFinish?: Function
}
const PopulationShipDetail: React.FC<IPopulationShipDetail> = (props) => {
    const { request, extraParams, id, onClosePopup, onFinish, initData, data } = props

    const [chooseShip, setChooseShip] = useState<any>(null)

    async function handleFinish(params: any) {
        const { id, shipCreateTime } = chooseShip ? chooseShip : data
        let shipId = ''
        if (chooseShip) {
            shipId = id
        } else {
            shipId = extraParams.shipId
        }
        const vo = await request({ ...data, ...params, ...extraParams, ...{ shipId, shipCreateTime } })
        if (vo) {
            onFinish && onFinish()
            onClosePopup && onClosePopup() // 关闭POPUP
        }
    }

    const editInput = [
        [
            '船舶',
            'shipId',
            InputType.component,
            {
                component: DataListChoose,
                isRow: true,
                btnTxt: '选择船舶',
                popTitle: '船舶列表',
                dataType: 'ship',
                rowSelectionType: "radio",
                request: getShipListTable,
                onFinish: handleDataListChooseFinish
            }
        ],

        [
            '船舶名称',
            'shipCnName',
            {
                placeholder: '',
                disabled: true
            }
        ],
        [
            '职务',
            'position',
            {
                placeholder: '请输入'
            }
        ],
        [
            '证书等级',
            'certificateLevel',
            {
                placeholder: '请输入'
            }
        ],
        [
            '在职状态',
            'status',
            InputType.component,
            {
                component: XcRadios,
                isRow: true,
                option: { data: positionStatusDict }
            }
        ]
    ]
    const addInput = [
        [
            '船舶',
            'shipId',
            InputType.component,
            {
                component: DataListChoose,
                isRow: true,
                btnTxt: '选择船舶',
                popTitle: '船舶列表',
                dataType: 'ship',
                rowSelectionType: "radio",
                request: getShipListTable,
                onFinish: handleDataListChooseFinish
            }
        ],
        [
            '职务',
            'position',
            {
                placeholder: '请输入'
            }
        ],
        [
            '证书等级',
            'certificateLevel',
            {
                placeholder: '请输入'
            }
        ],
        [
            '在职状态',
            'status',
            InputType.component,
            {
                component: XcRadios,
                isRow: true,
                option: { data: positionStatusDict }
            }
        ]
    ]
    const formInputs: any = id ? editInput : addInput


    function handleDataListChooseFinish(data: any) {

        if (data && data.length !== 0) {
            setChooseShip(() => {
                return data[0]
            })
        }
    }

    function showChooseShip(data: any) {
        if ([1, 2, 3].includes(data?.fusionStatus)) {
            const keyToProp: { [key: number]: string } = { 1: 'mmsi', 2: 'radarNumber', 3: 'targetId' }
            return data[keyToProp[data.fusionStatus]]
        }
        else {
            return data?.cnName || data?.enName || data?.id
        }
    }


    return (
        <div className={styles.wrapper}>
            <div className={styles.box}>
                {
                    chooseShip && <div className={styles.boxItem}>已选择的船舶：{showChooseShip(chooseShip)}</div>
                }

                <FormInterface
                    id={id}
                    inputs={formInputs}
                    formProps={{
                        labelCol: {
                            span: 3,
                        }
                    }}
                    initData={{ ...initData }}
                    options={{
                        submitText: '确认',
                        isShowReset: true
                    }}
                    getRequest={doGetPersonShipSailorInfo}
                    onFinish={handleFinish}
                    onReset={(params: any) => {
                        setChooseShip(null)
                    }}
                />
            </div>
        </div>
    )
}

PopulationShipDetail.defaultProps = {
}
export default PopulationShipDetail