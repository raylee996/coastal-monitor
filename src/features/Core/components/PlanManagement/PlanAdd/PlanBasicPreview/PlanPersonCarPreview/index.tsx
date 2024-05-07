import { Col, Row } from 'antd';
import Title from 'component/Title';
import { CtrlWarnDict, getDictName } from 'helper/dictionary';
import Map2D, { MapTileType } from 'helper/Map2D';
import { getIconByDeviceType } from 'helper/mapIcon';
import ImageSimple from 'hooks/basis/ImageSimple';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAreaDataById, getControlData } from 'server/core/controlManage';
import { getDeviceByCodes } from 'server/device';
import styles from './index.module.sass'

interface Props {
    data: any
}

// 人车布控预览
const PlanPersonCarPreview: React.FC<Props> = ({ data }) => {
    console.debug('PlanPersonCarPreview')
    const mapRef = useRef<HTMLDivElement>(null)
    const [map2D, setMap2D] = useState<Map2D>();
    const [areaList, setAreaList] = useState<any[]>()
    const [deviceList, setDeviceList] = useState<any[]>()

    const [faceList, setFaceList] = useState<any[]>()
    const [personList, setPersonList] = useState<any[]>()
    const [idCardListText, setIdCardListText] = useState('')
    const [licensePlatesText, setLicensePlatesText] = useState('')
    const [personAlarmText, setPersonAlarmText] = useState('')
    const [carAlarmText, setCarAlarmText] = useState('')
    const personNameText = useMemo(() => personList ? personList.map(item => item.name).toString() : '', [personList])

    const [flag, setFlag] = useState(false)


    // 初始化地图实例
    useEffect(() => {
        let _map2d: Map2D
        if (mapRef.current) {
            _map2d = new Map2D(mapRef.current, MapTileType.satellite)
            setMap2D(_map2d)
        }
        return () => {
            _map2d && _map2d.remove()
        }
    }, [])

    // 请求布控区域数据
    useEffect(() => {
        async function main() {
            if (data.areaId) {
                const vo = await getAreaDataById(data.areaId)
                if (vo?.graph) {
                    const graph = JSON.parse(vo.graph)
                    setAreaList([graph])
                }
                if (vo?.deviceCodes) {
                    const _deviceList = await getDeviceByCodes(vo.deviceCodes)
                    setDeviceList(_deviceList)
                }
            }
        }
        main()
    }, [data])

    useEffect(() => {
        const layers: any[] = []
        if (map2D && areaList) {
            areaList.forEach(item => {
                if (!item.properties.background) {
                    item.properties.background = "#3388ff"
                }
                if (!item.properties.borderColor) {
                    item.properties.borderColor = "#3388ff"
                }

                if (item.properties?.subType === 'Circle') {
                    let circle = new L.Circle([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
                        radius: item.properties.radius,
                        color: item.properties.borderColor, //颜色
                        fillColor: item.properties.background,
                        fillOpacity: 0.4, //透明度
                    });
                    circle.addTo(map2D.map);
                    map2D.map.panTo(circle.getBounds().getCenter())
                    layers.push(circle)
                } else {
                    const areaLayer = L.geoJson(item).addTo(map2D.map)
                    map2D.map.panTo(areaLayer.getBounds().getCenter())
                    //边框、背景颜色回显
                    areaLayer.setStyle({
                        color: item.properties.borderColor,
                        fillColor: item.properties.background,
                        fillOpacity: 0.4
                    })
                    layers.push(areaLayer)
                }
            })
        }
        return () => {
            layers.forEach(item => item.remove())
        }
    }, [map2D, areaList])

    useEffect(() => {
        let layerGroup: any
        if (map2D && deviceList) {
            layerGroup = L.layerGroup()
            deviceList.forEach(item => {
                const deviceType = String(item.deviceType)
                const icon = getIconByDeviceType(deviceType)
                const latLng = {
                    lat: item.latitude,
                    lng: item.longitude
                }
                const marker = L.marker(latLng, {
                    icon,
                    deviceCode: item.deviceCode
                })
                marker.bindTooltip(item.name, {
                    className: 'leaflet-tooltip-ui',
                    direction: 'top',
                    offset: L.point(0, -32)
                })
                layerGroup.addLayer(marker)
            })
            layerGroup.addTo(map2D.map)
        }
        return () => {
            layerGroup?.clearLayers()
        }
    }, [map2D, deviceList])

    // 初始化数据
    useEffect(() => {
        let ctr: AbortController
        async function main() {
            ctr = new AbortController()
            setFlag(false)
            setFaceList([])
            setPersonList([])
            setIdCardListText('')
            setPersonAlarmText('')
            setCarAlarmText('')
            setLicensePlatesText('')
            const vo = await getControlData(data.id, ctr)
            setFlag(true)
            if (vo.personCtrlJson?.personConditionDto?.faceDtoList) {
                setFaceList(vo.personCtrlJson.personConditionDto.faceDtoList)
            }
            if (vo.personCtrlJson?.personConditionDto?.idCardList) {
                const ids = vo.personCtrlJson.personConditionDto.idCardList.map((item: any) => item.idCard)
                const idsText = ids.toString()
                setIdCardListText(idsText)
            }
            if (vo.personCtrlJson?.personConditionDto?.focusPersonList) {
                setPersonList(vo.personCtrlJson.personConditionDto.focusPersonList)
            }
            if (vo.personCtrlJson?.carConditionDto?.licensePlates) {
                setLicensePlatesText(vo.personCtrlJson.carConditionDto.licensePlates)
            }
            if (vo.personCtrlJson?.personConditionDto?.controlScope === '0') {
                const text = getDictName(CtrlWarnDict, Number(vo.personCtrlJson?.personConditionDto?.alarmCondition))
                setPersonAlarmText(text)
            }
            if (vo.personCtrlJson?.carConditionDto?.controlScope === '0') {
                const text = getDictName(CtrlWarnDict, Number(vo.personCtrlJson?.carConditionDto?.alarmCondition))
                setCarAlarmText(text)
            }
        }
        main()
        return () => {
            ctr?.abort()
            setFlag(false)
            setFaceList([])
            setPersonList([])
            setIdCardListText('')
            setPersonAlarmText('')
            setCarAlarmText('')
            setLicensePlatesText('')
        }
    }, [data])

    function checkRow(index: number) {
        const booleanArray = [faceList, idCardListText, personNameText, licensePlatesText, personAlarmText]
        const add = booleanArray.filter((v, i) => i < index).map(Boolean).map(Number).reduce((n, m) => n + m)
        return add % 2 === 0 ? styles.contentRow : styles.InterlacedRow
    }


    return <article className={styles.wrapper}>
        <div ref={mapRef} className={styles.drawMap}></div>
        {flag && <div className={styles.box}>
            <div className={styles.content}>
                <Title title={'布控内容'} />
                <Row className={styles.labelRow}>
                    <Col span={4}>布控类型</Col>
                    <Col span={4}>内容类型</Col>
                    <Col span={16}>布控内容</Col>
                </Row>
                {faceList && faceList.length > 0 &&
                    < Row className={styles.contentRow}>
                        <Col className={styles.text} span={4}>人员布控</Col>
                        <Col className={styles.text} span={4}>人脸</Col>
                        <Col className={styles.textContent} span={16}>
                            {faceList.map(item =>
                                <ImageSimple className={styles.face} key={item.faceId} src={item.url} />
                            )}
                        </Col>
                    </Row>
                }
                {idCardListText &&
                    <Row className={checkRow(1)}>
                        <Col className={styles.text} span={4}>人员布控</Col>
                        <Col className={styles.text} span={4}>证件</Col>
                        <Col className={styles.textContent} span={16}>{idCardListText}</Col>
                    </Row>
                }
                {personNameText &&
                    <Row className={checkRow(2)}>
                        <Col className={styles.text} span={4}>人员布控</Col>
                        <Col className={styles.text} span={4}>档案</Col>
                        <Col className={styles.textContent} span={16}>{personNameText}</Col>
                    </Row>
                }
                {licensePlatesText &&
                    <Row className={checkRow(3)}>
                        <Col className={styles.text} span={4}>车辆布控</Col>
                        <Col className={styles.text} span={4}>车牌</Col>
                        <Col className={styles.textContent} span={16}>{licensePlatesText}</Col>
                    </Row>
                }
                {personAlarmText &&
                    <Row className={checkRow(4)}>
                        <Col className={styles.text} span={4}>人员布控</Col>
                        <Col className={styles.text} span={4}>所有人员</Col>
                        <Col className={styles.textContent} span={16}>预警条件：{personAlarmText}</Col>
                    </Row>
                }
                {carAlarmText &&
                    <Row className={checkRow(5)}>
                        <Col className={styles.text} span={4}>车辆布控</Col>
                        <Col className={styles.text} span={4}>所有车辆</Col>
                        <Col className={styles.textContent} span={16}>预警条件：{carAlarmText}</Col>
                    </Row>
                }
            </div>
        </div>
        }
    </article >
}

export default PlanPersonCarPreview