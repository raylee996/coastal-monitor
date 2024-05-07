import { Card, DatePicker } from 'antd'
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import XcEcharts from "../../../../../../hooks/flexibility/EchartPanel";
import XcEmpty from '../../../../../../component/XcEmpty'
interface props {
    title?: string
    url?: string
    request?: any
    extraParams?: any
}

const { RangePicker } = DatePicker;

const WarnTotalComponent: React.FC<props> = (props) => {
    console.debug('WarnTotal')

    const { request, title, extraParams } = props
    const [isShowOption,setIsShowOption] = useState(false)

    // 布控数量趋势-时间
    const [controlTime, setControlTime] = useState<any>([dayjs().subtract(7, 'day'), dayjs().subtract(0, 'day')])
    const [echartsOption, setEchartsOption] = useState<any>({})
    useEffect(() => {
        async function main() {
            if (request) {
                let extraP = extraParams ? { ...extraParams } : {}
                const vo = await request({ ...extraP, time: controlTime })
                setIsShowOption(vo.data.length?true:false)
                setEchartsOption(vo.options)
            }

        }
        main()
    }, [request, controlTime, extraParams])


    function handleControlTime(value?: any) {
        // 时间选择
        setControlTime(value)
    }
    return (
        <article >
            <Card title={title} extra={<RangePicker value={controlTime} onChange={handleControlTime}  getPopupContainer={triggerNode=>triggerNode} />}>
                <div style={{ height: '300px' }}>
                    {isShowOption?<XcEcharts option={echartsOption} />:<XcEmpty/>}
                </div>
            </Card>
        </article>
    )
}

export default WarnTotalComponent