import { Config, get, post, put, requestDelete } from "helper/ajax";
import { workerGet, workerPost } from "helper/workerRequest";

// 开发阶段
//上传附件
export const uploadAttachImg = (dto: any) => {
  return post("/graphql/sys/file/upload2Minio", dto);
};

export function graphqlShip(dto: any) {
  return post("/graphql/ship", dto, { isNotToken: true, isGraphql: true });
}

//航行信息轨迹点列表
export function getShipSailingDetailList(dto: any) {
  return post("/graphql/ship", dto, { isNotToken: true, isGraphql: true });
}

// 船舶信息 - 船员信息
export function getShipPersonTable(dto: any) {
  return post("/graphql/ship", dto, { isNotToken: true, isGraphql: true });
}

// 渔人码头 - 船舶列表
export function graphqlFishmanDock(dto: any) {
  return post("/graphql/fishmanDock", dto, {
    isNotToken: true,
    isGraphql: true,
  });
}

/***************************对接阶段***************************************************************/
// 对接阶段

// 新增船舶
export function addShip(dto: any) {
  return post("/archive/ship/add", dto);
}

// 上传船舶图片
export function uploadShip(dto: any) {
  return post("/file/upload", dto.file, { isUploadFile: true });
}

// 获取船舶列表
export function getShipList(dto: any, config?: Config) {
  return get("/archive/ship/list", dto, config);
}

// 获取查询船舶类型分类数量
export function getShipFocusTypeCount(dto: any) {
  return get("/archive/ship/focusTypeCount", dto);
}

// 删除船舶
export function delShip(id: string, dataType: number) {
  return requestDelete(`/archive/ship/${id}/${dataType}`, null, { successText: '删除船舶档案' });
}

// 导入船舶
export function importShip(dto: any) {
  return post("/archive/ship/import", dto, { isUploadFile: true });
}

//导入场所列表
export function importPlaceList(dto: any) {
  return post("/archive/place/import", dto, { isUploadFile: true });
}

// 船舶档案视图查看图片视频
export function graphqlArchiveImgVideo(dto: any) {
  return post("/graphql/archiveImgVideo", dto, {
    isNotToken: true,
    isGraphql: true,
  });
}

// 船舶列表NODE
export function getShipRealationTable(dto: any) {
  return post("/graphql/getRealationTable", dto);
}

// 获取船舶信息详细信息
export function getShipInfo(dto: any, config?: Config) {
  return get("/archive/ship/getInfo", dto, config);
}

// 【该接口后端通知不再使用】获取列表船舶信息详细信息
export function getShipDetail(dto: any) {
  return get(`/archive/ship/${dto.id}`, {});
}

// 编辑船舶信息
export function editShipDetail(dto: any) {
  return put('/archive/ship/edit', dto, { isSuccessMessage: true });
}

// 获取船员列表
export function getShipSailor(dto: any) {
  return get(`/archive/sailor/list`, dto);
}

// 获取船员信息
export function getShipSailorDetail(dto: any) {
  return get(`/archive/sailor/${dto.id}`);
}

// 删除船员信息
export function delShipSailor(dto: any) {
  return requestDelete(`/archive/sailor/${dto.id}`, null, { successText: '删除' });
}

// 导出船员列表
export function exportShipTable(dto: any) {
  return post(`/archive/ship/export`, dto);
}

// 获取船舶档案-预警信息
export function getShipWarnList(dto: any) {
  return get("/alarm/warnInfo/warnListV2", dto);
}

// 获取船舶档案-预警信息v2
export function getShipWarnListV2(dto: any) {
  return get("/alarm/warnInfo/warnListV2", dto);
}

// 获取船舶信息面版历史轨迹
export function getAISHistoryTrack(dto: any) {
  return post("/search/smart/traceAnalysisAis", dto, {
    isFormUrlencoded: true,
  });
}

// 获取船舶信息面版历史轨迹
export function getRadarHistoryTrack(dto: any) {
  return post("/search/smart/traceAnalysisRadar", dto, {
    isFormUrlencoded: true,
  });
}

// 新增船员
export function addShipSailor(dto: any) {
  return post("/archive/sailor/add", dto, { successText: '添加' });
}

// 修改船员
export function editShipSailor(dto: any) {
  return put("/archive/sailor/edit", dto, { successText: '编辑' });
}

// 船舶档案-伴随信息-提交任务
export function submitFollowTask(dto: any, config?: Config) {
  return post("/analyze/followTask/submit", dto, config);
}
// 船舶档案-伴随信息-查询任务
export function queryFollowTask(dto: any, cb: (data: any) => void) {
  return workerPost({
    api: "/search/followResult/list",
    dto,
    cb,
    config: {
      time: 2000,
    },
  });
}
// 船舶档案-伴随信息-轨迹信息
export function matchingRails(dto: any) {
  return post("/search/smart/historyTrack/list", dto, {
    isFormUrlencoded: true,
  });
}

// 修改船舶类型
export function editShipFocusType(dto: any) {
  return put("/archive/ship/editFocusType", dto, {
    isFormUrlencoded: true,
    successText: '更改船舶类型'
  });
}

//船舶-涉案信息
export function getCaseList(dto: any) {
  return get("/archive/ship/caseList", dto);
}

//船舶-数据回放
export function getTrackReview(dto: any, config?: Config) {
  return post("/search/smart/track/review", dto, {
    ...config,
    isFormUrlencoded: true,
  });
}

//情指中心 - 实时船舶列表
export function getRealShipList(dto: any) {
  return get("/wsapi/shipinfo/realTimeShipDataList", dto);
}
//情指中心 - 实时船舶列表 - 目标跟踪 - 实时视频流
export function getRealtimeVideoUrlByTargetInfo(dto: any, config?: Config) {
  return post("/ship/camera/getVideoStreamingUrlByTargetInfo", dto, { isUseResponse: true, ...config });
}
//情指中心 - 实时船舶列表 - 目标跟踪 - 请求停止视频联动
export function stopCameraLock(dto: any) {
  return post('/ship/camera/stopLock', dto)
}
//情指中心 - 实时船舶列表 - 目标跟踪 - 拍照
export function shipTakePhoto(dto: any) {
  return post('/ship/camera/takeAPicture', dto, { isUseResponse: true, successText: '拍照成功' })
}

//情指中心 - 实时船舶列表 - 目标跟踪 - 拍照
export function cameraPlayerPicture(dto: any) {
  return post('/ship/camera/takeAPicture', dto, { successAlt: '拍照成功' })
}

//情指中心 - 实时船舶列表 - 目标跟踪 - 云台控制
export function cameraControl(dto: any) {
  return post('/ship/camera/remoteControlCamera', dto, { isUseResponse: true })
}

//情指中心 - 实时船舶列表 - 目标跟踪 - 云台控制 - 可见光/红外线 切换。
//通过设备编码获取视频流地址
//调这个之前，需要停止联动，可见光/红外切换，相当于换了摄像头了。
export function getVideoSrcByDeviceCode(dto: any) {
  return post('/ship/camera/getVideoStreamingUrlByDeviceCode', dto, { isUseResponse: true, isNotErrorMessage: true })
}
export function getVideoUrlByDeviceCode(dto: any, config?: Config) {
  return post('/ship/camera/getVideoStreamingUrlByDeviceCode', dto, { isNotErrorMessage: true, ...config })
}

// 可见光红外线切换
export function changeChannel(dto: any) {
  return post('/ship/camera/changeChannel', dto)
}


//情指中心 - 实时船舶列表- 目标跟踪 - 开始视频录制
export function startRecording(dto: any) {
  return post('/ship/camera/startRecording', dto)
}
//情指中心 - 实时船舶列表- 目标跟踪 - 结束视频录制
export function stopRecording(dto: any) {
  return post('/ship/camera/stopRecording', dto)
}

// 联动跟踪倒计时
export function changeLockTime(dto: any) {
  return post('/ship/reslock/changeLockTime', dto)
}

// 摄像头抢占模式
export function seizeCamera(dto: any) {
  return post('/ship/reslock/getLock', dto)
}

//船舶详情 - 风险分布图
export function getShipRiskInfo(dto: any) {
  return get('/archive/ship/riskDistributionInfo', dto)
}


// 船舶列表 - 历史轨迹 - 查看 - 行为预警
export function getHistoryBehaviorWarn(dto: any) {
  return get('/alarm/warnInfo/listV2', dto)
}

// 关系图谱船舶列表,分页，非同行
export function getOtherRelationPage(dto: any) {
  return get('/graph/graph/getOtherRelationPage', dto)
}

// 关系图谱数据，非同行
export function getOtherRelation(dto: any) {
  return get('/graph/graph/getOtherRelations', dto, { isUseResponse: true })
}

// 获取船东列表
export function getShipOwerList(dto: any) {
  return get('/archive/ship/ShipOwerList', dto)
}

// 获取港口列表
export function getPortList(dto: any) {
  return get('/archive/ship/shipHarbourList', dto)
}

// 关系图谱，同行关系
export function getPeerRelationPage(dto: any) {
  return get('/analyze/followTask/getFollowRelation', dto, { isUseResponse: true })
}

// 船舶列表 - 历史轨迹 - 查看 - 行为预警
export function queryNewWarnTask(dto: any, cb: (data: any) => void) {
  return workerGet({
    api: "/alarm/warnInfo/listV2",
    dto,
    cb,
    config: {
      time: 5 * 1000,
    }
  });
}

// 船舶列表-查看-关系图谱-同船队-添加船队
export function addArchiveEntityAndRelation(dto: any) {
  return post('/graph/graph/addNoArchiveEntityAndRelation', dto, { isFormUrlencoded: true, isUseResponse: true })
}

// 船舶列表-查看-关系图谱-同船队-删除船队
export function delRelationEntity(dto: any) {
  return post('/graph/graph/delRelationEntity', dto, { isFormUrlencoded: true })
}
// 船舶列表-查看-关系图谱-同船队-编辑船队
export function editRelationEntity(dto: any) {
  return post('/graph/graph/editRelationEntity', dto, { isFormUrlencoded: true, isUseResponse: true })
}

// 船舶自动关注配置
export function autoFollow(dto: any) {
  return post('/system/config', dto, { successText: '自动关注' })
}
// 查询自动关注配置信息
export function searchAutoFollow(configId: number) {
  return get(`/system/config/${configId}`)
}
// 编辑船舶自动关注配置
export function editAutoFollow(dto: any) {
  return put('/system/config', dto, { successText: '自动关注' })
}