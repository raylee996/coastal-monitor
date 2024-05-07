import { Select } from "antd"
import { useMemo } from "react"

interface Iprops {
    handleChange?: Function
    isDisableSelect?: boolean
    value?: number
}

const TimeCount: React.FC<Iprops> = ({ handleChange, isDisableSelect, value }) => {
    const Opt = useMemo(() => {
        return [
            { value: 30, label: '30秒' },
            { value: 60, label: '1分钟' },
            { value: 600, label: '10分钟' },
            { value: 3600, label: '1小时' },
        ]
    }, [])

    function handleSelectChange(val: any) {
        handleChange && handleChange(val)
    }

    return <div style={{ fontSize: '14px' }}>
        跟踪倒计时：
        <Select
            value={value ? value : 30}
            style={{ width: 120 }}
            size={'small'}
            onChange={handleSelectChange}
            options={Opt}
            disabled={isDisableSelect}
            getPopupContainer={triggerNode => triggerNode.parentElement}
        />
    </div>
}

export default TimeCount