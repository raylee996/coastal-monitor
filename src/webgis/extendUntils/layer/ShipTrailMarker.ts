import ShipMarker, { CreateProps as ShipMarkerProps } from "./ShipMarker";

type LatLng = [number, number]

export interface CreateProps {
  /** 船舶图层 */
  shipParams: ShipMarkerProps
  /** 尾迹经纬度数组 */
  latLngs: LatLng[]
}

// 船舶尾迹图层
class ShipTrailMarker {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create(props: CreateProps) {
    

    const layerGroup = L.layerGroup()
    layerGroup.setZIndex(9)
    const polyline = L.polyline(props.latLngs, { color: 'red' });
    layerGroup.addLayer(polyline)
    layerGroup.addTo(this.map)
    
    const circleMarkerfeatureGroup = L.featureGroup()
    circleMarkerfeatureGroup.setZIndex(19)
    props.latLngs.forEach(latlng => {
      const circle = L.circleMarker(latlng, { radius: 2 })
      circleMarkerfeatureGroup.addLayer(circle)
    })
    circleMarkerfeatureGroup.addTo(this.map)

    const shipMarkerfeatureGroup = L.featureGroup()
    shipMarkerfeatureGroup.setZIndex(29)
    const shipMarker = new ShipMarker(this.map).create(props.shipParams)
    shipMarkerfeatureGroup.addLayer(shipMarker)
    shipMarkerfeatureGroup.addTo(this.map)

    return [shipMarkerfeatureGroup, circleMarkerfeatureGroup]
  }
}

export default ShipTrailMarker