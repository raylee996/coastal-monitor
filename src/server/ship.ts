import { datetimeSort, YMD, YMDHms } from "../helper";
import { Moment } from "moment";
import {
  addArchiveEntityAndRelation,
  addShip,
  addShipSailor,
  autoFollow,
  cameraControl,
  changeChannel,
  changeLockTime,
  delRelationEntity,
  delShip,
  delShipSailor,
  editAutoFollow,
  editRelationEntity,
  editShipDetail,
  editShipFocusType,
  editShipSailor,
  exportShipTable,
  getCaseList,
  getHistoryBehaviorWarn,
  getOtherRelation,
  getOtherRelationPage,
  getPeerRelationPage,
  getPortList,
  getRealShipList,
  getRealtimeVideoUrlByTargetInfo,
  getShipFocusTypeCount,
  getShipInfo,
  getShipList,
  getShipOwerList,
  getShipRealationTable,
  getShipSailingDetailList,
  getShipSailor,
  getShipSailorDetail,
  getTrackReview,
  getVideoSrcByDeviceCode,
  graphqlArchiveImgVideo,
  graphqlFishmanDock,
  graphqlShip,
  matchingRails,
  queryFollowTask,
  searchAutoFollow,
  seizeCamera,
  shipTakePhoto,
  startRecording,
  stopCameraLock,
  stopRecording,
  submitFollowTask,
  uploadShip,
} from "api/ship";
import common from "helper/common";
import matching, { getDictName, positionStatusDict, readDict, recordTargetDict, RelationTypeDict, shipListTypeDict, ShipRiskDict, shipStatusDict, shipTableTypeDict, shipTypeDict } from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import { getDictDataByType } from "./system";
import { graphqlTargetTrack } from "api/track";
import {
  getBehavirecordCountByDate,
  getBehavirecordCountByEventType,
  getBehavirecordCountByTimeInterval,
  getBehavirecordList,
  getFileInfoPage
} from "api/search";
import dayjs, { Dayjs } from "dayjs";
import { getBehivorEchartsLine, getBehivorEchartsPieSimple } from "helper/echartsConfig";
import { getHistoryTrack } from "api/common";
import _ from "lodash";
import { doGetDictTypeData } from "./common";
import { getShipInfoWarnTable, getWarnList } from "api/warn";
import { getShipArchive } from "api/archive";
import { message } from "antd";
import { getWarningV3Api } from "api/core/earlyWarning";
import { DataPlayBackQueryData } from "features/Core/components/DataPlayBack";
import { getLabelList } from "api/label";
import { addPreset, editPreset, getCameraPTZ, getCameraPTZInterval } from "api/preset";


//上传附件图片
export async function uploadAttachImgAsync(file: any) {
  let formData = new FormData();
  formData.append("file", file);
  let vo = "";
  return {
    path: vo,
  };
}

//航行信息轨迹点列表
export async function getShipSailingDetailListAsync(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
              shipSailingDetailList(pageInfo: $pageInfo){
                id
                time
                lan
                speed
                direction
                direction1
                status
                trackType
                radarNum
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await getShipSailingDetailList(dto);
  return {
    data: res.data.data.shipSailingDetailList,
    total: 800,
  };
}

export async function getShipTrackList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      trackList(pageInfo: $pageInfo){
        id
        type
        content
        datetime
        address
      } 
    }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.trackList.map((ele: any, idx: number) => ({
      ...ele,
      ordinal: ++idx,
    })),
    total: 1000,
  };
}

//关联侦码列表
export async function graphqlShipRelativeIMSIList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
              relativeIMSIList(pageInfo: $pageInfo){
                id
                time
                position
                IMSI
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.relativeIMSIList,
    total: 800,
  };
}

export async function getFittingNumberList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      fittingNumberList(pageInfo: $pageInfo){
        id
        imsi
        count
      } 
    }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.fittingNumberList,
    total: 1000,
  };
}

//船舶信息-船员信息列表
export async function getShipPeerTable(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      shipRelationPeer(pageInfo: $pageInfo){
              id    
              myData 
              peerDataType
              peerData
              shipName
              peerTimes
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.shipRelationPeer,
    total: 800,
  };
}

//船舶信息-关系图谱-同船东
export async function getShipOwnersTableDetail(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      shipShipOwners(pageInfo: $pageInfo){
              id  
              relationType
              mmsi 
              shipType
              shipName
              shipOwner 
              shipPrincipal
              shipOperator 
              shipManagement
              shipRegistered 
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.shipShipOwners,
    total: 800,
  };
}

// 获取关系图谱
export async function shipPersonRealationTable(
  pageInfo: PageInfo,
  params: any
) {
  const dto = {
    pageInfo,
    params,
  };
  const res = await getShipRealationTable(dto);
  return {
    data: res.data.data.shipPersonRealationTable,
    total: 50,
  };
}

export async function getArchiveImgVideo() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      table(pageInfo: $pageInfo){
        imgList
        videoList {
          videoSrc
          imgSrc
        }
      } 
    }`,
    variables: {
      pageInfo: {
        pageSize: 10,
        pageNumber: 1,
      },
    },
  };
  const res = await graphqlArchiveImgVideo(dto);
  return {
    data: res.data.data.table,
    total: 10,
  };
}

/** 航行信息--进出港列表*/

export async function getShipInoutPort(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      inoutPortList(pageInfo: $pageInfo){
              id
              address
              direction
              time
              speed
              lat
              lng
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.inoutPortList,
    total: 800,
  };
}

/** 航行信息--同港口列表*/
export async function getShipRelationPortTable(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      shipRelationInOutPort(pageInfo: $pageInfo){
            id
            shipName
            mmsi
            shipType
            relationType
            shipRegister
            inOutPort
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.shipRelationInOutPort,
    total: 800,
  };
}

/** 航行信息--同船队列表*/
export async function getShipRelationFleet(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      shipRelationFleet(pageInfo: $pageInfo){
        id
        shipName
        mmsi
        shipType
        relationType	
        caseNum
        caseType  
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.shipRelationFleet,
    total: 800,
  };
}

/** 航行信息--视图库*/
export async function getShipImgList(pageInfo?: PageInfo, params?: any) {
  const { id, dataType, ...para } = params
  const dto = {
    archiveId: id,// 档案ID，本ID为船舶ID
    archiveType: dataType === 1 ? 3 : 4, //档案类型 0:人员 1:车辆 2:手机 3:船舶 4:雷达
    ...para,
    ...pageInfo
  }
  if (para.customerTime) {
    dto.startTime = dayjs(para.customerTime[0]).format(YMD) + ' 00:00:00'
    dto.endTime = dayjs(para.customerTime[1]).format(YMD) + ' 23:59:59'
    _.unset(dto, 'customerTime')
  }
  const vo = await getFileInfoPage(dto)

  return {
    data: vo.records,
    total: vo.total,
  };
}

/** 航行信息--视图库*/
export async function getShipVideoList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      videoList(pageInfo: $pageInfo){
        id
        src
        cover
        title
        datetime
      } 
    }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlShip(dto);
  return {
    data: res.data.data.videoList,
    total: 800,
  };
}

/*********生产模式***********/

/** 上传图片 */
export async function doShipUpload(params: any) {
  if (common.isNull(params) && params.length === 0) {
    common.showMessage({ msg: "请至少选择一个文件", type: "error" });
    return;
  }

  let formData = new FormData();
  if (params.constructor.name.toLowerCase() === 'file') {
    formData.append("file", params);
  } else {
    params.forEach((element: any, index: number) => {
      formData.append("file", element);
    });
  }

  const dto = {
    file: formData,
  };

  const vo = await uploadShip(dto);
  return {
    path: vo,
    url: '',
    name: ''
  };
}

/** 新增船舶 */
export async function doAddEditShip(params: any) {
  if (common.isNull(params.cnName) && common.isNull(params.mmsi)) {
    common.showMessage({ msg: "中文船名或MMSI必填一项", type: "error" });
    return;
  }

  if (common.isNull(params.focusType)) {
    params.focusType = 2
  }

  //标签的处理，结果："1,2,3..."
  params.labelIds = common.arrayToString(params.labelIds);

  //船身照片，仅上传一张
  if (params.shipImgPathList) {
    params.shipImgPath = params.shipImgPathList.map((item: any) => item.url).toString()
  }
  // params.shipImgPath = common.getImgPathStr({
  //   data: params.shipImgPath,
  //   valise: "path",
  // });

  // 是否南山
  if (params.isNanShan) {
    params.isAuto = 4
  } else {
    params.isAuto = ''
  }
  _.unset(params, 'isNanShan')

  const dto = {
    ...params,
  };

  // 根据dataType 判断是否编辑还是新增，不能用Id判断，因为编辑雷达时候没有Id
  if (params.dataType) {
    const vo = await editShipDetail(dto);
    return vo;
  } else {
    const vo = await addShip(dto);
    return vo;
  }
  /* if (params.id === undefined) {
    const vo = await addShip(dto);
    return vo;
  } else {
    const vo = await editShipDetail(dto);
    return vo;
  } */
}

/**
 * 更新船舶档案图片
 * @param src 图片路径
 * @param type 船舶档案类型
 */
export async function updateShipImg(id: number, type: number, src: string) {

  const shipData = await getShipInfo({ id, dataType: type })

  shipData.shipImgPath = src

  const dto = {
    ...shipData
  }
  const vo = await editShipDetail(dto);

  return vo
}

/** 获取船舶列 */
export async function getShipListTable(pageInfo: PageInfo, params: any, signal?: AbortController) {

  const { labelNames, focusType, ...otherParams } = params

  const dto = {
    ...pageInfo,
    ...otherParams,
  }
  if (_.isEmpty(params.dataType)) {
    delete params.dataType
  }

  if (labelNames) {
    dto.labelIds = labelNames.toString()
  }


  if (focusType) {
    if (focusType === '6') {
      dto.isAuto = 4
    } else {
      dto.focusType = focusType
    }
  }

  const [res, archiveShipType] = await Promise.all([
    getShipList(dto, { signal }),
    getDictDataByType("archive_ship_type", 'string'),
  ]);

  matching(res.records, archiveShipType, "shipType");
  matching(res.records, shipListTypeDict, "focusType");
  matching(res.records, shipStatusDict, "shipStatus");

  res.records.forEach((item: any, index: number) => {
    let shipW = '' // 自定义长
    let shipL = '' // 自定义宽

    if (!_.isEmpty(item.shipWide) && !_.isEmpty(item.shipLong)) {
      // 优先显示-手动采集的长宽
      shipW = item.shipWide
      shipL = item.shipLong
    }
    else if (!_.isEmpty(item.capShipWide) && !_.isEmpty(item.capShipLong)) {
      // ais自动采集的长宽
      shipW = item.capShipWide
      shipL = item.capShipLong
    }

    item.shipW = shipW
    item.shipL = shipL

    // 照片处理，若上传多张，仅取第一张做为首图


    let shipImg: any = _.isEmpty(item.shipImgPath) ? '' : _.trim(item.shipImgPath).split(",").filter((v: any) => v)
    if (!_.isEmpty(shipImg)) {
      item.shipImgPathFirst = shipImg[0]
    } else {
      // 默认图片
    }

    // radar图片有时候为null，有时候为“ ”,统一为null
    if (!item.radarImgPath) {
      item.radarImgPath = null
    }

    // 是否南山标识
    if (item.isAuto === 4) {
      item.isNanShan = '是'
    } else {
      item.isNanShan = ''
    }
  })

  return {
    data: res.records,
    total: res.total,
  };
}

/** 删除船舶 */
export async function doDelShip(params: any) {
  const { id, dataType } = params
  const vo = await delShip(id, dataType);
  return vo;
}

/** 获取船舶信息详细信息 */
export async function getShipInfoData(params: any, signal?: AbortController) {
  const dto = {
    ...params
  };

  const vo = await getShipInfo(dto, { signal })

  const [jobDict, typeDict, labelListDict] = await Promise.all([
    getDictDataByType("archive_job_type"),
    getDictDataByType("archive_ship_type"),
    getLabelList({ pageSize: -1, pageNumber: 1, type: 4 })
  ]);

  readDict(vo, "jobType", jobDict);
  readDict(vo, "shipType", typeDict);

  // 去掉labelIds中的系统标签
  if (vo?.labelIds && labelListDict?.records?.length) {
    const labelIdList = vo?.labelIds.split(',').map(Number)
    let labelIds = labelIdList.filter((item: string) => {
      const labelIdObj = labelListDict.records.find((v: any) => v.id === item)
      return labelIdObj && labelIdObj.isAuto === '0'
    })
    vo.labelIds = labelIds.join(',')
  }
  // 船舶首张图片
  if (vo && vo.shipImgPath) {
    const imgs = vo.shipImgPath.split(',')
    vo.headShipImg = _.head(imgs)
  } else {
    vo.headShipImg = null
  }

  if (vo && !common.isNull(vo.id)) {
    //编辑状态时，要判断MMSI是否为空，为空可编辑
    if (common.isNull(vo.mmsi)) {
      vo.disaMmsi = false
    } else {
      vo.disaMmsi = true
    }
  }

  // 是否南山
  if (vo.isAuto === 4) {
    vo.isNanShan = true
  } else {
    vo.isNanShan = false
  }

  // 船舶图片回显
  if (vo && vo.shipImgPath) {
    vo.shipImgPathList = vo.shipImgPath.split(',').map((url: string) => ({
      uid: _.uniqueId(),
      name: '',
      url
    }))
  } else {
    vo.shipImgPathList = []
  }

  return vo;
}

/** 获取船舶信息详细信息 */
export async function getShipData(params: any) {
  const dto = {
    ...params
  };

  const vo = await getShipArchive(dto)

  return vo;
}

/**获取船舶信息 */
export async function getShipDetailInfo(params: any) {
  const dto = {
    id: params,
  };
  const vo = await getShipInfo(dto);

  if (vo && !common.isNull(vo.id)) {
    //编辑状态时，要判断MMSI是否为空，为空可编辑
    if (common.isNull(vo.mmsi)) {
      vo.disaMmsi = false
    } else {
      vo.disaMmsi = true
    }
  } else {
    // common.showMessage({ msg: '该档案为空', type: 'error' })
    return {
      code: 0,
      data: []
    }
  }

  if (common.isNull(vo.shipImgPath)) {
    vo.shipImgPath = [];
  } else {
    vo.shipImgPath = vo.shipImgPath.split(",");
  }
  return vo;
}

/** 获取鱼人码头船舶列表 */
export async function getFishmanShipList(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      table(pageInfo: $pageInfo){
                id
                name
                mmsi
                number
                destination
                time
                contrast
                scanner
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlFishmanDock(dto);
  return {
    data: res.data.data.table,
    total: 100,
  };
}

/**获取船舶信息 船舶信息 */
export async function getShipBaseInfo(params: any, signal?: AbortController) {
  const [res, archiveShipType, archiveShipJobType] = await Promise.all([
    getShipInfo(params, { signal }),
    getDictDataByType("archive_ship_type"),
    getDictDataByType('archive_job_type')
  ]);

  res && matching([res], archiveShipType, "shipType");
  res && matching([res], archiveShipJobType, "jobType");
  res && matching([res], shipTypeDict, "focusType");
  return res;
}

/** 获取船员列表 */
export async function getShipSailorList(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };
  // const res = await getShipSailor(dto);

  const [res, userSexDict] = await Promise.all([getShipSailor(dto), getDictDataByType("sys_user_sex"),])

  matching(res.records, positionStatusDict, "status");// 在职状态
  matching(res.records, userSexDict, "sex"); //字典数据转换，方法：matching(数据源, 字典数据, 数据源中的字段) 值：数据源中的字段+Name

  return {
    data: res.records,
    total: res.total,
  };
}

/** 获取船员详细信息 */
export async function doGetShipSailorDetail(params: any) {
  const dto = {
    id: params,
  };

  const vo = await getShipSailorDetail(dto);

  vo.personId = [{
    ...vo,
    id: vo.personId,
    name: vo.name,
    facePath: vo.imgPath,
  }]

  if (common.isNull(vo.imgPath)) {
    vo.imgPath = [];
  } else {
    vo.imgPath = vo.imgPath.split(",");
  }
  return vo
}


/** 删除船员 */
export async function doDelShipSailor(params: any) {
  const dto = {
    id: params,
  };

  const vo = await delShipSailor(dto);
  return vo;
}



/** 导出船员列表 */
export async function doExportShipTable(params: any) {
  const dto = {
    ...params,
  };

  const res = await exportShipTable(dto);
  return {
    data: res.records,
    total: res.total,
  };
}

/** 获取船舶档案-预警信息表格数据 */
export async function getShipWarnTable(pageInfo: PageInfo, params: any, signal: AbortController) {
  const { shipData, dateTimeRange, ..._params } = params

  const dto: any = {
    ...pageInfo,
    ..._params
  }

  if (shipData.targetId) {
    dto.fusionId = shipData.targetId
  } else if (shipData.mmsi) {
    dto.warnContent = shipData.mmsi
  } else if (shipData.radarNumber) {
    dto.warnContent = shipData.radarNumber
  } else {
    return {
      data: [],
      total: 0,
    }
  }

  if (dateTimeRange) {
    const [startDatetime, endDatetime]: [Moment, Moment] = dateTimeRange;
    dto.startTime = startDatetime.format(YMDHms)
    dto.endTime = endDatetime.format(YMDHms)
  }

  if (params.warnTypes) {
    dto.warnTypes = params.warnTypes.toString();
  }

  const [vo, monitorDict, levelDict, modelDict, deviceDict] = await Promise.all(
    [
      getWarningV3Api(dto, { signal }),
      getDictDataByType("monitor_type"),
      getDictDataByType("risk_level", 'number'),
      getDictDataByType("warn_type"),
      getDictDataByType("device_type"),
    ]
  );

  const data = vo.records.map((ele: any) => {
    if (ele.longitude || ele.latitude) {
      ele.longitudeLatitude = `${ele.longitude}/${ele.latitude}`;
    } else {
      ele.longitudeLatitude = "";
    }
    return ele;
  });
  let arr: any = deviceDict.map((item: any) => {
    return { name: item.name, value: Number(item.value) }
  })
  matching(data, monitorDict, "monitorType");
  matching(data, levelDict, "riskLevel");
  matching(data, modelDict, "warnType");
  matching(data, arr, "deviceType");
  data.forEach((item: any) => {
    if (item.warnType) {
      let temp = item.warnType.indexOf(";") ? item.warnType.split(";") : ''
      if (temp) {
        let warnName: any = []
        temp.forEach((it: any) => {
          modelDict.forEach((warn: any) => {
            if (it === warn.value) {
              warnName.push(warn.name)
            }
          })
        })
        item['warnTypeName'] = warnName.join(',')
      }
    }
  })
  return {
    data,
    total: vo.total,
  };
}

/** 新增/编辑船员信息 */
export async function doAddEditShipSailor(params: any) {
  const { personId, id, ...para } = params
  if (!personId?.length) {
    return {
      code: 0,
      msg: '未选择人员'
    }
  }

  let dto: any = {
    ...para,
    personId: personId[0].id
  }

  // 编辑-新增
  const vo = id ? await editShipSailor({ ...dto, id }) : await addShipSailor(dto);
  return vo;
}


/** 获取多目标轨迹数据 */
export async function getTargetTrack() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      table(pageInfo: $pageInfo){
                id
                legendName
                legendImgSrc
                latLngList {
                  lat
                  lng
                  time
                  speed
                  course
                  heading
                }
            } 
        }`,
    variables: {
      pageInfo: {
        pageNumber: 1,
        pageSize: 3
      },
    },
  };
  const res = await graphqlTargetTrack(dto);

  const result = res.data.data.table.map((ele: any) => {
    const latLngList = ele.latLngList.map((val: any) => ({ ...val, text: val.time }))
    return {
      ...ele,
      latLngList
    }
  })
  return result;
}

// 船舶档案-伴随信息-提交任务
export async function addFollowTask(params: any, signal?: AbortController) {
  const [startTimeMoment, endTimeMoment] = params.queryDateRange as [Moment, Moment]
  const dto: any = {
    // archiveId: params.shipData.id,
    archiveType: 3, // 0:人员  1:车辆  2:手机  3:船舶
    startTime: startTimeMoment.format(YMD) + ' 00:00:00',
    endTime: endTimeMoment.format(YMD) + ' 23:59:59',
    // levelNum: 1
  }
  if (params.shipData.dataType === 1) {
    dto.srcCode = params.shipData.mmsi
    dto.srcCodeType = 6
  } else if (params.shipData.dataType === 2) {
    dto.srcCode = params.shipData.radarNumber
    dto.srcCodeType = 7
  }
  // dto.tagCodeType = dto.srcCodeType
  /*  const _dto = {
     srcCodeType: 6,
     srcCode: 412888833,
     startTime: "2023-01-01 00:00:00",
     endTime: "2023-02-28 00:00:00",
     archiveType: 3
   } */
  const vo = await submitFollowTask(dto, { signal })
  vo.result.forEach((item: any) => item.id = _.uniqueId('uniqueId'))

  return vo
}
// 船舶档案-伴随信息-查询任务
export function getFollowTask(params: any, cb: (data: any) => void) {
  const dto = {
    taskId: params.taskId
  }
  return queryFollowTask(dto, cb)
}
// 船舶档案-伴随信息-轨迹信息
export async function getMatchingRails(srcData: any, tagData: any, queryParams: any) {
  const [startTime, endTime] = queryParams.datetime

  const dto: any = {
    current: 1,
    size: 9999,
    aisDateType: 1,
    coincidence: queryParams.coincidence, //是否融合:true或false
    analyzeType: 4,
    beginTime: startTime.format(YMDHms),
    endTime: endTime.format(YMDHms),
    targetId: `${srcData.targetId},${tagData.tagTargetId}`
  }


  const vo = await matchingRails(dto)
  const codeTypeDict = await getDictDataByType('target_data_type', 'number')


  matching(vo.content, codeTypeDict, 'codeType')

  datetimeSort(vo.content, 'capTime')

  const currentShip = {
    legendName: srcData.mmsi || srcData.radarNumber,
    latLngList: [] as any[]
  }
  const targetShip = {
    legendName: tagData.tagTargetId,
    latLngList: [] as any[]
  }

  vo.content.forEach((ele: any, idx: number) => {
    const [lng, lat] = ele.capAddress.split(',')
    ele.ordinal = idx + 1
    ele.id = _.uniqueId('uniqueId')
    if (currentShip.legendName === ele.content) {
      currentShip.latLngList.push({
        targetId: ele.targetId,
        lng,
        lat,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading
      })
    } else {
      targetShip.latLngList.push({
        targetId: ele.targetId,
        lng,
        lat,
        time: ele.capTime,
        speed: Number(ele.speed),
        course: ele.course,
        heading: ele.trueHeading
      })
    }
  });

  return [vo.content, [currentShip, targetShip]]
}

// 船舶档案-伴随信息-轨迹信息
export async function doGetShipGallery(params: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1
  }
  const { id, dataType, ...para } = params
  // 组装参数
  const dto = {
    archiveId: id,// 档案ID，本ID为船舶ID
    archiveType: dataType === 1 ? 3 : 4, //档案类型 0:人员 1:车辆 2:手机 3:船舶 4:雷达
    ...para,
    ...pageInfo
  }

  const vo = await getFileInfoPage(dto)

  return {
    data: vo.records,
    total: vo.total,
  };
}

// 船舶档案-行为分析-行为分析列表
export async function doGetBehavirecordList(pageInfo: PageInfo, params: any) {
  const dto: any = {
    archiveId: params.id,// 档案ID，本ID为船舶ID
    archiveType: params.archiveType ? params.archiveType : 3, //档案类型 0:人员 1:车辆 2:手机 3:船舶,4:雷达
    ...pageInfo
  }

  if (params.datetime) {
    dto.startTime = dayjs(params.datetime[0]).format('YYYY-MM-DD HH:mm:ss')
  }
  if (params.datetime) {
    dto.endTime = dayjs(params.datetime[1]).format('YYYY-MM-DD HH:mm:ss')
  }

  if (params.eventType) {
    dto.eventType = params.eventType
  }

  const vo = await getBehavirecordList(dto)
  vo.records.forEach((item: any, index: number) => {
    let lastLng = common.isNull(item.lastLng) ? '-' : item.lastLng
    let lastLat = common.isNull(item.lastLat) ? '-' : item.lastLat
    item.lonLatName = `${lastLng},${lastLat}`
  })


  //格式化目标
  for (let i = 0; i < recordTargetDict.length; i++) {
    vo.records.forEach((item: any) => {
      if (item.codeType === recordTargetDict[i].value) {
        item.targetName = recordTargetDict[i].name + " : " + item.codeValue
      }
    })
  }

  return {
    data: vo.records,
    total: vo.total,
  };
}

/** 船舶档案-行为分析-行为分类统计*/
export async function getShipActionlOptions(param: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1
  }
  const dto: any = {
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    archiveId: param.id,
    archiveType: param.archiveType,
    ...pageInfo
  }
  if (param.actionDate === 'month') {
    dto.beginTime = dayjs().subtract(1, 'M').format(YMDHms)
  } else {
    dto.beginTime = dayjs().subtract(1, 'y').format(YMDHms)
  }

  const [vo] = await Promise.all([getBehavirecordCountByEventType(dto)])

  const data = vo.map((ele: any) => {
    return {
      name: ele.labelName,
      value: Number(ele.itemNum)
    }
  })

  const options = getBehivorEchartsPieSimple({

    seriesData: data
  })

  return options;
}



/** 船舶档案-行为分析-触发时段统计*/
export async function getShipTriggerIntervalOptions(param: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1
  }
  const dto: any = {
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    archiveId: param.id,
    archiveType: param.archiveType,
    ...pageInfo
  }

  if (param.timeDate === 'month') {
    dto.beginTime = dayjs().subtract(1, 'M').format(YMDHms)
  } else {
    dto.beginTime = dayjs().subtract(1, 'y').format(YMDHms)
  }

  const vo = await getBehavirecordCountByTimeInterval(dto)

  const totalList: number[] = []

  vo.forEach((item: any) => {
    totalList.push(item.itemNum)
  });

  const maxTotal = _.max(totalList) || 100

  let result: any = []

  vo.forEach((item: any) => {
    let str: any = {
      itemNum: item.itemNum,
      labelName: item.labelName,
      totalNum: item.totalNum,
      type: item.type,
      wd: (item.itemNum / maxTotal) * 100
    }
    result.push(str)
  })

  return result;
}

/** 船舶档案-行为分析-每日行为统计*/
export async function getShipCountByDateOptions(param: any) {
  const pageInfo: any = {
    pageSize: -1,
    pageNumber: 1
  }
  const dto: any = {
    beginTime: `${dayjs(param.dateRange[0]).format('YYYY-MM-DD')} 00:00:00`,
    endTime: `${dayjs(param.dateRange[1]).format('YYYY-MM-DD')} 23:59:59`,
    archiveId: param.id,
    archiveType: param.archiveType,
    ...pageInfo
  }

  const vo = await getBehavirecordCountByDate(dto)
  let dayArr: any = []//日期
  let dataArr: any = []//值

  vo.forEach((ele: any) => {
    dayArr.push(ele.labelName)
    dataArr.push(Number(ele.itemNum))
  })

  const options: any = getBehivorEchartsLine({
    xAxisData: dayArr,
    seriesData: dataArr,
  })

  return options;
}

/**
 * 船舶信息面版-更改船舶类型
 * @param id 船舶档案id
 * @param type 2重点 3关注 4一般
 */
export async function editShipType(id: number, type: number) {
  const dto = {
    id: id,
    focusType: type
  }
  await editShipFocusType(dto)
}


export async function getShipHistoryTrack(
  shipData: {
    mmsi?: string
    uniqueId?: string
  },
  queryParams: any) {
  const [startTime, endTime] = queryParams

  const dto: any = {
    current: 1,
    size: 9999,
    beginTime: startTime.format(YMDHms),
    endTime: endTime.format(YMDHms),
  }

  if (shipData.mmsi) {
    dto.mmsi = shipData.mmsi
  } else if (shipData.uniqueId) {
    dto.uniqueId = shipData.uniqueId
  }

  const vo = await getHistoryTrack(dto)

  const result = vo.content.map((ele: any) => {
    const [lng, lat] = ele.capAddress.split(',')
    return {
      lng,
      lat,
      datetime: ele.capTime,
      speed: Number(ele.speed),
      course: ele.course,
      heading: ele.trueHeading
    }
  });

  datetimeSort(result, 'datetime', 'asc')

  return result
}

//船舶-涉案信息
export async function getShipCaseList(pageInfo: PageInfo, params: any) {

  const dto = {
    ...pageInfo,
    ...params
  }

  // shipId为空时，不要请求接口
  if (!params.shipId) {
    return {
      data: [],
      total: 0,
    };
  }

  const vo = await getCaseList(dto)

  return {
    data: vo.records,
    total: vo.total,
  };
}

//船舶-轨迹
export async function getTrackReviewData(params: any) {

  const [begin, end]: [Dayjs, Dayjs] = params.range
  let beginTime = begin.format(YMDHms)
  let endTime = end.format(YMDHms)

  let dataType = '1'
  if (params && params.typeList) {
    dataType = params.typeList.toString()
  }

  const dto = {
    beginTime,
    endTime,
    dataType
  }

  const vo = await getTrackReview(dto)

  return vo;
}

/**
 * 一次性获取所有数据回放轨迹与预警数据
 * @param param range, types, isTrack, trackTime
 * @param signal 
 * @returns 
 */
export async function getTrackReviewAndBehavirecord({ range, types, isTrack, trackTime }: DataPlayBackQueryData, signal?: AbortController): Promise<any> {

  let begin = dayjs().subtract(1, 'h')
  let end = dayjs()

  const dto = {
    beginTime: begin.format(YMDHms),
    endTime: end.format(YMDHms),
    dataType: types.toString()
  }

  if (range) {
    const [sTime, eTime] = range
    if (sTime && eTime) {
      if (isTrack) {
        const _trackTime = trackTime > 10 ? trackTime : 10
        dto.beginTime = sTime.subtract(_trackTime, 'm').format(YMDHms)
        dto.endTime = eTime.add(_trackTime, 'm').format(YMDHms)

      } else {
        dto.beginTime = sTime.subtract(10, 'm').format(YMDHms)
        dto.endTime = eTime.add(10, 'm').format(YMDHms)
      }
      begin = sTime
      end = eTime
    }
  }


  const trackData = await getTrackReview(dto, { signal })

  const actionData = await getWarnList({
    startWarnTime: begin.format(YMDHms),
    endWarnTime: end.format(YMDHms),
    pageSize: -1,
    pageNumber: 1
  }, { signal })

  actionData.records.forEach((warn: any) => {
    const target: any[] | undefined = _.get(trackData, warn.warnContent)
    if (target) {
      const point = target.find(dot => {
        if (dot.capTime === warn.capTime) {
          return true
        } else {
          const capDayjs = dayjs(dot.capTime)
          const warnDayjs = dayjs(warn.capTime)
          const diff = capDayjs.diff(warnDayjs, 's')
          return diff > 0 && diff <= 10
        }
      })
      if (point) {
        point.warnInfoDto = warn
      }
    }
  })

  return trackData
}

/**
 * 循环获取回放数据
 * @param param range, types, isTrack, trackTime
 * @param signal 
 * @returns 
 */
export async function getTrackReviewAndBehavirecordData({ range, types }: any, signal?: AbortController): Promise<any> {

  let begin = dayjs().subtract(1, 'h')
  let end = dayjs()

  const dto = {
    beginTime: begin.format(YMDHms),
    endTime: end.format(YMDHms),
    dataType: types.toString()
  }

  if (range) {
    const [sTime, eTime] = range
    if (sTime && eTime) {
      // if (isTrack) {
      //   const _trackTime = trackTime > 10 ? trackTime : 10
      //   dto.beginTime = sTime.subtract(_trackTime, 'm').format(YMDHms)
      //   dto.endTime = eTime.add(_trackTime, 'm').format(YMDHms)

      // } else {
      //   dto.beginTime = sTime.subtract(10, 'm').format(YMDHms)
      //   dto.endTime = eTime.add(10, 'm').format(YMDHms)
      // }
      dto.beginTime = sTime.format(YMDHms)
      dto.endTime = eTime.format(YMDHms)
      begin = sTime
      end = eTime
    }
  }


  const trackData = await getTrackReview(dto, { signal })

  const actionData = await getWarnList({
    startWarnTime: begin.format(YMDHms),
    endWarnTime: end.format(YMDHms),
    pageSize: -1,
    pageNumber: 1
  }, { signal })

  actionData.records.forEach((warn: any) => {
    const target: any[] | undefined = _.get(trackData, warn.warnContent)
    if (target) {
      const point = target.find(dot => {
        if (dot.capTime === warn.capTime) {
          return true
        } else {
          const capDayjs = dayjs(dot.capTime)
          const warnDayjs = dayjs(warn.capTime)
          const diff = capDayjs.diff(warnDayjs, 's')
          return diff > 0 && diff <= 10
        }
      })
      if (point) {
        point.warnInfoDto = warn
      }
    }
  })

  return trackData
}

//情指中心-实时船舶列表
export async function getRealShipListAsync(pageInfo?: PageInfo, params?: any) {
  const dto = {
    ...pageInfo,
    ...params
  }

  const vo: any = await getRealShipList(dto) || []

  const shipType: any = await doGetDictTypeData({ dictType: 'archive_ship_type' })
  matching(vo, shipType.data, 'shipType')
  return {
    data: vo,
    total: vo.length
  };
}
//情指中心 - 实时船舶列表 - 目标跟踪 - 实时视频流
export async function getRealtimeVideoUrlAsync(params: any, signal?: AbortController) {
  let dto = {
    ...params
  }
  let vo = await getRealtimeVideoUrlByTargetInfo(dto, { signal })
  if (vo.data.code !== 200) {
    return {
      ...vo.data,
      url: undefined,
    }
  } else {
    return vo.data
  }
}

//情指中心 - 实时船舶列表 - 目标跟踪 - 请求停止视频联动
export async function stopCameraLockAsync(params: any) {
  let dto = {
    ...params
  }
  return await stopCameraLock(dto)
}

//情指中心 - 实时船舶列表 - 目标跟踪 - 拍照
export async function shipTakePhotoAsync(params: any) {
  let dto = {
    ...params
  }
  return await shipTakePhoto(dto)
}

//情指中心 - 实时船舶列表 - 目标跟踪 - 云台控制
export async function cameraControlAsync(params: any) {
  let dto = {
    ...params
  }
  return await cameraControl(dto)
}

// 轮询获取摄像头ptz
export function getCameraPTZIntervalAsync(params: any, cb: (data: any) => void) {
  let dto = {
    deviceCode: params.deviceCode,
    channel: params.channel
  }
  return getCameraPTZInterval(dto, cb)
}

//情指中心 - 实时船舶列表 - 目标跟踪 - 云台控制 - 全景、细景，可见光/红外线 切换。
//通过设备编码获取视频流地址
export async function getVideoSrcByDeviceCodeAsync({ deviceCode, ...othParams }: any) {
  if (deviceCode) {
    const dto = {
      deviceCode,
      ...othParams
    }
    const vo = await getVideoSrcByDeviceCode(dto)
    return vo.data.data
  } else {
    message.warning('获取视频地址，无设备编号')
    return undefined
  }
}

// 可见光、红外线切换

export async function changeChannelAsync(params: any) {
  let dto = {
    ...params
  }
  return await changeChannel(dto)
}

//视频录制开始
export async function startRecordingAsync(params: any) {
  let dto = {
    ...params
  }
  return await startRecording(dto)
}
//视频录制结束
export async function stopRecordingAsync(params: any) {
  let dto = {
    ...params
  }
  return await stopRecording(dto)
}

// 获取设备ptz
export async function getCameraPTZData(deviceCode: string, channel: string) {
  const dto = {
    deviceCode,
    channel
  }

  const vo = await getCameraPTZ(dto)

  return vo
}

// 预置位-新增
export async function addPresetData(params: any, channel: string) {
  const ptz = await getCameraPTZData(params.deviceCode, channel)
  const dto = {
    ...params,
    pan: ptz.pan,
    tilt: ptz.tilt,
    zoom: ptz.zoom,
  }
  await addPreset(dto)
}

// 预置位-保存当前ptz
export async function savePresetData(params: any, channel: string) {

  const ptz = await getCameraPTZData(params.deviceCode, channel)

  const dto = {
    id: params.id,
    pan: ptz.pan,
    tilt: ptz.tilt,
    zoom: ptz.zoom,
  }

  await editPreset(dto, { successText: '保存预置位' })

}

//情指中心 - 实时船舶列表 - 历史轨迹
export async function shipHistoryTrack(pageInfo: PageInfo, params: any, signal?: AbortController) {
  let dto = {
    ...pageInfo,
    ...params,
    beginTime: params.beginTime,
    endTime: params.endTime,
    mmsi: params.mmsi || '',
    uniqueId: params.uniqueId || '',
    aisDateType: params.aisDateType
  }
  return await getHistoryTrack(dto, { signal })
}

// 跟踪倒计时
export async function changeLockTimeAsync(params: any) {
  let dto = {
    ...params
  }
  return await changeLockTime(dto)
}

// 抢占模式
export async function seizeCameraAsync(params: any) {
  let dto = {
    ...params
  }
  return await seizeCamera(dto)
}


// 查询船舶类型分类数量
export async function doGetShipFocusTypeCount(params?: any): Promise<any[]> {
  let dto = {
    ...params
  }

  const vo = await getShipFocusTypeCount(dto)

  matching(vo, shipTableTypeDict, "key")

  vo.forEach((ele: any) => {

    switch (ele.key) {
      case '2':
        ele.bgClass = 'btnImgShipTypeImportant'
        break;
      case '3':
        ele.bgClass = 'btnImgShipTypeFocus'
        break;
      case '4':
        ele.bgClass = 'btnImgShipTypeImportant'
        break;
      case '6':
        ele.bgClass = 'btnImgShipTypeNanShan'
        break;
      default:
        break;
    }

  })

  return vo
}

// 查询船舶类型分类数量
export async function getShipInfoWarnList(pageInfo: PageInfo, params: any) {

  const dto: any = {
    ...pageInfo
  }

  if (params.mmsi) {
    dto.contentType = 6
    dto.warnContent = params.mmsi
  } else if (params.batchNum) {
    dto.contentType = 7
    dto.warnContent = params.batchNum
  } else if (params.targetId) {
    dto.fusionId = params.targetId
  } else {
    return {
      data: [],
      total: 0,
    }
  }

  if (params.endTime) {
    dto.endTime = params.endTime
  }

  const vo = await getShipInfoWarnTable(dto)
  const modelTypeDict = await getDictDataByType("warn_type")

  matching(vo.records, ShipRiskDict, 'riskLevel')

  vo.records.forEach((item: any) => {
    const warnTypeList = item.warnType.split(';')
    const typeNamelist = warnTypeList.map((val: string) => getDictName(modelTypeDict, val)).filter((v: string) => v)
    item.warnTypeName = typeNamelist.toString()
  })

  return {
    data: vo.records,
    total: vo.total
  }

}

// 船舶历史轨迹中的预警信息
export async function getHistoryBehaviorWarnAsync(params: any) {
  let dto: any = {
    ...params
  }
  let vo = await getHistoryBehaviorWarn(dto)
  return vo
}


// 关系图谱下面的船舶列表
export async function getOtherRelationPageAsync(pageInfo?: PageInfo, params?: any) {
  const dto = {
    ...pageInfo,
    ...params
  }
  let vo = await getOtherRelationPage(dto);
  const archiveShipType = await getDictDataByType("archive_ship_type")

  let shipTypeDict: any = archiveShipType.map((item: any) => {
    return { name: item.name, value: item.value }
  })

  matching(vo.content, shipTypeDict, "shipType");
  matching(vo.content, RelationTypeDict, 'relationType')

  for (let i = 0; i < vo.content.length; i++) {
    if (!vo.content[i].name) {
      vo.content[i].name = ''
    }
  }
  return {
    data: vo.content,
    total: vo.total
  }
}

// 关系图谱非同行关系
export async function getOtherRelationAsync(params?: any) {
  let dto = {
    ...params
  }
  let vo = await getOtherRelation(dto)
  return {
    data: vo.data,
    total: vo.total
  }
}


// 获取同行关系关系图谱
export async function getPeerRelationPageAsync(params: any) {
  let dto = {
    ...params
  }
  let vo = await getPeerRelationPage(dto)
  if (vo.data.code !== 200) {
    message.error(vo.data.msg)
    return {
      data: undefined
    }
  }
  return {
    data: vo.data
  }

}

// 获取船东列表
export async function getShipOwerListAsync(params: any) {
  let dto = {
    ...params
  }

  let vo = await getShipOwerList(dto)
  let arr: any = [];
  if (vo.length > 0) {
    for (let i = 0; i < vo.length; i++) {
      arr.push({
        name: vo[i].name,
        value: vo[i].name,
        ...vo[i]
      })
    }
  }
  return arr
}

// 获取港口列表
export async function getPortListAsync(params: any) {
  let dto = {
    ...params
  }
  let vo = await getPortList(dto)
  let arr: any[] = [];
  for (let i = 0; i < vo.length; i++) {
    arr.push({
      name: vo[i].name,
      value: vo[i].name, //传给后端港口名
    })
  }
  return arr
}

// 船舶列表-查看-关系图谱-同船队-添加船队
export async function addArchiveEntityAndRelationAsync(dto: any) {
  let vo = await addArchiveEntityAndRelation(dto)
  return vo
}
// 船舶列表-查看-关系图谱-同船队-删除船队
export async function delRelationEntityAsync(dto: any) {
  let vo = await delRelationEntity(dto)
  return vo
}
// 船舶列表-查看-关系图谱-同船队-编辑船队
export async function editRelationEntityAsync(dto: any) {
  let vo = await editRelationEntity(dto)
  return vo
}

// 自动关注船舶配置
export async function autoFollowAsync(dto: any) {
  if (dto.areaCode) {
    dto.areaCode = dto.areaCode.join(',')
  }
  let vo = await autoFollow({
    configValue: JSON.stringify(dto),
    configId: 102, //固定为102
    configKey: 'autoFocus',
    configName: '自动关注配置',
    remark: "自动关注配置"
  })
  return vo
}

// 查询自动关注配置,configId固定为102
export async function searchAutoFollowAsync() {
  let vo = await searchAutoFollow(102)
  return vo
}

// 编辑关注船舶配置
export async function editAutoFollowAsync(dto: any) {
  let vo = await editAutoFollow({
    configValue: JSON.stringify(dto),
    configId: 102, //固定为102
    configKey: 'autoFocus',
    configName: '自动关注配置',
    remark: "自动关注配置"
  })
  return vo
}