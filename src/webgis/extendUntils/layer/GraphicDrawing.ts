export interface GraphicProps {
  /** 工具栏放置位置 默认topright */
  position?: string;
  /** 是否启用绘制线条，默认启用 */
  drawPolyline?: boolean
  /** 是否启用绘制多边形 默认启用 */
  drawPolygon?: boolean;
  /** 是否启用绘制矩形 默认启用  */
  drawRectangle?: boolean;
  /** 是否启用绘制编辑 默认启用  */
  editMode?: boolean;
  /** 是否启用清除绘制图形 默认启用  */
  removalMode?: boolean;
  /** 是否启用拖动图形 默认启用  */
  dragMode?: boolean
  /** 是否启用支持剪切 默认不启用 */
  cutPolygon?: boolean
}

class GraphicDrawing {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create(_options?: GraphicProps) {

    let options = {
      drawText: false,
      drawMarker: false,
      drawCircleMarker: false,
      cutPolygon: false,
      position: "topright",
      drawPolyline: true,
      drawPolygon: true,
      drawRectangle: true,
      editMode: true,
      removalMode: true,
    }

    if (_options) {
      options = {
        ...options,
        ..._options
      }
    }

    this.map.pm.setLang("zh");
    this.map.pm.addControls(options);
  }
}

export default GraphicDrawing;
