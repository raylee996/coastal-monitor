import dayjs from "dayjs"
import Map2D from "helper/Map2D"
import _ from "lodash"
import { Latlng, Latlngs } from "webgis/webgis"

// 绘制复杂线 虚实结合
export function createDottedSolidPolyline(map2d: Map2D, markerPolylineList: any[], polylineOptions?: any) {
  // 历史线
  let HistoryPolyline: any = []
  const options = polylineOptions || {}

  // 绘制复杂线 虚实结合
  for (let j = 0; j < markerPolylineList.length; j++) {
    let line: any = ''
    // 只有一个点的情况
    if (markerPolylineList.length === 1) {
      let latLng = [[markerPolylineList[0].lat, markerPolylineList[0].lng]]
      line = L.polyline(latLng, { ...{ color: 'red', weight: 1 }, ...options }).addTo(map2d.map)
      HistoryPolyline.push(line)
    }
    // 大于一个点的情况
    if (markerPolylineList.length > 1 && j < markerPolylineList.length - 1) {
      // 相邻两个点的坐标
      let latLng: Latlngs = [
        [markerPolylineList[j].lat, markerPolylineList[j].lng],
        [markerPolylineList[j + 1].lat, markerPolylineList[j + 1].lng],
      ]
      // 两点之间的时间大于30分钟，使用虚线
      if (dayjs(markerPolylineList[j].datetime).diff(markerPolylineList[j + 1].datetime, 'minute') > 30) {
        line = L.polyline(latLng, {
          ...{
            color: 'red',
            weight: 1,
            dashArray: '2,4'
          }, ...options
        }).addTo(map2d.map)
      } else {
        const distance = map2d.map.distance(latLng[0], latLng[1])
        if (distance > 500 || j % 5 === 0) {
          line = L.polyline(latLng, {
            ...{
              color: 'red',
              weight: 1
            }, ...options
          }).addTo(map2d.map)
        } else {
          line = L.polyline(latLng, { ...{ color: 'red', weight: 1 }, ...options }).addTo(map2d.map)
        }
      }
      HistoryPolyline.push(line)
    }
  }
  // 将地图层级和定位根据线自适应调整
  markerPolylineList?.length && map2d.map.fitBounds(markerPolylineList, { maxZoom: 13 });
  return HistoryPolyline
}

/** 
 * 根据数据绘制图形区域
 * @param map2d 地图实例
 * @param _geoJson 几何图形数据
 * @param tooltipContent 图形tooltip内容
 */
export function createDrawAreaPolyline(map2d: Map2D, _geoJson: any, tooltipContent?: any) {
  let layers: any = null
  // 绘圆
  if (_geoJson.properties.subType === 'Circle') {
    let circle = new L.Circle([_geoJson.geometry.coordinates[1], _geoJson.geometry.coordinates[0]], {
      radius: _geoJson.properties.radius,
      color: _geoJson.properties.borderColor || '#3388ff', //颜色
      fillColor: _geoJson.properties.background || '#3388ff',
      fillOpacity: 0.1, //透明度
      weight: 1, //线条宽度
      opacity: 1 //线条透明度
    });
    tooltipContent && circle.bindTooltip(tooltipContent)
    layers = circle.addTo(map2d.map);
  }
  // 绘制其他图形
  else {
    const areaLayer = L.geoJson(_geoJson)
    tooltipContent && areaLayer.bindTooltip(tooltipContent)
    layers = areaLayer.addTo(map2d.map)
    //边框、背景颜色回显
    areaLayer.setStyle({
      color: _geoJson.properties.borderColor || '#3388ff',
      fillColor: _geoJson.properties.background || '#3388ff',
      fillOpacity: 0.1, //透明度
      weight: 1, //线条宽度
      opacity: 1 //线条透明度
    })
  }
  return layers
}

/** 绘制航道 */
export function createYawPolyline(map2d: Map2D, _geoJson: any) {
  const lineLayer = L.geoJson(_geoJson).addTo(map2d.map)
  let line1 = turf.lineOffset(_geoJson, (parseInt(_geoJson.areaWidth) || 800) / 2, { units: 'meters', weight: 2 });
  let line2 = turf.lineOffset(_geoJson, -((parseInt(_geoJson.areaWidth) || 800) / 2), { units: 'meters', weight: 2 });

  let line1Layer = L.geoJson(line1).addTo(map2d.map)
  let line2Layer = L.geoJson(line2).addTo(map2d.map)
  //边框、背景颜色回显
  lineLayer.setStyle({
    color: _geoJson.properties.borderColor || '#3388ff',
    fillColor: _geoJson.properties.background || '#3388ff',
    fillOpacity: 0.4,
    weight: 2,
    dashArray: [5, 5]
  })
  line1Layer.setStyle({
    color: _geoJson.properties.borderColor || '#3388ff',
    fillColor: _geoJson.properties.background || '#3388ff',
    fillOpacity: 0.4,
    weight: 2,
  })
  line2Layer.setStyle({
    color: _geoJson.properties.borderColor || '#3388ff',
    fillColor: _geoJson.properties.background || '#3388ff',
    fillOpacity: 0.4,
    weight: 2,
  })
  return [lineLayer, line1Layer, line2Layer]
}


/**
 * 根据区域大小排序区域(默认：从大到小)
 * @param list 数组项包含graph字符串类型字段
 * @returns 大小排序后的数组
 */
export function graphAreaSort(list: { graph: string }[]) {
  const _list: any[] = _.cloneDeep(list)
  _list.forEach(item => {
    const graphObj = JSON.parse(item.graph)
    item.graphObj = graphObj
    if (_.isNil(graphObj)) {
      item.layerType = 'Line'
      item.size = 1
      return
    }
    if (graphObj.geometry.type === 'Polygon') {
      item.layerType = 'Polygon'
      const [target] = graphObj.geometry.coordinates
      const pointList = target.map(([lng, lat]: any[]) => [lat, lng])
      const polygon = turf.polygon([pointList]);
      item.size = turf.area(polygon)
    } else if (graphObj.properties.subType === 'Circle') {
      item.layerType = 'Circle'
      item.size = 3.14 * graphObj.properties.radius * graphObj.properties.radius
    } else if (graphObj.properties.subType === 'Line') {
      item.layerType = 'Line'
      item.size = 1
    }
  })

  const result: any[] = _list.sort((a, b) => b.size - a.size)

  return result
}

/** 判断点是否在图形内 */
export function isPointInPolygon(point: Latlng, polygon: any[][]) {
  const pt = turf.point([point[1], point[0]]);
  const poly = turf.polygon(polygon);
  return turf.booleanPointInPolygon(pt, poly);
}

/** 判断点是否在圆内 */
export function isPointInCircle(point: Latlng, circle: Latlngs, radius: number) {
  const from = L.latLng(circle)
  const distance = from.distanceTo([point[1], point[0]])
  return distance < radius || distance === radius
}

export const planPoint97 = [
  // {
  //   "lat": 22.45307666008965,
  //   "lng": 113.94281387329103
  // },
  // {
  //   "lat": 22.453869898715592,
  //   "lng": 113.9436721801758
  // },
  // {
  //   "lat": 22.45513907107688,
  //   "lng": 113.94470214843751
  // },
  // {
  //   "lat": 22.456408231818948,
  //   "lng": 113.94504547119142
  // },
  {
    "lat": 22.457518737936468,
    "lng": 113.94538879394533
  },
  {
    "lat": 22.45878787689114,
    "lng": 113.94538879394533
  },
  {
    "lat": 22.459898363943907,
    "lng": 113.94521713256837
  },
  {
    "lat": 22.460532923979297,
    "lng": 113.94470214843751
  },
  {
    "lat": 22.461802035333992,
    "lng": 113.9436721801758
  },
  {
    "lat": 22.462595224028956,
    "lng": 113.94281387329103
  },
  {
    "lat": 22.463864316497762,
    "lng": 113.94229888916017
  },
  {
    "lat": 22.465292031632345,
    "lng": 113.94229888916017
  },
  {
    "lat": 22.466719732056127,
    "lng": 113.94229888916017
  },
  {
    "lat": 22.467830155548192,
    "lng": 113.94195556640626
  },
  {
    "lat": 22.469099200069817,
    "lng": 113.94229888916017
  },
  {
    "lat": 22.470685489374304,
    "lng": 113.9414405822754
  },
  {
    "lat": 22.471320000009992,
    "lng": 113.94023895263673
  },
  {
    "lat": 22.472271760513905,
    "lng": 113.94058227539064
  },
  {
    "lat": 22.47290626388335,
    "lng": 113.9414405822754
  },
  {
    "lat": 22.47401663778582,
    "lng": 113.94092559814455
  },
  {
    "lat": 22.47401663778582,
    "lng": 113.93955230712892
  },
  {
    "lat": 22.473699389007738,
    "lng": 113.9381790161133
  },
  {
    "lat": 22.475444248294416,
    "lng": 113.93714904785158
  },
  {
    "lat": 22.476078737130177,
    "lng": 113.9366340637207
  },
  {
    "lat": 22.47671322305901,
    "lng": 113.935604095459
  },
  {
    "lat": 22.477347706080856,
    "lng": 113.93457412719728
  }
]

export const plan97UAV = [
  {
    "lat": 22.49257442633893,
    "lng": 113.94590377807619
  },
  {
    "lat": 22.490195361712125,
    "lng": 113.94521713256837
  },
  {
    "lat": 22.48781625618642,
    "lng": 113.94453048706056
  },
  {
    "lat": 22.486230163116037,
    "lng": 113.9436721801758
  },
  {
    "lat": 22.484961275573855,
    "lng": 113.94264221191408
  },
  {
    "lat": 22.483533763185854,
    "lng": 113.94229888916017
  },
  {
    "lat": 22.482106236077684,
    "lng": 113.94126892089845
  },
  {
    "lat": 22.480678694250074,
    "lng": 113.94023895263673
  },
  {
    "lat": 22.479885609096975,
    "lng": 113.93903732299806
  },
  {
    "lat": 22.479409755824616,
    "lng": 113.93749237060548
  },
  {
    "lat": 22.479092519401192,
    "lng": 113.9359474182129
  }
]

export const plan97PoliceShip = [
  {
    "lat": 22.484326827440988,
    "lng": 113.92152786254884
  },
  {
    "lat": 22.483533763185854,
    "lng": 113.92101287841798
  },
  {
    "lat": 22.482582080082597,
    "lng": 113.92101287841798
  },
  {
    "lat": 22.48147177486035,
    "lng": 113.92066955566408
  },
  {
    "lat": 22.480202843703335,
    "lng": 113.92118453979494
  },
  {
    "lat": 22.479409755824616,
    "lng": 113.92187118530275
  },
  {
    "lat": 22.479092519401192,
    "lng": 113.92324447631837
  },
  {
    "lat": 22.479092519401192,
    "lng": 113.92410278320314
  },
  {
    "lat": 22.478933900916914,
    "lng": 113.92581939697266
  },
  {
    "lat": 22.477982186195636,
    "lng": 113.92753601074219
  },
  {
    "lat": 22.477982186195636,
    "lng": 113.92890930175783
  },
  {
    "lat": 22.477982186195636,
    "lng": 113.92959594726564
  },
  {
    "lat": 22.477982186195636,
    "lng": 113.93062591552736
  }
]