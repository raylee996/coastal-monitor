import { UseType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"

interface Props {
    /**  */
    data?: any
}

const formInputs = [
    ['处理意见', 'opinionTypeName'],
    ['备注', 'remark'],
    ['处理人', 'createName'],
    ['处理时间', 'createTime'],
]

const EarlyRecordPopup: React.FC<Props> = ({data}) => {
    console.debug("EarlyRecordPopup")

    return <FormInterface
        inputs={formInputs}
        formType={UseType.show}
        formProps={{
          labelCol: {
            span: 6,
          }
        }}
        initData={data}
    />
}

export default EarlyRecordPopup