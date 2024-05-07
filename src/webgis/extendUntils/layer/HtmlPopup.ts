import './HtmlPopup.css';

export interface CreateProps {
  /** 经纬度 */
  latLng?: number[] | { lat: number, lng: number };
  /** 内容 */
  content: HTMLElement
  /** Popup options */
  options?: any
  /** 额外数据 */
  extraData?: any
}

class HtmlPopup {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create(props: CreateProps) {

    const options = {
      offset: [0, 0],
      autoPanPadding: [0, 0],
      closeOnClick: false,
      closeButton: false,
      className: 'webgis__layer_HtmlPopup',
      minWidth: 0,
      extraData: props.extraData,
      ...props.options,
    }

    return L.popup(options).setLatLng(props.latLng).setContent(props.content);
  }

}

export default HtmlPopup;
