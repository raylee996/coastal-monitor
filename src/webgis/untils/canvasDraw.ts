import { dmsFormatter } from "."
import WebGis from ".."


export interface CircleParams {
  /** 园中心点经纬度坐标 */
  latLng: { lat: number, lng: number }
  /** 像素半径 */
  radius: number
  /** 颜色 */
  color?: string
}

/**
 * 在画布上根据经纬度绘制圆形，支持定制半径与颜色
 * @param params 参数
 * @param canvas 画布元素
 * @param webgis 地图对象
 */
export const createCircle = (params: CircleParams, canvas: HTMLCanvasElement, webgis: WebGis) => {
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const point = webgis.map.latLngToContainerPoint(params.latLng)
    ctx.beginPath()
    ctx.arc(point.x, point.y, params.radius, 0, Math.PI * 2)
    if (params.color) {
      ctx.fillStyle = params.color
    }
    ctx.fill()
  }
}


/**
 * 批量在画布上根据经纬度绘制圆形，支持定制半径与颜色
 * @param params 参数
 * @param canvas 画布元素
 * @param webgis 地图对象
 */
export const createCircleGroup = (params: CircleParams[], canvas: HTMLCanvasElement, webgis: WebGis) => {
  params.forEach(data => createCircle(data, canvas, webgis))
}


export interface LineParams {
  /** 经纬度坐标 */
  latLngList: { lat: number, lng: number }[]
  /** 颜色 */
  color?: string
}

/**
 * 在画布上面绘制线段，支持自定义颜色
 * @param params 
 * @param canvas 
 * @param webgis 
 */
export const createLine = (params: LineParams, canvas: HTMLCanvasElement, webgis: WebGis) => {
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.beginPath()
    ctx.lineWidth = 0.5
    params.latLngList.forEach((latLng, index) => {
      const point = webgis.map.latLngToContainerPoint(latLng)
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    if (params.color) {
      ctx.strokeStyle = params.color
    }
    ctx.stroke()
  }
}


/**
 * 批量在画布上面绘制线段，支持自定义颜色
 * @param params 
 * @param canvas 
 * @param webgis 
 */
export const createLineGroup = (params: LineParams[], canvas: HTMLCanvasElement, webgis: WebGis) => {
  params.forEach(data => createLine(data, canvas, webgis))
}


interface RectParam {
  /** 矩形左上和右下坐标点集合 */
  latlngs: { lat: number, lng: number }[]
  /** 填充演示 */
  color?: string
}

/**
 * 在画布上面绘制矩形，支持自定义颜色
 * @param params 
 * @param canvas 
 * @param webgis 
 */
export const createRect = (params: RectParam, canvas: HTMLCanvasElement, webgis: WebGis) => {
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = params.color || 'green';
    const [topLeft, bottomRight] = params.latlngs
    const pointTL = webgis.map.latLngToContainerPoint(topLeft)
    const pointBR = webgis.map.latLngToContainerPoint(bottomRight)
    const w = pointTL.x - pointBR.x
    const h = pointTL.y - pointBR.y
    ctx.fillRect(pointTL.x, pointTL.y, w, h);
  }
}

/**
 * 批量在画布上面绘制矩形，支持自定义颜色
 * @param params 
 * @param canvas 
 * @param webgis 
 */
export const createRectGroup = (params: RectParam[], canvas: HTMLCanvasElement, webgis: WebGis) => {
  params.forEach(data => createRect(data, canvas, webgis))
}

interface TextParam {
  /** 文本内容 */
  text: string
  /** 经纬度地址 */
  latLng: {
    lat: number
    lng: number
  }
  /** 颜色 */
  color?: string
}

/**
 * 在画布上面绘制问文本
 * @param params 
 * @param canvas 
 * @param webgis 
 */
export const createText = (params: TextParam, canvas: HTMLCanvasElement, webgis: WebGis) => {
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = params.color || 'rgba(0, 0, 0, 0.8)'
    ctx.font = '12px'
    const pixel = webgis.map.latLngToContainerPoint(params.latLng)
    ctx.fillText(params.text, pixel.x, pixel.y);
  }
}

/**
 * 在画布上面绘制经纬度网格
 * @param canvas 
 * @param webgis 
 * @param opt textColor 标记颜色
 */
export const createLatlngGird = (canvas: HTMLCanvasElement, webgis: WebGis, opt?: { textColor?: string }) => {
  const zoom = webgis.map.getZoom()
  const bounds = webgis.map.getBounds()
  const north = bounds.getNorth()
  const east = bounds.getEast()
  // 间隔度数 90，应当为180和90的公约数
  const d = 90 / Math.pow(2, zoom - 1)
  // 经度线
  const lineLngList: number[] = []
  for (let i = -180; i < 360; i += d) {
    if (bounds.contains([north, i])) {
      const lineParams: LineParams = {
        latLngList: [
          { lat: -90, lng: i },
          { lat: 90, lng: i }
        ],
      }
      createLine(lineParams, canvas, webgis)
      lineLngList.push(i)
    }
  }
  // 纬度线
  const lineLatList: number[] = []
  for (let i = -90; i < 90; i += d) {
    if (bounds.contains([i, east])) {
      const lineParams: LineParams = {
        latLngList: [
          { lat: i, lng: -180 },
          { lat: i, lng: 360 }
        ]
      }
      createLine(lineParams, canvas, webgis)
      lineLatList.push(i)
    }
  }
  // 标记
  for (let i = 0; i < lineLatList.length; i++) {
    const lat = lineLatList[i];
    for (let j = 0; j < lineLngList.length; j++) {
      const lng = lineLngList[j];
      const latVal = dmsFormatter(lat, 'ms')
      const lngVal = dmsFormatter(lng, 'ms')
      const textParam: TextParam = {
        text: `${latVal},${lngVal}`,
        latLng: { lat, lng },
        color: opt?.textColor
      }
      createText(textParam, canvas, webgis)
    }
  }
}