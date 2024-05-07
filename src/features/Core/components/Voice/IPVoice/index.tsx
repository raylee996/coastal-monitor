import { Button, Checkbox, Col, Form, Input, Row } from "antd"
import { useCallback, useEffect, useState } from "react";
import styles from './index.module.sass'
import XcEmpty from "component/XcEmpty";
import windowUI from "component/WindowUI";
import VoicePlayPanel from "../VoicePlayPanel";
import { getDevicesList } from "api/device";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
// ip音柱组件
const IPVoice: React.FC = () => {

    const [form] = Form.useForm();
    const [deviceList, setDeviceList] = useState<any[]>([])
    const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAll, setCheckAll] = useState(false);

    const queryDeviceList = useCallback(
        (searchValue?: string) => {
            async function main() {
                let dto = {
                    current: 1,
                    size: -1,
                    type: 9,
                    deviceNameOrCode: searchValue,
                    orderType: 2
                }
                const vo = await getDevicesList(dto)
                setDeviceList(vo.records)
            }
            main()
        },
        [],
    )

    // 查询设备列表
    useEffect(() => {
        queryDeviceList()
    }, [queryDeviceList])

    // 搜索设备
    function handleSearch() {
        let formData = form.getFieldsValue()
        queryDeviceList(formData.deviceNameOrCode)
    }

    // 重置
    function handleReset() {
        queryDeviceList()
        setCheckedList([]);
        setIndeterminate(true);
        setCheckAll(false);
    }

    // 选中音柱
    function handleSelect(list: CheckboxValueType[]) {
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < deviceList.length);
        setCheckAll(list.length === deviceList.length);
    }
    // 全选
    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        let checked = []
        if (deviceList.length > 0) {
            checked = deviceList.map(item => item.deviceCode)
        }
        setCheckedList(e.target.checked ? checked : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
    };

    // 打开点播面板
    function handleOpenVoicePlayWin(deviceCodes: any) {
        windowUI(<VoicePlayPanel deviceCodes={deviceCodes} />, {
            title: '点播',
            offset: [1480, 80],
            width: '400px',
            height: '800px',
            key: '点播'
        })
    }
    return <article>
        <header>
            <Form
                form={form}
                labelCol={{ span: 1 }}
                wrapperCol={{ span: 23 }}
                style={{ overflow: "hidden" }}
            >
                <Row style={{ height: '42px' }}>
                    <Col span={11}>
                        <Form.Item name='deviceNameOrCode' style={{ marginBottom: '8px' }}>
                            <Input placeholder='请输入音柱名称' />
                        </Form.Item>
                    </Col>
                    <Col span={9}>
                        <Button className={styles.button} type={"primary"} onClick={handleSearch}>搜索</Button>
                        <Button type={"default"} onClick={handleReset}>重置</Button>
                    </Col>
                </Row>
            </Form>
        </header>
        <article>
            <div className={styles.listTop}>
                <div>已选择<span className={styles.selectedCount}>{checkedList.length}</span>条</div>
                <Button type='primary' onClick={() => handleOpenVoicePlayWin(checkedList)} disabled={checkedList.length === 0}>点播</Button>
            </div>
        </article>
        <article>
            <p>音柱列表:</p>
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                全选
            </Checkbox>
            <div className={styles.deviceList}>
                <Checkbox.Group style={{ width: '100%' }} onChange={handleSelect} value={checkedList}>
                    {
                        deviceList.length > 0 && deviceList.map((item: any) => {
                            return <div className={styles.listItem} key={item.id}>
                                <Checkbox value={item.deviceCode}>{item.deviceName}</Checkbox>
                                <Button type="link" onClick={() => handleOpenVoicePlayWin([item.deviceCode])}>点播</Button>
                            </div>
                        })
                    }
                </Checkbox.Group>
                {deviceList.length === 0 && <XcEmpty />}
            </div>
        </article>
    </article>
}

export default IPVoice