import Webgis, { MapOptions } from "webgis/index";
import { selectTargetIcon } from "./mapIcon";

/**
 * 地图实例类型
 */
export enum MapTileType {
  /** 街景地图*/
  street,
  /** 卫星地图 */
  satellite,
  /** 海图 */
  sea,
  /** 空白底图 */
  empty
}

// [纬度， 经度] [latitude， longitude]
const center_wgs84 = [22.470417, 113.908426];

class Map2D extends Webgis {
  public selectPoint: any;

  constructor(ele: HTMLElement, tileType: MapTileType, config?: MapOptions) {
    console.debug("Map2D");

    let center = center_wgs84;
    let crs = L.CRS.EPSG3857;

    if (tileType === MapTileType.sea) {
      crs = L.CRS.EPSG900913;
    }

    let tilelayer: any
    if (tileType === MapTileType.satellite) {
      tilelayer = getOffLineTile();
    } else if (tileType === MapTileType.street) {
      tilelayer = getOffLineTianditu()
    } else if (tileType !== MapTileType.empty) {
      tilelayer = getMapOffLineDate(tileType);
    }

    super(ele, {
      center,
      zoom: 14,
      minZoom: 12,
      maxZoom: 17,
      // maxZoom: 16,
      zoomControl: false,
      crs,
      layers: tilelayer,
      ...config,
    });
  }

  getCenterLatLon() {
    return center_wgs84;
  }

  createSelectTarget(latLng: { lat: number; lng: number }) {
    this.clearSelectTarget();
    this.selectPoint = L.marker(latLng, {
      icon: selectTargetIcon,
      offset: L.point(0, -4),
      pane: "shadowPane",
    }).addTo(this.map);
  }

  clearSelectTarget() {
    this.selectPoint && this.selectPoint.remove();
  }
}

function getTileLayerGroup(mapUrl: string, type: string) {
  const tileLayerObj: any = {
    street: {
      baseUrl: `${mapUrl}/Tianditu3857/`,
      type: "TianDiTu",
      levelArray: [
        { maxNativeZoom: 7, level: "world_1_7" },
        { maxNativeZoom: 9, level: "china_8_9" },
        { maxNativeZoom: 12, level: "guangdong_10_12" },
        { maxNativeZoom: 18, level: "shenzhen" },
        { maxNativeZoom: 18, level: "hongkong" },
      ],
    },
    satellite: {
      baseUrl: `${mapUrl}/TianDiTuSatellite/`,
      type: "TianDiTuSatellite",
      levelArray: [
        { maxNativeZoom: 7, level: "world_1_7" },
        { maxNativeZoom: 9, level: "china_8_9" },
        { maxNativeZoom: 12, level: "guangdong_10_12" },
        { maxNativeZoom: 15, level: "hongkong_10_15" },
        { maxNativeZoom: 18, level: "shenzhen_13_18" },
      ],
    },
    sea: {
      baseUrl: `${mapUrl}/Haitu/`,
      type: "Haitu",
      levelArray: [
        { maxNativeZoom: 5, level: "china_1_5" },
        { maxNativeZoom: 8, level: "china_6_8" },
        { maxNativeZoom: 12, level: "guangdong_9_12" },
        { maxNativeZoom: 14, level: "shenzhen_13_14" },
        { maxNativeZoom: 17, level: "nanshan_15_17" },
      ],
    },
  };
  return tileLayerObj[type].levelArray.map(
    (item: { maxNativeZoom?: number; level: string }) => {
      const { maxNativeZoom, level } = item;
      const allUrl = `${tileLayerObj[type].baseUrl + level}/{z}/{x}/{y}.png`;
      return L.tileLayer.chinaProvider(allUrl, {
        ...{
          type: tileLayerObj[type].type,
          tms: true,
        },
        ...(maxNativeZoom ? { maxNativeZoom } : {}),
      });
    }
  );
}

/**
 * 根据地图类型返回对应的离线地图数据
 */
function getMapOffLineDate(type: MapTileType, mapUrl: string = "/public") {
  let mapTypeKey: string = '';
  switch (type) {
    case MapTileType.street:
      mapTypeKey = "street";
      break;
    case MapTileType.satellite:
      mapTypeKey = "satellite";
      break;
    case MapTileType.sea:
      mapTypeKey = "sea";
      break;
  }
  return [L.layerGroup(getTileLayerGroup(mapUrl, mapTypeKey))];
}

/**
 * 获取卫星地图底图（天地图）
 */
function getOffLineTile() {
  const baseUrl = "/public/TianDiTuSatellite";

  const guangdongTile = L.tileLayer.fallback(
    baseUrl + "/guangdong_10_12/{z}/{x}/{y}.png",
    {
      minNativeZoom: 10,
      maxNativeZoom: 12,
      minZoom: 10,
      maxZoom: 20,
      tms: true,
    }
  );

  const shenzhenTile = L.tileLayer.fallback(
    baseUrl + "/shenzhen_13_18/{z}/{x}/{y}.png",
    {
      minNativeZoom: 13,
      maxNativeZoom: 16,
      minZoom: 13,
      maxZoom: 20,
      tms: true,
    }
  );

  const hongkongTile = L.tileLayer.fallback(
    baseUrl + "/hongkong_10_15/{z}/{x}/{y}.png",
    {
      minNativeZoom: 10,
      maxNativeZoom: 15,
      minZoom: 10,
      maxZoom: 20,
      tms: true,
    }
  );

  return [guangdongTile, shenzhenTile, hongkongTile];
}

/**
 * 获取街道地图底图（天地图）
 */
function getOffLineTianditu() {
  const baseUrl = "/public/Tianditu3857";

  const guangdongTile = L.tileLayer.fallback(
    baseUrl + "/guangdong_10_12/{z}/{x}/{y}.png",
    {
      minNativeZoom: 10,
      maxNativeZoom: 12,
      minZoom: 10,
      maxZoom: 20,
      tms: true,
    }
  );

  const shenzhenTile = L.tileLayer.fallback(
    baseUrl + "/shenzhen/{z}/{x}/{y}.png",
    {
      minNativeZoom: 13,
      maxNativeZoom: 18,
      minZoom: 13,
      maxZoom: 20,
      tms: true,
    }
  );

  const hongkongTile = L.tileLayer.fallback(
    baseUrl + "/hongkong/{z}/{x}/{y}.png",
    {
      minNativeZoom: 1,
      maxNativeZoom: 18,
      minZoom: 12,
      maxZoom: 20,
      tms: true,
    }
  );

  return [guangdongTile, shenzhenTile, hongkongTile];
}

export default Map2D;
