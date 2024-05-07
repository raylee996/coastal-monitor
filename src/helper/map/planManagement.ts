import Map2D from "helper/Map2D";
import ship_icon from "images/ship/altImg/YC30.png"
import ship_position from "images/core/planManagement/shipPosition.png"
import ship_top_position from "images/core/planManagement/shipTop.png"
import ship_history from "images/core/planManagement/shipHistory.png"
import createElementByComponent from "helper/elementComponent";
import { getAreaTwo } from "server/core/controlManage";
import { createDrawAreaPolyline, createYawPolyline } from "./common";

// 船舶与定位图标
const shipConfigList = [
    { icon: ship_position, iconSize: [65, 65] },
    { icon: ship_icon, iconSize: [15, 57] },
    { icon: ship_top_position, iconSize: [24, 42], iconAnchor: [12, 42] },
]


// 预警目标自动研判效果演示
export async function createPlanManagementMap(
    shipLatLng: number[],
    destinationList: {
        latLng: number[],
        cameraScope: number,
        typeId: string[]
    }[],
    planDestinationHtml: any,
    bindPopupHtmlComponent: any,
    shipMsgContent: any,
    warbMsgContent?: any,
    // 区域或图形id
    areaId?: string,
    map2d?: Map2D,
    historyLatLngList?: [number, number][],
) {
    if (!map2d) return

    // 绘制动态船舶和目标 以及移动路径
    const movingShipLayer = shipConfigList.map((item) => {
        const movingShip = L.Marker.movingMarker([...historyLatLngList || [], shipLatLng], 10000, {
            autostart: true,
            // loop: true
        })
        movingShip.setIcon(L.icon({
            iconUrl: item.icon,
            iconSize: item.iconSize,
            iconAnchor: item.iconAnchor
        }))
        return movingShip
    })

    // 被预警船信息
    const shipMsgMarker = map2d.createInfoMarker({
        latLng: shipLatLng,
        // content: <WarnMapInfo text={'粤蛇渔运8888'} textColor={'#fff'} isNotOpenWindow={true} />
        content: shipMsgContent
    })
    // 预警信息
    const warnMsgMarker = warbMsgContent ? [map2d.createInfoMarker({
        latLng: shipLatLng,
        // content: <WarnMapInfo text={'超速'} textColor={'#fff'} themeColor={'#ffa940'} customIcon={<span className={`iconfont icon-lingdang ${styles.icon}`} style={{ color: '#ffa940' }}></span>} isNotOpenWindow={true} />,
        content: warbMsgContent,
        position: 'bottomRight',
        lineColor: '#ffa940'
    })] : []

    // 绘制船舶与目的地之间的连接虚线
    const lineLayer = destinationList.map((item: any) => {
        return L.polyline([item.latLng, shipLatLng], { color: '#ffa940', weight: 1, dashArray: '2,4' })
    })

    // 绘制船舶走过的历史点和路线
    const historyMarkerLayer = historyLatLngList?.filter((item, index) => index).map((item) => {
        return L.marker(item, {
            icon: L.icon({
                iconUrl: ship_history,
                iconSize: [30, 30]
            })
        })
    })
    const historyLineLayer = historyLatLngList ? [L.polyline([...historyLatLngList, shipLatLng], { color: '#ff4d4f', weight: 1 })] : []

    // 绘制图形
    const res = areaId ? await getAreaTwo({ id: areaId }) : null
    let areaLayerList: any
    if (res?.graph) {
        if (res.graph.type === '5') {
            // 航道相关的绘制
            areaLayerList = createYawPolyline(map2d, res.graph)
        } else {
            areaLayerList = createDrawAreaPolyline(map2d, res.graph)
        }
    }

    const shipLayerList = L.featureGroup([...movingShipLayer, ...lineLayer, ...historyMarkerLayer || [], ...historyLineLayer, shipMsgMarker, ...warnMsgMarker]).addTo(map2d.map)


    // 绘制预案目的地点
    const markerLayer = destinationList.map((item, index) => {
        const { latLng, cameraScope, typeId } = item
        return L.marker(latLng, {
            icon: L.divIcon({
                // html: createElementByComponent(<SvgPic pic={planDestinationSvga} svagid={`planDestinationSvga${index}`} option={{ height: '72px', width: '72px', borderRadius: '30px' }} />),
                html: createElementByComponent(planDestinationHtml({ index })),
                iconSize: [80, 80],
                iconAnchor: [45, 45]
            }),
            // 自定义值
            index: index + 1,
            latLng,
            cameraScope,
            typeId
        })
    })

    const markerLayerList = L.featureGroup(markerLayer)

    // 绘制形状 矩形多边形 线 圆 航道

    // 监听点击事件
    markerLayerList.on('click', (e: any) => {
        const { index } = e.layer.options
        // const htmlEle = createElementByComponent(<PlanManagementPopup data={{ index }} />)
        const htmlEle = createElementByComponent(bindPopupHtmlComponent({ index }))
        e.layer.bindPopup(htmlEle, {
            className: 'leaflet-popup-ui',
            minWidth: 360,
            // autoPan: false,
            offset: L.point(0, -4)
        }).openPopup()
    })

    shipLayerList.addTo(map2d.map)
    markerLayerList.addTo(map2d.map)

    map2d.map.panTo(shipLatLng)

    return () => {
        shipLayerList?.remove()
        markerLayerList?.remove()
        areaLayerList?.remove()
    }
}