import { getPlaceTypeIconSrc } from "helper"
import { getIconByDeviceType } from "helper/mapIcon"
import { useCallback, useEffect, useState } from "react"
import { getLabelTable } from "server/label"
import { doGetPlaceInfo, doGetPlacesAllDevices } from "server/place"
import DetailPane from "../../../PlanBasicPreview/PlanPlacePreview/DetailPane"

interface Props {
    basicInfo: any
    map2D: any
}

let markers: any
// 重点场所配置
const PlanConfigPlace: React.FC<Props> = ({
    basicInfo,
    map2D
}) => {

    const [deviceList, setDeviceList] = useState<any>([])
    const [graph, setGraph] = useState<any>()

    // 单个点位渲染，如易跳海
    const [selectIcon, setSelectIcon] = useState<any>()
    const [labelList, setLabelList] = useState<any[]>([])

    // 获取设备列表
    useEffect(() => {
        async function main() {
            const vo: any = await doGetPlacesAllDevices({ focusPlaceId: basicInfo.place })
            setDeviceList(vo.data)
        }
        main()
    }, [basicInfo])

    // 获取所有场所类型
    useEffect(() => {
        async function getLabelList() {
            const vo = await getLabelTable({ type: 9 })
            setLabelList(vo?.data || [])
        }
        getLabelList()
    }, [])

    // 获取场所详情
    useEffect(() => {
        async function main() {
            const vo: any = await doGetPlaceInfo(basicInfo.place);
            setGraph(vo?.data?.graph)
            let icon = vo?.data?.icon;
            if (icon && labelList && labelList.length) {
                const selectLabel = labelList.find((ele) => ele.subType === icon);
                selectLabel && setSelectIcon({
                    name: selectLabel.labelName,
                    value: selectLabel.subType
                })
            }
        }
        main()
    }, [labelList, basicInfo])

    // 绘制标识点
    const drawMarker = useCallback((MAP: any, latLng: [number, number]) => {
        if (!selectIcon) {
            return
        }
        const IconUrl = getPlaceTypeIconSrc(selectIcon?.value)
        const marker = MAP.createMarker({
            markerId: 1,
            latLng,
            markerOptions: {
                icon: L.icon({
                    iconUrl: IconUrl,
                    iconSize: selectIcon?.value === '11' ? [94, 22] : [20, 20],
                })
            }
        })
        marker.bindTooltip(`${selectIcon?.name || ''}`, {
            className: 'leaflet-tooltip-ui',
            direction: 'top',
            offset: L.point(0, -10)
        }).addTo(MAP.map)

        // 将marker放入layer管理
        const layerGroup = L.layerGroup([marker]);
        markers = layerGroup
        MAP.map.addLayer(layerGroup)
        return layerGroup
    }, [selectIcon])

    // 渲染区域
    useEffect(() => {
        const layers: any[] = []
        if (graph && map2D) {
            const geoJsonData = JSON.parse(graph)
            // 回显轨迹点
            if (geoJsonData?.geometry?.type === 'SinglePoint') {
                geoJsonData?.geometry?.coordinates && drawMarker(map2D, geoJsonData.geometry.coordinates)
                geoJsonData?.geometry?.coordinates && map2D.map.fitBounds([geoJsonData.geometry.coordinates], { maxZoom: 13 })
            } else {
                //单独处理圆形
                if (geoJsonData.properties.subType === 'Circle') {
                    let circle = new L.Circle([geoJsonData.geometry.coordinates[1], geoJsonData.geometry.coordinates[0]], {
                        radius: geoJsonData.properties.radius,
                        color: geoJsonData.properties.borderColor, //颜色
                        fillColor: geoJsonData.properties.background,
                        fillOpacity: 0.4, //透明度
                    });
                    circle.addTo(map2D?.map);
                    map2D?.map.panTo(circle.getBounds().getCenter())
                    layers.push(circle)
                } else {
                    const areaLayer = L.geoJson(geoJsonData).addTo(map2D?.map)
                    map2D?.map.panTo(areaLayer.getBounds().getCenter())
                    //边框、背景颜色回显
                    areaLayer.setStyle({
                        color: geoJsonData.properties.borderColor,
                        fillColor: geoJsonData.properties.background,
                        fillOpacity: 0.4
                    })
                    layers.push(areaLayer)
                }
            }

        }
        return () => {
            layers.forEach(item => item.remove())
            if (markers) {
                markers.clearLayers()
                markers = null
            }
        }
    }, [drawMarker, graph, map2D])


    // 渲染设备
    useEffect(() => {
        let group: any
        if (deviceList && deviceList.length > 0 && map2D) {
            const result = deviceList.map((ele: any) => {
                const lIcon = getIconByDeviceType(ele.deviceType)
                ele.latLng = [ele.latitude, ele.longitude]
                ele.lIcon = lIcon
                return ele
            })
            const markerList = result.map((ele: any) => {
                const marker = L.marker(ele.latLng, {
                    extraData: ele,
                    icon: ele.lIcon
                })
                marker.bindTooltip(ele.name, {
                    className: 'leaflet-tooltip-ui',
                    direction: 'top',
                    offset: L.point(0, -32)
                })
                marker.on("mouseover", function (evt: any) {
                    evt.target.openPopup()
                })
                return marker
            });
            group = L.featureGroup(markerList).addTo(map2D.map);
            let latlngArr = deviceList.map((item: any) => [item.latitude, item.longitude])
            group && map2D.map.fitBounds(latlngArr, { maxZoom: 13 })
        }
        return () => {
            group && group.remove()
        }
    }, [deviceList, map2D])

    return <div>
        {<DetailPane placeId={basicInfo.place} />}
    </div>
}

export default PlanConfigPlace