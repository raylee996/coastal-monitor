import { changeTime, downloadFile, YMDHms } from "./../helper/index";
import {
  addMyNote,
  addNotice,
  deleteMyNote,
  deleteMyNotes,
  editNotice,
  getDeptList,
  getDictDatalist,
  getLoginlog,
  getMyNoteList,
  getNotice,
  getNoticeList,
  getSyslog,
  getSyslogDetail,
  getTaskApprovalDetail,
  getTaskApprovalList,
  getUserList,
  graphqlWhitelist,
  removeNotice,
  updateAdminTaskApproval,
  updateMyNote,
  getDeviceList,
  getStateList,
  addStateList,
  deleteStateList,
  updateStateList,
  getDictionaryList,
  addDictionary,
  editDictionary,
  removeDictionary,
  getDictionary,
  getDictionaryDataList,
  editDictionaryData,
  removeDictionaryData,
  addDictionaryData,
  getDictionaryData,
  addsDeviceList,
  getVadioTogetherDeviceList,
  editsDeviceList,
  delDeviceList,
  editInfoDeviceList,
  getUserProfile,
  updatePwdProfile,
  putUserProfile,
  getTaskApprovalDetailList,
  exportSyslog,
  getWhiteList,
  getWhite,
  addWhite,
  exportWhite,
  delWhite,
  downWhiteTemplate,
  importWhite,
  getBlackList,
  addBlack,
  delBlacklist,
  importBlack,
  exportBlack,
  downBlackTemplate
} from "api/system";
import matching, {
  approvalStatusDesc,
  busTypeDict,
  loginStatusDict,
  noticeStatusDict,
  noticeTypeDict,
  Type,
  deviceListOptions,
  dictionaryStatusDict,
  optionApproval,
  optionOperate,
  whiteArchiveDict,
  BlackArchiveDict,
  // whiteDataDict,
  deviceStatues,
  ControlLevelDict,
  deviceSourceDict,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import { FormInstance } from "antd";
import { getLabelSelect } from "./label";
import { addDeviceAreaRelation, delDeviceAreaRelationBatch, getDeviceAreaRelationList } from "api/device";
import { getFileInfoPage } from "api/search";


/**
 * 根据字典类型获取字典数据
 * @param type 字典类型，字符串标识
 * @param valueType 返回的字典数据值类型，默认原样返回
 * @returns Type<any>[] 当传入valueType时，则返回对应类型
 */
export async function getDictDataByType<T = string>(type: string, valueType?: "string" | "number" | 'auto', signal?: AbortController): Promise<Type<T>[]> {
  const dto = {
    dictType: type,
    pageNumber: 1,
    pageSize: -1,
  };
  const vo = await getDictDatalist(dto, { signal });
  const list = _.get(vo, "rows", vo.records);
  if (!_.isEmpty(list)) {
    const typeList: Type<any>[] = list.map((item: any) => {
      let value = item.dictValue;
      if (valueType) {
        switch (valueType) {
          case "string":
            value = String(item.dictValue);
            break;
          case "number":
            value = Number(item.dictValue);
            break;
          default:
            break;
        }
      }
      return {
        name: item.dictLabel,
        value,
      };
    });
    return typeList;
  } else {
    console.warn(
      "[getDictDataByType]",
      type,
      " 根据字典类型获取字典数据，返回的数据",
      vo
    );
    return [];
  }
}

// 临时获取所有部门
export async function getAllDeptList() {
  const dto = {
    current: 1,
    size: 9999,
  };
  const list = await getDeptList(dto);
  if (!_.isEmpty(list)) {
    const typeList: Type<any>[] = list.records.map((item: any) => ({
      name: item.deptName,
      value: item.deptId,
    }));
    return typeList;
  } else {
    console.warn("[getAllDeptList]", "临时使用获取所有部门，返回的数据", list);
    return [];
  }
}

// 临时获取所有人员
export async function getAllUserList() {
  const dto = {
    current: 1,
    size: 9999,
  };
  const vo = await getUserList(dto);
  const list = _.get(vo, "rows", vo.records);
  if (!_.isEmpty(list)) {
    const typeList: Type<any>[] = list.map((item: any) =>
    ({
      name: item.nickName,
      value: item.userId,
    }));
    return typeList;
  } else {
    console.warn("[getAllDeptList]", "临时使用获取所有人员，返回的数据", vo);
    return [];
  }
}

// 获取-风险等级-字典数据
export async function getRiskLevelDict() {
  return await getDictDataByType("risk_level");
}

// 获取-预警行为-模型类型-字典数据
export async function getModelTypeDict() {
  return await getDictDataByType("warn_type");
}

// 获取白名单列表
export async function getWhitelist(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
      table(pageInfo: $pageInfo){
        id
        type
        content
        isAllow
        name
        remark
        date
      } 
    }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlWhitelist(dto);
  return {
    data: res.data.data.table,
    total: 50,
  };
}

// 个人工作台-代办审批列表
export async function getTaskApprovalPageList(pageInfo: PageInfo, params: any, signal?: AbortController) {
  let dto = {
    ...pageInfo,
    ...params,
  };
  const data = await getTaskApprovalList(dto, { signal });
  matching(data.records, approvalStatusDesc, "status");
  changeTime(data.records, "create_time");
  changeTime(data.records, "approval_time");
  const typeList: Type<any>[] = data.records.map((item: any) =>
  ({
    names: item.userName + '' + item.apply_name,
    ...item
  }));
  return {
    data: typeList,
    total: data.total,
  };
}
// 个人工作台-代办审批详情列表
export async function getApprovalDetailList(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };

  const data = await getTaskApprovalDetailList(dto);

  matching(data.records, optionApproval, "status");
  matching(data.records, optionOperate, "operateType");

  return {
    data: data.records,
    total: data.total,
  };
}
// 个人工作台-代办审批操作-通过/不通过
export async function updateTaskApproval(params: any) {
  return await updateAdminTaskApproval(params);
}
// 个人工作台-修改密码
export async function updatePwds(params: any) {
  return await updatePwdProfile(params);
}
// 个人工作台-基本信息
export async function personUserProfile() {
  return await getUserProfile();
}
// 个人工作台-基本信息
export async function putPersonUserProfile(params: any) {
  return await putUserProfile(params);
}

// 个人工作台-代办审批查询详情
export async function getTaskApprovalDetails(dto: any) {
  const vo = await getTaskApprovalDetail(dto);

  matching([vo], ControlLevelDict, 'controlLevel', 'control_levelName')

  return vo;
}

// 查询便签列表
export async function queryMyNoteList(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };

  const [vo, NoteTypeDict] = await Promise.all([
    getMyNoteList(dto),
    getLabelSelect({ type: 11 }),
  ]);

  matching(vo.records, NoteTypeDict, 'noteTypeId')

  return {
    data: vo.records,
    total: vo.total,
  };
}

export async function addMyNoteItem(dto: any) {
  return await addMyNote(dto);
}

export async function updateMyNoteItem(dto: any) {
  return await updateMyNote(dto);
}

export async function deleteMyNoteItem(id: any) {
  return await deleteMyNote(id);
}
export async function deleteMyNoteItems(id: any) {
  return await deleteMyNotes(id);
}

// 获取操作日志列表
export async function getSystemlog(pageInfo: PageInfo, params: any) {
  const { datetimeRange, ...otherParams } = params;

  const dto = {
    ...pageInfo,
    ...otherParams,
  };

  if (datetimeRange) {
    const [beginMoment, endMoment] = datetimeRange;
    dto.beginTime = beginMoment.format(YMDHms);
    dto.endTime = endMoment.format(YMDHms);
  }

  const vo = await getSyslog(dto);

  matching(vo.records, busTypeDict, "busType");

  return {
    data: vo.records,
    total: vo.total,
  };
}
// 获取查看操作日志列表
export async function getSystemlogDetail(id: any) {
  const dto = {
    logId: id
  };
  const vo = await getSyslogDetail(dto);
  return vo;
}

// 操作日志-列表
export async function getLoginlogTable(pageInfo: PageInfo, params: any) {
  const { datetimeRange, ...otherParams } = params;

  const dto = {
    ...pageInfo,
    ...otherParams,
  };

  if (datetimeRange) {
    const [beginMoment, endMoment] = datetimeRange;
    dto.beginTime = beginMoment.format(YMDHms);
    dto.endTime = endMoment.format(YMDHms);
  }

  const vo = await getLoginlog(dto);

  matching(vo.records, loginStatusDict, "status");

  return {
    data: vo.records,
    total: vo.total,
  };
}

// 操作日志-导出
export async function exportSyslogFile(form: FormInstance) {
  const params = form.getFieldsValue();

  const { datetimeRange, ...otherParams } = params;

  const dto = {
    ...otherParams,
  };
  console.log(dto)

  if (datetimeRange) {
    const [begin, end] = datetimeRange;
    dto.beginTime = begin.format(YMDHms);
    dto.endTime = end.format(YMDHms);
  }

  const vo = await exportSyslog(dto);
  downloadFile(vo.data, "用户操作日志");
}

export async function getNoticeTable(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params,
  };

  const vo = await getNoticeList(dto);

  matching(vo.records, noticeTypeDict, "noticeType");
  matching(vo.records, noticeStatusDict, "status");

  return {
    data: vo.records,
    total: vo.total,
  };
}

export async function addNoticeData(dto: any) {
  return await addNotice(dto);
}

export async function editNoticeData(params: any) {
  const dto = {
    ...params,
    noticeId: params.id,
  };
  return await editNotice(dto);
}

export async function removeNoticeData(id: any) {
  return await removeNotice(id);
}

export async function getNoticeData(id: any) {
  const vo = await getNotice(id);
  return vo;
}

// 设备管理 --设备列表查询
export async function getDeviceData(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };
  const vo = await getDeviceList(dto);
  matching(vo.records, deviceListOptions, "deviceType");
  matching(vo.records, deviceSourceDict, "deviceSource");
  matching(vo.records, deviceStatues, "status");
  let arr: any = vo.records.map((item: any, index: any) => {
    if (item.deviceType === 10) {
      item.statusName = ''
    }
    return {
      deviceId: index + 1,
      ...item
    }
  })
  return {
    data: arr,
    total: vo.total,
  };
}
// 设备管理 --设备列表查询
export async function getDeviceDataAll() {
  let dto = {
    current:1,
    size:-1
  };
  const vo = await getDeviceList(dto);
  return vo.records
}
// 所有设备
export async function getAllDeviceData(params: any) {
  let dto = {
    ...params,
    current: 1,
    size: 100
  };
  const vo = await getDeviceList(dto);
  let arr: any = []

  vo.records.forEach((item: any, index: number) => {
    arr.push({
      label: item.deviceName,
      // value: item.id
      value: item.deviceCode
    })
  });
  return arr;
}
// 设备管理 --设备列表删除
export async function removeDeviceList(id: any) {
  return await delDeviceList(id);
}
// 设备管理 --视频联动列表查询
export async function getVadioTogetherDeviceData() {
  let dto = {
    current: 1,
    size: 9999,
  };
  const vo = await getVadioTogetherDeviceList(dto);
  let arr: any = []

  vo.records.forEach((item: any, index: number) => {
    arr.push({
      name: item.deviceName,
      value: item.id
    })
  });
  return arr;
}

// 设备管理 --添加/编辑设备列表
export async function addDeviceDataList(params: any) {
  const { id, graph, areaRelation, videoWarnRange, type, sceneMode, gain, rain, sea, ...para } = params

  let dto = {
    type,
    ...para
  };
  // 转换为json字符串
  graph && (dto.graph = Object.prototype.toString.call(graph) === '[object Object]' ? JSON.stringify(graph) : graph);

  // 对海防雷达的场景参数配置组装
  if (type === '5') {
    dto.propertyJson = JSON.stringify({
      ...sceneMode ? { sceneMode: Number(sceneMode) } : {},
      gain,
      rain,
      sea
    })
  }

  const vo = id ? await editsDeviceList({ ...dto, id }) : await addsDeviceList(dto);

  if (areaRelation) {
    if (id) {
      const getDto = {
        deviceId: id,
        useType: 1
      }
      const list = await getDeviceAreaRelationList(getDto)
      if (list.length > 0) {
        const ids: number[] = list.map((item: any) => item.id)
        const delDto = ids.toString()
        await delDeviceAreaRelationBatch(delDto)
      }
    }
    const deviceId = id || vo
    for (let i = 0; i < areaRelation.length; i++) {
      const item = areaRelation[i];
      const addDto = {
        deviceId,
        name: item.name,
        type: item.type,
        graph: JSON.stringify(item.graphJson),
        useType: 1
      }
      await addDeviceAreaRelation(addDto)
    }
  }

  if (videoWarnRange) {
    if (id) {
      const getDto = {
        deviceId: id,
        useType: 2
      }
      const list = await getDeviceAreaRelationList(getDto)
      if (list.length > 0) {
        const ids: number[] = list.map((item: any) => item.id)
        const delDto = ids.toString()
        await delDeviceAreaRelationBatch(delDto)
      }
    }
    const deviceId = id || vo
    for (let i = 0; i < videoWarnRange.length; i++) {
      const item = videoWarnRange[i];
      const addDto = {
        deviceId,
        name: item.name,
        type: item.type,
        graph: JSON.stringify(item.graphJson),
        useType: 2
      }
      await addDeviceAreaRelation(addDto)
    }
  }
}

/** 获取所有视频预警设备预警范围列表 */
export async function getDeviceVideoWarnAreaList(signal?: AbortController) {
  const dto = {
    useType: 2
  }
  const vo = await getDeviceAreaRelationList(dto, { signal })

  const result = vo.map(item => {
    if (item.graph) {
      return {
        ...item,
        graphJson: JSON.parse(item.graph)
      }
    } else {
      return item
    }
  })

  return result
}

// 设备管理 --单个设备列表
export async function editInfoDeviceDataList(id: any, signal?: AbortController) {
  const dto = {
    deviceId: id
  }
  const vo = await editInfoDeviceList(dto, { signal });
  vo.deviceBase['AreaMap'] = [{ lat: vo.deviceBase.latitude, lng: vo.deviceBase.longitude }]
  if (vo.deviceBase.siteType && vo.deviceBase.siteType === 2) {
    vo.deviceBase['siteIds'] = vo.deviceBase.siteId
  }
  if (vo.deviceChannelList) {
    vo.deviceBase['deviceChannelList'] = vo.deviceChannelList
  }
  // json字符串转换为json数据
  if (vo?.deviceBase?.graph) {
    const graph = vo.deviceBase.graph
    vo.deviceBase.graph = Object.prototype.toString.call(graph) === '[object String]' ? JSON.parse(graph) : graph
  }

  if (vo.deviceBase.businessFunction) {
    vo.deviceBase.businessFunction = vo.deviceBase.businessFunction.split(',')
  }

  // 海防雷达拆解场景参数配置
  if (vo.deviceBase.type === 5 && vo.deviceBase.propertyJson) {
    const propertyJson = JSON.parse(vo.deviceBase.propertyJson)
    const { sceneMode, gain, rain, sea } = propertyJson
    vo.deviceBase.sceneMode = sceneMode ? sceneMode + '' : '';
    gain && (vo.deviceBase.gain = gain);
    rain && (vo.deviceBase.rain = rain);
    sea && (vo.deviceBase.sea = sea);
  }

  // 海防雷达组装过滤静态目标范围数据
  if (vo.deviceBase.type === 5) {
    const getDto = {
      deviceId: id,
      useType: 1
    }
    const list = await getDeviceAreaRelationList(getDto)
    if (list?.length) {
      const areaRelation = list.map(item => ({
        name: item.name,
        graphJson: JSON.parse(item.graph),
        type: Number(item.type)
      }))
      vo.deviceBase.areaRelation = areaRelation
    }
  }

  // 视频预警类型预警范围数据
  if (vo.deviceBase.businessFunction && vo.deviceBase.businessFunction.includes('6')) {
    const getDto = {
      deviceId: id,
      useType: 2
    }
    const list = await getDeviceAreaRelationList(getDto)
    if (list?.length) {
      const areaRelation = list.map(item => ({
        name: item.name,
        graphJson: JSON.parse(item.graph),
        type: Number(item.type)
      }))
      vo.deviceBase.videoWarnRange = areaRelation
    }
  }

  vo.deviceBase.type = String(vo.deviceBase.type)
  vo.deviceBase.siteType = vo.deviceBase.siteType ? vo.deviceBase.siteType : 1
  return vo.deviceBase;
}

// 设备管理 --站点列表查询
export async function getStateListData(params: any) {
  let dto = {
    ...params,
  };
  const vo = await getStateList(dto);
  return vo;
}
// 设备管理 --站点列表查询
export async function getStateListDatas(params: any) {
  let dto = {
    type: 1,
  };
  const vo = await getStateList(dto);
  let arr: any = []

  vo.forEach((item: any, index: number) => {
    arr.push({
      name: item.siteName,
      value: item.id
    })
  });
  return arr;
}
// 设备管理 --站点列表查询
export async function getStateListDatastwo(params: any) {
  let dto = {
    type: 2,
  };
  const vo = await getStateList(dto);
  let arr: any = []

  vo.forEach((item: any, index: number) => {
    arr.push({
      name: item.siteName,
      value: item.id
    })
  });
  return arr;
}
// 设备管理 --站点新增
export async function addStateListData(params: any) {
  let dto = {
    ...params,
  };
  const vo = await addStateList(dto);
  return vo;
}
// 设备管理 --站点编辑
export async function updateStateListData(params: any) {
  let dto = {
    ...params,
  };
  const vo = await updateStateList(dto);
  return vo;
}
export async function removeSiteData(dto: any) {
  return await deleteStateList(dto);
}

// 字典管理-列表
export async function getDictionaryTable(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };

  const vo = await getDictionaryList(dto);

  matching(vo.records, dictionaryStatusDict, "status");

  return {
    data: vo.records,
    total: vo.total,
  };
}
// 字典管理-详情
export async function getDictionaryDetail(params: any) {
  const vo = await getDictionary(params);

  return vo;
}
// 字典管理-新增
export async function addDictionaryDetail(params: any) {
  let dto = {
    ...params,
  };

  const vo = await addDictionary(dto);

  return vo;
}
// 字典管理-编辑
export async function editDictionaryDetail(params: any) {
  let dto = {
    ...params,
    dictId: params.id,
  };

  const vo = await editDictionary(dto);

  return vo;
}
// 字典管理-删除
export async function delDictionaryDetail(params: any) {
  const vo = await removeDictionary(params);

  return vo;
}

// 字典数据管理-列表
export async function getDictionaryDataTable(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };

  const vo = await getDictionaryDataList(dto);

  matching(vo.records, dictionaryStatusDict, "status");

  return {
    data: vo.records,
    total: vo.total,
  };
}
// 字典数据管理-详情
export async function getDictionaryDataDetail(params: any) {
  const vo = await getDictionaryData(params);

  if (vo.picPath) {
    vo.picPath = Number(vo.picPath)
  }

  return vo;
}
// 字典数据管理-新增
export async function addDictionaryDataDetail(params: any) {
  let dto = {
    ...params,
  };

  const vo = await addDictionaryData(dto);

  return vo;
}
// 字典数据管理-编辑
export async function editDictionaryDataDetail(params: any) {
  let dto = {
    ...params,
    dictCode: params.id,
  };

  const vo = await editDictionaryData(dto);

  return vo;
}
// 字典数据管理-删除
export async function delDictionaryDataDetail(params: any) {
  const vo = await removeDictionaryData(params);

  return vo;
}

// 白名单-列表
export async function getWhiteTable(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };

  //const vo = await getWhiteList(dto);
  const [vo, whiteDict] = await Promise.all([
    getWhiteList(dto),
    getDictDataByType("black_data_type"),
  ]);
  matching(vo.records, whiteArchiveDict, "isEnableCreateArchive");
  matching(vo.records, whiteDict, "dataType");

  return {
    data: vo.records,
    total: vo.total,
  };
}
// 黑名单-列表
export async function getBlackTable(pageInfo: PageInfo, params: any) {
  let dto = {
    ...pageInfo,
    ...params,
  };

  // const vo = await getBlackList(dto);
  const [vo, blackDict] = await Promise.all([
    getBlackList(dto),
    getDictDataByType("black_data_type"),
  ]);
  console.log(blackDict)
  matching(vo.records, BlackArchiveDict, "isWarn");
  matching(vo.records, blackDict, "dataType");

  return {
    data: vo.records,
    total: vo.total,
  };
}
// 白名单-详情
export async function getWhiteData(id: any) {
  const vo = await getWhite(id);
  return vo;
}
// 白名单-新增
export async function addWhiteData(params: any) {
  const dto = {
    ...params,
  };
  const vo = await addWhite(dto);
  return vo;
}
// 黑名单-新增
export async function addBlackData(params: any) {
  const dto = {
    ...params,
  };
  const vo = await addBlack(dto);
  return vo;
}
// 白名单-删除
export async function delWhiteData(ids: any) {
  const vo = await delWhite(ids);
  return vo;
}
// 黑名单-删除
export async function delBlackData(ids: any) {
  const vo = await delBlacklist(ids);
  return vo;
}
// 白名单-导出
export async function exportWhiteFile(params: any) {
  const dto = {
    ...params,
  };
  const vo = await exportWhite(dto);
  downloadFile(vo.data, "白名单列表");
}
// 黑名单-导出
export async function exportBlackFile(params: any) {
  const dto = {
    ...params,
  };
  const vo = await exportBlack(dto);
  downloadFile(vo.data, "黑名单列表");
}
// 白名单-下载模板
export async function downWhiteTemplateFile() {
  const vo = await downWhiteTemplate();
  downloadFile(vo.data, "白名单导入模板");
}
// 黑名单-下载模板
export async function downBlackTemplateFile() {
  const vo = await downBlackTemplate();
  downloadFile(vo.data, "黑名单导入模板");
}
// 白名单-导入
export async function importWhiteFile(formData: FormData) {
  await importWhite(formData);
}
// 黑名单-导入
export async function importBlackFile(formData: FormData) {
  await importBlack(formData);
}

// 获取水域卡口记录图片列表
export async function getBayonetImgs(params: any, signal?: AbortController) {
  const dto = {
    businessType: 14,
    businessId: params.id,
    current: 1,
    size: -1
  }
  const vo = await getFileInfoPage(dto, { signal })
  const imgs = vo.records.map((item: any) => {
    return item.picUrl
  })
  return imgs
}


/** 获取船舶类型字典数据 */
export async function getShipTypeDictData(signal?: AbortController) {
  const dto = {
    dictType: 'archive_ship_type',
    pageNumber: 1,
    pageSize: -1,
  }

  const vo = await getDictDatalist(dto, { signal });

  return vo.records
}

/** 获取包含图标信息的船舶类型字典数据 */
export async function getShipTypeDictDataOnlyIcon(signal?: AbortController) {
  const dto = {
    dictType: 'archive_ship_type',
    pageNumber: 1,
    pageSize: -1,
  }

  const vo = await getDictDatalist(dto, { signal });

  const result = _.filter(vo.records, item => item.picPath)

  const data = result.map(item => {
    return {
      name: item.dictLabel,
      value: item.dictValue
    }
  })

  const _data = [{ name: '雷达目标', value: '-1' }, ...data]

  return _data
}