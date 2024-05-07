import {  ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { getUserTable } from "server/user";
import styles from "./index.module.sass";
import {InputType} from "hooks/flexibility/FormPanel";
import EchartsData from './EchartData'
const columns = [
    ['序号', 'id'],
    ['预警模块', 'module'],
    ['预警时间', 'time'],
    ['预警内容', 'content'],
    ['风险等级', 'level'],
    ['预警名称', 'name'],
    ['预警类型', 'name'],
    ['数据类型', 'devcie'],
    ['预警点位', 'addr'],
    ['图片', 'src', ColType.image],
    ['视频', 'video', ColType.image]
]

const queryInputs = [
    ['预警时间', 'datetime',InputType.dateTimeRange],
    ['风险等级', 'level',InputType.select,{dict:[]}],
    ['数据类型', 'warn',InputType.select,{dict:[]}]
]


const Warndata: React.FC = () => {
    console.debug('Warndata')

    return (
        <article >
            <EchartsData/>
            <TableInterface
                columns={columns}
                queryInputs={queryInputs}
                request={getUserTable}
            />
        </article>
    )
}

export default Warndata
