import { useCallback, useEffect, useMemo, useState } from "react"
import PlanBasic from "./PlanBasic"
import PlanConfig from "./PlanConfig"
import styles from './index.module.sass'
import { Tabs, TabsProps } from "antd"

interface Props {
    onClosePopup?: () => void
    // 预案数据，编辑赋值
    planData?: any
    // 预案id
    planId?: any
}
// 新增预案
const PlanAdd: React.FC<Props> = ({ onClosePopup, planData, planId }) => {
    console.debug('PlanAdd')

    // 当前页面步骤。
    const [step, setStep] = useState('1')
    const [basicInfo, setBasicInfo] = useState<any>()

    // 编辑赋值
    useEffect(() => {
        if (planData) {
            let data = JSON.parse(planData)
            setBasicInfo(data)
        }
    }, [planData])


    // 建模返回后显示空白。
    useEffect(() => {
        let ele: any = document.getElementsByClassName('graphContainer');

        if (ele.length && step === '1') {
            ele[0].style.height = '434px'
        } else if (ele.length > 1 && step === '2') {
            ele[1].style.height = '280px'
        }
    }, [step])



    const items = useMemo<TabsProps['items']>(() => [
        {
            key: '1',
            label: '预案基本信息',
            children: <PlanBasic
                planId={planId}
                onClosePopup={onClosePopup}
                setStep={setStep}
                setBasicInfo={setBasicInfo}
                basicInfo={basicInfo} />
        },
        {
            key: '2',
            label: '预案配置',
            children: <PlanConfig
                planId={planId}
                basicInfo={basicInfo}
                onClosePopup={onClosePopup}
                setStep={setStep} />,
        }
    ], [basicInfo, onClosePopup, planId])


    const renderTabBar = useCallback(
        () => <></>,
        [],
    )


    return (
        <article className={styles.wrapper}>
            <Tabs activeKey={step} items={items} renderTabBar={renderTabBar} />
        </article>
    )
}

export default PlanAdd