import { Select } from "antd";
import { getPlaceTypeIcon } from "helper";
import Map2D from "helper/Map2D"
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react"
import { getPlaceLabelOptions, getPlaceOptionsByLabel } from "server/place";
import styles from "./index.module.sass";


/** 应当传入 placeType 和 placeIds 或者 graph */
interface PlanAreaSelectInputValue {
  /** 标签id */
  placeType?: number
  /** 场所ids */
  placeIds?: number[]
  /** 自定义区域范围json字符串数组 */
  graph?: string[]
}

/** geoman api */
export interface PlanAreaSelectInputPmApi {
  onCreate: (evt: any) => void
  onRemove: (evt: any) => void
  onEdit: (evt: any) => void
}

interface Props {
  /** 激活地图事件监听 */
  onCurrent?: (params?: PlanAreaSelectInputPmApi) => Map2D | undefined
  value?: PlanAreaSelectInputValue
  onChange?: (val: PlanAreaSelectInputValue) => void
}

const PlanAreaSelectInput: React.FC<Props> = ({ onCurrent, value, onChange }) => {
  console.debug('PlanAreaSelectInput')


  const [placeType, setPlaceType] = useState<number>()
  const [labelOptions, setLabelOptions] = useState<any[]>()
  const [placeIds, setPlaceIds] = useState<number[]>()
  const [placeItems, setPlaceItems] = useState<any[]>()
  const [placeOptions, setPlaceOptions] = useState<any[]>()
  const [isShowAreaEdit, setIsShowAreaEdit] = useState(false)
  const [customLayerList, setCustomLayerList] = useState<any[]>()
  const [map2d, setMap2d] = useState<Map2D>();


  const areaCount = useMemo(() => {
    return customLayerList?.length || 0
  }, [customLayerList])


  useEffect(() => {
    if (onCurrent) {
      const _map2d = onCurrent()
      setMap2d(_map2d)
    }
  }, [onCurrent])

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
          setIsShowAreaEdit(true)
        } else {
          setIsShowAreaEdit(false)
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

    if (map2d && placeItems) {
      // 根据区域大小排序区域、避免大区域覆盖小区域从而无法点击小区域
      placeItems.forEach((item: any) => {
        const graphObj = JSON.parse(item.graph)
        item.graphObj = graphObj
        if (item.graph) {
          if (graphObj.geometry.type === 'Polygon') {
            item.layerType = 'Polygon'
            const [target] = graphObj.geometry.coordinates
            const pointList = target.map(([lng, lat]: any[]) => [lat, lng])
            const polygon = turf.polygon([pointList]);
            item.size = turf.area(polygon)
          } else if (graphObj.properties.subType === 'Circle') {
            item.layerType = 'Circle'
            item.size = 3.14 * graphObj.properties.radius * graphObj.properties.radius
          } else if (graphObj.geometry.type === 'LineString') {
            item.layerType = 'Line'
            item.size = 1
          } else if (graphObj.geometry.type === 'SinglePoint') {
            item.layerType = 'Point'
            item.size = 1
          }
        } else {
          item.layerType = ''
          item.size = 1
        }
      })

      const placeSortItems = placeItems.sort((a: any, b: any) => b.size - a.size)

      placeSortItems.forEach(record => {
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
              offset: L.point(0, -8)
            })
            layer.openTooltip()
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
              offset: L.point(0, -8)
            })
            layer.openTooltip()
          } else {
            layer = L.geoJson(_geoJson)
            layer.addTo(map2d.map)
            layer.bindTooltip(record.name, {
              className: 'leaflet-tooltip-ui',
              direction: 'top',
              offset: L.point(0, -8)
            })
            layer.openTooltip()
          }

          layers.push(layer)

        }
      })
    }

    return () => {
      layers.forEach(layer => layer.remove())
    }
  }, [map2d, placeItems])

  // 响应控件赋值
  useEffect(() => {
    const geoJsonList = customLayerList?.map(layer => {
      const geoJson = layer.toGeoJSON()
      if (layer.pm._shape === "Circle") {
        geoJson.properties.subType = layer.pm._shape
        geoJson.properties.radius = layer._mRadius
      }
      return JSON.stringify(geoJson)
    })
    if (isShowAreaEdit && geoJsonList && onChange && value && !_.isEqual(value.graph, geoJsonList)) {
      onChange({
        placeType: value.placeType,
        graph: geoJsonList
      })
    }
  }, [isShowAreaEdit, customLayerList, value, onChange])

  useEffect(() => {
    if (map2d) {
      if (isShowAreaEdit) {
        map2d.map.pm.Toolbar.drawContainer.style.display = 'block'
        map2d.map.pm.Toolbar.editContainer.style.display = 'block'
      } else {
        map2d.map.pm.Toolbar.drawContainer.style.display = 'none'
        map2d.map.pm.Toolbar.editContainer.style.display = 'none'
      }
    }
  }, [map2d, isShowAreaEdit])



  const handleCreate = useCallback(
    (evt: any) => {
      setCustomLayerList(val => {
        if (val) {
          return [...val, evt.layer]
        } else {
          return [evt.layer]
        }
      })
    },
    [],
  )

  const handleRemove = useCallback(
    (evt: any) => {

      setCustomLayerList(val => {
        const layers = [...val!]
        _.remove(layers, layer => layer._leaflet_id === evt.layer._leaflet_id)
        return layers.length ? layers : undefined
      })
    },
    [],
  )

  const handleEdit = useCallback(
    (evt: any) => {
      setCustomLayerList(val => {
        const layers = [...val!]
        const index = layers.findIndex(layer => layer._leaflet_id === evt.layer._leaflet_id)
        layers.splice(index, 1, evt.layer)
        return layers
      })
    },
    [],
  )

  // 指定区域表单赋值
  useEffect(() => {
    let layers: any[] = []
    if (value?.placeIds) {
      setPlaceIds(value?.placeIds)
      let placeItems = _.filter(placeOptions, (item: any) => value.placeIds?.includes(item.id))
      setPlaceItems(placeItems)
    }
    setIsShowAreaEdit(false)
    if (value?.graph && map2d) {
      setIsShowAreaEdit(true)
      for (let i = 0; i < value.graph.length; i++) {
        const graphObj = JSON.parse(value.graph[i])
        let layer = L.geoJson(graphObj)
        layer.addTo(map2d.map)
        layers.push(layer)
      }
      setCustomLayerList(layers)
      if (map2d && value.placeType === 999 && onCurrent) {
        onCurrent({
          onCreate: handleCreate,
          onRemove: handleRemove,
          onEdit: handleEdit
        })
      }
    }
    return () => {
      layers.forEach(layer => layer.remove())
    }
  }, [handleCreate, handleEdit, handleRemove, map2d, onCurrent, placeOptions, value])

  const handleLabelChange = useCallback(
    (_placeType: number) => {
      setPlaceType(_placeType)
      setPlaceIds(undefined)
      setPlaceItems(undefined)
      setCustomLayerList(val => {
        val?.forEach(layer => layer.remove())
        return undefined
      })

      if (map2d && _placeType === 999 && onCurrent) {
        onCurrent({
          onCreate: handleCreate,
          onRemove: handleRemove,
          onEdit: handleEdit
        })
      }

      onChange && onChange({
        placeType: _placeType
      })
    },
    [handleCreate, handleEdit, handleRemove, map2d, onChange, onCurrent],
  )

  const handlePlaceListChange = useCallback(
    (_placeIds: number[], _placeItems: any[]) => {
      setPlaceIds(_placeIds)
      setPlaceItems(_placeItems)

      onChange && onChange({
        placeType: value?.placeType,
        placeIds: _placeIds
      })
    },
    [onChange, value],
  )


  return (
    <article className={styles.wrapper}>
      <section className={styles.selectLabelBox}>
        <Select
          options={labelOptions}
          value={placeType}
          onChange={handleLabelChange}
        />
      </section>
      <section className={styles.selectBox}>
        {isShowAreaEdit ?
          <div className={styles.textBox}>已选择{areaCount}个区域</div> :
          <Select
            options={placeOptions}
            mode='tags'
            placeholder='请选择'
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

export default PlanAreaSelectInput