import { Button, Col, Form, Input, message, Row, Upload, UploadProps } from "antd"
import styles from './index.module.sass'
import { doUploadFile } from "server/common";
import { useState } from "react";
import { ttsContentAddAsync } from "server/device";

interface Props {
    refreshTable?: () => void
    onClosePopup?: () => void

}
// 上传音频
const AddVideoContent: React.FC<Props> = ({ refreshTable, onClosePopup }) => {

    const [form] = Form.useForm();
    //传给后端的path
    const [audioPath, setAudioPath] = useState<any>('');
    const [isLoading, setIsLoading] = useState(false)

    async function handleBeforeUpload(file: any) {
        // 格式检查
        setIsLoading(true)
        let isAudio = await handleIsAudio(file)
        setIsLoading(false)
        if (!isAudio) {
            message.error('请上传音频文件')
            return Upload.LIST_IGNORE
        }
        // 大小检查
        const isLt2M = file.size / 1024 / 1024 > 100;
        if (isLt2M) {
            message.error(`文件不得大于${100}MB!`);
            return Upload.LIST_IGNORE
        }
        return false;
    }

    // 判断是否为音频文件
    function handleIsAudio(file: any) {
        return new Promise((resolve: (value: unknown) => void, reject: any) => {
            const urlObj = URL.createObjectURL(file);
            const audio = new Audio(urlObj)
            audio.onerror = (e: any) => {
                resolve(false)
            }
            audio.addEventListener('canplaythrough', function (e) {
                resolve(true)
            })
        })
    }

    const handleChange: UploadProps['onChange'] = async ({ fileList, file, event }) => {
        if (fileList.length === 0) {
            return
        }
        try {
            let data: any = await doUploadFile(file);
            const url = data.path.url
            setAudioPath(url)
        } catch (err) {
            message.error('视频上传失败')
            console.error(err)
        }
    }
    // 删除音频
    function handleRemove() {
        setAudioPath('')
    }

    // 提交表单
    async function handleSubmit() {
        let formData = await form.validateFields();
        let result: any
        if (!audioPath) {
            message.error('请选择音频文件')
            return
        }
        formData.url = audioPath;
        formData.type = 2;
        result = await ttsContentAddAsync(formData)
        if (result.data.code === 200) {
            message.success(result.data.msg || '操作成功')
            refreshTable && refreshTable()
            onClosePopup && onClosePopup()
        } else {
            message.error(result.data.msg || '服务异常')
        }
    }

    return <>
        <header>
            <Form
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ overflow: "hidden" }}
            >
                <Row>
                    <Col span={24}>
                        <Form.Item label='音频名称' name='content' style={{ marginBottom: '8px' }} rules={[{ required: true }]}>
                            <Input placeholder='请输入音频名称' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item label='音频' name='video' style={{ marginBottom: '8px' }}>
                            <Upload
                                beforeUpload={handleBeforeUpload}
                                onChange={handleChange}
                                onRemove={handleRemove}
                                maxCount={1}
                            >
                                <div>
                                    <Button>上传音频</Button>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <div className={styles.wrapper}>
                            <Button className={styles.button} type={"default"} onClick={() => { onClosePopup && onClosePopup() }}>取消</Button>
                            <Button type={"primary"} onClick={handleSubmit} loading={isLoading}>{isLoading ? '校验中...' : '确定'}</Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        </header>
    </>
}

export default AddVideoContent