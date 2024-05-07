import { Form, FormInstance, FormProps } from "antd"
import dayjs from "dayjs"
import { planDealMethods, startTypeDict } from "helper/dictionary"
import Map2D from "helper/Map2D"
import { InputType, PanelOptions } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import React from "react"
import { useEffect, useMemo, useState } from "react"
import CustomAreaSelect from "../components/CustomAreaSelect"
import VoiceConfig from "../components/VoiceConfig"
import WisdomJudgmentSelect from "../components/WisdomJudgmentSelect"

interface Props {
    // form表单默认值
    data?: any
    // 当前节点的位置
    index: number
    // 当前表单的位置
    idx: number
    // 地图实例
    getMap2d: () => Map2D | undefined
    // form实例
    getFormInstance?: (form: FormInstance, index: number, idx: number) => void
    // 判断是否为新增的项
    isNewList?: any
}
const options: PanelOptions = {
    isShowItemButton: false,
    isNotShowFooter: true,
}

// 预案动态表单配置
const PlanConfigForm: React.FC<Props> = ({
    data,
    index,
    idx,
    getMap2d,
    getFormInstance,
    isNewList
}) => {
    console.debug('PlanConfigForm');
    const [initData, setInitData] = useState<any>({
        startType: 1
    })
    const [form] = Form.useForm()

    // 表单初始值
    useEffect(() => {
        if (data) {
            setInitData({ ...data, time: data.time ? [dayjs(data.time[0]), dayjs(data.time[1])] : undefined })
        }
    }, [data])

    useEffect(() => {
        form.setFieldValue('isNewList', isNewList)
        getFormInstance && getFormInstance(form, index, idx)
    }, [getFormInstance, form, index, idx, isNewList])


    const inputs = useMemo(() => [
        ['启动时机', 'startType', InputType.radio, {
            dict: startTypeDict
        }],
        ['指定区域', 'area', InputType.component, {
            when: { startType: 2 },
            component: CustomAreaSelect,
            getMap2d: getMap2d
        }],
        ['通知范围', 'noticeScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入通知范围',
            when: { startType: 2 }
        }],
        ['处理方式', 'typeId', InputType.selectMultiple, {
            dict: planDealMethods,
            maxTagCount: 1
        }],
        ['摄像机范围', 'cameraScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入摄像机范围',
            when: { typeId: { in: [1] } }
        }],
        ['车辆设备范围', 'carScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入车辆设备范围',
            when: { typeId: { in: [2] } }
        }],
        ['人脸设备范围', 'personScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入人脸设备范围',
            when: { typeId: { in: [3] } }
        }],
        ['无人机范围', 'wrjScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入无人机范围',
            when: { typeId: { in: [4] } }
        }],
        ['无人船范围', 'wrcScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入无人船范围',
            when: { typeId: { in: [5] } }
        }],
        ['音柱距离', 'itcScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入音柱距离',
            when: { typeId: { in: [6] } }
        }],
        // 返回值内容
        /* { 
            // 广播类型 1:文本 2:音频
            itcType: 1, 
            // 广播内容
            trumpetContent: '' 
        } */
        ['广播内容', 'broadCastContent', InputType.component, {
            when: { typeId: { in: [6] } },
            component: VoiceConfig
        }],
        ['警力范围', 'policScope', InputType.number, {
            addonAfter: '米',
            placeholder: '请输入警力范围',
            when: { typeId: { in: [7] } }
        }],
        ['领导电话', 'leaderPhone', InputType.input, {
            placeholder: '请输入领导电话',
            when: { typeId: { in: [8] } }
        }],
        ['研判时间', 'time', InputType.dateTimeRange, {
            when: { typeId: { in: [9] } }
        }],
        ['研判模型', 'judgeModelId', InputType.component, {
            when: { typeId: { in: [9] } },
            component: WisdomJudgmentSelect
        }],
        ['预案描述', 'remark', InputType.textArea, {
            rows: 3,
            placeholder: '请输入预案描述'
        }],
        // 隐藏，用于判断是否为新增的项
        ['是否是新增的项', 'isNewList', InputType.input, {
            itemProps: {
                style: {
                    display: 'none'
                }
            }
        }],
        // 隐藏
        ['itemId', 'itemId', InputType.input, {
            itemProps: {
                style: {
                    display: 'none'
                }
            }
        }]
    ], [getMap2d])

    // 表单值变化触发
    const formProps: FormProps = {
        labelCol: { span: 5 }
    }

    return <article>
        {<FormInterface
            form={form}
            formProps={formProps}
            inputs={inputs}
            options={options}
            formData={initData}
        />}
    </article>
}

export default PlanConfigForm