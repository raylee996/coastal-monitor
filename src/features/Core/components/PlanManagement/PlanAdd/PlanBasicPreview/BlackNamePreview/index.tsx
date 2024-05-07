import ImageSimple from "hooks/basis/ImageSimple"
import { useCallback, useEffect, useState } from "react"
import { planGetBlackTable } from "server/core/planManagement"
import styles from './index.module.sass'
import shipDefSrc from 'images/default/ship.png'
import { defaultImgCar } from "helper/common";
import { Button } from "antd"
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo"
import popup from "hooks/basis/Popup"
import CarArchiveInfo from "features/DataCenter/CarArchiveInfo"

interface DataPros {
    dataType?: string
    codeValue?: any //为空时，选择全部
}
interface Props {
    data: DataPros
}
// 黑名单预览
const BlackNamePreview: React.FC<Props> = ({ data }) => {
    console.debug('BlackNamePreview')
    const [blacklist, setBlacklist] = useState<any>([])

    // 获取黑名单列表
    const getBlackList = useCallback(
        async () => {
            let vo: any = await planGetBlackTable({ dataType: data.dataType ? data.dataType : '', picFlag: true })
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
        if (item.dataType === '6') {
            popup(<ShipArchiveInfo dataType={1} mmsi={item.content} />, { title: '查看船舶档案', size: "fullscreen" })
        } else if (item.dataType === '1') {
            popup(<CarArchiveInfo carPlate={item.content} />, { title: '车辆档案', size: 'fullscreen' })
        }
    }

    return <div className={styles.wrapper}>
        <ul>
            {blacklist && blacklist.map((item: any) => {
                return <li key={item.id} className={styles.card}>
                    {item.dataType === '6' && <ImageSimple src={item.picUrl} width='100%' height='80px' defaultSrc={shipDefSrc} />}
                    {item.dataType === '1' && <ImageSimple src={item.picUrl} width='100%' height='80px' defaultSrc={defaultImgCar} />}
                    <span className={styles.name} title={item.name}>{item.shipName ? item.shipName : item.name}</span>
                    <Button type="link" onClick={() => handlOpenArchive(item)}>查看档案</Button>
                </li>
            })}
        </ul>

    </div>
}

export default BlackNamePreview