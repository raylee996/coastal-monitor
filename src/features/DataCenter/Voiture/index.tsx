import {  ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { getUserTable } from "server/user";
import styles from "./index.module.sass";
import {InputType} from "hooks/flexibility/FormPanel";
const columns = [
    // ['序号', 'id'],
    ['预警时间', 'time'],
    ['预警内容', 'content'],
    ['布控名称', 'level'],
    ['预警类型', 'name'],
    ['预警设备', 'devcie'],
    ['预警地址', 'addr'],
    ['经纬度', 'addr'],
    ['图片', 'src', ColType.image],
    ['视频', 'video', ColType.image]
]

const queryInputs = [
    ['预警内容', 'content'],
    ['预警时间', 'datetime',InputType.dateTimeRange]
]


const Warndata: React.FC = () => {
    console.debug('Warndata')

    return (
        <article >
            <TableInterface
                columns={columns}
                queryInputs={queryInputs}
                request={getUserTable}
            />
        </article>
    )
}

export default Warndata
