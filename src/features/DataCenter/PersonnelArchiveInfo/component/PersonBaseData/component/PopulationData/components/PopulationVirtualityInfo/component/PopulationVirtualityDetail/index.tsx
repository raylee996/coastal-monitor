
import FormInterface from "hooks/integrity/FormInterface";
import { doGetPersonVirtualInfo } from "server/personnel";
import styles from "./index.module.sass";

/**个人档案 -> 个人信息 -> 人口信息 -> 表格内表单 */
interface IPopulationVirtualityDetail {
    id?: any
    data?: any
    request?: any
    formInputs: any
    extraParams?: any
    onClosePopup?: Function
    onFinish?: Function
}
const PopulationVirtualityDetail: React.FC<IPopulationVirtualityDetail> = (props) => {
    const { formInputs, request, extraParams, id, onClosePopup, onFinish } = props

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
                    options={{
                        submitText: '确认',
                        isShowReset: true
                    }}
                    getRequest={doGetPersonVirtualInfo}
                    onFinish={handleFinish}
                />
            </div>
        </div>
    )
}

PopulationVirtualityDetail.defaultProps = {
    formInputs: []
}
export default PopulationVirtualityDetail