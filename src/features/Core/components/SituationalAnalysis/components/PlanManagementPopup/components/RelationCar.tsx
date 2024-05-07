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

const RelationCarCard: React.FC<TableCardProps<any>> = ({ index, data }) => {

    return (
        <article className={`${styles.cardWrapper} ${(index + 1) % 3 === 0 ? styles.delMarginLeft : ''}`}>
            <div className={styles.carImgBox}>
                <div className={styles.detailBox}>
                    <ImageSimple src={data.path} width={'100%'} height={'100%'} />
                </div>
                <div className={styles.largeImage}>
                    <ImageSimple src={data.path2} width={'100%'} height={'100%'} />
                </div>
            </div>
            <div className={styles.text}>{`车牌：${data.content || '--'}`}</div>
            <div className={styles.text} title={data.capAddress}>{`点位：${data.capAddress || '--'}`}</div>
            <div className={styles.text} title={data.capTime}>{`时间：${data.capTime}`}</div>
        </article>
    )
}

interface Props {
    deviceList?: any[]
}

const CarInputs: any[] = [
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
                businessFunctions: ['4'],
                deviceTypes: ['1']
            }
        },
    }],
    ['时间范围', 'datetime', InputType.dateTimeRange, {
        allowClear: false
    }],
]

const RelationCar: React.FC<Props> = ({ deviceList }) => {
    console.debug('RelationCar')

    const queryData = useMemo(() => {
        return deviceList?.length ? {
            pointJsonList: deviceList
        } : {}
    }, [deviceList])


    return <article className={styles.wrapper}>
        <TableInterface
            card={RelationCarCard}
            queryInputs={CarInputs}
            queryInit={queryInit}
            queryData={queryData}
            cardOptions={{ isFlex: true }}
            extraParams={{ codeType: 1 }}
            request={getAllSisdomSearchList}
        />
    </article>
}

export default RelationCar