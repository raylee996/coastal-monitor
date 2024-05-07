import { Select } from "antd"
import { useCallback, useEffect, useState } from "react"
import { planGetBlackTable } from "server/core/planManagement"
import { getDictDataByType } from "server/system"
import styles from './index.module.sass'

interface Props {
    onChange?: (data: any) => void
    value?: any
}

// 黑名单输入
const BlackNameInput: React.FC<Props> = ({ onChange, value }) => {
    console.debug('BlackNameInput')
    const [type, setType] = useState<any>(undefined)
    const [typeList, setTypeList] = useState<any>([])
    const [selectedBlackList, setSelectedBlackList] = useState<any>(undefined)
    const [blacklist, setBlacklist] = useState([])

    // 获取数据类型列表
    useEffect(() => {
        async function main() {
            let type = await getDictDataByType("black_data_type")
            let list = type.map((item: any) => {
                return {
                    ...item,
                    label: item.name,
                    value: item.value
                }
            })
            list = [{ label: '全部', value: '' }, ...list]
            setTypeList(list)
        }
        main()
    }, [])

    // 获取黑名单列表
    const getBlackList = useCallback(
        async (dataType?: any) => {
            let vo: any = await planGetBlackTable({ dataType, picFlag: true })
            if (vo) {
                let list = vo.map((item: any) => {
                    return {
                        ...item,
                        label: item.name,
                        value: item.id
                    }
                })
                list.splice(0, 0, { label: '全部', value: '' })
                setBlacklist(list)
            }
        },
        [],
    )

    useEffect(() => {
        getBlackList()
    }, [getBlackList])


    useEffect(() => {
        if (value) {
            if (value.dataType === undefined) {
                setType(undefined)
            } else {
                setType(value.dataType)
            }
            if (value.codeValue === undefined) {
                setSelectedBlackList(undefined)
            } else {
                setSelectedBlackList(value.codeValue)
            }
        }
    }, [value])

    function handleChangeType(e: any) {
        setType(e)
        getBlackList(e)
        setSelectedBlackList([''])
        onChange && onChange({
            dataType: e,
            codeValue: ['']
        })
    }

    function handleChangeBlackList(e: any) {
        setSelectedBlackList(e)
        onChange && onChange({
            dataType: type,
            codeValue: e
        })
    }

    return <div className={styles.wrapper}>
        <Select
            style={{ width: '120px' }}
            placeholder='请选择'
            value={type}
            options={typeList}
            onChange={handleChangeType}
        />
        <Select
            placeholder='请选择'
            mode='tags'
            maxTagCount={1}
            maxTagTextLength={6}
            allowClear
            value={selectedBlackList}
            options={blacklist}
            onChange={handleChangeBlackList}
        />
    </div>
}

export default BlackNameInput