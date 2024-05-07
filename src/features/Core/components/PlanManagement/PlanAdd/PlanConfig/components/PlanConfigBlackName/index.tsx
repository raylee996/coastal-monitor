import { Button } from 'antd'
import styles from './index.module.sass'
import shipDefSrc from 'images/default/ship.png'
import ImageSimple from 'hooks/basis/ImageSimple'
import { useCallback, useEffect, useState } from 'react'
import { planGetBlackTable } from 'server/core/planManagement'
import Title from 'component/Title'
interface Props {
    basicInfo: any
}
// 黑名单配置
const PlanConfigBlackName: React.FC<Props> = ({ basicInfo }) => {

    let data = basicInfo.basicInfoJson

    const [blacklist, setBlacklist] = useState<any>([])

    // 获取黑名单列表
    const getBlackList = useCallback(
        async () => {
            let vo: any = await planGetBlackTable({ dataType: data.dataType ? data.dataType : '' })
            if (vo) {
                let list = vo.map((item: any) => {
                    return {
                        ...item,
                        label: item.name,
                        value: item.id
                    }
                })
                let arr = []
                // 全选
                if (data.codeValue && data.codeValue.includes('')) {
                    setBlacklist(list)
                } else {
                    for (let i = 0; i < list.length; i++) {
                        for (let j = 0; j < data.codeValue?.length; j++) {
                            if (list[i].value === data.codeValue[j]) {
                                arr.push(list[i])
                            }
                        }
                    }
                    setBlacklist(arr)
                }
            }
        },
        [data],
    )

    useEffect(() => {
        getBlackList()
    }, [getBlackList])

    // 查看档案
    function handlOpenArchive(item: any) {

    }

    return <div className={styles.wrapper}>
        <Title title='黑名单' />
        <ul>
            {blacklist && blacklist.map((item: any) => {
                return <li key={item.id} className={styles.card}>
                    <ImageSimple src={''} width='100%' height='80px' defaultSrc={shipDefSrc} />
                    <span className={styles.name} title={item.name}>{item.name}</span>
                    <Button type="link" onClick={() => handlOpenArchive(item)}>查看档案</Button>
                </li>
            })}
        </ul>
    </div>
}

export default PlanConfigBlackName