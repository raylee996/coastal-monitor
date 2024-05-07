// API:人员档案
import { Config, get, post, put, requestDelete } from "helper/ajax";

// 获取人员档案列表
export function getPersonList(dto: any, config?: Config) {
    return get(`/archive/person/list`, dto, config)
}

// 新增人员档案
export function addPerson(dto: any) {
    return post(`/archive/person/add`, dto, { successText: '新增人员档案' })
}

// 编辑人员档案
export function editPerson(dto: any) {
    return put(`/archive/person/edit`, dto, { successText: '编辑人员档案' })
}

// 获取人员档案详情
export function getPersonInfo(dto: any) {
    return get(`/archive/person/getInfo`, dto)
}

// 删除人员档案
export function delPerson(dto: any) {
    return requestDelete(`/archive/person/${dto}`, null, { successText: '删除人员档案' })
}

// 查询涉案列表
export function getPersonCaseList(dto: any) {
    return get(`/archive/person/caseList`, dto)
}

/** 个人社保 */
// 人员档案-查询个人【社保】信息列表
export function getPersonSocialList(dto: any) {
    return get(`/archive/archiveSocial/list`, dto)
}

// 人员档案-查询个人【社保】信息
export function getPersonSocialInfo(dto: any) {
    return get(`/archive/archiveSocial/getInfo`, dto)
}

// 人员档案-新增个人【社保】信息
export function addPersonSocial(dto: any) {
    return post(`/archive/archiveSocial/add`, dto, { successText: '新增个人社保' })
}

// 人员档案-编辑个人【社保】信息
export function editPersonSocial(dto: any) {
    return put(`/archive/archiveSocial/edit`, dto, { successText: '编辑个人社保' })
}

// 人员档案-删除个人【社保】信息
export function delPersonSocial(dto: any) {
    return requestDelete(`/archive/archiveSocial/${dto}`, null, { successText: '删除个人社保' })
}

/** 个人银行信息 */
// 人员档案-查询个人【银行】信息列表
export function getPersonBankList(dto: any) {
    return get(`/archive/archiveBank/list`, dto)
}

// 人员档案-查询个人【银行】信息
export function getPersonBankInfo(dto: any) {
    return get(`/archive/archiveBank/getInfo`, dto)
}

// 人员档案-新增个人【银行】信息
export function addPersonBank(dto: any) {
    return post(`/archive/archiveBank/add`, dto, { successText: '新增个人银行信息' })
}

// 人员档案-编辑个人【银行】信息
export function editPersonBank(dto: any) {
    return put(`/archive/archiveBank/edit`, dto, { successText: '编辑个人银行信息' })
}

// 人员档案-删除个人【银行】信息
export function delPersonBank(dto: any) {
    return requestDelete(`/archive/archiveBank/${dto}`, null, { successText: '删除个人银行信息' })
}


/** 个人房产信息 */
// 人员档案-查询个人【房产】信息列表
export function getPersonHouseList(dto: any) {
    return get(`/archive/archiveHouse/list`, dto)
}

// 人员档案-查询个人【房产】信息
export function getPersonHouseInfo(dto: any) {
    return get(`/archive/archiveHouse/getInfo`, dto)
}

// 人员档案-新增个人【房产】信息
export function addPersonHouse(dto: any) {
    return post(`/archive/archiveHouse/add`, dto, { successText: '新增个人房产信息' })
}

// 人员档案-编辑个人【房产】信息
export function editPersonHouse(dto: any) {
    return put(`/archive/archiveHouse/edit`, dto, { successText: '编辑个人房产信息' })
}

// 人员档案-删除个人【房产】信息
export function delPersonHouse(dto: any) {
    return requestDelete(`/archive/archiveHouse/${dto}`, null, { successText: '删除个人房产信息' })
}


/** 个人车辆信息 */
// 人员档案-查询个人【车辆】信息列表
export function getPersonCarList(dto: any) {
    return get(`/archive/archiveCar/list`, dto)
}

// 人员档案-查询个人【车辆】信息
export function getPersonCarInfo(dto: any) {
    return get(`/archive/archiveCar/getInfo`, dto)
}

// 人员档案-新增个人【车辆】信息
export function addPersonCar(dto: any) {
    return post(`/archive/archiveCar/add`, dto, { successText: '新增个人车辆信息' })
}

// 人员档案-编辑个人【车辆】信息
export function editPersonCar(dto: any) {
    return put(`/archive/archiveCar/edit`, dto, { successText: '编辑个人车辆信息' })
}

// 人员档案-删除个人【车辆】信息
export function delPersonCar(dto: any) {
    return requestDelete(`/archive/archiveCar/${dto}`, null, { successText: '删除个人车辆信息' })
}



/** 个人虚拟信息 */
// 人员档案-查询个人【虚拟】信息列表
export function getPersonVirtualList(dto: any) {
    return get(`/archive/archiveVirtual/list`, dto)
}

// 人员档案-查询个人【虚拟】信息
export function getPersonVirtualInfo(dto: any) {
    return get(`/archive/archiveVirtual/getInfo`, dto)
}

// 人员档案-新增个人【虚拟】信息
export function addPersonVirtual(dto: any) {
    return post(`/archive/archiveVirtual/add`, dto, { successText: '新增个人虚拟信息' })
}

// 人员档案-编辑个人【虚拟】信息
export function editPersonVirtual(dto: any) {
    return put(`/archive/archiveVirtual/edit`, dto, { successText: '编辑个人虚拟信息' })
}

// 人员档案-删除个人【虚拟】信息
export function delPersonVirtual(dto: any) {
    return requestDelete(`/archive/archiveVirtual/${dto}`, null, { successText: '删除个人虚拟信息' })
}

// 查询人员类型分类数量
export function getPersonTypeCount(dto: any) {
    return get(`/archive/person/personTypeCount`, dto);
}

// 导入人员
export function importPersons(dto: any) {
    return post("/archive/person/import", dto, { isUploadFile: true });
}