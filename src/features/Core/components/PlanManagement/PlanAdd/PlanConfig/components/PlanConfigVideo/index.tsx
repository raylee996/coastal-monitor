import Title from "component/Title"
import { getIconByDeviceType } from "helper/mapIcon"
import { useEffect, useState } from "react"
import { planGetPointListAsync } from "server/core/planManagement"
import styles from './index.module.sass'

interface Props {
    basicInfo: any
    map2D: any
}
// 视频预警
const PlanConfigVideo: React.FC<Props> = ({
    basicInfo,
    map2D
}) => {
    const [deviceList, setDeviceList] = useState<any>([])

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
            if (deviceList && deviceList.length && basicInfo.devices) {
                for (let i = 0; i < deviceList.length; i++) {
                    for (let j = 0; j < basicInfo.devices.length; j++) {
                        if (deviceList[i].id === basicInfo.devices[j] && deviceList[i].longitude && deviceList[i].latitude) {
                            needRenderDevice.push(deviceList[i])
                        }
                    }
                }
            }
            setDeviceList(needRenderDevice)
        }
        main()
    }, [basicInfo])

    return <article className={styles.wrapper}>
        <Title title="视频点位" />
        {deviceList.length && deviceList.map((item: any) => {
            return <p key={item.id} className={styles.itemName}>{item.name}</p>
        })}
    </article>
}

export default PlanConfigVideo