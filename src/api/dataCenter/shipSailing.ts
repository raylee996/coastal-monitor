import { get, post } from "helper/ajax";

/** 历史轨迹内容 */

// 获取历史轨迹数据
export function getHistoryTrackApi(dto: any) {
  return post("/search/smart/historyTrack/list", dto, {
    isFormUrlencoded: true,
  });
}

/** 历经港口内容 */

// 全部港口
export function getAllPlacePortApi(dto: any) {
  return get("/archive/place/portTerminalList", dto);
}

// 船舶经过港口
export function getShipPlacePortApi(dto: any) {
  return get("/search/portInfo/page", dto);
}
