import { Button, Input, message, Select } from "antd";
import { isPointInCircle, isPointInPolygon } from "helper/map/common";
import Map2D, { MapTileType } from "helper/Map2D";
import { getIconByDeviceType, getIconDeviceSelected } from "helper/mapIcon";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addCtrAreaData, editCtrAreaData } from "server/core/controlManage";
import styles from "./index.module.sass";

const deviceBusinessFunctionOptions = [{
  label: '人脸识别',
  value: '3'
}, {
  label: '卡口',
  value: '4'
}]

interface Props {
  areaData?: any
  deviceList?: any[]
  onSuccess: () => void
}

const MapAreaInfo: React.FC<Props> = ({ areaData, deviceList, onSuccess }) => {
  console.debug('MapAreaInfo')


  const mapRef = useRef<HTMLElement>(null)


  const [typeList, setTypeList] = useState<string[]>(['4'])
  const [map2d, setMap2D] = useState<Map2D>()
  const [value, setValue] = useState<string[]>([])
  const [polygonLayers, setPolygonLayers] = useState<any>()
  const [polygonGeojson, setPolygonGeojson] = useState<any>()
  const [name, setName] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  /*颜色设置*/
  const [background, setBackground] = useState('#3388ff')
  const [borderColor, setBorderColor] = useState('#3388ff')


  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    const timer = setTimeout(() => {
      if (mapRef.current) {
        _map2d = new Map2D(mapRef.current, MapTileType.satellite)
        setMap2D(_map2d)
      }
    }, 1000);
    return () => {
      _map2d?.map?.remove()
      clearTimeout(timer)
    }
  }, [])

  // 初始化绘制插件
  useEffect(() => {
    if (map2d) {
      const controlsOptions: any = {
        position: 'topright',
        drawMarker: false,
        drawText: false,
        drawCircleMarker: false,
        cutPolygon: false,
        rotateMode: false,
        dragMode: false,
        editMode: false,
        removalMode: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: true
      }

      map2d.map.pm.setLang('zh');
      map2d.map.pm.addControls(controlsOptions);
      map2d.map.pm.setPathOptions({
        color: borderColor,
        fillColor: background,
        fillOpacity: 0.4,
        weight: 2,
      });

      const handlePmCreate = (e: any) => {
        const layers = map2d.map.pm.getGeomanLayers().filter((item: any) => item.options.pane === 'overlayPane')
        let rectangleGeoJson = e.layer.toGeoJSON();
        //特殊处理圆形
        if (e.shape === 'Circle') {
          rectangleGeoJson.properties.subType = 'Circle'
          rectangleGeoJson.properties.radius = e.layer.getRadius()
          setPolygonLayers(() => {
            return {
              type: 'Circle',
              radius: e.layer.getRadius(),
              coordinates: rectangleGeoJson.geometry.coordinates
            }
          })
        } else {
          setPolygonLayers(() => {
            return {
              type: 'Polygon',
              coordinates: rectangleGeoJson.geometry.coordinates
            }
          })
        }
        rectangleGeoJson.properties.background = background
        // rectangleGeoJson.properties.borderColor = "#3388ff"
        rectangleGeoJson.properties.borderColor = borderColor
        setPolygonGeojson(rectangleGeoJson)
        // 只保留当前创建的范围
        const needRemoveLayers = _.filter(layers, (ele: any) => ele._leaflet_id !== e.layer._leaflet_id)
        needRemoveLayers.forEach((ele: any) => {
          ele.pm.remove()
        });
      }
      map2d.map.on('pm:create', handlePmCreate)
    }
    return () => {
      map2d?.map.pm.removeControls()
    }
  }, [map2d, borderColor, background])

  // 绘制范围选择设备
  useEffect(() => {
    if (deviceList && polygonLayers?.coordinates?.length) {
      const deviceArr = deviceList.filter(item => item.businessFunction.includes(typeList))
      const result = _.filter(deviceArr, item => {
        if (polygonLayers.type === 'Circle') {
          const is = isPointInCircle([item.latitude, item.longitude], polygonLayers.coordinates, polygonLayers.radius)
          return is
        } else {
          const is = isPointInPolygon([item.latitude, item.longitude], polygonLayers.coordinates.map((v: any) => v))
          return is
        }
      })
      const codeList = result.map(item => item.deviceCode)
      setValue(codeList)
    }
  }, [deviceList, polygonLayers, typeList])

  // 响应区域数据
  useEffect(() => {
    let layer: any
    if (map2d && areaData) {
      if (areaData.graph) {
        const jsonObj = JSON.parse(areaData.graph)
        console.log(jsonObj)
        setBorderColor(jsonObj.properties.borderColor)
        setBackground(jsonObj.properties.background)
        if (jsonObj.properties.subType === 'Circle') {
          layer = new L.Circle([jsonObj.geometry.coordinates[1], jsonObj.geometry.coordinates[0]], {
            radius: jsonObj.properties.radius,
            color: jsonObj.properties.borderColor, //颜色
            fillColor: jsonObj.properties.background,
            fillOpacity: 0.4, //透明度
          })
        } else if (jsonObj.geometry.type === 'Point') {
          layer = L.circleMarker([jsonObj.geometry.coordinates[1], jsonObj.geometry.coordinates[0]], {
            pane: 'markerPane',
            radius: 4,
            fillColor: '#f5222d',
            fillOpacity: 1,
            weight: 0
          })
        } else {
          // layer = L.geoJson(jsonObj)
          layer = L.geoJson(jsonObj).addTo(map2d?.map)
          map2d?.map.panTo(layer.getBounds().getCenter())
          //边框、背景颜色回显
          layer.setStyle({
            color: jsonObj.properties.borderColor,
            fillColor: jsonObj.properties.background,
            fillOpacity: 0.4
          })
        }
        layer.addTo(map2d.map)
      }

      if (areaData.deviceCodes) {
        const _value = areaData.deviceCodes.split(',');
        setValue(_value)
      }


      const _polygonGeojson = JSON.parse(areaData.graph)
      setPolygonGeojson(_polygonGeojson)
      setName(areaData.name)
    }
  }, [map2d, areaData])


  const handleDeleteByCode = useCallback(
    (code: string) => {
      if (value?.includes(code)) {
        const _value = [...value]
        _.remove(_value, ele => ele === code)
        setValue(_value)
      }
    },
    [value],
  )


  // 渲染设备
  useEffect(() => {
    let layerGroup: any
    if (map2d && deviceList) {
      layerGroup = L.layerGroup()
      for (let i = 0; i < deviceList.length; i++) {
        const deviceType = String(deviceList[i].deviceType)
        const cameraType = Number(deviceList[i].cameraType)

        if (typeList && typeList.length) {
          let businessFunction = deviceList[i].businessFunction.split(',')
          let hasTheSame = businessFunction.filter((x: any) => typeList.some(item => item === x))
          if (hasTheSame.length === 0) {
            continue
          }
        }
        let icon: any
        let isSelected = false
        if (value && value.includes(deviceList[i].deviceCode)) {
          icon = getIconDeviceSelected()
          isSelected = true
        } else {
          icon = getIconByDeviceType(deviceType, cameraType)
        }
        const latLng = {
          lat: deviceList[i].latitude,
          lng: deviceList[i].longitude
        }
        if (latLng.lat && latLng.lng) {
          const marker = L.marker(latLng, {
            icon,
            isSelected,
            deviceCode: deviceList[i].deviceCode
          })
          marker.bindTooltip(deviceList[i].deviceName, {
            className: 'leaflet-tooltip-ui',
            direction: 'top',
            offset: L.point(0, -32)
          })
          marker.on("click ", (evt: any) => {
            if (evt.target.options.isSelected) {
              handleDeleteByCode(deviceList[i].deviceCode)
            } else {
              const _value = value ? [deviceList[i].deviceCode, ...value] : [deviceList[i].deviceCode]
              setValue(_value)
            }
          })
          layerGroup.addLayer(marker)
        }
      }
      layerGroup.addTo(map2d.map)
    }
    return () => {
      layerGroup?.clearLayers()
    }
  }, [map2d, value, deviceList, handleDeleteByCode, typeList])


  const options = useMemo(() => {
    if (deviceList) {
      const result: any[] = []
      deviceList.forEach(item => {
        const opt = {
          label: item.deviceName,
          value: item.deviceCode
        }
        if (typeList && typeList.length) {
          let businessFunction = item.businessFunction.split(',')
          let hasTheSame = businessFunction.filter((x: any) => typeList.some(item => item === x))
          if (hasTheSame.length > 0) {
            result.push(opt)
          }
        } else {
          result.push(opt)
        }
      })
      return result
    } else {
      return []
    }
  }, [deviceList, typeList])

  const selectDeviceList = useMemo(() => {
    if (deviceList && value) {
      const result = _.filter(deviceList, item => value.includes(item.deviceCode))
      return result
    } else {
      return []
    }
  }, [deviceList, value])


  const handleTypeList = useCallback(
    (val: string[]) => {
      setTypeList(val)
    },
    [],
  )

  const handleValue = useCallback(
    (val: any) => {
      setValue(val)
    },
    [],
  )

  const handleName = useCallback(
    ({ target: { value } }: any) => {
      setName(value)
    },
    [],
  )
  const handleSubmit = useCallback(
    async () => {
      try {
        if (!isLoading) {
          // !value.length && message.warning('请选择设备')
          !name && message.warning('请输入区域名称')
          // !polygonGeojson && message.warning('请绘制区域')
          if (name) {
            setIsLoading(true)
            if (areaData) {
              const _polygonGeojson = polygonGeojson ? { ...polygonGeojson } : null
              if (_polygonGeojson?.propertie) {
                _polygonGeojson.properties.borderColor = borderColor
                _polygonGeojson.properties.background = background
                setPolygonGeojson(_polygonGeojson)
              }
              await editCtrAreaData(areaData.id, name, value, _polygonGeojson)
            } else {
              await addCtrAreaData(name, value, polygonGeojson)
            }

            onSuccess()
          }
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, name, onSuccess, polygonGeojson, value, areaData, borderColor, background],
  )

  //修改图形背景颜色
  function changeBackground(e: any) {
    if (map2d) {
      const map = map2d.map
      setBackground(e.target.value)
      map.pm.setPathOptions({
        color: borderColor,
        fillColor: e.target.value,
        fillOpacity: 0.4,
        weight: 2,

      });

      const layers = map2d.map.pm.getGeomanLayers()
      const layer: any = _.first(layers)
      layer.setStyle({
        fillColor: e.target.value,
        fillOpacity: 0.4
      })
    }
  }

  //修改边框颜色
  function changeBorderColor(e: any) {
    if (map2d) {
      const map = map2d.map
      setBorderColor(e.target.value)
      map.pm.setPathOptions({
        color: e.target.value,
        fillColor: background,
        fillOpacity: 0.4,
        weight: 2,
      });

      const layers = map2d.map.pm.getGeomanLayers()
      // const layer: any = _.first(layers)
      for (let i = 0; i < layers.length; i++) {
        layers[i].setStyle({
          color: e.target.value
        })
      }

    }
  }


  return (
    <article className={styles.wrapper}>
      <section className={styles.map} ref={mapRef}></section>
      <article className={styles.box}>
        <header>
          <Select
            className={styles.type}
            options={deviceBusinessFunctionOptions}
            value={typeList}
            onChange={handleTypeList}
            mode='tags'
            maxTagCount={2}
            maxTagTextLength={5}
            placeholder='所有设备类型'
            allowClear
          />
          <Select
            className={styles.deviceList}
            options={options}
            value={value}
            onChange={handleValue}
            mode='tags'
            maxTagCount={1}
            maxTagTextLength={10}
            placeholder='请选择设备'
          />
        </header>
        <section>
          {selectDeviceList.map(item =>
            <div className={styles.selected} key={item.deviceCode}>
              <div className={styles.name} title={item.deviceName}>{item.deviceName}</div>
              <div className={styles.typeName}>{item.deviceTypeName}</div>
              <div className={styles.delete}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleDeleteByCode(item.deviceCode)}
                >
                  删除
                </Button>
              </div>
            </div>
          )}
        </section>
      </article>
      <footer className={styles.footer}>
        <Input placeholder="请输入区域名称" value={name} onChange={handleName} style={{ width: '200px' }} />
        <>填充：<input type='color' value={background} onChange={changeBackground} /></>
        边框：<input type='color' value={borderColor} onChange={changeBorderColor} />
        <Button onClick={handleSubmit} loading={isLoading} style={{ marginLeft: '10px' }}>确认</Button>
      </footer>
    </article>
  )
}

export default MapAreaInfo