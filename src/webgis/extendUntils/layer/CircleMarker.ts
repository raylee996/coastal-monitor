export interface CreateProps {
  /** 经纬度 */
  latLng: number[] | { lat: number, lng: number };
  /** leafletjs circleMarker Options */
  options?: any
  /** 额外数据 */
  extraData?: any
}

class CircleMarker {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }
  create({ latLng, extraData, options }: CreateProps) {
    return L.circleMarker(latLng, {
      pane: 'markerPane',
      radius: 4,
      fillColor: '#f5222d',
      fillOpacity: 1,
      weight: 0,
      extraData,
      ...options
    })
  }

  createGroup(props: CreateProps[]) {
    const circleMarkerList = props.map((item) => this.create(item));
    const group = L.featureGroup(circleMarkerList)
    return group.addTo(this.map);
  }
}

export default CircleMarker;
