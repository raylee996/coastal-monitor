import { Card } from 'antd'
import React from 'react'
import { useEffect, useState } from 'react'
import { doGetStatisticsCaseNumStats } from 'server/statistics'
import styles from './index.module.sass'

interface ICommonData {
    title?: string,
    type?: number
}

const CommonData: React.FC<ICommonData> = (props) => {
    const { title, type } = props
    console.log(type)
    const [caseData, setCaseData] = useState<any>([
        { keyName: "近半年", count: 0 },
        { keyName: "近一月", count: 0 },
        { keyName: "近半年", count: 0 },
        { keyName: "近一年", count: 0 },
    ])

    useEffect(() => {
        async function main() {
            const vo = await doGetStatisticsCaseNumStats({})
            setCaseData(vo)
        }
        main()
        return () => { }
    }, [])




    return (
        <article className={styles.wrapper}>
            <Card title={title} style={{ width: '100%' }}>
                <div className={styles.contents}>
                    {
                        caseData.map((element: any, index: number) => {
                            return (
                                <div key={'controlData_' + index} className={styles.imgs}>
                                    <p className={styles.nums}>{element.count}</p>
                                    <p className={styles.labels}>{element.keyName}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </Card>
            {/* <React.Fragment key={'case_data_' + index}>
                                    <p className={styles.label}>{element.keyName}: <span className={styles.count}>{element.count}</span></p>
                                </React.Fragment> */}
        </article>
    )
}

export default CommonData