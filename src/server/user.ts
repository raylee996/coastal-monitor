import { FormInstance } from "antd";
import {
  addDept,
  addMenu,
  addRole,
  addUser,
  changeRoleStatus,
  changeUserStatus,
  deleltDept,
  deleltMenu,
  deleteRole,
  deleteUser,
  editDept,
  editMenu,
  editRole,
  editUser,
  exportLogin,
  getDept,
  getDeptList,
  getHasWait,
  getMenu,
  getMenuList,
  getMenuListAuth,
  getMenuTreeByRole,
  getRole,
  getRoleList,
  getUser,
  getUserList,
  login,
  logout,
  resetUserPwd,
  getLoginFileCA
} from "api/user";
import { downloadFile, filterRouYiMenuOfTree, YMDHms } from "helper";
import matching, {
  deptStatusDict,
  menuStatusDict,
  menuTypeDict,
  roleAdminDict,
  sexDict,
  userLevelOptions,
} from "helper/dictionary";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import { arrayToTree } from "performant-array-to-tree";

export async function userlogin(params: any) {
  const dto = {
    username: params.account,
    password: params.password,
  };
  const vo = await login(dto);
  return vo;
}

export async function getUserTable(pageInfo: PageInfo, params: any) {

  const dto: any = {
    ...pageInfo,
    ...params
  }

  const vo = await getUserList(dto);

  vo.records.forEach((ele: any) => {
    if (ele.dept?.deptName) {
      ele.deptName = ele.dept.deptName;
    }
    if (!_.isEmpty(ele.roles)) {
      ele.rolesName = ele.roles.map((it: any) => it.roleName).toString();
    }
    if (ele.status === "0") {
      ele.statusBoolean = true;
    } else {
      ele.statusBoolean = false;
    }
  });

  matching(vo.records, sexDict, 'sex')
  matching(vo.records, userLevelOptions, 'level')

  return {
    data: vo.records,
    total: vo.total,
  };
}

export async function getUserListByDept(deptIds: number | number[]) {
  if (_.isUndefined(deptIds)) {
    return []
  } else {
    const dto: any = {
      pageSize: -1,
      pageNumber: 1,
      deptId: _.isArray(deptIds) ? _.last(deptIds) : deptIds,
      hasApprovePermission: 1,
      status: 0
    }

    const vo = await getUserList(dto);

    const dict = vo.records.map((item: any) => ({ name: `${item.name} [${item.userName}]`, value: item.userId }))

    return dict
  }
}

export async function editUserStatus(checked: boolean, record: any) {
  const dto = {
    userId: record.userId,
    status: checked ? "0" : "1",
  };

  await changeUserStatus(dto);

  return checked;
}

export async function addUserData(params: any) {
  const dto = {
    ...params,
    deptId: _.isArray(params.deptId) ? _.last(params.deptId) : params.deptId,
    effectiveTime: params.effectiveTime
  };
  const vo = await addUser(dto);
  return vo;
}

export async function deleteUserData(id: number) {
  const vo = await deleteUser(id);
  return vo;
}

export async function getUserData(id: number) {
  const dto = {
    userId: id
  }
  const vo = await getUser(dto);
  const data: any = vo.user
  data.roleIds = vo.user.roles.map((item: any) => item.roleId)
  return data;
}

export async function editUserData(params: any) {
  const dto = {
    ...params,
    userId: params.id,
    deptId: _.isArray(params.deptId) ? _.last(params.deptId) : params.deptId,
    effectiveTime: params.effectiveTime
  };
  const vo = await editUser(dto);
  return vo;
}

export async function getRoleTable(pageInfo: PageInfo, params: any) {
  const dto: any = {
    ...params,
    ...pageInfo,
  };

  const vo = await getRoleList(dto);

  matching(vo.records, roleAdminDict, "admin");

  vo.records.forEach((ele: any) => {
    if (ele.status === "0") {
      ele.statusBoolean = true;
    } else {
      ele.statusBoolean = false;
    }
  });

  return {
    data: vo.records,
    total: vo.total,
  };
}

export async function getRoleAllData() {
  const dto: any = {
    pageNumber: 1,
    pageSize: -1,
  };

  const vo = await getRoleList(dto);

  vo.records.forEach((ele: any) => {
    ele.value = ele.roleId;
    ele.name = ele.roleName;
  });

  return vo.records;
}

export async function editRoleStatus(checked: boolean, record: any) {
  const dto = {
    roleId: record.roleId,
    status: checked ? "0" : "1",
  };

  await changeRoleStatus(dto);

  return checked;
}

export async function getRoleData(id: number, signal?: AbortController) {
  const vo = await getRole(id, { signal });
  const menuTree = await getMenuTreeByRole(id);
  vo.menuIds = menuTree.checkedKeys;
  return vo;
}

export async function editRoleData(params: any) {
  const dto = {
    ...params,
    roleId: params.id,
  }

  if (!_.isArray(params.menuIds)) {
    const approvalMenuId = 2045 // 个人工作台菜单id
    const systemMenuId = 2030 // 系统管理菜单id

    if (params.menuIds.checkedKeys.includes(approvalMenuId) &&
      !params.menuIds.halfCheckedKeys.includes(systemMenuId)) {
      dto.halfSelect = [...params.menuIds.halfCheckedKeys, systemMenuId].toString();
    } else {
      dto.halfSelect = params.menuIds.halfCheckedKeys.toString();
    }

    dto.menuIds = params.menuIds.checkedKeys;
  }

  const vo = await editRole(dto)

  return vo
}

export async function addRoleData(params: any) {
  const dto = {
    ...params
  }

  const approvalMenuId = 2045 // 个人工作台菜单id
  const systemMenuId = 2030 // 系统管理菜单id

  if (!_.isArray(params.menuIds)) {
    if (params.menuIds.checkedKeys.includes(approvalMenuId) &&
      !params.menuIds.halfCheckedKeys.includes(systemMenuId)) {
      dto.halfSelect = [...params.menuIds.halfCheckedKeys, systemMenuId].toString();
    } else {
      dto.halfSelect = params.menuIds.halfCheckedKeys.toString();
    }
    dto.menuIds = params.menuIds.checkedKeys;
  } else {
    if (params.menuIds.includes(approvalMenuId)) {
      dto.halfSelect = `${systemMenuId}`
    }
    dto.menuIds = params.menuIds;
  }

  const vo = await addRole(dto)

  return vo
}

export async function deleteRoleData(id: number) {
  const vo = await deleteRole(id);
  return vo;
}

export async function getMenuTable(pageInfo: PageInfo, params: any) {
  const dto: any = {
    ...params,
    pageNumber: 1,
    pageSize: -1
  };

  const vo = await getMenuList(dto);

  matching(vo, menuTypeDict, "menuType");
  matching(vo, menuStatusDict, "status");

  const tree = arrayToTree(vo, {
    id: "menuId",
    rootParentIds: { "0": true },
    dataField: null,
  });

  const result = _.filter(
    tree,
    (ele) => !["系统管理_rouyi", "系统监控_rouyi", "系统工具_rouyi"].includes(ele.menuName)
  );

  return {
    data: result,
    total: result.length,
  };
}

export async function addMenuData(params: any) {
  const dto = {
    ...params,
    parentId: _.isUndefined(params.parentId) ? 0 : _.last(params.parentId),
  };

  const vo = await addMenu(dto);

  return vo;
}

export async function getMenuCascader() {
  const dto: any = {
    pageNumber: 1,
    pageSize: -1,
  };

  const vo = await getMenuList(dto);

  vo.forEach((ele: any) => {
    ele.value = ele.menuId;
    ele.label = ele.menuName;
  });

  const tree = arrayToTree(vo, {
    id: "menuId",
    rootParentIds: { "0": true },
    dataField: null,
  });

  const result = filterRouYiMenuOfTree(tree);

  return result;
}

/**
 * 获取角色菜单权限菜单数组
 * @param hasApprovePermission 是否锁定审批权限，是则禁用个人工作台菜单选项，需要自行在表单中设置选中
 * @returns 
 */
export async function getMenuTree(hasApprovePermission: number, signal?: AbortController) {

  const dto: any = {
    pageNumber: 1,
    pageSize: -1,
  };

  const vo = await getMenuList(dto, { signal });

  vo.forEach((ele: any) => {
    ele.key = ele.menuId;
    ele.title = ele.menuName;
    if (hasApprovePermission) {
      const approvalMenuId = 2045 // 个人工作台菜单id
      if (ele.menuId === approvalMenuId) {
        ele.disableCheckbox = true
      }
    }
  });

  const tree = arrayToTree(vo, {
    id: "menuId",
    rootParentIds: { "0": true },
    dataField: null,
  });

  const result = filterRouYiMenuOfTree(tree);

  return result;
}

export async function editMenuData(params: any) {
  let parentId = params.parentId;
  if (_.isArray(params.parentId)) {
    parentId = _.last(params.parentId);
  }

  const dto = {
    ...params,
    parentId,
    menuId: params.id,
  };
  const vo = await editMenu(dto);
  return vo;
}

export async function getMenuData(id: number) {
  const vo = await getMenu(id);
  return vo;
}

export async function deleltMenuData(id: number) {
  const vo = await deleltMenu(id);
  return vo;
}

export async function getMenuTreeDataByRole(id: number) {
  const vo = await getMenuTreeByRole(id);
  return vo;
}

export async function getDeptTable(pageInfo: PageInfo, params: any) {
  const dto = {
    ...params,
    pageNumber: 1,
    pageSize: -1
  };

  const vo = await getDeptList(dto);

  matching(vo.records, deptStatusDict, "status");

  const notParentNodes: any[] = []

  vo.records.forEach((ele: any) => {
    ele.key = ele.deptId;
    ele.title = ele.deptName;
    const is = vo.records.some((it: any) => it.deptId === ele.parentId || ele.parentId === 0)
    !is && notParentNodes.push(ele)
  });

  const tree = arrayToTree(vo.records, {
    id: "deptId",
    rootParentIds: { "0": true },
    dataField: null
  });

  const result = filterRouYiMenuOfTree(tree);

  const list = result.concat(notParentNodes)

  return {
    data: list,
    total: vo.total,
  };
}

export async function getDeptCascader() {
  const dto: any = {
    pageNumber: 1,
    pageSize: -1,
  };

  const vo = await getDeptList(dto);

  vo.records.forEach((ele: any) => {
    ele.value = ele.deptId;
    ele.label = ele.deptName;
  });

  const tree = arrayToTree(vo.records, {
    id: "deptId",
    rootParentIds: { "0": true },
    dataField: null,
  });

  return tree;
}

export async function addDeptData(params: any) {
  const dto = {
    ...params,
    parentId: _.last(params.parentId),
  };

  const vo = await addDept(dto);

  return vo;
}

export async function deleltDeptData(id: number) {
  const vo = await deleltDept(id);
  return vo;
}

export async function getDeptData(id: number) {
  const vo = await getDept(id);
  return vo;
}
export async function resetUserData(params: any) {
  const vo = await resetUserPwd({ userId: params });
  return vo;
}

export async function editDeptData(params: any) {
  let parentId = params.parentId;
  if (_.isArray(params.parentId)) {
    parentId = _.last(params.parentId);
  }

  const dto = {
    ...params,
    parentId,
    deptId: params.id,
  };
  const vo = await editDept(dto);
  return vo;
}

export async function userLogout() {
  const vo = await logout();
  return vo;
}

export async function exportLoginFile(form: FormInstance) {

  const params = form.getFieldsValue()

  const { datetimeRange, ...otherParams } = params;

  const dto = {
    ...otherParams
  }

  if (datetimeRange) {
    const [begin, end] = datetimeRange;
    dto.beginTime = begin.format(YMDHms);
    dto.endTime = end.format(YMDHms);
  }

  const vo = await exportLogin(dto);
  downloadFile(vo.data, '用户登录日志')
}
export async function exportLoginFileCA(param:any) {

  
  const vo = await getLoginFileCA({fileUrl:param});
  downloadFile(vo.data, '软件驱动')
}

// 审批记录-列表
export function getHasWaitData(cb: (data: any) => void) {
  return getHasWait(null, cb);
}

// 获取用户菜单树
export async function getUserMenuList(token?: string) {
  const dto: any = {
    pageNumber: 1,
    pageSize: -1
  }

  const vo = await getMenuListAuth(dto, { requestToken: token });

  const menuList = _.filter(vo.menuList, (ele) => ele.menuName.indexOf('rouyi') === -1)
  const halfMenuList = _.filter(vo.halfMenuList, (ele) => ele.menuName.indexOf('rouyi') === -1)

  return [...menuList, ...halfMenuList];
}