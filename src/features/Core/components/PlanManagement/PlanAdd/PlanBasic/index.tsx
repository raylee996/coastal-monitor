import { Button, Form, Space } from 'antd'
import Title from 'component/Title'
import { InputType, PanelOptions } from 'hooks/flexibility/FormPanel'
import FormInterface from 'hooks/integrity/FormInterface'
import { useCallback, useState, useMemo, useEffect } from 'react'
import {
    planDoGetControlInfoList,
    planGetAllControlList,
    planGetLabelTable,
    planGetModelListAsync,
    planGetPointListAsync,
    planGetQueryPlaceList
} from 'server/core/planManagement'
import { getDictDataByType } from 'server/system'
import PlanModelPreview from '../PlanBasicPreview/PlanModelPreview'
import PlanDevicesPreview from '../PlanBasicPreview/PlanDevicesPreview'
import PlanPersonCarPreview from '../PlanBasicPreview/PlanPersonCarPreview'
import PlanPlacePreview from '../PlanBasicPreview/PlanPlacePreview'
import PlanShipPreview from '../PlanBasicPreview/PlanShipPreview'
import styles from './index.module.sass'
import BlackNameInput from '../BlackNameInput'
import BlackNamePreview from '../PlanBasicPreview/BlackNamePreview'

interface Props {
    onClosePopup?: () => void
    setStep?: (step: string) => void
    setBasicInfo?: (params: any) => void
    basicInfo?: any,
    planId?: any
}
const options: PanelOptions = {
    isShowItemButton: false,
    isNotShowFooter: true,
}
// 预案信息
const PlanBasic: React.FC<Props> = ({
    onClosePopup,
    setStep,
    setBasicInfo,
    basicInfo,
    planId }) => {

    console.debug('PlanBasic')
    const [form] = Form.useForm()
    const [currentFun, setCurrentFun] = useState<string>('')
    const [previewData, setPreviewData] = useState<any>()



    // 切换input值，显示不同的预览
    const handleChange = useCallback(
        (monitorType: string, val: any) => {
            setCurrentFun(monitorType)
            setPreviewData(val)
        },
        [],
    )

    // 表单赋值
    useEffect(() => {
        async function main() {
            setCurrentFun(basicInfo.monitorType)
            let shipControlList = await planGetAllControlList()
            let carPersonList = await planDoGetControlInfoList()
            switch (basicInfo.monitorType) {
                case '03':
                    setPreviewData(basicInfo.modelId)
                    break;
                case '04':
                    setPreviewData(basicInfo.place)
                    break;
                case '05':
                    setPreviewData(basicInfo.devices)
                    break;
                case '06':
                    setPreviewData(basicInfo.basicInfoJson)
                    break;
                case '0104':
                    let shipData = shipControlList.find((item: any) => item.id === basicInfo.shipControlName)
                    setPreviewData(shipData)
                    break;
                case '0101':
                    let carPersonData = carPersonList.find((item: any) => item.id === basicInfo.carPersonName)
                    setPreviewData(carPersonData)
                    break;
                default:
                    break;
            }
        }
        if (basicInfo) {
            main()
        }
    }, [basicInfo, form])

    const inputs = useMemo(() => [
        ['预案名称', 'name', InputType.input, {
            placeholder: '请输入预案名称',
            itemProps: {
                rules: [{ required: true }],
            },
        }],
        ['预案类型', 'planTypeId', InputType.selectRemote, {
            request: planGetLabelTable,
            placeholder: '请选择预案类型'
        }],
        ['业务功能', 'monitorType', InputType.selectRemote, {
            request: () => getDictDataByType("monitor_type"),
            onChange: () => {
                handleChange('', null)
                form.setFieldsValue({
                    modelId: undefined,
                    devices: [],
                    basicInfoJson: undefined,
                    shipControlName: undefined,
                    carPersonName: undefined,
                    place: undefined
                })
            },
            disabled: (planId && basicInfo?.monitorType === '03') ? true : false,
            placeholder: '请选择业务功能',
            itemProps: {
                rules: [{ required: true }],
            },
        }],
        ['模型名称', 'modelId', InputType.selectRemote, {
            when: { monitorType: '03' },
            request: () => planGetModelListAsync(planId ? false : true),
            onChange: (val: any) => {
                handleChange('03', val)
            },
            disabled: planId ? true : false,
            itemProps: {
                rules: [{ required: true }],
            },
        }],
        ['点位', 'devices', InputType.selectMultipleRemote, {
            when: { monitorType: '05' },
            remote: planGetPointListAsync,
            onChange: (val: any) => {
                handleChange('05', val)
            },
            maxTagCount: 1,
            maxTagTextLength: 12,
            itemProps: {
                rules: [{ required: true }]
            },
            optionFilterProp: "children",
            showSearch: true
        }],
        ['黑名单', 'basicInfoJson', InputType.component, {
            when: { monitorType: '06' },
            component: BlackNameInput,
            itemProps: {
                rules: [{ required: true }]
            },
            onChange: (val: any) => {
                // val值格式为 {dataType:'',codeValue:[]}
                handleChange('06', val)
            }
        }],
        // 船舶布控
        ['布控名称', 'shipControlName', InputType.selectRemote, {
            when: { monitorType: '0104' },
            request: planGetAllControlList,
            onChange: (val: any, data: any) => {
                handleChange('0104', data)
            },
            itemProps: {
                rules: [{ required: true }]
            },
        }],
        // 人车布控
        ['布控名称', 'carPersonName', InputType.selectRemote, {
            when: { monitorType: '0101' },
            request: planDoGetControlInfoList,
            onChange: (val: any, data: any) => {
                handleChange('0101', data)
            },
            itemProps: {
                rules: [{ required: true }]
            },
        }],
        ['场所布控', 'place', InputType.selectRemote, {
            when: { monitorType: '04' },
            request: planGetQueryPlaceList,
            onChange: (val: any) => {
                handleChange('04', val)
            },
            itemProps: {
                rules: [{ required: true }]
            },
        }],
        ['目的', 'purpose', InputType.textArea, {
            rows: 3,
        }],
        ['指挥长', 'commanderName', InputType.input],
        ['指挥长职位', 'commanderPost', InputType.input],
        ['副指挥长', 'deputyCommanderName', InputType.input],
        ['副指挥长职位', 'deputyCommanderPost', InputType.input],
    ], [basicInfo, form, handleChange, planId])

    function handleCancel() {
        onClosePopup && onClosePopup()
    }
    async function handleNext() {
        let formData = await form.validateFields()
        let pointList = await planGetPointListAsync()
        // 建模、人车布控、船舶布控、场所布控id，后端都用monitorId
        let monitorId: any = undefined
        // 点位编码，黑名单
        let basicInfoJson: any = {}
        switch (formData.monitorType) {
            case '03':
                monitorId = formData.modelId
                break
            case '0104':
                monitorId = formData.shipControlName
                break
            case '0101':
                monitorId = formData.carPersonName
                break;
            case '04':
                monitorId = formData.place
                break
            case '05':
                // 点位
                let deviceCodes = []
                if (formData.devices && pointList && pointList.length) {
                    for (let i = 0; i < pointList.length; i++) {
                        for (let j = 0; j < formData.devices.length; j++) {
                            if (formData.devices[j] === pointList[i].id) {
                                deviceCodes.push(pointList[i].deviceCode)
                            }
                        }
                    }
                }
                basicInfoJson.deviceCodes = deviceCodes
                break;
            case '06':
                // 黑名单
                basicInfoJson = formData.basicInfoJson
                break
            default:
                monitorId = undefined
                break
        }
        formData.monitorId = monitorId
        formData.basicInfoJson = basicInfoJson
        setBasicInfo && setBasicInfo((oldVal: any) => {
            return {
                ...oldVal,
                ...formData
            }
        })
        setStep && setStep('2')
    }
    return <article className={styles.wrapper}>
        {/* 基本信息 */}
        <div className={styles.left}>
            <Title title='基本信息' />
            <FormInterface
                inputs={inputs}
                options={options}
                form={form}
                formData={basicInfo}
            />
            <Space className={styles.btns}>
                <Button onClick={handleCancel}>取消</Button>
                <Button onClick={handleNext} type='primary'>下一步</Button>
            </Space>
        </div>
        {/* 预览 */}
        <div className={styles.right}>
            {/* 船舶布控: 0104
                人车布控: 0101
                重点场所: 04
                视频预警: 05
                黑名单预警: 06
                智慧建模: 03
            */}
            <Title title='预览' />
            {/* 模型预览 */}
            {currentFun === '03' && previewData && <PlanModelPreview modelId={previewData} />}
            {/* 视频预警预览 */}
            {currentFun === '05' && previewData && <PlanDevicesPreview ids={previewData} />}
            {/* 船舶布控预览 */}
            {currentFun === '0104' && previewData && <PlanShipPreview data={previewData} />}
            {/* 人车布控预览 */}
            {currentFun === '0101' && previewData && <PlanPersonCarPreview data={previewData} />}
            {/* 场所布控预览 */}
            {currentFun === '04' && previewData && <PlanPlacePreview placeId={previewData} />}
            {/* 黑名单预警预览 */}
            {currentFun === '06' && previewData && <BlackNamePreview data={previewData} />}

        </div>
    </article >
}

export default PlanBasic