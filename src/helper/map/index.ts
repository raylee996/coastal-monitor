import Webgis, { MapOptions } from "webgis/index";

class CoastalMonitorWebgis extends Webgis {
  constructor(ele: HTMLElement, config: MapOptions) {
    super(ele, {
      center: [22.490417097439508, 113.90842618520311],
      zoom: 14,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      ...config,
    });
  }
}

export default CoastalMonitorWebgis;
