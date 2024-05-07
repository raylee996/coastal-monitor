import { Select } from 'antd'
import AreaSelectInForm from 'component/AreaSelectInForm'
import { getPlaceTypeIcon } from 'helper'
import Map2D from 'helper/Map2D'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAreaTable } from 'server/core/controlManage'
import { getPlaceLabelOptions, getPlaceOptionsByLabel } from 'server/place'
import styles from './index.module.sass'

/** 应当传入 placeType 和 placeIds 或者 graph */
interface PlanAreaSelectInputValue {
    /** 标签id */
    placeType?: number
    /** 场所ids */
    placeId?: number[]
    /** 自定义区域范围json字符串数组 */
    graph?: string[]
    // 自定义区域id
    graphId?: number[]
}

interface Props {
    getMap2d: () => Map2D | undefined
    value?: PlanAreaSelectInputValue
    onChange?: (val: PlanAreaSelectInputValue) => void
}
// 指定区域选择
const CustomAreaSelect: React.FC<Props> = ({
    value,
    onChange,
    getMap2d
}) => {
    const [placeType, setPlaceType] = useState<number>()
    const [labelOptions, setLabelOptions] = useState<any[]>()

    const [placeIds, setPlaceIds] = useState<number[]>()
    const [placeItems, setPlaceItems] = useState<any[]>()
    const [placeOptions, setPlaceOptions] = useState<any[]>()

    const [isCustomArea, setIsCustomArea] = useState(false)
    const [graphId, setGraphId] = useState<any>()

    // 获取标签选择
    useEffect(() => {
        let ctr: AbortController
        async function main() {
            ctr = new AbortController()
            const vo = await getPlaceLabelOptions(ctr)
            setLabelOptions([...vo, { label: '自定义', value: 999 }])
        }
        main()
        return () => {
            ctr?.abort()
        }
    }, [])

    const labelId = useMemo<number | undefined>(() => value?.placeType || labelOptions?.[0].value, [labelOptions, value])

    // 根据标签获取场所选择
    useEffect(() => {
        let ctr: AbortController
        async function main() {
            if (labelId) {
                const _labelId = labelId
                setPlaceType(_labelId)
                if (_labelId === 999) {
                    setIsCustomArea(true)
                } else {
                    setIsCustomArea(false)
                    ctr = new AbortController()
                    const vo = await getPlaceOptionsByLabel(_labelId, ctr)
                    setPlaceOptions(vo)
                }
            }
        }
        main()
        return () => {
            ctr?.abort()
        }
    }, [labelId])

    // 根据场所渲染地图
    useEffect(() => {
        let layers: any[] = []
        const map2d = getMap2d()

        if (map2d && placeItems) {
            placeItems.forEach(record => {
                if (record.graph) {
                    const _geoJson = JSON.parse(record.graph)
                    let layer: any

                    if (_geoJson.properties.subType === 'Circle') {
                        layer = new L.Circle([_geoJson.geometry.coordinates[1], _geoJson.geometry.coordinates[0]], {
                            radius: _geoJson.properties.radius,
                            color: _geoJson.properties.borderColor, //颜色
                            fillColor: _geoJson.properties.background,
                            fillOpacity: 0.1, //透明度
                            weight: 1, //线条宽度
                            opacity: 0.4 //线条透明度
                        });

                        layer.addTo(map2d.map);
                        layer.bindTooltip(`${record.name} <br/> ${_geoJson.geometry.coordinates[1]} , ${_geoJson.geometry.coordinates[0]}`, {
                            className: 'leaflet-tooltip-ui',
                            direction: 'top',
                            offset: L.point(0, -8),
                            permanent: true
                        })
                        // layer.openTooltip()
                    } else if (_geoJson?.geometry?.type === 'SinglePoint') {
                        const icon = getPlaceTypeIcon(record.icon)
                        layer = map2d.createMarker({
                            markerId: 1,
                            latLng: _geoJson?.geometry.coordinates.map(Number),
                            markerOptions: {
                                icon
                            }
                        })
                        layer.addTo(map2d.map)
                        layer.bindTooltip(record.name, {
                            className: 'leaflet-tooltip-ui',
                            direction: 'top',
                            offset: L.point(0, -8),
                            permanent: true
                        })
                        // layer.openTooltip()
                    } else {
                        layer = L.geoJson(_geoJson)
                        layer.addTo(map2d.map)
                        layer.bindTooltip(record.name, {
                            className: 'leaflet-tooltip-ui',
                            direction: 'top',
                            offset: L.point(0, -8),
                            permanent: true
                        })
                        // layer.openTooltip()
                    }

                    layers.push(layer)

                }
            })
        }

        return () => {
            layers.forEach(layer => layer.remove())
        }
    }, [getMap2d, placeItems])

    // 指定区域表单赋值
    useEffect(() => {
        if (value) {
            if (value.placeType) {
                setPlaceType(value.placeType)
            }
            if (value.placeType === 999) {
                if (value.graphId && value.graph) {
                    setGraphId(value.graphId)
                    setPlaceItems(value.graph)
                } else {
                    setGraphId(undefined)
                    setPlaceItems(undefined)
                }
            } else {
                if (value.placeId) {
                    const _placeItems = _.filter(placeOptions, (item: any) => value.placeId?.includes(item.id))
                    setPlaceItems(_placeItems)
                    setPlaceIds(value.placeId)
                } else {
                    setPlaceItems(undefined)
                }
            }
        } else {
            setPlaceType(undefined)
            setPlaceIds(undefined)
            setPlaceItems(undefined)
        }
    }, [placeOptions, value])

    const handleLabelChange = useCallback(
        (_placeType: number) => {
            onChange && onChange({
                placeType: _placeType
            })
        },
        [onChange],
    )

    const handlePlaceListChange = useCallback(
        (_placeIds: number[], _placeItems: any[]) => {
            onChange && onChange({
                placeType: value?.placeType,
                placeId: _placeIds
            })
        },
        [onChange, value],
    )

    // 选择自定义区域
    function getGraphData(val: any) {
        getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '2,3,4' }).then(res => {
            console.log(res);
            let items = res.data.filter((item: any) => val.includes(item.id))
            onChange && onChange({
                placeType: placeType,
                graphId: val,
                graph: items.map((item: any) => item)
            })
        })
    }


    return (
        <article className={styles.wrapper}>
            <section className={styles.selectLabelBox}>
                <Select
                    placeholder='请选择类型'
                    options={labelOptions}
                    value={placeType}
                    onChange={handleLabelChange}
                />
            </section>
            <section className={styles.selectBox}>
                {isCustomArea ?
                    <AreaSelectInForm
                        value={graphId}
                        size='middle'
                        inputProps={{
                            style: {
                                width: '160px'
                            },
                            maxTagCount: 1,
                        }}
                        onChange={getGraphData} /> :
                    <Select
                        options={placeOptions}
                        mode='tags'
                        placeholder='请选择场所区域'
                        maxTagCount={1}
                        maxTagTextLength={6}
                        value={placeIds}
                        onChange={handlePlaceListChange}
                        allowClear
                    />
                }
            </section>
        </article>
    )
}

export default CustomAreaSelect