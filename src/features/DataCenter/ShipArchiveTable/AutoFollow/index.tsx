import { Button, Form, InputNumber, Radio } from "antd"
import AreaSelectInForm from "component/AreaSelectInForm";
import { useEffect, useState } from "react";
import { autoFollowAsync, editAutoFollowAsync, searchAutoFollowAsync } from "server/ship";
import styles from './index.module.sass'

interface Props {
    onClosePopup?: Function
}

// 自动关注配置
const AutoFollow: React.FC<Props> = ({ onClosePopup }) => {
    const [form] = Form.useForm();
    const [formData, setFormData] = useState({
        isAutoFocus: 0,
        areaCode: '',
        frequency: 10,
        appear_days: 3,
        appear_minute: 10
    });

    // 用于判断当前是新增还是编辑。默认为新增
    const [isAdd, setIsAdd] = useState(true)

    // 初始值
    useEffect(() => {
        async function main() {
            let vo = await searchAutoFollowAsync()
            if (vo.configId) { //编辑时赋值
                setIsAdd(false)
                let formData = JSON.parse(vo.configValue);
                form.setFieldsValue({
                    ...formData
                })
            } else { //新增时赋值
                setIsAdd(true)
                form.setFieldsValue({
                    isAutoFocus: 0,
                    areaCode: '',
                    frequency: 10,
                    appear_days: 3,
                    appear_minute: 10
                })
            }
        }
        main()

    }, [form])

    // 修改formData
    function handleFieldsChange() {
        let formData = form.getFieldsValue()

        form.setFieldsValue({
            ...formData
        })
        setFormData({ ...formData })
    }
    // 区域选择
    function getAreaId(val: any) {
        setFormData({ ...form.getFieldsValue(), areaId: val })
    }

    // 提交
    async function handleSubmit() {
        let formData = form.getFieldsValue();
        if (isAdd) { //新增
            await autoFollowAsync(formData)
        } else { //编辑
            await editAutoFollowAsync(formData)
        }
        onClosePopup && onClosePopup()
    }
    return <div className={styles.wrapper}>
        <div className={styles.notes}>
            备注：在指定区域，出现频次及每天出现时长满足要求的船舶，即自动设定为关注船舶
        </div>
        <Form
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
            onFieldsChange={handleFieldsChange}>
            <Form.Item label='自动关注' name='isAutoFocus' className={styles.formItem}>
                <Radio.Group defaultValue={0}>
                    <Radio value={1}>开启</Radio>
                    <Radio value={0}>关闭</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label="出现区域" className={styles.formItem}>
                <Form.Item name="areaCode" noStyle>
                    <AreaSelectInForm value={formData.areaCode} onChange={getAreaId} size='default' />
                </Form.Item>
            </Form.Item>
            <Form.Item label="出现频次" className={styles.formItem}>
                <Form.Item name="frequency" noStyle>
                    <InputNumber min={formData.appear_days ? formData.appear_days : 1} max={Number.MAX_SAFE_INTEGER} />
                </Form.Item>
                <span className={styles.text}>天内 , 出现</span>
                <Form.Item name="appear_days" noStyle>
                    <InputNumber min={1} max={formData.frequency ? formData.frequency : Number.MAX_SAFE_INTEGER} />
                </Form.Item>
                <span className={styles.text}>天</span>
            </Form.Item>
            <Form.Item label='每天出现时长' className={styles.formItem}>
                <Form.Item name="appear_minute" style={{ display: 'inline-block' }}>
                    <InputNumber min={1} />
                </Form.Item>
                <span className={styles.text}>分钟</span>
            </Form.Item>
        </Form>
        <div className={styles.footer}>
            <Button type="default" className={styles.cancel} onClick={() => { onClosePopup && onClosePopup() }}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>确定</Button>
        </div>
    </div>
}

export default AutoFollow