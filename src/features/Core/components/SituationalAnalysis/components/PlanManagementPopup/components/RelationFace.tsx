import AreaPointDrawFrom from "component/AreaPointDrawFrom"
import dayjs from "dayjs";
import ImageSimple from "hooks/basis/ImageSimple";
import { TableCardProps } from "hooks/flexibility/CardPanel";
import { InputType } from "hooks/flexibility/FormPanel"
import TableInterface from "hooks/integrity/TableInterface"
import { useMemo } from "react";
import { getAllSisdomSearchList } from "server/core/wisdomSearch";
import styles from "./index.module.sass";

const queryInit = { datetime: [dayjs().subtract(1, 'day'), dayjs()] }

const RelationFaceCard: React.FC<TableCardProps<any>> = ({ index, data }) => {

    return (
        <article className={`${styles.cardWrapper} ${(index + 1) % 3 === 0 ? styles.delMarginLeft : ''}`}>
            <div className={styles.imgBox}>
                <div className={styles.detailBox}>
                    <ImageSimple width={'100%'} height={'100%'} src={data?.path} rootClassName='img-preview-face' />
                </div>
                <div className={styles.largeImage}>
                    <ImageSimple width={'100%'} height={'100%'} src={data?.path2} />
                </div>
            </div>
            <div className={styles.text} title={data.capAddress}>{`点位：${data.capAddress}`}</div>
            <div className={styles.text} title={data.capTime}>{`时间：${data.capTime}`}</div>
        </article>
    )
}

interface Props {
    deviceList?: any[]
}

const FaceInputs: any[] = [
    ['点位', 'pointJsonList', InputType.component, {
        component: AreaPointDrawFrom,
        inputProps: {
            size: 'middle',
            maxTagCount: 1,
            style: { width: '180px' }
        },
        pointProps: {
            isPoint: true,
            params: {
                businessFunctions: ['3'],
                deviceTypes: ['1']
            }
        },
    }],
    ['时间范围', 'datetime', InputType.dateTimeRange, {
        allowClear: false
    }],
]

const RelationFace: React.FC<Props> = ({ deviceList }) => {
    console.debug('RelationFace')

    const queryData = useMemo(() => {
        return deviceList?.length ? {
            pointJsonList: deviceList
        } : {}
    }, [deviceList])

    return <article className={styles.wrapper}>
        <TableInterface
            card={RelationFaceCard}
            queryInputs={FaceInputs}
            queryInit={queryInit}
            queryData={queryData}
            cardOptions={{ isFlex: true }}
            extraParams={{ codeType: 0 }}
            request={getAllSisdomSearchList}
        />
    </article>
}

export default RelationFace