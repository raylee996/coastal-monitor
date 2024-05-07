import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.sass";

interface Props {
  /** 设置值 */
  value?: any[]
  /** 值更新回调 */
  onChange?: (values: any[]) => void
  /** 关闭popup */
  onClosePopup?: Function
}

export type LatLng = { lat: number; lng: number; }

let myGroup: any;

const ChoosePointLatLng: React.FC<Props> = ({ value, onChange, onClosePopup }) => {
  console.debug('ChoosePointLatLng')

  const mapRef = useRef<HTMLDivElement>(null)

  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>()

  const [latLng, setLatLng] = useState<LatLng>(value?.length && value[0])

  // 地图实例化
  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.SatelliteMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs })
      getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
      setMapLeaflet(_mapLeaflet)
      // 监听地图点击事件
      _mapLeaflet.map.on('click', function (ev: any) {
        myGroup && myGroup.clearLayers()
        console.log(ev.latlng, 'ev.latlng')
        if (ev?.latlng) {
          ev.latlng.lat = ev.latlng.lat?.toFixed(6)
          ev.latlng.lng = ev.latlng.lng?.toFixed(6)
        }
        ev?.latlng && setLatLng(ev.latlng)
      })

      _mapLeaflet.map.on("popupopen", (ev1: any) => {
        let popupEle = ev1.popup.getElement();
        let ss = popupEle.querySelector('.detail-button');
        ss.addEventListener("click", (ev: any) => {
          handClick()
        })
      });
    }
    return () => {
      _mapLeaflet?.map?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (mapLeaflet && latLng?.lat && latLng?.lng) {
      const marker = mapLeaflet.createMarker({
        markerId: 0, latLng: [latLng.lat, latLng.lng]
      }).bindPopup(`<div>经纬度：${latLng.lat},${latLng.lng} <Button class="detail-button">地图选择</Button></div>`).addTo(mapLeaflet.map);
      marker.openPopup()
      // 将marker放入layer管理
      myGroup = L.layerGroup([marker]);
      mapLeaflet.map.addLayer(myGroup)
      onChange && onChange([latLng])
    }
  }, [latLng, mapLeaflet, onChange])

  function handClick() {
    onClosePopup && onClosePopup()
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.mapBox} ref={mapRef}></div>
    </article>
  )
}

export default ChoosePointLatLng