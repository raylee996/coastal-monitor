import SelectPointMap from "component/SelectPointMap";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { doGetFaceList } from "server/personnel";
import PersonGallery from "./components/PersonGallery";
import styles from "./index.module.sass";

interface IFaceData {
    id: any
}

const FaceData: React.FC<IFaceData> = (props) => {
    const { id } = props
    
    const queryInputs = [
        [
            '时间',
            'searchTime',
            InputType.dateTimeRange, {
            }
        ],
        [
            '点位',
            'deviceCode',
            InputType.component,
            {
                component: SelectPointMap,
                businessFunctions: [3],
                deviceTypes: ['1']
            }
        ],
    ]

    // function handleFinish(params: any) {
    //     console.log(params)
    // }

    return (
        <article className={styles.wapper}>
            <div className={styles.condition}>

            </div>

            <div className={styles.table}>
                {/* 列表区 */}
                <TableInterface
                    card={PersonGallery}
                    extraParams={{
                        archiveId: id
                    }}
                    request={doGetFaceList}
                    queryInputs={queryInputs}
                    cardOptions={{
                        // onSelected: handlerSelectPeople,
                        // onCardActions: handlerActionPeople,
                        // isRadio: false,
                    }}
                    paginationProps={{
                        pageSize: 20,
                        showQuickJumper: true,
                        showSizeChanger: true,
                    }}
                />

            </div>



        </article>
    )
}

export default FaceData
