import ImageSimple from 'hooks/basis/ImageSimple'
import styles from './index.module.sass'
import { defaultImgPeople } from "helper/common";
import { useCallback, useEffect, useState } from 'react';
import { getPlaceDeploy } from 'server/place';
import Title from 'component/Title';
import XcEmpty from 'component/XcEmpty';

interface Props {
    placeId: string | number
}

const DetailPane: React.FC<Props> = ({ placeId }) => {
    console.debug('DetailPane')
    const [isAllShip, setIsAllShip] = useState(false)
    const [mmsiList, setMmsiList] = useState<string[]>([])
    const [shipNameList, setShipNameList] = useState<string[]>([])
    const [shipFaceList, setShipFaceList] = useState<any[]>([])
    const [focusList, setFocusList] = useState<any[]>([])
    const [faceList, setFaceList] = useState<any[]>([])
    const [carList, setCarList] = useState<string[]>([])

    const getData = useCallback(
        async () => {
            const vo = await getPlaceDeploy(placeId)
            if (vo) {
                if (vo.areaCtrlJson) {
                    const areaCtrlJson = vo.areaCtrlJson

                    if (areaCtrlJson.controlScope === '0') {
                        setIsAllShip(true)
                        setMmsiList([])
                        setShipNameList([])
                        setShipFaceList([])
                    } else {
                        setIsAllShip(false)
                        if (areaCtrlJson.alarmConditionShipMmsis) {
                            const _mmsiList = areaCtrlJson.alarmConditionShipMmsis.split(',')
                            setMmsiList(_mmsiList)
                        } else {
                            setMmsiList([])
                        }

                        if (areaCtrlJson.alarmConditionShipNames) {
                            const _shipNameList = areaCtrlJson.alarmConditionShipNames.split(',')
                            setShipNameList(_shipNameList)
                        } else {
                            setShipNameList([])
                        }

                        if (areaCtrlJson.alarmConditionShipFaceList) {
                            setShipFaceList(areaCtrlJson.alarmConditionShipFaceList)
                        } else {
                            setShipFaceList([])
                        }
                    }

                    if (areaCtrlJson.focusPersonList) {
                        setFocusList(areaCtrlJson.focusPersonList)
                    } else {
                        setFocusList([])
                    }

                    if (areaCtrlJson.faceDtoList) {
                        setFaceList(areaCtrlJson.faceDtoList)
                    } else {
                        setFaceList([])
                    }

                    if (areaCtrlJson.licensePlates) {
                        const _licensePlates = areaCtrlJson.licensePlates.split(',')
                        setCarList(_licensePlates)
                    } else {
                        setCarList([])
                    }
                }
            }
        },
        [placeId],
    )


    useEffect(() => {
        async function main() {
            await getData()
        }
        main()
    }, [getData])

    return <>
        <article className={styles.panel}>
            <header>
                <Title title='船舶布控' />
            </header>

            {isAllShip &&
                <section>任意船舶</section>
            }

            {mmsiList.length !== 0 &&
                <section>
                    <div className={styles.title}>MMSI:</div>
                    {mmsiList.map(item =>
                        <div className={styles.mmsiCard} key={item}>
                            <span>{item}</span>
                        </div>
                    )}
                </section>
            }

            {shipNameList.length !== 0 &&
                <section>
                    <div className={styles.title}>船名:</div>
                    {shipNameList.map(item =>
                        <div className={styles.mmsiCard} key={item}>
                            <span>{item}</span>
                        </div>
                    )}
                </section>
            }

            {shipFaceList.length !== 0 &&
                <section>
                    <div className={styles.title}>船脸:</div>
                    {shipFaceList.map(item =>
                        <div className={styles.shipImg} key={item.id}>
                            <ImageSimple src={item.url} width={100} height={100} />
                        </div>
                    )}
                </section>
            }
            {
                (!isAllShip && mmsiList.length === 0 && shipNameList.length === 0 && shipFaceList.length === 0) && <XcEmpty />
            }
        </article>

        <article className={styles.panel}>
            <header>
                <Title title='重点人员布控' />
            </header>
            {focusList.length !== 0 ?
                <section>
                    {focusList.map(item =>
                        <div className={styles.focusCard} key={item.id}>
                            <ImageSimple src={item.url} width={100} height={100} defaultSrc={defaultImgPeople} />
                            <div className={styles.focusName}>{item.name}</div>
                        </div>
                    )}
                </section> : <XcEmpty />
            }
        </article>

        <article className={styles.panel}>
            <header>
                <Title title='人脸布控' />
            </header>
            {faceList.length !== 0 ?
                <section>
                    {faceList.map(item =>
                        <div className={styles.focusCard} key={item.url}>
                            <ImageSimple src={item.url} width={100} height={100} />
                        </div>
                    )}
                </section> : <XcEmpty />
            }
        </article>

        <article className={styles.panel}>
            <header>
                <Title title='车辆布控' />
            </header>
            {carList.length !== 0 ?
                <section>
                    {carList.map(item =>
                        <div className={styles.mmsiCard} key={item}>
                            <span>{item}</span>
                        </div>
                    )}
                </section> : <XcEmpty />
            }
        </article>
    </>
}

export default DetailPane