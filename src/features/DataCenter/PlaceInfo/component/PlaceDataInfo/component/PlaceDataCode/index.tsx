
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { getShipListTable } from "server/ship";
import styles from "./index.module.sass";

interface IPlaceDataCode {
    placeId: any
}
const PlaceDataCode: React.FC<IPlaceDataCode> = (props) => {
    console.debug('PlaceDataCode')
    const { placeId } = props
    console.log(placeId)
    const tableRef = useRef<any>(null)

    const columns = [
        ['序号', 'caseNo'],
        ['MMSI', 'imsi'],
        ['MAC', 'mac'],
        ['IMEI', 'imei'],
        ['手机号', 'phone'],
        ['点位', 'site'],
        ['地址', 'address'],
        ['时间', 'time'],
    ]

    const queryInputs = [
        [
            '点位',
            'site',
            InputType.component,
            {
                component: null,

            }
        ],
        ['手机',
            'searchValue',
            {
                placeholder: '请输入IMSI/MAC/IMEI/手机号',
                allowClear: true
            }
        ],
        ['时间', 'datetime', InputType.dateTimeRange],
    ]

    return (
        <article className={styles.wapper}>
            <TableInterface
                ref={tableRef}
                queryInputs={queryInputs}
                columns={columns}
                request={getShipListTable}
            />
        </article>
    )
}

export default PlaceDataCode
