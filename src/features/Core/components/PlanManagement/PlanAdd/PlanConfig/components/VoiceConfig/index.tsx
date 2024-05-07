import { Button, Form, Upload, Input, message, UploadProps, Radio, Space } from "antd"
import TTSContent from "features/Core/components/Voice/TTSContent";
import VoiceContent from "features/Core/components/Voice/VoiceContent";
import popup from "hooks/basis/Popup"
import { useCallback, useEffect, useMemo, useState } from "react";
import { doUploadFile } from "server/common";
import styles from './index.module.sass'

const { TextArea } = Input;

interface VoiceProps {
    // 广播类型
    itcType: number,
    // 广播内容
    trumpetContent: string
}

interface VoiceContentProps {
    onClosePopup?: () => void
    // 获取tts或者音频URL
    getContent: (content: VoiceProps) => void
}
// 喊话内容
const VoiceContentConfig: React.FC<VoiceContentProps> = ({
    onClosePopup,
    getContent
}) => {
    const [form] = Form.useForm();
    //传给后端的path
    const [audioPath, setAudioPath] = useState<any>('');
    const [isLoading, setIsLoading] = useState(false)

    // 内容类型： 1tts内容，2音频
    const [contentType, setContentType] = useState(1)

    useEffect(() => {
        form.setFieldsValue({
            contentType: 1
        })
        setContentType(1)
    }, [form])


    // 显示音频列表
    const [fileList, setFileList] = useState<any>([])

    // 使用引用内容
    const handleGetRecord = useCallback(
        (data: any) => {
            if (data.type === 1) {
                // 文本
                form.setFieldValue('content', data.content)
            } else if (data.type === 2) {
                // 音频
                setFileList([{
                    name: data.content,
                    status: 'done',
                    url: data.url,
                }])
                setAudioPath(data.url)
            }
        },
        [form],
    )

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

    const handleChangeAudio: UploadProps['onChange'] = async ({ fileList, file }) => {
        if (fileList.length === 0) {
            return
        }
        try {
            let data: any = await doUploadFile(file);
            const url = data.path.url
            setAudioPath(url)
            setFileList(fileList)
        } catch (err) {
            message.error('上传失败')
            console.error(err)
        }
    }

    // 删除音频
    function handleRemove() {
        setAudioPath('')
        setFileList([])
    }
    // 切换音频内容
    function handleChangeContentType(e: any) {
        form.setFieldsValue({
            contentType: e.target.value
        })
        setContentType(e.target.value)
    }
    // 关闭弹窗
    function handleClose() {
        onClosePopup && onClosePopup()
    }

    // 确定
    function handleConfirm() {
        let content = form.getFieldValue('content')

        if (contentType === 1) {
            // TTS内容.
            if (!content) {
                message.error('TTS内容不能为空')
                return
            }
            getContent({
                // 广播类型 1:文本 2:音频
                itcType: 1,
                // 广播内容
                trumpetContent: content
            })
        } else {
            // 音频
            if (!audioPath) {
                message.error('音频不能为空')
                return
            }
            getContent({
                // 广播类型 1:文本 2:音频
                itcType: 2,
                // 广播内容
                trumpetContent: audioPath
            })
        }
        handleClose()
    }

    return <article className={styles.wrapper}>
        <Form
            form={form}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            className={styles.form}
        >
            <Form.Item name="contentType" label="内容类型">
                <Radio.Group onChange={handleChangeContentType}>
                    <Radio value={1}>TTS 内容</Radio>
                    <Radio value={2}>音频</Radio>
                </Radio.Group>
            </Form.Item>
            {contentType === 1 && <Form.Item name="content" label="TTS内容">
                <TextArea
                    rows={3}
                    placeholder="TTS内容"
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    style={{ border: 'solid 1px #2f689e' }}
                />
            </Form.Item>}
            {contentType === 2 && <Form.Item label='音频' name='video' className={styles.formItem}>
                <Upload
                    beforeUpload={handleBeforeUpload}
                    onChange={handleChangeAudio}
                    onRemove={handleRemove}
                    fileList={fileList}
                    maxCount={1}
                >
                    <div>
                        <Button loading={isLoading}>{isLoading ? '校验中' : '上传'}</Button>
                    </div>
                </Upload>
            </Form.Item>}
            <Form.Item>
                <div className={styles.actionBtns}>
                    <Space>
                        <Button type='default' onClick={handleClose}>取消</Button>
                        <Button type="primary" onClick={handleConfirm}>确定</Button>
                    </Space>
                </div>
            </Form.Item>
        </Form>
        {contentType === 1 && <div className={styles.table}>
            <TTSContent getRecord={handleGetRecord} />
        </div>}
        {contentType === 2 && <div className={styles.table}>
            <VoiceContent getRecord={handleGetRecord} />
        </div>}
    </article>
}

interface Props {
    onChange?: (data: any) => void
    value?: any
}
// 音柱配置
const VoiceConfig: React.FC<Props> = ({ onChange, value }) => {
    // 判断是否已经配置
    const isShowConfiged = useMemo(() => {
        if (value) {
            return true
        } else {
            return false
        }
    }, [value])

    function handleGetContent(val: VoiceProps) {
        onChange && onChange(val)
    }
    function handleClick() {
        popup(<VoiceContentConfig getContent={handleGetContent} />, { title: '喊话内容', size: 'auto' })
    }
    return <>
        <Button type="link" onClick={handleClick}>配置</Button>
        {isShowConfiged && <span>已配置</span>}
    </>
}

export default VoiceConfig