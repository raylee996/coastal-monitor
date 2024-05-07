type HandleDraw = (info: {
  layer: any
  canvas: HTMLCanvasElement
}) => void

class CanvasPane {
  readonly map: any;

  private pane: any
  private canvasLayer: any
  private drawList: HandleDraw[] = []

  constructor(_map: any) {
    this.map = _map;
    this.pane = this.map.getPane('OverlayPane')

    const onDrawLayer: HandleDraw = (info) => {
      this.clearContent()
      this.drawList.forEach(fn => fn(info))
    }

    this.canvasLayer = L.canvasLayer({ pane: this.pane }).delegate({
      onDrawLayer
    })

    this.canvasLayer.addTo(this.map)
  }

  addDrawFn(fn: HandleDraw) {
    try {
      this.drawList.push(fn)
      this.canvasLayer.drawLayer()
    } catch (error) {
      console.error('addDrawFn', error)
    }
  }

  delDrawFn(fn: HandleDraw) {
    try {
      const idx = this.drawList.findIndex(item => item === fn)
      this.drawList.splice(idx, 1)
      this.canvasLayer.drawLayer()
    } catch (error) {
      console.error('delDrawFn', error)
    }
  }

  clearDrawFn() {
    this.drawList = []
  }

  clearContent() {
    const canvas = this.canvasLayer._canvas
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  clear() {
    this.clearDrawFn()
    this.clearContent()
  }

  getCanvasElement() {
    return this.canvasLayer._canvas
  }

  remove() {
    this.canvasLayer.remove()
  }

}

export default CanvasPane