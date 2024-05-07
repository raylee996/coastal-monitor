import _ from "lodash"
import WebGis from ".."

interface Item {
  lat?: number
  lng?: number
  latitude?: number
  longitude?: number
}

interface Aggregate extends Item {
  item: Item
  list: Item[]
}

/**
 * 根据范围组装点位，类似聚合图层的效果
 * @param opt pixelRadius 范围检测的像素半径
 * @param cb 
 * @returns 
 */
export const latLngAggregate = (opt: {
  itemList: Item[],
  pixelRadius: number,
  map2d: WebGis,
}, cb: (itemList: Item[], aggregateList: Item[][]) => void) => {
  const _aggregateCache: Aggregate[] = []

  const latLngA = opt.map2d.map.containerPointToLatLng(L.point(0, 0))
  const latLngB = opt.map2d.map.containerPointToLatLng(L.point(opt.pixelRadius, 0))
  const metersRadius = opt.map2d.map.distance(latLngA, latLngB)

  opt.itemList.forEach(item => {

    let isNotAggregate = true
    for (let i = 0; i < _aggregateCache.length; i++) {
      const _aggregate = _aggregateCache[i];
      const metersDistance = opt.map2d.map.distance(_aggregate.item, item)
      if (metersDistance < metersRadius) {
        isNotAggregate = false
        _aggregate.list.push(item)
        break
      }
    }
    if (isNotAggregate) {
      _aggregateCache.push({
        item,
        list: []
      })
    }

  })

  const _itemArray = _.filter(_aggregateCache, item => item.list.length === 0)
  const _aggregateArray = _.filter(_aggregateCache, item => item.list.length !== 0)
  const _itemList = _itemArray.map(item => item.item)
  const _aggregateList = _aggregateArray.map(item => item.list)

  return [_itemList, _aggregateList]
}


/**
 * 将经纬度数值转成度分秒格式
 * @param val 经度或者纬度
 * @param opt dms字符串表示展示的内容
 */
export const dmsFormatter = (val: number, opt?: string) => {
  const ddd = Math.trunc(val)
  const mmVal = val % 1 * 60
  const mm = Math.trunc(mmVal)
  const ssVal = mmVal % 1 * 60
  const ss = Math.trunc(ssVal)
  let result = ''
  if (opt) {
    if (opt.search('d') !== -1) {
      result += `${ddd}°`
    }
    if (opt.search('m') !== -1) {
      result += `${mm}'`
    }
    if (opt.search('s') !== -1) {
      result += `${ss}"`
    }
  } else {
    result = `${ddd}°${mm}'${ss}"`
  }
  return result
}