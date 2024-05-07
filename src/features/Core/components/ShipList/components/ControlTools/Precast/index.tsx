import { CheckOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Popconfirm, Space } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { delPresetData, editPresetName, getAllPreset } from "server/preset";
import { addPresetData, cameraControlAsync, savePresetData } from "server/ship";

import styles from './index.module.sass'

interface Props {
    deviceCode?: string
    targetVideo?: any
    channel?: any
    lockId?: string
    setrealLockId?: Function
}
const Precast: React.FC<Props> = ({
    deviceCode,
    targetVideo,
    channel,
    lockId,
    setrealLockId
}) => {
    const [precastName, setPrecastName] = useState('')
    const [precastList, setPrecastList] = useState<any[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selecPrecastId, setSelecPrecastId] = useState()
    const [editPrecastId, setEditPrecastId] = useState<number | undefined>()
    const [isPrecastLoading, setIsPrecastLoading] = useState(false)
    // 展示预置位弹窗
    const showPrecastModal = useCallback(() => setIsModalOpen(true), [])
    // 关闭预置位弹窗
    const handleCancelPrecast = useCallback(() => {
        setIsModalOpen(false)
        setPrecastName('')
        setEditPrecastId(undefined)
    }, [])

    const [realLockId, setRealLockId] = useState(lockId)

    useEffect(() => {
        if (lockId) {
            setRealLockId(lockId)
        }
    }, [lockId])


    const getPresetList = useCallback(
        async () => {
            if (deviceCode) {
                const list = await getAllPreset(deviceCode)
                setPrecastList(list)
            }
        },
        [deviceCode]
    )

    const precastShowList = useMemo(() => precastList.map(item => ({
        ...item,
        isSelect: selecPrecastId === item.id,
        class: selecPrecastId === item.id ? styles.precastCardTarget : styles.precastCard
    })), [precastList, selecPrecastId])


    const okButtonProps = useMemo(() => ({
        loading: isPrecastLoading
    }), [isPrecastLoading])


    // 根据当前视频查询预置位lieb 
    useEffect(() => {
        async function main() {
            await getPresetList()
        }
        main()
    }, [getPresetList])

    // 新增预置位
    const handleAddPrecast = useCallback(
        async () => {
            try {
                setIsPrecastLoading(true)
                if (editPrecastId) {
                    await editPresetName(editPrecastId, precastName)
                    setEditPrecastId(undefined)
                } else {
                    const params = {
                        deviceCode: deviceCode,
                        presetName: precastName
                    }
                    await addPresetData(params, channel)
                }
                await getPresetList()
                setIsModalOpen(false)
                setPrecastName('')
                setEditPrecastId(undefined)
            } finally {
                setIsPrecastLoading(false)
            }
        },
        [precastName, getPresetList, editPrecastId, deviceCode, channel]
    )

    // 保存预置位
    const handleSavePrecast = useCallback(
        async (data: any) => {
            await savePresetData(data, channel)
            await getPresetList()
        },
        [channel, getPresetList]
    )

    // 编辑预置位
    const handleEditPrecast = useCallback(
        (data: any) => {
            setEditPrecastId(data.id)
            setPrecastName(data.presetName)
            setIsModalOpen(true)
        },
        []
    )

    // 删除预置位
    const handleDeletePrecast = useCallback(
        async (data: any) => {
            await delPresetData(data.id)
            await getPresetList()
        },
        [getPresetList]
    )
    // 选择预置位
    const handleSelectPrecast = useCallback(
        async (data: any) => {
            setSelecPrecastId(data.id)
            const params = {
                controlType: 6,
                ptzVo: {
                    pan: data.pan,
                    tilt: data.tilt,
                    zoom: data.zoom
                }
            }
            cameraControlAsync({
                channel,
                deviceCode,
                ...targetVideo,
                ...params,
                lockId: realLockId,
                step: 50
            }).then((res: any) => {
                if (res.data?.data?.lockId) {
                    setRealLockId(res.data.data.lockId)
                    setrealLockId && setrealLockId(res.data.data.lockId)
                }
            })
        },
        [targetVideo, channel, deviceCode, realLockId, setrealLockId]
    )

    return <>
        <header className={styles.header}>
            <span>预置位</span>
            <PlusCircleOutlined title="新增当前查看的位置" className={styles.precastAdd} onClick={showPrecastModal} />
        </header>
        <div className={styles.precastList}>
            {
                precastShowList && precastShowList.map((item: any) => <div className={item.class} key={item.id}>
                    <div className={styles.precastName} title={item.presetName} onDoubleClick={() => handleSelectPrecast(item)}>
                        {item.isSelect && <CheckOutlined className={styles.precastCheck} />}
                        {item.presetName}
                    </div>
                    <div>
                        <Space>
                            <Popconfirm
                                title="确认保存当前位置到该预置位吗？"
                                okText="是"
                                cancelText="否"
                                onConfirm={() => handleSavePrecast(item)}
                            >
                                <SaveOutlined title="保存当前位置到该预置位" className={styles.precastAction} />
                            </Popconfirm>

                            <EditOutlined title="编辑该预置位名称" className={styles.precastAction} onClick={() => handleEditPrecast(item)} />
                            <Popconfirm
                                title="确认删除预置位吗？"
                                okText="是"
                                cancelText="否"
                                onConfirm={() => handleDeletePrecast(item)}
                            >
                                <DeleteOutlined title="删除" className={styles.precastAction} />
                            </Popconfirm>
                        </Space>
                    </div>
                </div>)
            }
        </div>
        <section>
            <Modal
                title="预置位"
                transitionName=""
                centered={true}
                open={isModalOpen}
                okButtonProps={okButtonProps}
                onOk={handleAddPrecast}
                onCancel={handleCancelPrecast}>
                <Form.Item
                    label="设备名称">
                    <span>{targetVideo?.deviceName}</span>
                </Form.Item>
                <Form.Item
                    label="预置位名称">
                    <Input value={precastName} onChange={evt => setPrecastName(evt.target.value)} placeholder="请输入预置位名称" />
                </Form.Item>
            </Modal>
        </section>
    </>
}

export default Precast