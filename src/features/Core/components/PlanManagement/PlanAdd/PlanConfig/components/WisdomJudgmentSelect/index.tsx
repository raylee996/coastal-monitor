import { Button, Select } from "antd"
import WisdomJudgment from "features/Core/components/WisdomJudgment"
import popup from "hooks/basis/Popup"
import { useCallback, useEffect, useState } from "react"
import { getJudgmentListAsync } from "server/core/wisdomJudgment"
import styles from './index.module.sass'

interface Props {
    onChange?: (val: any) => void
    value?: any
}

// 智能研判选择
const WisdomJudgmentSelect: React.FC<Props> = ({
    onChange,
    value
}) => {
    const [options, setOptions] = useState<any[]>([])

    const getOptionsList = useCallback(
        async () => {
            let list = await getJudgmentListAsync({ pageNumber: 1, pageSize: -1 }, {})
            let res = list.data.map((item: any) => {
                return {
                    ...item,
                    value: item.id,
                    name: item.modelName,
                    label: item.modelName
                }
            })
            setOptions(res)

        },
        [],
    )

    useEffect(() => {
        getOptionsList()
    }, [getOptionsList])

    function handleChange(val: any) {
        onChange && onChange(val)
    }

    // 添加智能研判，关闭后刷新下拉列表
    function handleAdd() {
        popup(<WisdomJudgment />, {
            title: '智能研判', size: 'fullscreen', onCloseCallback: function () {
                getOptionsList()
            }
        })
    }

    return <article className={styles.wrapper}>
        <Select
            options={options}
            value={value}
            onChange={handleChange}
            placeholder="请选择研判模型"
        />
        <Button type="link" onClick={handleAdd}>添加</Button>
    </article>
}

export default WisdomJudgmentSelect