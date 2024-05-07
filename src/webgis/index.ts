import { MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import CommonMarker, { CreateProps as MarkerProps } from "./extendUntils/layer/CommonMarker";
import ShipMarker, { CreateProps as ShipMarkerProps } from "./extendUntils/layer/ShipMarker";
import MoveMarker, { CreateProps as MoveMarkerProps } from "./extendUntils/layer/MoveMarker";
import ShipTrailMarker, { CreateProps as ShipTrailMarkerProps } from "./extendUntils/layer/ShipTrailMarker";
import GraphicDrawing, { GraphicProps } from "./extendUntils/layer/GraphicDrawing";
import CircleMarker, { CreateProps as CircleMarkerProps } from "./extendUntils/layer/CircleMarker";
import HtmlPopup, { CreateProps as HtmlPopupProps } from "./extendUntils/layer/HtmlPopup";
import InfoMarker, { CreateProps as InfoMarkerProps } from "./extendUntils/layer/InfoMarker";
import PolylineDecorator, { Options as PolylineDecoratorProps } from "./extendUntils/layer/PolylineDecorator";
import CanvasPane from "./extendUntils/layer/CanvasPane";
import { Latlngs } from "./webgis";
import Ruler from "./extendUntils/tool/Ruler";
import Area, { AreaToolOptions, DrawType } from "./extendUntils/tool/Area";
import Text, { TextToolOptions } from "./extendUntils/tool/Text";
import Pin, { PinToolOptions } from "./extendUntils/tool/Pin";


interface MinMapOptions {
  /**
   * 地图静态瓦片资源地址
   */
  mapUrl: string;
  /**
   * 小地图crs参数
   */
  crsType: MapType;
}

interface Config {
  /**
   * 小地图配置项，当传入此配置项时展示小地图
   */
  minMap?: MinMapOptions;
}

export interface MapOptions {
  /**
   * 自定义参数
   */
  config?: Config;
  /**
   * leaflet配置项原始参数
   */
  [key: string]: any;
}

export interface IMapLeaflet {
  /**
   * 地图实例化所依赖的元素
   */
  ele: HTMLElement;
  /**
   * 实例化地图时配置的地图类型
   */
  options: MapOptions;
}

class WebGis implements IMapLeaflet {
  /** L.map() 返回的地图实例 */
  public map: any;

  readonly ele: HTMLElement;
  readonly options: MapOptions;

  private shipMarker: ShipMarker;
  private commonMarker: CommonMarker;
  private htmlPopup: HtmlPopup;
  private infoMarker: InfoMarker;
  private polylineDecorator: PolylineDecorator

  constructor(ele: HTMLElement, options: MapOptions) {
    this.ele = ele;
    this.options = options;
    const { config, ...mapOptions } = this.options;
    // 地图坐标系
    this.map = L.map(this.ele, mapOptions);
    // 小地图
    if (config?.minMap) {
      new L.Control.MiniMap(
        getMapOffLineDate(config.minMap.crsType, config.minMap.mapUrl),
        {
          toggleDisplay: true,
        }
      ).addTo(this.map);
    }

    this.shipMarker = new ShipMarker(this.map)
    this.commonMarker = new CommonMarker(this.map)
    this.htmlPopup = new HtmlPopup(this.map)
    this.infoMarker = new InfoMarker(this.map)
    this.polylineDecorator = new PolylineDecorator(this.map)
  }


  /** 创建自定义点 */
  createMarker = (props: MarkerProps) => this.commonMarker.create(props)
  /** 创建自定义点集合图层 */
  createMarkerGroup = (props: MarkerProps[]) => this.commonMarker.createGroup(props)
  /** 创建轨迹上面画箭头 */
  createPolylineDecorator = (latlngs: Latlngs, opt?: PolylineDecoratorProps) => this.polylineDecorator.create(latlngs, opt)

  /**
   * 创建船舶
   * @param props ShipMarker CreateProps
   * @returns L.trackSymbol
   */
  createShip = (props: ShipMarkerProps) => this.shipMarker.create(props)
  /** 批量创建船舶 */
  createShipGroup = (props: ShipMarkerProps[]) => this.shipMarker.createGroup(props)


  /** 创建圆点标记 */
  createCircleMarker = (props: CircleMarkerProps) => new CircleMarker(this.map).create(props)
  /** 创建圆点标记集合图层 */
  createCircleMarkerGroup = (props: CircleMarkerProps[]) => new CircleMarker(this.map).createGroup(props)


  // 创建绘制移动标记
  createMoveMarker = (props: MoveMarkerProps) => new MoveMarker(this.map).create(props)


  // 创建船舶尾迹图层
  createShipTrailMarker = (props: ShipTrailMarkerProps) => new ShipTrailMarker(this.map).create(props)


  // 创建图形绘制与工具
  createGraphicDrawing = (options?: GraphicProps) => new GraphicDrawing(this.map).create(options)

  createHtmlPopup = (props: HtmlPopupProps) => this.htmlPopup.create(props)


  /** 创建信息标记 */
  createInfoMarker = (props: InfoMarkerProps) => this.infoMarker.create(props)

  /** 创建画布图层 */
  createCanvasPane = () => new CanvasPane(this.map)

  /** 创建测距工具 */
  createRulerTool = () => new Ruler(this.map).open()

  /** 创建测面积工具 */
  createAreaTool = (type: DrawType, opt?: AreaToolOptions) => new Area(this.map).open(type, opt)

  /** 创建文本工具 */
  createTextTool = (props: TextToolOptions) => new Text(this.map).open(props)

  /** 图钉 */
  createPinTool = (props: PinToolOptions) => new Pin(this.map).open(props)

  /** map.remove() 的快捷函数 */
  remove() {
    this.map.remove();
  }

  /** map.on('zoom', handle) 的快捷函数 */
  onZoom(handle: (evt: any) => void) {
    this.map.on('zoom', handle)
  }

  /** map.off('zoom', handle) 的快捷函数 */
  offZoom(handle: (evt: any) => void) {
    this.map.off('zoom', handle)
  }
}

export default WebGis;
