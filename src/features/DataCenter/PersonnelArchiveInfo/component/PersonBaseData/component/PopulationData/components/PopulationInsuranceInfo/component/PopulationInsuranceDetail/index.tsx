
import FormInterface from "hooks/integrity/FormInterface";
import { doGetPersonSocialInfo } from "server/personnel";
import styles from "./index.module.sass";

/**个人档案 -> 个人信息 -> 人口信息 -> 表格内表单 */
interface IPopulationInsuranceDetail {
    id?: any
    data?: any
    api?: any
    request?: any
    formInputs: any
    initData?: any
    extraParams?: any
    onClosePopup?: Function
    onFinish?: Function
}
const PopulationInsuranceDetail: React.FC<IPopulationInsuranceDetail> = (props) => {
    const { formInputs, request, api, extraParams, id, onClosePopup, onFinish, initData } = props
    console.log(id, api)

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
                    getRequest={doGetPersonSocialInfo}
                    onFinish={handleFinish}
                />
            </div>
        </div>
    )
}

PopulationInsuranceDetail.defaultProps = {
    formInputs: []
}
export default PopulationInsuranceDetail
