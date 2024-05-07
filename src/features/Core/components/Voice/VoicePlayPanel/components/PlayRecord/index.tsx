import { PaginationProps, Tooltip } from 'antd'
import { TableCardProps } from 'hooks/flexibility/CardPanel'
import TableInterface from 'hooks/integrity/TableInterface'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { itcJobListAsync } from 'server/device'
import styles from './index.module.sass'

const paginationProps: PaginationProps = {
    showQuickJumper: false,
    size: 'small'
}


const RecordCard: React.FC<TableCardProps<any>> = ({ data, onAction }) => {
    function handleGetData() {
        onAction && onAction('selectRecord', data)
    }
    return <div className={styles.recordItem}>
        <div className={styles.content}>
            <div>内容：<Tooltip title={data.content}> {data.content}</Tooltip></div>
            <div>音柱：<Tooltip title={data.deviceNames}> {data.deviceNames}</Tooltip></div>
            <div className={styles.bottomContent}>
                <div>时间：{data.createTime}</div>
                {!data.isMicroPhone && <div className={styles.quttoContent} onClick={handleGetData}>引用内容</div>}
            </div>
        </div>
        <div className={styles.bottomLineBg}></div>
    </div>
}


interface Props {
    getRecord?: (record: any) => void
    randomNum?: number
}
// 下发记录
const PlayRecord: React.FC<Props> = ({ getRecord, randomNum }) => {
    const [isNotRefreshTable, setIsNotRefreshTable] = useState<number>(1)
    const handleSelect = useCallback(
        (type: string, data: any) => {
            getRecord && getRecord(data)
        },
        [getRecord],
    )
    const cardOptions = useMemo(() => ({
        isFlex: true,
        onCardActions: handleSelect
    }), [handleSelect])

    useEffect(() => {
        if (randomNum) {
            setIsNotRefreshTable(-1)
            setTimeout(() => {
                setIsNotRefreshTable(randomNum)
            }, 1000)
        }
    }, [randomNum])


    return <article className={styles.wrapper}>
        {isNotRefreshTable > 0 && <TableInterface
            card={RecordCard}
            request={itcJobListAsync}
            paginationProps={paginationProps}
            cardOptions={cardOptions}
        />}
    </article>
}

export default PlayRecord