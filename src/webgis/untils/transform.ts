type LatLng = { lat: number; lng: number }

const PROJECTION_WGS84 = '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees';
const PROJECTION_EPSG3395 = '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs';

/**
 * 经纬度转换，WGS84 至 EPSG3395
 * @param latLng { lat: number; lng: number }
 * @returns LatLng { lat: number; lng: number }
 */
export function proj4_WGS84_EPSG3395(latLng: LatLng): LatLng {

  const result = proj4(
    PROJECTION_WGS84,
    PROJECTION_EPSG3395,
    [latLng.lng, latLng.lat] //[x=longitude,y=latitude]
  );

  const [longitude, latitude] = result

  return {
    lat: latitude,
    lng: longitude
  };
}