
import FormInterface from "hooks/integrity/FormInterface";
import { useEffect, useState } from "react";

import styles from "./index.module.sass";

interface IConditionForm {
    persionId?: any
    column: any
    option?: any
    onFinish?: Function
}
const ConditionForm: React.FC<IConditionForm> = (props) => {
    console.debug('ConditionForm')
    const { option, onFinish, column } = props

    const [formInputs, setFormInputs] = useState<any>([])

    useEffect(() => {
        setFormInputs(column)
    }, [column])


    function handleFinish(data: any) {
        onFinish && onFinish(data)
    }


    return (
        <div className={styles.wrapper}>
            <FormInterface
                inputs={formInputs}
                formProps={{
                    layout: "inline",
                }}
                options={{
                    isShowItemButton: true,
                    isNotShowFooter: true,
                    submitText: '查询',
                    ...option
                }}
                onFinish={handleFinish}
            />
        </div>
    )
}

export default ConditionForm
