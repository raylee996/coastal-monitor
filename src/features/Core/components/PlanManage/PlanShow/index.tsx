import React, { useCallback, useEffect, useRef, useState } from "react";
import CoastalMonitorWebgis from "../../../../../helper/map";
import { getCRSByMapType, MapType } from "../../../../../helper/map/crsUtil";
import getMapOffLineDate from "../../../../../helper/map/getMap";
import styles from "./index.module.sass";
import { Button } from "antd";
import { playPlanAsync } from "../../../../../server/core/planManage";
import markerIcon from "images/core/wisdomCommand/markerIcon.svg";
import _ from "lodash";
import { getAreaListByIds } from "server/core/controlManage";
import { getModelDetailAsync } from "server/core/model";
import VideoSimple from "component/VideoSimple";
import shipImg from './planShip.png'

interface Props {
  onClosePopup?: Function
  id?: number | string
  // 模型ID
  modelId?: number | string
  //事件集合
  totalItem?: any[]
}
//预案演示
const PlanShow: React.FC<Props> = ({ onClosePopup, id, totalItem, modelId }) => {
  console.debug('预案演示')
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>();

  //上一步下一步总数据
  const [totalItems, setTotalItems] = useState<any>([])
  //当前item
  const [currentItem, setCurrentItem] = useState<any>({});
  //当前index
  const [currentIndex, setCurrentIndex] = useState(0);
  //位置信息
  const [positionData, setPositionData] = useState<any>([]);
  //另一条船的位置信息
  const [cooperateShipPosition, setCooperateShipPosition] = useState<any>([])

  const [curentVideo, setCurentVideo] = useState<any>()

  // 获取视频源， 渔人码头光电设备   10：34-10：36 这段设备放到预案演示
  useEffect(() => {
    async function main() {
      setCurentVideo({
        startTime: '2023-05-17 10:34:00',
        endTime: '2023-05-17 10:36:11',
        deviceChannelCode: '44030500101325547225',
        deviceCode: '44030500101325247225',
      })
    }
    main()
  }, [])

  // 获取模型区域,划区域图形
  useEffect(() => {
    const layers: any[] = []
    async function main() {
      if (mapLeaflet) {
        let nodes: any[] = []
        if (totalItem) {
          nodes = _.cloneDeep(totalItem)
        } else {
          //获取节点
          await getModelDetailAsync(modelId).then(res => {
            nodes = _.cloneDeep(JSON.parse(res.modelJson).eventParams)
          })
        }

        // 获取所有区域
        let ids: number[] = []
        nodes.forEach(item => {
          if (item.attributeJson.areaId) {
            ids = ids.concat(item.attributeJson.areaId)
          }
          if (item.attributeJson.lineId) {
            ids = ids.concat(item.attributeJson.lineId)
          }
        })

        if (ids.length !== 0) {

          ids = _.uniq(ids)
          const idsStr = ids.toString()
          const allArea = await getAreaListByIds(idsStr)

          // 根据区域大小排序区域、避免大区域覆盖小区域从而无法点击小区域
          allArea.forEach(item => {
            const graphObj = JSON.parse(item.graph)
            item.graphObj = graphObj
            if (graphObj.geometry.type === 'Polygon') {
              item.layerType = 'Polygon'
              const [target] = graphObj.geometry.coordinates
              const pointList = target.map(([lng, lat]: any[]) => [lat, lng])
              const polygon = turf.polygon([pointList]);
              item.size = turf.area(polygon)
            } else if (graphObj.properties.subType === 'Circle') {
              item.layerType = 'Circle'
              item.size = 3.14 * graphObj.properties.radius * graphObj.properties.radius
            } else if (graphObj.properties.subType === 'Line') {
              item.layerType = 'Line'
              item.size = 1
            }
          })
          const areaList = allArea.sort((a, b) => b.size - a.size)

          areaList.forEach(item => {
            let layer: any

            if (item.layerType === 'Circle') {
              layer = new L.Circle([item.graphObj.geometry.coordinates[1], item.graphObj.geometry.coordinates[0]], {
                radius: item.graphObj.properties.radius,
              })
            } else {
              layer = L.geoJson(item.graphObj)
            }
            const nodeList = _.filter(nodes, ele => ele.attributeJson.areaId?.includes(item.id) || ele.attributeJson.lineId?.includes(item.id))

            layer.options.nodeList = nodeList
            layer.options.area = item
            layer.addTo(mapLeaflet.map)
            layers.push(layer)
          })

        }
      }
    }
    main()
    return () => {
      layers.forEach(layer => layer.remove())
    }
  }, [mapLeaflet, totalItem, modelId, currentIndex])

  //渲染线条上的节点和标签
  const renderPositionLabel = useCallback((latLng: any, item?: any) => {
    if (mapLeaflet) {
      // 绘制标识点
      mapLeaflet.createMarker({
        markerId: 1,
        latLng: latLng,
        markerOptions: {
          icon: L.icon({
            iconUrl: markerIcon,
            iconSize: [20, 20],
            markerColor: 'red'
          })
        }
      }).addTo(mapLeaflet.map)

      if (item) {
        // 绘制标识内容
        mapLeaflet.createInfoMarker({
          latLng: latLng,
          content: <article className={styles.infoWrapper}>
            <div>速度：{item.speed}节</div>
            <div>经纬度：{item.latitude.toFixed(6)},{item.longitude.toFixed(6)}</div>
            <div>预警内容：{item.warnContent || item.sourceEventName}</div>
          </article>,
          lineColor: '#00f4fa',
          position: 'bottomRight'
        }).addTo(mapLeaflet.map)
      } else {
        // 另一条船
        mapLeaflet.createInfoMarker({
          latLng: latLng,
          content: <article className={styles.infoWrapper}>
            <div>经纬度：{latLng[0].toFixed(6)},{latLng[1].toFixed(6)}</div>
            <div>预警内容：两船靠泊</div>
          </article>,
          lineColor: '#00f4fa',
        }).addTo(mapLeaflet.map)
      }

    }
  },
    [mapLeaflet],
  );


  //获取上一步下一步节点总数
  useEffect(() => {
    async function main() {
      if (mapLeaflet) {
        let polyline: any
        let res: any = await playPlanAsync({ id })
        let list = res.data.radarTable

        if (list && list.length > 0) {
          setTotalItems(list)
          setCurrentItem(list[0])
          let position = [];
          for (let i = 0; i < list.length; i++) {
            position.push([list[i].latitude, list[i].longitude])
          }

          //添加线条，首个点
          polyline = L.polyline([position[0]], { color: '#00f4fa', dashArray: '5,10' }).addTo(mapLeaflet.map);
          //该图形位于地图居中
          mapLeaflet.map.fitBounds(polyline.getBounds(), { maxZoom: 13 });
          setPositionData(position)
          //渲染行为标签
          renderPositionLabel(position[0], list[0])

          // 另一条船
          let cooperatePosition = [];
          for (let i = 0; i < list.length; i++) {
            if (list[i].cooperateShip) {
              cooperatePosition.push([list[i].cooperateShip.lat, list[i].cooperateShip.lon])
            } else {
              cooperatePosition.push(null)
            }
          }
          // 另一条船的位置
          setCooperateShipPosition(cooperatePosition)
          /* 
                    if (list[0].cooperateShip) {
                      for (let i = 0; i < list.length; i++) {
                        cooperatePosition.push([list[i].cooperateShip.lat, list[i].cooperateShip.lon])
                      }
                      // 另一条船
                      L.polyline([cooperatePosition[0]], { color: '#00f4fa', dashArray: '5,10' })
                      // 另一条船的位置
                      setCooperateShipPosition(cooperatePosition)
                    } */
        }
      }
    }
    if (id) {
      main()
    }
  }, [id, mapLeaflet, renderPositionLabel]);

  //渲染地图
  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.SatelliteMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs, keyboard: false })
      getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [])

  //上一步
  const prevBtn = useCallback(() => {
    if (currentIndex === 0) {
      return
    }
    let prevItem = totalItems[currentIndex - 1]
    setCurrentIndex(currentIndex - 1)
    setCurrentItem(prevItem)
    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      layers.forEach((ele: any) => {
        ele.pm.remove()
      });
      let position = positionData.slice(0, currentIndex)
      L.polyline(position, { color: '#00f4fa', dashArray: '2,4', weight: 2 }).addTo(mapLeaflet.map);
      mapLeaflet.map.panTo(position[position.length - 1], { maxZoom: 13 });
      //渲染行为标签
      renderPositionLabel(position[position.length - 1], prevItem)

      // 另一条船
      if (cooperateShipPosition.length > 0) {
        let cooperatePosition = cooperateShipPosition.slice(0, currentIndex)
        let newPosition = cooperatePosition.filter((item: any) => {
          return item !== null
        })
        L.polyline(newPosition, { color: '#00f4fa', dashArray: '2,4', weight: 2 }).addTo(mapLeaflet.map);
        //渲染另一条船行为标签
        renderPositionLabel(cooperatePosition[cooperatePosition.length - 1])
      }

    }
  }, [cooperateShipPosition, currentIndex, mapLeaflet, positionData, renderPositionLabel, totalItems])
  //下一步
  const nextBtn = useCallback(() => {
    if (currentIndex + 1 === totalItems.length) {
      return
    }
    let nextItem = totalItems[currentIndex + 1]
    setCurrentIndex(currentIndex + 1)
    setCurrentItem(nextItem)

    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      layers.forEach((ele: any) => {
        ele.pm.remove()
      });

      let position = positionData.slice(0, currentIndex + 2)
      L.polyline(position, { color: '#00f4fa', dashArray: '2,4', weight: 2 }).addTo(mapLeaflet.map);
      mapLeaflet.map.panTo(position[position.length - 1], { maxZoom: 13 });
      //渲染行为标签
      renderPositionLabel(position[position.length - 1], nextItem)

      // 另一条船
      if (cooperateShipPosition.length > 0) {
        let cooperatePosition = cooperateShipPosition.slice(0, currentIndex + 2)
        let newPosition = cooperatePosition.filter((item: any) => {
          return item !== null
        })
        L.polyline(newPosition, { color: '#00f4fa', dashArray: '2,4', weight: 2 }).addTo(mapLeaflet.map);
        //渲染另一条船行为标签
        renderPositionLabel(cooperatePosition[cooperatePosition.length - 1])
      }
    }
  }, [cooperateShipPosition, currentIndex, mapLeaflet, positionData, renderPositionLabel, totalItems])

  // 键盘方向键
  useEffect(() => {
    function nextBtnByKeyboard(e: any) {
      if (e.keyCode === 39 || e.keyCode === 40) {
        nextBtn()
      } else if (e.keyCode === 37 || e.keyCode === 38) {
        prevBtn()
      }
    }
    document.addEventListener('keydown', nextBtnByKeyboard)
    return () => {
      document.removeEventListener('keydown', nextBtnByKeyboard)
    }
  }, [nextBtn, prevBtn])

  //关闭
  function handleClose() {
    onClosePopup && onClosePopup()
  }

  return <div className={styles.wrapper}>
    {/*地图*/}
    <div className={styles.map} ref={mapRef} />

    {/* 右侧弹窗 */}
    <div className={styles.preview}>
      <p className={styles.title}>{currentItem.warnContent || currentItem.sourceEventName}</p>
      <div className={styles.sourceSrc}>
        <VideoSimple getVideoParams={curentVideo} posterImage={shipImg} isAutoPlay={true} />
      </div>
    </div>

    {/*底部按钮*/}
    <div className={styles.bottom}>
      {currentIndex > 0 && <Button type={"primary"} onClick={prevBtn}>上一步</Button>}
      <Button type={"default"} onClick={handleClose}>关闭</Button>
      {currentIndex < totalItems.length - 1 && <Button type={"primary"} onClick={nextBtn}>下一步</Button>}
    </div>
  </div>
}

export default PlanShow
