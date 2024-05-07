export interface CreateProps {
  /** 当使用更新创建时，使用的唯一标识 */
  markerId?: string | number
  /** 经纬度 */
  latLng: number[] | { lat: number, lng: number };
  /** leafletjs marker Options */
  markerOptions?: any
  /** 额外数据 */
  extraData?: any
  /** circleMarker options */ 
  circleMarkerOptions?:any
}

class CommonMarker {
  readonly map: any;
  readonly LeafIcon: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create(props: CreateProps) {
    const { latLng, extraData, circleMarkerOptions, ...otherProps} = props;
    if (otherProps.markerOptions) {
      return L.marker(latLng, {
        extraData,
        ...otherProps.markerOptions
      });
    } else {
      return L.circleMarker(latLng, {
        pane: 'markerPane',
        radius: 4,
        fillColor: '#f5222d',
        fillOpacity: 1,
        weight: 0,
        extraData,
        ...circleMarkerOptions
      })
    }
  }

  createGroup(props: CreateProps[]) {
    let markArr = props.map((v) => this.create(v));
    return L.featureGroup(markArr).addTo(this.map);
  }

}

export default CommonMarker;
