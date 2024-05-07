import Map2D, { MapTileType } from "helper/Map2D";
import { useEffect, useRef, useState } from "react";
import styles from './index.module.sass'
import { planGetPointListAsync } from 'server/core/planManagement'
import { getIconByDeviceType } from "helper/mapIcon";

interface Props {
    ids: any
}
// 点位预览
const PlanDevicesPreview: React.FC<Props> = ({ ids }) => {
    console.debug('PlanDevicesPreview')
    const mapRef = useRef<HTMLDivElement>(null)
    const [map2D, setMap2D] = useState<Map2D>();
    const [deviceList, setDeviceList] = useState<any>([])
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

    useEffect(() => {
        let layerGroup: any
        if (map2D && deviceList && deviceList.length) {
            layerGroup = L.layerGroup()
            deviceList.forEach((item: any) => {
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
            let latlngArr = deviceList.map((item: any) => [item.latitude, item.longitude])
            layerGroup.addTo(map2D.map)
            layerGroup && map2D.map.fitBounds(latlngArr, { maxZoom: 13 })
        }
        return () => {
            layerGroup?.clearLayers()
        }
    }, [map2D, deviceList])

    // 获取需要渲染的设备信息。
    useEffect(() => {
        async function main() {
            let deviceList: any = await planGetPointListAsync()
            let needRenderDevice = []
            if (deviceList && deviceList.length && ids) {
                for (let i = 0; i < deviceList.length; i++) {
                    for (let j = 0; j < ids.length; j++) {
                        if (deviceList[i].id === ids[j] && deviceList[i].longitude && deviceList[i].latitude) {
                            needRenderDevice.push(deviceList[i])
                        }
                    }
                }
            }
            setDeviceList(needRenderDevice)
        }
        main()
    }, [ids])


    return <article className={styles.wrapper}>
        <div ref={mapRef} className={styles.drawMap}></div>
    </article>
}

export default PlanDevicesPreview
