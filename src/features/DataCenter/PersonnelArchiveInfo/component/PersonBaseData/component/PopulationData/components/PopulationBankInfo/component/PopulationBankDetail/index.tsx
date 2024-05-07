
import FormInterface from "hooks/integrity/FormInterface";
import { doGetPersonBankInfo } from "server/personnel";
import styles from "./index.module.sass";

/**个人档案 -> 个人信息 -> 人口信息 -> 表格内表单 */
interface IPopulationBankDetail {
    id?: any
    data?: any
    request?: any
    formInputs: any
    initData?: any
    extraParams?: any
    onClosePopup?: Function
    onFinish?: Function
}
const PopulationBankDetail: React.FC<IPopulationBankDetail> = (props) => {
    const { formInputs, request, extraParams, id, onClosePopup, onFinish, initData } = props

    async function handleFinish(data: any) {
        await request({ ...data, ...extraParams })
        onFinish && onFinish()
        onClosePopup && onClosePopup() // 关闭POPUP
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.box}>
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
                    getRequest={doGetPersonBankInfo}
                    onFinish={handleFinish}
                />
            </div>
        </div>
    )
}

PopulationBankDetail.defaultProps = {
    formInputs: []
}
export default PopulationBankDetail