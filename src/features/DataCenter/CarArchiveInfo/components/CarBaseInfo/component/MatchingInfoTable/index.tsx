import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useEffect, useState } from "react";
import { getShipListTable } from "server/ship";
import styles from "./index.module.sass";

interface IMatchingInfoTable {
    carId: any
    carItem?: any
    /**数据列 */
    columns: any
}
const MatchingInfoTable: React.FC<IMatchingInfoTable> = (props) => {
    console.debug('MatchingInfoTable')
    const { carId, carItem, columns } = props
    console.log(carId + carItem)

    const handleGetData = useCallback<any>(() => {
        async function main() {
            //   const vo: any = await getLabelTable({ type })
            //   setLabelData(vo.data)
        }
        main()
    }, [])

    const [tableColumns, setTableColumns] = useState([])

    useEffect(() => {
        setTableColumns(columns)
        handleGetData()  
    }, [carId,columns, handleGetData])

    return (
        <article className={styles.wrapper}>
            <TableInterface
                columns={tableColumns}
                request={getShipListTable}
            />
        </article>
    )
}

export default MatchingInfoTable