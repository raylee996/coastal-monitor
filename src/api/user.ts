import { Config, get, post, put, requestDelete } from "helper/ajax";
import { workerGet } from "helper/workerRequest";

export function graphqlUser(dto: any) {
  return post('/graphql/user', dto, { isNotToken: true, isGraphql: true })
}

// 用户登录
export function login(dto: any) {
  return post('auth/login', dto, { isNotToken: true })
}
// 登录注销
export function logout() {
  return requestDelete("/auth/logout");
}
// 登录日志-导出
export function exportLogin(dto: any) {
  return post('/logs/logininfor/export', dto, { isRequestFile: true, isFormUrlencoded: true })
}

// 获取用户列表
export function getUserList(dto: any) {
  return get('system/user/list', dto)
}
// 重置密码
export function resetUserPwd(dto: any) {
  return get('/system/user/resetPwd1', dto)
}

// 更改用户状态
export function changeUserStatus(dto: any) {
  return put('system/user/changeStatus', dto, { isSuccessMessage: true })
}

// 新增用户
export function addUser(dto: any) {
  return post('system/user/user-add', dto, { isSuccessMessage: true })
}

// 编辑用户
export function editUser(dto: any) {
  return put('system/user', dto, { isSuccessMessage: true })
}

// 删除用户
export function deleteUser(id: any) {
  return requestDelete(`system/user/${id}`, {}, { isSuccessMessage: true })
}

// 获取用户详情
export function getUser_back(id: any) {
  return get(`system/user/${id}`)
}

export function getUser(dto: any) {
  return get('system/user/getInfo', dto)
}

// 获取角色列表
export function getRoleList(dto: any) {
  return get('system/role/list', dto)
}

// 更改角色状态
export function changeRoleStatus(dto: any) {
  return put('system/role/changeStatus', dto, { isSuccessMessage: true })
}

// 获取角色
export function getRole(roleId: number, config?: Config) {
  return get(`system/role/${roleId}`, null, config);
}

// 新增角色
export function addRole(dto: any) {
  return post('system/role', dto, { isSuccessMessage: true });
}

// 编辑角色
export function editRole(dto: any) {
  return put('system/role', dto, { isSuccessMessage: true });
}

// 删除角色
export function deleteRole(roleId: number) {
  return requestDelete(`system/role/${roleId}`, {}, { isSuccessMessage: true });
}

// 获取菜单列表
export function getMenuList(dto: any, config?: Config) {
  return get("system/menu/list", dto, config);
}

// 获取用户菜单列表
export function getMenuListAuth(dto: any, config?: Config) {
  return get("system/menu/v1/list", dto, config);
}

// 新增菜单
export function addMenu(dto: any) {
  return post("system/menu", dto, { isSuccessMessage: true });
}

// 编辑菜单
export function editMenu(dto: any) {
  return put("system/menu", dto, { isSuccessMessage: true });
}

// 获取菜单
export function getMenu(menuId: number) {
  return get(`system/menu/${menuId}`);
}

// 删除菜单
export function deleltMenu(menuId: number) {
  return requestDelete(`system/menu/${menuId}`, {}, { isSuccessMessage: true });
}

// 获取部门列表
export function getDeptList(dto: any) {
  return get("system/dept/list", dto);
}

// 获取角色菜单 
export function getMenuTreeByRole(roleId: number) {
  return get(`system/menu/roleMenuTreeselect/${roleId}`);
}

// 新增部门列表
export function addDept(dto: any) {
  return post("system/dept", dto, { isSuccessMessage: true });
}

// 删除部门
export function deleltDept(deptId: number) {
  return requestDelete(`system/dept/${deptId}`, {}, { isSuccessMessage: true });
}

// 获取部门
export function getDept(deptId: number) {
  return get(`system/dept/${deptId}`);
}

// 编辑部门
export function editDept(dto: any) {
  return put("system/dept", dto, { isSuccessMessage: true });
}

// 审批记录-列表
export function getHasWait(dto: any, cb: (data: any) => void) {
  return workerGet({ api: '/admin/waitHandle/hasWaitHandle', dto, cb, config: { time: 30 * 1000 } })
}

/** Ca登录驱动 */
export function getLoginFileCA(dto?: any) {
  return post(`/file/download`,dto,{ isRequestFile: true});
}