
import XcRadios from "component/XcRadios";
import { nodeLevelDict, searchTimeRangeDict } from "helper/dictionary";
import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";

interface ICondForm {
    /**条件类型 */
    type?: any
    onFinish?: Function
}

const CondForm: React.FC<ICondForm> = (props) => {
    const { type, onFinish } = props
    const [formInputs, setFormInputs] = useState<any>([])

    useEffect(() => {
        console.log('type = ' + type)
        if (type.includes("item-0")) {
            setFormInputs([
                [
                    '展示层级',
                    'state',
                    InputType.component,
                    {
                        component: XcRadios,
                        option: { data: [{ name: '一层', value: "0" }, { name: '两层', value: "1" }] }
                    }
                ],
                [
                    '每层条数',
                    'nodeLevelDict',
                    InputType.select, {
                        dict: nodeLevelDict,
                        placeholder: '请选择',
                    }
                ],
                [
                    '数据类型',
                    'dataType',
                    InputType.component,
                    {
                        component: XcRadios,
                        // option: { data: [{ name: '人脸', value: "0" }, { name: '侦码', value: "1" }, { name: '车牌', value: "2" }] }
                        option: { data: [{ name: '人脸', value: "0" }, { name: '车牌', value: "2" }] }
                    }
                ],
                [
                    '查询时段',
                    'searchTime',
                    InputType.select, {
                        dict: searchTimeRangeDict,
                        placeholder: '请选择',
                    }
                ]

            ])
        } else {
            setFormInputs([
                [
                    '每层条数',
                    'nodeLevelDict',
                    InputType.select, {
                        dict: nodeLevelDict,
                        placeholder: '请选择',
                    }
                ]
            ])
        }

    }, [type])

    function handleFinish(data: any) {
        onFinish && onFinish(data)
    }
    return <div>
        <FormInterface
            inputs={formInputs}
            formProps={{
                layout: "inline",
            }}
            options={{
                isShowItemButton: true,
                isNotShowFooter: true,
                submitText: '筛选',
                isShowReset: false
            }}
            onFinish={handleFinish}
        />
    </div>
}

interface ICondition {
    active?: any
    data?: any
    mode?: any
    defaultOpenKeys?: any
    onFinish?: Function
}

const Condition: React.FC<ICondition> = (props) => {
    console.debug('Condition')
    const {defaultOpenKeys, onFinish, active } = props

    const [menuIndex, setMenuIndex] = useState<any>(defaultOpenKeys)

    useEffect(() => {
        setMenuIndex(`item-${active}`)
    }, [active])

    function handleFinish(params: any) {
        if (params.searchTime) {
        }
        onFinish && onFinish(params)
    }


    return (
        <article className={styles.wapper}>
            <div className={styles.condForm}>
                <CondForm type={menuIndex} onFinish={handleFinish} />
            </div>
        </article>
    )
}

Condition.defaultProps = {
    mode: "horizontal",
    data: [],
    defaultOpenKeys: ['item-0']
}

export default Condition
