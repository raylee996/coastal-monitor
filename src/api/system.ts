import { Config, get, post, put, requestDelete } from "helper/ajax";

// 获取字典数据
export function getDictDatalist(dto: any, config?: Config) {
  return get("system/dict/data/list", dto, { isCache: true, ...config });
}


// 获取部门列表
export function getDeptList(dto: any) {
  return get("system/dept/list", dto);
}


// 获取人员列表
export function getUserList(dto: any) {
  return get("system/user/list", dto);
}


// 获取白名单列表
export function graphqlWhitelist(dto: any) {
  return post("graphql/whitelist", dto, { isNotToken: true, isGraphql: true });
}


// 个人工作台-代办审批列表
export function getTaskApprovalList(dto: any, config?: Config) {
  return get("admin/taskApproval/list", dto, config);
}
// 个人工作台-代办审批操作-通过/不通过
export function updateAdminTaskApproval(dto: any) {
  return put("admin/taskApproval/update", dto, {
    successText: "审批",
  });
}
// 个人工作台-代办审批查询详情
export function getTaskApprovalDetail(dto: any) {
  return get("admin/taskApproval/detail", dto);
}
// 个人工作台-代办审批查询详情列表
export function getTaskApprovalDetailList(dto: any) {
  return get("admin/taskApproval/taskApprovalRecordList", dto);
}
// 个人工作台-便签列表
export function getMyNoteList(dto: any) {
  return get("admin/myNote/list", dto);
}
// 个人工作台-新增便签
export function addMyNote(dto: any) {
  return post("admin/myNote/add", dto, {
    successText: "新增便签",
  });
}
// 个人工作台-编辑便签
export function updateMyNote(dto: any) {
  return post("admin/myNote/update", dto, {
    successText: "编辑便签",
  });
}
// 个人工作台-删除便签
export function deleteMyNotes(dto: any) {
  return requestDelete("admin/myNote/del", dto, {
    successText: "删除便签",
  });
}
// 个人工作台-删除便签
export function deleteMyNote(dto: any) {
  return requestDelete("admin/myNote/detail", dto, {
    successText: "删除便签",
  });
}
// 个人工作台-基本信息
export function getUserProfile() {
  return get("system/user/profile");
}
// 个人工作台-基本信息
export function putUserProfile(dto: any) {
  return put("system/user/profile", dto, { successText: ' ' });
}
// 个人工作台-修改密码
export function updatePwdProfile(dto: any) {
  return put("system/user/profile/updatePwd", dto, { isFormUrlencoded: true });
}


// 操作日志-列表
export function getSyslog(dto: any) {
  return get("logs/syslog/page", dto);
}
// 操作日志-导出
export function exportSyslog(dto: any) {
  return post("/logs/syslog/export", dto, { isRequestFile: true, isFormUrlencoded: true });
}


// 登录日志-列表
export function getLoginlog(dto: any) {
  return get("logs/logininfor/page", dto);
}
// 操作日志-查看
export function getSyslogDetail(dto: any) {
  return get("logs/syslog/detail", dto);
}


// 通知公告-列表
export function getNoticeList(dto: any) {
  return get("system/notice/list", dto);
}
// 通知公告-新增
export function addNotice(dto: any) {
  return post("system/notice", dto, {
    successText: "新增",
  });
}
// 通知公告-删除
export function removeNotice(noticeIds: any) {
  return requestDelete(`system/notice/${noticeIds}`, null, {
    successText: "删除",
  });
}
// 通知公告-编辑
export function editNotice(dto: any) {
  return put("system/notice", dto, {
    successText: "编辑",
  });
}


// 通知公告-详情
export function getNotice(noticeId: any) {
  return get(`system/notice/${noticeId}`);
}


// 设备管理-设备列表
export function getDeviceList(dto: any) {
  return get("admin/device/list", dto);
}
// 设备管理-删除设备列表
export function delDeviceList(dto: any) {
  return get("admin/device/del", dto);
}
// 设备管理-单个设备信息
export function editInfoDeviceList(dto: any, config?: Config) {
  return get("admin/device/editInfo", dto, config);
}
// 设备管理-视频联动列表
export function getVadioTogetherDeviceList(dto: any) {
  return get("admin/device/getVadioTogetherDeviceList", dto);
}
// 设备管理-添加设备列表
export function addsDeviceList(dto: any) {
  return post("admin/device/add", dto, { successText: '新增设备' });
}
// 设备管理-编辑设备列表
export function editsDeviceList(dto: any) {
  return post("admin/device/edit", dto, { successText: '编辑设备' });
}

// 设备管理-站点列表数据
export function getStateList(dto: any) {
  return get("admin/site/list", dto);
}
// 设备管理-新增站点列表数据
export function addStateList(dto: any) {
  return post("admin/site/add", dto, { isFormUrlencoded: true });
}
// 设备管理-编辑站点列表数据
export function updateStateList(dto: any) {
  return post("admin/site/update", dto, { isFormUrlencoded: true });
}
// 设备管理-删除站点列表数据
export function deleteStateList(dto: any) {
  return get("admin/site/del", dto);
}


// 字典管理-列表
export function getDictionaryList(dto: any) {
  return get("system/dict/type/list", dto);
}
// 字典管理-详情
export function getDictionary(dictId: any) {
  return get(`/system/dict/type/${dictId}`);
}
// 字典管理-新增
export function addDictionary(dto: any) {
  return post("system/dict/type", dto, {
    successText: "新增",
  });
}
// 字典管理-编辑
export function editDictionary(dto: any) {
  return put("system/dict/type", dto, {
    successText: "编辑",
  });
}
// 字典管理-删除
export function removeDictionary(dictIds: any) {
  return requestDelete(`/system/dict/type/${dictIds}`, null, {
    successText: "删除",
  });
}


// 字典数据管理-列表
export function getDictionaryDataList(dto: any) {
  return get("system/dict/data/list", dto);
}
// 字典数据管理-详情
export function getDictionaryData(dictCode: any) {
  return get(`system/dict/data/${dictCode}`);
}
// 字典数据管理-新增
export function addDictionaryData(dto: any) {
  return post("system/dict/data", dto, {
    successText: "新增",
  });
}
// 字典数据管理-编辑
export function editDictionaryData(dto: any) {
  return put("system/dict/data", dto, {
    successText: "编辑",
  });
}
// 字典数据管理-删除
export function removeDictionaryData(dictCodes: any) {
  return requestDelete(`/system/dict/data/${dictCodes}`, null, {
    successText: "删除",
  });
}


// 白名单-列表
export function getWhiteList(dto: any) {
  return get("/admin/whitelist/list", dto);
}
// 黑名单-列表
export function getBlackList(dto: any) {
  return get("/admin/blacklist/list", dto);
}
// 白名单-详情
export function getWhite(id: any) {
  return get(`/admin/whitelist/${id}`);
}
// 白名单-新增
export function addWhite(dto: any) {
  return post('/admin/whitelist/add', dto, { successText: '新增白名单' });
}
// 黑名单-新增
export function addBlack(dto: any) {
  return post('/admin/blacklist/add', dto, { successText: '新增黑名单' });
}
// 白名单-导出
export function exportWhite(dto: any) {
  return post('/admin/whitelist/export', dto, { isRequestFile: true, isFormUrlencoded: true });
}
// 黑名单-导出
export function exportBlack(dto: any) {
  return post('/admin/blacklist/export', dto, { isRequestFile: true, isFormUrlencoded: true });
}
// 白名单-删除
export function delWhite(ids: any) {
  return requestDelete(`/admin/whitelist/${ids}`, null, { successText: '删除白名单' });
}
// 黑名单-删除
export function delBlacklist(ids: any) {
  return requestDelete(`/admin/blacklist/${ids}`, null, { successText: '删除黑名单' });
}
// 白名单-下载模板
export function downWhiteTemplate() {
  return post('/admin/whitelist/down/template',
    null,
    { isRequestFile: true }
  );
}
// 黑名单-下载模板
export function downBlackTemplate() {
  return post('/admin/blacklist/down/template',
    null,
    { isRequestFile: true }
  );
}
// 白名单-上传
export function importWhite(dto: any) {
  return post('/admin/whitelist/importData',
    dto,
    { isUploadFile: true }
  );
}
// 黑名单-上传
export function importBlack(dto: any) {
  return post('/admin/blacklist/importData',
    dto,
    { isUploadFile: true }
  );
}