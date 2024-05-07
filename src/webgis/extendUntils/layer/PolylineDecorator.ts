import { Latlngs } from "webgis/webgis";



export interface Options {
  /** 插件原始配置项 */ 
  patterns?: any
  /** 折线原始配置项 */
  options?: any
}

class PolylineDecorator {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create(latlngs: Latlngs,opt?:Options) {
    // const line = L.polyline(latlngs, { color: 'red', weight: 1,...opt?.options })
    const line = L.polyline(latlngs, { color: 'rgba(0,0,0,0)', weight: 0 })
    const polylineDecorator = L.polylineDecorator(line, {
      patterns: [
        {
          offset: 10,
          endOffset: 5,
          repeat: 50,
          symbol: L.Symbol.arrowHead({
            pixelSize: 8,
            headAngle: 60,
            polygon: false,
            pathOptions: {
              stroke: true,
              weight: 1,
              color: 'red'
            }
          }),
          ...opt?.patterns
        }
      ]
    })
    polylineDecorator.on('add',()=>{
      line.addTo(this.map)
    })
    polylineDecorator.on('remove',()=>{
      line.remove()
    })
    return polylineDecorator
  }

}

export default PolylineDecorator;
