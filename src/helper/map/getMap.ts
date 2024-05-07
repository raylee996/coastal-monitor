import { MapType } from "./crsUtil";

function getTileLayerGroup(mapUrl: string, type: string) {
  const tileLayerObj: { [key: string]: any } = {
    street: {
      baseUrl: `${mapUrl}/Tianditu3857/`,
      type: "TianDiTu",
      levelArray: [
        { maxNativeZoom: 7, level: "world_1_7" },
        { maxNativeZoom: 9, level: "china_8_9" },
        { maxNativeZoom: 12, level: "guangdong_10_12" },
        { level: "shenzhen" },
        { level: "hongkong" },
      ],
    },
    satellite: {
      baseUrl: `${mapUrl}/TianDiTuSatellite/`,
      type: "TianDiTuSatellite",
      levelArray: [
        { maxNativeZoom: 7, level: "world_1_7" },
        { maxNativeZoom: 9, level: "china_8_9" },
        { maxNativeZoom: 12, level: "guangdong_10_12" },
        { maxNativeZoom: 18, level: "shenzhen_13_18" },
        { maxNativeZoom: 15, level: "hongkong_10_15" },
      ],
    },
    sea: {
      baseUrl: `${mapUrl}/Haitu/`,
      type: "Haitu",
      levelArray: [
        { maxNativeZoom: 5, level: "world_1_5" },
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
function getMapOffLineDate(type: MapType, mapUrl: string = '/public') {
  let mapTypeKey = "sea";
  switch (type) {
    case MapType.StreetMap:
      mapTypeKey = "street";
      break;
    case MapType.SatelliteMap:
      mapTypeKey = "satellite";
      break;
  }
  return L.layerGroup(getTileLayerGroup(mapUrl, mapTypeKey));
}

export default getMapOffLineDate;
