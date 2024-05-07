import { Select } from "antd"
import { useMemo } from "react"

interface Iprops{
    handleChange?: Function
}

const SeizeTimeSelect: React.FC<Iprops> = ({handleChange}) => {
    const Opt = useMemo(() => {
        return [
            { value: 1800, label: '30分钟' },
            { value: 3600, label: '1小时' },
            { value: 7200, label: '2小时' }
        ]
    }, [])

    function handleSelectChange(val:any){
        handleChange && handleChange(val)
    }

    return <div style={{ fontSize: '14px' }}>
        <Select
            defaultValue={1800}
            style={{ width: 100 }}
            size={'small'}
            onChange = {handleSelectChange}
            options={Opt}
        />
    </div>
}

export default SeizeTimeSelect