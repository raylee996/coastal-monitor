import { Button, Col, Form, Input, InputNumber, message, Row, Select, Slider, Tabs, Upload, UploadProps } from "antd"
import { getDevicesList } from "api/device";
import windowUI from "component/WindowUI";
import { local } from "helper/storage";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { doUploadFile } from "server/common";
import { itcJobAddAsync } from "server/device";
import TTSContent from "../TTSContent";
import VoiceContent from "../VoiceContent";
import MicroPhoneSended from "./components/MicroPhoneSended";
import PlayRecord from "./components/PlayRecord";
import styles from './index.module.sass'
const { TextArea } = Input;

interface Props {
    deviceCodes?: any[]
}

// 点播面板
const VoicePlayPanel: React.FC<Props> = ({ deviceCodes }) => {
    const [form] = Form.useForm();
    const [options, setOptions] = useState<any>([])
    const [microPhoneList, setMicroPhoneList] = useState<any>([])
    //传给后端的path
    const [audioPath, setAudioPath] = useState<any>('');
    const [audioName, setAudioName] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    // 显示音频列表
    const [fileList, setFileList] = useState<any>([])

    const [key, setKey] = useState('item-0')

    const [volume, setVolume] = useState(50)

    // 随机数，用于刷新下发记录
    const [randomNum, setRandomNum] = useState(0)

    const queryDeviceList = useCallback(
        (type?: number) => {
            async function main() {
                let dto = {
                    current: 1,
                    size: -1,
                    type: type,
                }
                const vo = await getDevicesList(dto)
                let options = vo.records.map((item: any) => {
                    return {
                        ...item,
                        value: item.deviceCode,
                        label: item.deviceName,
                        volume: item.volume
                    }
                })
                if (type === 9) {
                    // 音柱列表
                    setOptions(options)
                } else {
                    // 麦克风列表
                    let list = options.map((item: any) => {
                        return {
                            ...item,
                            value: item.itcId,
                            label: item.deviceName
                        }
                    })
                    setMicroPhoneList(list)
                }
            }
            main()
        },
        [],
    )


    // 查询设备列表
    useEffect(() => {
        queryDeviceList(9)
        queryDeviceList(22)
    }, [queryDeviceList])

    // 默认音量
    useEffect(() => {
        let localVolume = local('volume')
        if (localVolume) {
            setVolume(localVolume)
            form.setFieldValue('volume', localVolume)
        } else {
            setVolume(50)
            form.setFieldValue('volume', 50)
        }
    }, [form])


    useEffect(() => {
        if (deviceCodes) {
            form.setFieldsValue({
                deviceCodes: deviceCodes
            })
        }
    }, [deviceCodes, form])

    // 切换tab
    const handleChange = useCallback(
        (val: string) => {
            setKey(val)
        },
        [],
    )

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
                setAudioName(data.content)
            }
        },
        [form],
    )
    const item1 = useMemo(() => [
        { label: '下发记录', key: 'item-0', children: <PlayRecord getRecord={handleGetRecord} randomNum={randomNum} /> },
        { label: 'TTS内容库', key: 'item-1', children: <div style={{ height: '380px' }}><TTSContent getRecord={handleGetRecord} /> </div> },
        { label: '音频内容库', key: 'item-2', children: <div style={{ height: '380px' }}><VoiceContent getRecord={handleGetRecord} /></div> },
    ], [handleGetRecord, randomNum])

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
            setAudioName(file.name)
            setFileList(fileList)
        } catch (err) {
            message.error('上传失败')
            console.error(err)
        }
    }
    // 删除音频
    function handleRemove() {
        setAudioPath('')
        setAudioName('')
        setFileList([])
    }


    // 下发内容广播
    async function handleSubmitContent() {
        let formData = await form.validateFields()
        if (!formData.content) {
            message.error('请填写TTS内容')
            return false
        }
        if (!formData.deviceCodes) {
            message.error('请选择需要下发的设备')
            return false
        }
        formData.deviceCodes = formData.deviceCodes.join(',')
        formData.type = 1
        _.unset(formData, 'video')
        let result = await itcJobAddAsync(formData)
        if (result.data.code === 200) {
            message.success(result.data.msg || '操作成功')
            let time = new Date().getTime()
            setRandomNum(time)
        } else {
            message.error(result.data.msg || '服务异常')
        }
    }
    // 下发音频广播
    async function handleSubmitAudio() {
        let formData = await form.validateFields()
        if (!audioPath) {
            message.error('请选择音频')
            return false
        }
        if (!formData.deviceCodes) {
            message.error('请选择需要下发的设备')
            return false
        }
        formData.deviceCodes = formData.deviceCodes.join(',')
        formData.type = 2
        formData.url = audioPath
        formData.content = audioName
        _.unset(formData, 'video')

        let result = await itcJobAddAsync(formData)
        if (result.data.code === 200) {
            message.success(result.data.msg || '操作成功')
            let time = new Date().getTime()
            setRandomNum(time)
        } else {
            message.error(result.data.msg || '服务异常')
        }
    }
    // 下发麦克风
    async function handleSubmitMicroPhone() {
        let formData = await form.validateFields()
        let microNamesList: any[] = []
        if (!formData.itcId) {
            message.error('请选择麦克风')
            return false
        }
        if (!formData.deviceCodes) {
            message.error('请选择需要下发的设备')
            return false
        }
        microNamesList = microPhoneList.filter((item: any) => formData.itcId.includes(item.itcId)).map((item: any) => item.deviceName)
        let data = {
            type: 3,
            itcId: formData.itcId.join(','),
            deviceCodes: formData.deviceCodes.join(','),
            content: '下发麦克风',
            volume: formData.volume
        }
        let result = await itcJobAddAsync(data)
        if (result.data.code === 200) {
            let time = new Date().getTime()
            setRandomNum(time)
            message.success(`正在使用[${microNamesList.join(',')}]设备呼叫！`)
        } else {
            message.error(result.data.msg || '服务异常')
        }
    }
    function handleChangeVoice(val: number) {
        setVolume(val)
        form.setFieldValue('volume', val)
        local('volume', val)
    }
    // 查看已下发列表
    function handleSendedList() {
        windowUI(<MicroPhoneSended />, { title: '已发送麦克风', width: '400px', height: '600px', offset: [900, 80], key: '已发送麦克风' })
    }
    return <article>
        <header className={styles.header}>
            <Form
                form={form}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                style={{ overflow: "hidden" }}
            >
                <Form.Item label="音柱" name="deviceCodes" className={styles.formItem}>
                    <Select
                        mode="multiple"
                        size={'middle'}
                        placeholder="请选择音柱"
                        value={deviceCodes}
                        style={{ width: '100%' }}
                        options={options}
                        allowClear
                        maxTagCount={2}
                    />
                </Form.Item>
                <Form.Item label='音量' className={styles.formItem}>
                    <Row>
                        <Col span={15}>
                            <Form.Item name='volume' className={styles.formItem}>
                                <Slider value={volume} min={1} max={100} onChange={(val: any) => handleChangeVoice(val)} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <InputNumber
                                value={volume}
                                min={1}
                                max={100}
                                onChange={(val: any) => handleChangeVoice(val)}
                                className={styles.stepVal}
                            />
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label="TTS内容" className={styles.formItem}>
                    <Row>
                        <Col span={18}>
                            <Form.Item name="content" noStyle>
                                <TextArea
                                    rows={3}
                                    placeholder="TTS内容"
                                    autoSize={{ minRows: 3, maxRows: 3 }}
                                    style={{ border: 'solid 1px #2f689e' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Button className={styles.sendContent} type={"primary"} onClick={handleSubmitContent}>下发</Button>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label='音频' name='video' className={styles.formItem}>
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
                    <Button className={styles.sendAudio} type={"primary"} onClick={handleSubmitAudio}>下发</Button>
                </Form.Item>
                <Form.Item label="麦克风" className={styles.formItem}>
                    <Row>
                        <Col span={12}>
                            <Form.Item noStyle name="itcId">
                                <Select
                                    mode="multiple"
                                    size={'middle'}
                                    placeholder="请选择麦克风"
                                    style={{ width: '100%' }}
                                    options={microPhoneList}
                                    allowClear
                                    maxTagTextLength={6}
                                    maxTagCount={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Button className={styles.btn} type={"primary"} onClick={handleSubmitMicroPhone}>呼叫</Button>
                            <Button className={styles.btn} type={"default"} onClick={handleSendedList}>使用中</Button>
                        </Col>
                    </Row>

                </Form.Item>
            </Form>
        </header>
        <article>
            <Tabs items={item1} tabPosition='top' activeKey={key} onChange={handleChange}></Tabs>
        </article>
    </article >
}

export default VoicePlayPanel