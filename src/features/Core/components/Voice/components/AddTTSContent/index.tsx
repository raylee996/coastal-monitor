import { Col, Form, Row, Input, Button, message } from "antd";
import { useEffect } from "react";
import { ttsContentAddAsync, ttsContentEditAsync } from "server/device";
import styles from './index.module.sass'

const { TextArea } = Input

interface Props {
    onClosePopup?: () => void
    refreshTable?: () => void
    // 编辑内容
    record?: any
}
const AddTTSContent: React.FC<Props> = ({ onClosePopup, refreshTable, record }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                ...record
            })
        }
    }, [form, record])


    // 新增/编辑
    async function handleAdd() {
        let formData = await form.validateFields();
        formData.type = 1
        let result: any
        if (record) {
            result = await ttsContentEditAsync({
                ...record,
                ...formData
            })
        } else {
            result = await ttsContentAddAsync(formData)
        }
        if (result.data.code === 200) {
            message.success(result.data.msg || '操作成功')
            refreshTable && refreshTable()
            onClosePopup && onClosePopup()
        } else {
            message.error(result.data.msg || '服务异常')
        }
    }
    return <>
        <Form
            form={form}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            style={{ overflow: "hidden" }}
        >
            <Row>
                <Col span={24}>
                    <Form.Item label='内容' name='content' style={{ marginBottom: '8px' }} rules={[{ required: true }]}>
                        <TextArea placeholder='请输入TTS内容' rows={5} autoSize={{ minRows: 5, maxRows: 20 }} showCount maxLength={1000} />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div className={styles.wrapper}>
                        <Button className={styles.button} type={"default"} onClick={() => { onClosePopup && onClosePopup() }}>取消</Button>
                        <Button type={"primary"} onClick={handleAdd}>确定</Button>
                    </div>
                </Col>
            </Row>
        </Form>
    </>

}

export default AddTTSContent