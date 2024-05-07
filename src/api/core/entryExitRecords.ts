import { Config, get } from "helper/ajax";

// 获取进出港列表接口
export function queryPortApi(dto: any, config?: Config) {
  return get("/search/portInfo/page", dto, config);
}

// 进出港统计信息接口
export function queryEntryExitStatisticsApi(dto: any) {
  return get("/search/portInfo/entryExitStatistics", dto);
}

// 进出港热力图接口
export function queryThermalMapApi(dto: any) {
  return get("/search/portInfo/thermalMap", dto);
}

// 获取船员信息以及关联的从文件中抠出的人脸
export function querySailorInfoApi(dto: any) {
  return get("/search/person/getSailorInfoAndFaceFromFile", dto);
}
