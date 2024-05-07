import { Button, Input, message, Space } from "antd";
import Map2D, { MapTileType } from "helper/Map2D";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import {
  addAreaServe,
  deleteAreaServe,
  editAreaServe,
  getAreaTable,
  getSelectedAreaTable
} from "server/core/controlManage";
import styles from "./index.module.sass";


interface Props {
  /**扩展参数 */
  extraParams?: any
  /** 默认选择项的key数组，单选只需要传一项 */
  defaultRowKeys?: any[]
  /** 获取组件内部选择的项 */
  onChange?: (rows: any[]) => void
  //类别返回类型：图形类型 1 线 2 圆形 3 矩形 4 多边形
  chooseType?: string

  /** 是否不支持编辑矩形 */
  isNotRectangle?: boolean
  /** 是否不支持编辑多边形 */
  isNotPolygon?: boolean
  /** 是否不支持编辑线条 */
  isNotLine?: boolean
  /** 是否不支持编辑圆形 */
  isNotCircle?: boolean,
  /**单选，多选,不传默认为单选*/
  isMultiple?: boolean
  /**是否需要区分AB面*/
  isShowAB?: boolean
}


const AreaSelect: React.FC<Props> = ({
  extraParams,
  defaultRowKeys,
  onChange,
  chooseType,
  isNotRectangle,
  isNotPolygon,
  isNotLine,
  isMultiple,
  isNotCircle,
  isShowAB
}) => {
  console.log('AreaSelect', extraParams)

  const mapRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<any>(null)
  const [mapLeaflet, setMapLeaflet] = useState<Map2D>()

  const [rowKeys, setRowKeys] = useState<any[]>(defaultRowKeys || [])
  const [name, setName] = useState('')
  const [isAdd, setIsAdd] = useState(false)
  const [id, setId] = useState<any>()

  // 航道宽度
  const [yawWidth, setYawWidth] = useState(800)
  // 航道线条对象
  const [yawObj, setYawObj] = useState<any>(null)
  // 编辑航道使用yawObjLayer.on('pm:edit')
  const [yawObjLayer, setYawObjLayer] = useState<any>(null)

  // 航道多边形,大数据需要使用。
  const [yawPolyGeoJSON, setYawPolyGeoJSON] = useState<any>(null)
  // 航道两边线段
  const [lineA, setLineA] = useState<any>(null)
  const [lineB, setLineB] = useState<any>(null)
  // 航道两端截口线段
  const [lineC, setLineC] = useState<any>(null)
  const [lineD, setLineD] = useState<any>(null)

  /*颜色设置*/
  const [background, setBackground] = useState('#3388ff')
  const [borderColor, setBorderColor] = useState('#3388ff')

  const [areaType] = useState(() => {
    if (chooseType === '1') {
      return 'line'
    } else if (chooseType === '5') {
      return 'yaw'
    } else {
      return 'area'
    }
  })

  // 地图实例化
  useEffect(() => {
    let _mapLeaflet: Map2D
    if (mapRef.current) {
      _mapLeaflet = new Map2D(mapRef.current, MapTileType.satellite)
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet?.map?.remove()
    }
  }, [])


  // 绘制插件初始化
  useEffect(() => {
    // pm插件画完事件
    let handlePmDrawend: any;
    // pm插件创建事件
    let handlePmCreate: any;

    if (mapLeaflet && isAdd) {
      const map = mapLeaflet.map
      const controlsOptions: any = {
        position: 'topright',
        drawMarker: false,
        drawText: false,
        drawCircleMarker: false,
        cutPolygon: false,
        rotateMode: false,
        dragMode: false,
        removalMode: false
      }
      if (isNotRectangle) {
        controlsOptions.drawRectangle = false
      }
      if (isNotPolygon) {
        controlsOptions.drawPolygon = false
      }
      if (isNotLine) {
        controlsOptions.drawPolyline = false
      }
      if (isNotCircle) {
        controlsOptions.drawCircle = false
      }
      map.pm.setLang('zh');
      map.pm.addControls(controlsOptions);

      map.pm.setPathOptions({
        color: borderColor,
        fillColor: background,
        fillOpacity: 0.4,
        weight: 2,
        // 航道中间的线条为虚线
        dashArray: areaType === 'yaw' ? [5, 5] : [0, 0]
      });

      // 创建事件
      handlePmCreate = function (e: any) {
        const layers = map.pm.getGeomanLayers()
        // 只保留当前创建的范围
        const needRemoveLayers = _.filter(layers, (ele: any) => ele._leaflet_id !== e.layer._leaflet_id)
        needRemoveLayers.forEach((ele: any) => {
          ele.pm.remove()
        });
      }
      // 绘制完成执行
      handlePmDrawend = function () {
        //当前绘制的图形是线条，需要显示AB面
        if (mapLeaflet && isShowAB) {
          let layer = mapLeaflet.map.pm.getGeomanLayers()
          let currentLayer: any = _.last(layer)
          if (layer.length > 0 && currentLayer.pm._shape === 'Line') {
            //起始点第一个点
            let startPoint: any = currentLayer.pm._layer._latlngs[0];
            //起始点第二个点
            let endPoint: any = currentLayer.pm._layer._latlngs[1]

            // 线的起点的左边A面
            let lineStartLeft = turf.transformRotate(currentLayer.toGeoJSON(), -30, {
              pivot: [startPoint.lng, startPoint.lat]
            });
            // 线的终点的左边B面
            let lineEndLeft = turf.transformRotate(currentLayer.toGeoJSON(), -30, {
              pivot: [endPoint.lng, endPoint.lat]
            });

            //取经纬度平均值
            let Aa = (lineStartLeft.geometry.coordinates[0][0] + lineStartLeft.geometry.coordinates[1][0]) / 2
            let Ab = (lineStartLeft.geometry.coordinates[0][1] + lineStartLeft.geometry.coordinates[1][1]) / 2

            let Ba = (lineEndLeft.geometry.coordinates[0][0] + lineEndLeft.geometry.coordinates[1][0]) / 2
            let Bb = (lineEndLeft.geometry.coordinates[0][1] + lineEndLeft.geometry.coordinates[1][1]) / 2

            let ASide = L.divIcon({
              html: 'A面',
              className: styles.myIcon
            })
            L.marker([Ab, Aa], { icon: ASide }).addTo(mapLeaflet.map)
            let BSide = L.divIcon({
              html: 'B面',
              className: styles.myIcon
            })
            L.marker([Bb, Ba], { icon: BSide }).addTo(mapLeaflet.map)
          }
        } else if (mapLeaflet && areaType === 'yaw') {
          // 创建航道
          let layer = mapLeaflet.map.pm.getGeomanLayers()
          let currentLayer: any = _.last(layer)

          if (currentLayer) {
            setYawObj(JSON.stringify(currentLayer.toGeoJSON()))
            setYawObjLayer(currentLayer)
          }

          // 防止多次点击线条工具出现多条线的问题
          if (layer.length > 1) {
            return
          }

          if (layer.length > 0 && currentLayer.pm._shape === 'Line') {

            let line1 = turf.lineOffset(currentLayer.toGeoJSON(), yawWidth / 2, { units: 'meters', weight: 2 });
            let line2 = turf.lineOffset(currentLayer.toGeoJSON(), -(yawWidth / 2), { units: 'meters', weight: 2 });

            let line1Layer = L.geoJson(line1).addTo(mapLeaflet.map)
            let line2Layer = L.geoJson(line2).addTo(mapLeaflet.map)

            line1Layer.setStyle({
              color: borderColor,
              fillColor: background,
              fillOpacity: 0.4,
              weight: 2,
            })
            line2Layer.setStyle({
              color: borderColor,
              fillColor: background,
              fillOpacity: 0.4,
              weight: 2,
            })
            line1Layer.pm.enable({
              allowEditing: false
            });
            line2Layer.pm.enable({
              allowEditing: false
            });

            // 航道两边的实线
            setLineA(line1)
            setLineB(line2)

            // line1和line2拼成多边形
            let latlngs = [...line1.geometry.coordinates, ...line2.geometry.coordinates.reverse()];
            // 经纬度反转
            let latlngsReverse = []
            for (let i = 0; i < latlngs.length; i++) {
              latlngsReverse.push([latlngs[i][1], latlngs[i][0]])
            }

            // 航道多边形
            let polygon = L.polygon(latlngsReverse)
            // polygon.addTo(mapLeaflet.map)
            // mapLeaflet.map.fitBounds(polygon.getBounds())
            // console.log(polygon.toGeoJSON())
            setYawPolyGeoJSON(polygon.toGeoJSON())

            // 航道入口线段
            let newLine1 = JSON.parse(JSON.stringify(line1))
            let newLine2 = JSON.parse(JSON.stringify(line2))

            let line1Start = newLine1.geometry.coordinates[0].reverse();
            let line1End = newLine1.geometry.coordinates[newLine1.geometry.coordinates.length - 1].reverse();
            let line2Start = newLine2.geometry.coordinates[0].reverse();
            let line2End = newLine2.geometry.coordinates[newLine2.geometry.coordinates.length - 1].reverse();

            let lineC = L.polyline([line1Start, line2End])
            let lineD = L.polyline([line1End, line2Start])

            setLineC(lineC.toGeoJSON())
            setLineD(lineD.toGeoJSON())
          }
        }
      }
      // 创建事件
      map.on('pm:create', handlePmCreate);
      //绘制完成，区分AB面
      map.on('pm:drawend', handlePmDrawend)
    }
    return () => {
      mapLeaflet && mapLeaflet.map.pm.removeControls()
      mapLeaflet && mapLeaflet.map.off('pm:drawend', handlePmDrawend)
      mapLeaflet && mapLeaflet.map.off('pm:create', handlePmCreate)
    }
  }, [mapLeaflet, isAdd, isNotRectangle, isNotPolygon, isNotLine, isNotCircle, borderColor, background, isShowAB, areaType, yawWidth])

  // 编辑航道
  useEffect(() => {
    if (mapLeaflet && yawObjLayer) {
      // 编辑航道
      yawObjLayer.on('pm:edit', function (e: any) {
        const layers = mapLeaflet.map.pm.getGeomanLayers()

        layers.forEach((ele: any) => {
          if (ele._leaflet_id !== e.layer._leaflet_id) {
            ele.pm.remove()
          }
        });
        let currentLayer = e.layer
        if (currentLayer) {
          setYawObj(JSON.stringify(currentLayer.toGeoJSON()))
          setYawObjLayer(currentLayer)
        }

        let line1 = turf.lineOffset(currentLayer.toGeoJSON(), yawWidth / 2, { units: 'meters', weight: 2 });
        let line2 = turf.lineOffset(currentLayer.toGeoJSON(), -(yawWidth / 2), { units: 'meters', weight: 2 });

        let line1Layer = L.geoJson(line1).addTo(mapLeaflet.map)
        let line2Layer = L.geoJson(line2).addTo(mapLeaflet.map)

        line1Layer.setStyle({
          color: borderColor,
          fillColor: background,
          fillOpacity: 0.4,
          weight: 2,
        })
        line2Layer.setStyle({
          color: borderColor,
          fillColor: background,
          fillOpacity: 0.4,
          weight: 2,
        })
        line1Layer.pm.enable({
          allowEditing: false
        });
        line2Layer.pm.enable({
          allowEditing: false
        });
        // 航道两边的实线
        setLineA(line1)
        setLineB(line2)

        // line1和line2拼成多边形
        let latlngs = [...line1.geometry.coordinates, ...line2.geometry.coordinates.reverse()];
        // 经纬度反转
        let latlngsReverse = []
        for (let i = 0; i < latlngs.length; i++) {
          latlngsReverse.push([latlngs[i][1], latlngs[i][0]])
        }

        // 航道多边形
        let polygon = L.polygon(latlngsReverse)
        setYawPolyGeoJSON(polygon.toGeoJSON())

        // 航道入口线段
        let newLine1 = JSON.parse(JSON.stringify(line1))
        let newLine2 = JSON.parse(JSON.stringify(line2))

        let line1Start = newLine1.geometry.coordinates[0].reverse();
        let line1End = newLine1.geometry.coordinates[newLine1.geometry.coordinates.length - 1].reverse();
        let line2Start = newLine2.geometry.coordinates[0].reverse();
        let line2End = newLine2.geometry.coordinates[newLine2.geometry.coordinates.length - 1].reverse();

        let lineC = L.polyline([line1Start, line2End])
        let lineD = L.polyline([line1End, line2Start])

        setLineC(lineC.toGeoJSON())
        setLineD(lineD.toGeoJSON())
      })
    }
  }, [mapLeaflet, yawObjLayer, background, borderColor, yawWidth])


  //默认选中项的数据，绘制图形，编辑
  useEffect(() => {
    getSelectedAreaTable().then((res: any) => {
      let result = res.data || []
      let selectedRows = result.filter((item: any) => {
        return rowKeys.includes(item.id)
      })
      if (selectedRows.length > 0 && mapLeaflet) {
        //渲染
        for (let i = 0; i < selectedRows.length; i++) {
          const geoJsonData = JSON.parse(selectedRows[i].graph)
          mapLeaflet.map.pm.setPathOptions({
            color: geoJsonData.properties.borderColor,
            fillColor: geoJsonData.properties.background,
            fillOpacity: 0.4,
            weight: 2,
            // 航道中间的线条为虚线
            dashArray: areaType === 'yaw' ? [5, 5] : [0, 0]
          });
          setBorderColor(geoJsonData.properties.borderColor)
          setBackground(geoJsonData.properties.background)
          //单独处理圆形
          if (geoJsonData.properties.subType === 'Circle') {
            let circle = new L.Circle([geoJsonData.geometry.coordinates[1], geoJsonData.geometry.coordinates[0]], {
              radius: geoJsonData.properties.radius,
              color: geoJsonData.properties.borderColor, //颜色
              fillColor: geoJsonData.properties.background,
              fillOpacity: 0.4, //透明度
            });
            circle.addTo(mapLeaflet.map);
            mapLeaflet.map.panTo(circle.getBounds().getCenter())
          } else {
            const areaLayer = L.geoJson(geoJsonData).addTo(mapLeaflet.map)
            mapLeaflet.map.panTo(areaLayer.getBounds().getCenter())
            //边框、背景颜色回显
            areaLayer.setStyle({
              color: geoJsonData.properties.borderColor,
              fillColor: geoJsonData.properties.background,
              fillOpacity: 0.4,
              weight: 2,
              dashArray: areaType === 'yaw' ? [5, 5] : [0, 0]
            })

            /*区分AB面*/
            let currentLayer: any = L.geoJson(geoJsonData)
            if (currentLayer && currentLayer.pm._layers[0].feature.properties.subType === 'Line' && isShowAB) {
              //起始点第一个点
              let startPoint: any = currentLayer.pm._layers[0].feature.geometry.coordinates[0];
              //起始点第二个点
              let endPoint: any = currentLayer.pm._layers[0].feature.geometry.coordinates[1]

              // 线的起点的左边A面
              let lineStartLeft = turf.transformRotate(currentLayer.toGeoJSON(), -30, {
                pivot: [startPoint[0], startPoint[1]]
              });
              // 线的终点的左边B面
              let lineEndLeft = turf.transformRotate(currentLayer.toGeoJSON(), -30, {
                pivot: [endPoint[0], endPoint[1]]
              });

              //取经纬度平均值
              let Aa = (lineStartLeft.features[0].geometry.coordinates[0][0] + lineStartLeft.features[0].geometry.coordinates[1][0]) / 2
              let Ab = (lineStartLeft.features[0].geometry.coordinates[0][1] + lineStartLeft.features[0].geometry.coordinates[1][1]) / 2

              let Ba = (lineEndLeft.features[0].geometry.coordinates[0][0] + lineEndLeft.features[0].geometry.coordinates[1][0]) / 2
              let Bb = (lineEndLeft.features[0].geometry.coordinates[0][1] + lineEndLeft.features[0].geometry.coordinates[1][1]) / 2

              let ASide = L.divIcon({
                html: 'A面',
                className: styles.myIcon
              })
              L.marker([Ab, Aa], { icon: ASide }).addTo(mapLeaflet.map)
              let BSide = L.divIcon({
                html: 'B面',
                className: styles.myIcon
              })
              L.marker([Bb, Ba], { icon: BSide }).addTo(mapLeaflet.map)
            } else if (currentLayer && areaType === 'yaw') {
              // 创建航道
              let layer = mapLeaflet.map.pm.getGeomanLayers()
              let currentLayer: any = _.last(layer)

              let line1 = turf.lineOffset(currentLayer.toGeoJSON(), geoJsonData.areaWidth / 2, { units: 'meters', weight: 2 });
              let line2 = turf.lineOffset(currentLayer.toGeoJSON(), -(geoJsonData.areaWidth / 2), { units: 'meters', weight: 2 });

              setYawObj(JSON.stringify(currentLayer.toGeoJSON()))
              setYawObjLayer(currentLayer)
              setYawWidth(geoJsonData.areaWidth)

              // 航道两边的线，line1,line2 。两条线添加颜色样式
              let line1Layer = L.geoJson(line1).addTo(mapLeaflet.map)
              let line2Layer = L.geoJson(line2).addTo(mapLeaflet.map)
              line1Layer.setStyle({
                color: geoJsonData.properties.borderColor,
                fillColor: geoJsonData.properties.background,
                fillOpacity: 0.4,
                weight: 2,
              })
              line2Layer.setStyle({
                color: geoJsonData.properties.borderColor,
                fillColor: geoJsonData.properties.background,
                fillOpacity: 0.4,
                weight: 2,
              })
              line1Layer.pm.enable({
                allowEditing: false
              });
              line2Layer.pm.enable({
                allowEditing: false
              });

              // 航道两边的实线
              setLineA(line1)
              setLineB(line2)

              // line1和line2拼成多边形
              let latlngs = [...line1.geometry.coordinates, ...line2.geometry.coordinates.reverse()];
              // 经纬度反转
              let latlngsReverse = []
              for (let i = 0; i < latlngs.length; i++) {
                latlngsReverse.push([latlngs[i][1], latlngs[i][0]])
              }

              // 航道多边形
              let polygon = L.polygon(latlngsReverse)
              // polygon.addTo(mapLeaflet.map)
              // mapLeaflet.map.fitBounds(polygon.getBounds())
              // console.log(polygon.toGeoJSON())
              setYawPolyGeoJSON(polygon.toGeoJSON())

              // 航道入口线段
              let newLine1 = JSON.parse(JSON.stringify(line1))
              let newLine2 = JSON.parse(JSON.stringify(line2))

              let line1Start = newLine1.geometry.coordinates[0].reverse();
              let line1End = newLine1.geometry.coordinates[newLine1.geometry.coordinates.length - 1].reverse();
              let line2Start = newLine2.geometry.coordinates[0].reverse();
              let line2End = newLine2.geometry.coordinates[newLine2.geometry.coordinates.length - 1].reverse();

              let lineC = L.polyline([line1Start, line2End])
              let lineD = L.polyline([line1End, line2Start])
              setLineC(lineC.toGeoJSON())
              setLineD(lineD.toGeoJSON())

            }
          }
        }
      }
    })
    return () => {
      if (mapLeaflet) {
        const layers = mapLeaflet.map.pm.getGeomanLayers()

        layers.forEach((ele: any) => {
          ele.pm.remove()
        });
      }
    }
  }, [rowKeys, mapLeaflet, isShowAB, areaType]);

  const toolsRight = [
    [areaType === 'line' ? '新增线条' : areaType === 'yaw' ? '新增航道' : '新增区域', {
      onClick() {
        setId(null)
        setName('')
        setIsAdd(true)
        clearLayers()
        setRowKeys([])
        setBackground('#3388ff')
        setBorderColor('#3388ff')
      }
    }]
  ]


  function clearLayers() {
    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      layers.forEach((ele: any) => {
        ele.pm.remove()
      });
    }
  }


  const inputs = [
    ['区域名称', 'areaName', {
      placeholder: '输入区域名称',
      style: {
        width: '120px'
      }
    }]
  ]
  const columns = [
    [areaType === 'line' ? '线条名称' : areaType === 'yaw' ? '航道名称' : '区域名称', 'name'],
    [
      ['编辑', (record: any) => {
        if (mapLeaflet) {
          setId(record.id)
          setName(record.name)
          setIsAdd(true)
          clearLayers()
          setRowKeys([record.id])
        }
      }],
      ['删除', async (record: any) => {
        try {
          await deleteAreaServe(record.id)
          tableRef.current.onRefresh()
          message.success(`删除[${record.name}]成功`);
        } catch (error) {
          // message.error('删除区域异常');
        }
      }, ActionType.confirm]
    ]
  ]


  // 取消新增
  function handleCancel() {
    setIsAdd(false)
    clearLayers()
  }

  //新增
  async function handleAdd() {
    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      if (name && layers.length > 0) {
        let layer: any = _.first(layers)
        let shape = layer.pm._shape
        let type = '1';
        switch (shape) {
          case 'Rectangle':
            type = '3'
            break;
          case 'Circle':
            type = '2'
            break;
          case 'Polygon':
            type = '4'
            break;
          case 'Line':
            areaType === 'line' ? type = '1' : type = '5'
            // type = '1';
            //当时线条的时候，layer中有三个元素，线条和AB两面，取第一个线条
            /* if (areaType === 'line') {
              layer = layers[0]
            } else if (areaType === 'yaw') {
              layer = layers
            } */
            layer = layers[0]
            break;
        }
        if (layer) {
          const geoJson = layer.toGeoJSON()
          if (shape === "Circle") {
            geoJson.properties.subType = layer.pm._shape
            geoJson.properties.radius = layer._mRadius
          } else if (shape === "Line") {
            geoJson.properties.subType = layer.pm._shape
          }
          geoJson.properties.borderColor = borderColor
          geoJson.properties.background = background

          let dto: any
          if (areaType === 'yaw') {
            geoJson.areaWidth = yawWidth;
            geoJson.graphJson = yawPolyGeoJSON;
            geoJson.lineA = lineA;
            geoJson.lineB = lineB;
            geoJson.lineC = lineC;
            geoJson.lineD = lineD;
            dto = {
              name,
              graph: JSON.stringify(geoJson),
              type: type,
              ...extraParams
            }
          } else {
            dto = {
              name,
              graph: JSON.stringify(geoJson),
              type: type,
              ...extraParams
            }
          }

          if (id) {
            dto.id = id
            await editAreaServe(dto)
          } else {
            await addAreaServe(dto)
          }
          /*clearLayers()
          setIsAdd(false)*/
          setIsAdd(false)
          tableRef.current.onRefresh()
          if (id) {
            message.success('编辑成功');
          } else {
            message.success('新增成功');
          }
          clearLayers()

        } else {
          message.info('请使用工具在地图上创建一个范围')
        }
      } else {
        message.warning('请输入名称和绘画区域');
      }
    }
  }




  // 单选/多选
  function handleRowRadio(selectedRowKeys: any[], selectedRows: any[]) {
    //选中了两个或两个以上，需要把新增或者编辑关闭才合理
    if (selectedRowKeys.length > 1) {
      setIsAdd(false)
    }
    setRowKeys(selectedRowKeys)
    onChange && onChange(selectedRows)
  }

  function handleName(evt: any) {
    setName(evt.target.value)
  }

  function handleYawWidth(evt: any) {
    // 新增时，改变航道宽，重新绘制
    if (mapLeaflet && yawObj) {

      const layers = mapLeaflet.map.pm.getGeomanLayers()
      layers.forEach((ele: any) => {
        ele.pm.remove()
      });

      let areaLayer = L.geoJson(JSON.parse(yawObj)).addTo(mapLeaflet.map)
      areaLayer.setStyle({
        color: borderColor,
        fillColor: background,
        fillOpacity: 0.4,
        weight: 2,
        // 航道中间的线条为虚线
        dashArray: areaType === 'yaw' ? [5, 5] : [0, 0]
      });
      setYawObjLayer(areaLayer)


      let layer = mapLeaflet.map.pm.getGeomanLayers()
      let line: any = _.last(layer)

      let line1 = turf.lineOffset(line.toGeoJSON(), evt.target.value / 2, { units: 'meters', weight: 2 });
      let line2 = turf.lineOffset(line.toGeoJSON(), -(evt.target.value / 2), { units: 'meters', weight: 2 });

      let line1Layer = L.geoJson(line1).addTo(mapLeaflet.map)
      let line2Layer = L.geoJson(line2).addTo(mapLeaflet.map)
      line1Layer.setStyle({
        color: borderColor,
        fillColor: background,
        fillOpacity: 0.4,
        weight: 2,
      })
      line2Layer.setStyle({
        color: borderColor,
        fillColor: background,
        fillOpacity: 0.4,
        weight: 2,
      })
      line1Layer.pm.enable({
        allowEditing: false
      });
      line2Layer.pm.enable({
        allowEditing: false
      });

      // 航道两边的实线
      setLineA(line1)
      setLineB(line2)

      // line1和line2拼成多边形
      let latlngs = [...line1.geometry.coordinates, ...line2.geometry.coordinates.reverse()];
      // 经纬度反转
      let latlngsReverse = []
      for (let i = 0; i < latlngs.length; i++) {
        latlngsReverse.push([latlngs[i][1], latlngs[i][0]])
      }

      // 航道多边形
      let polygon = L.polygon(latlngsReverse)
      // polygon.addTo(mapLeaflet.map)
      // mapLeaflet.map.fitBounds(polygon.getBounds())
      // console.log(polygon.toGeoJSON())
      setYawPolyGeoJSON(polygon.toGeoJSON())

      // 航道入口线段
      let newLine1 = JSON.parse(JSON.stringify(line1))
      let newLine2 = JSON.parse(JSON.stringify(line2))

      let line1Start = newLine1.geometry.coordinates[0].reverse();
      let line1End = newLine1.geometry.coordinates[newLine1.geometry.coordinates.length - 1].reverse();
      let line2Start = newLine2.geometry.coordinates[0].reverse();
      let line2End = newLine2.geometry.coordinates[newLine2.geometry.coordinates.length - 1].reverse();

      let lineC = L.polyline([line1Start, line2End])
      let lineD = L.polyline([line1End, line2Start])
      setLineC(lineC.toGeoJSON())
      setLineD(lineD.toGeoJSON())
    }

    setYawWidth(evt.target.value)
  }

  //修改图形背景颜色
  function changeBackground(e: any) {
    if (mapLeaflet) {
      const map = mapLeaflet.map
      setBackground(e.target.value)
      map.pm.setPathOptions({
        color: borderColor,
        fillColor: e.target.value,
        fillOpacity: 0.4,
        weight: 2,
        // 航道中间的线条为虚线
        dashArray: areaType === 'yaw' ? [5, 5] : [0, 0]
      });

      const layers = mapLeaflet.map.pm.getGeomanLayers()
      const layer: any = _.first(layers)
      layer.setStyle({
        fillColor: e.target.value,
        fillOpacity: 0.4
      })
    }
  }

  //修改边框颜色
  function changeBorderColor(e: any) {
    if (mapLeaflet) {
      const map = mapLeaflet.map
      setBorderColor(e.target.value)
      map.pm.setPathOptions({
        color: e.target.value,
        fillColor: background,
        fillOpacity: 0.4,
        weight: 2,
        // 航道中间的线条为虚线
        dashArray: areaType === 'yaw' ? [5, 5] : [0, 0]
      });

      const layers = mapLeaflet.map.pm.getGeomanLayers()
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
      <section className={styles.mapBox}>
        <div className={styles.map} ref={mapRef} />
      </section>
      <aside className={styles.tableBox}>
        <TableInterface
          ref={tableRef}
          columns={columns}
          queryInputs={inputs}
          extraParams={{ type: chooseType, ...extraParams }}
          request={getAreaTable}
          tools={toolsRight}
          tableProps={{
            size: 'small',
            rowSelection: {
              type: isMultiple ? 'checkbox' : 'radio',
              // type: isMultiple ? 'radio' : 'checkbox',
              onChange: handleRowRadio,
              selectedRowKeys: rowKeys,
              preserveSelectedRowKeys: true
            }
          }}
          paginationProps={{
            size: 'small',
            showQuickJumper: false,
            showSizeChanger: false
          }} />
      </aside>
      {isAdd &&
        <aside className={styles.addPanel}>
          <Space>
            {id ? <span>编辑</span> : <span>新增</span>}

            <Input placeholder={areaType === 'line' ? '请输入线条名称' : areaType === 'yaw' ? '请输入航道名称' : '请输入区域名称'} value={name} onChange={handleName} />

            {areaType === 'yaw' && <>航道宽：<Input placeholder="航道宽" value={yawWidth} onChange={handleYawWidth} suffix="米" /></>}

            {areaType === 'area' && <>填充：<input type='color' value={background} onChange={changeBackground} /></>}

            边框：<input type='color' value={borderColor} onChange={changeBorderColor} />

            <Button onClick={handleCancel}>取消</Button>
            <Button onClick={handleAdd} type="primary">确认</Button>
          </Space>
        </aside>
      }
    </article>
  )
}

export default AreaSelect
