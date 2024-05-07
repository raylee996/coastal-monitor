import { doGetControlInfoList, getAllControlList } from "./controlManage"
import { getModelListAsync } from "./model"
import { getPointListAsync } from "../device"
import { getLabelTable } from "../label"
import { getQueryPlaceList } from "../place"
import { getBlackTable, getDictDataByType } from "../system"
import { PageInfo } from "hooks/integrity/TableInterface"
import { addPlan, editPlan, getJudgeRecordApi, getJudgeRecordGroupByApi } from "api/core/planManagement"
import matching, { shipListTypeDict } from "helper/dictionary"

// 预案中获取预案类型
export async function planGetLabelTable() {
    let vo = await getLabelTable({ type: 12 })
    return vo.data.map((item: any) => {
        return {
            name: item.labelName,
            value: item.id
        }
    })
}

// 预案中获取模型列表
export async function planGetModelListAsync(hasFilterPlan: boolean) {
    const vo: any = await getModelListAsync({ pageNumber: 1, pageSize: -1 }, { hasFilterPlan, status: 1 })
    return vo.data.map((item: any) => {
        return {
            name: item.modelName,
            value: item.modelId
        }
    })
}


// 预案中获取点位列表
export async function planGetPointListAsync() {
    const vo: any = await getPointListAsync({
        deviceTypes: ['1'],
        businessFunctions: ['6']
    })
    return vo
}

// 预案中获取船舶布控
export async function planGetAllControlList() {
    let vo: any = await getAllControlList({ pageNumber: 1, pageSize: -1 }, { controlCategory: 1, controlStatus: 3 })
    return vo.data.map((item: any) => {
        return {
            ...item,
            name: item.controlName,
            value: item.id,
        }
    })
}

// 预案中获取人车布控列表
export async function planDoGetControlInfoList() {
    // 获取不空中的列表
    let vo: any = await doGetControlInfoList({ pageNumber: 1, pageSize: -1 }, { controlCategory: 2, controlStatus: 3 })
    return vo.data.map((item: any) => {
        return {
            ...item,
            name: item.controlName,
            value: item.id
        }
    })
}

// 预案中获取场所布控列表
export async function planGetQueryPlaceList() {
    let vo: any = await getQueryPlaceList({ pageNumber: 1, pageSize: -1 }, {})
    return vo.data.map((item: any) => {
        return {
            name: item.name,
            value: item.id
        }
    })
}

// 获取黑名单列表
export async function planGetBlackTable(params?: any) {
    let vo: any = await getBlackTable({ pageNumber: 1, pageSize: -1 }, { ...params })
    return vo.data.map((item: any) => {
        return {
            ...item,
            name: item.content,
            value: item.id
        }
    })
}

//新增预案
export async function addPlanAsync(params: any) {
    let dto: any = {
        ...params
    }
    let res = await addPlan(dto)
    return res
}

// 编辑预案
export async function editPlanAsync(params: any) {
    let dto: any = {
        ...params
    }
    let res = await editPlan(dto)
    return res
}

/** 预警目标自动研判serve */

// 研判记录列表
export async function getJudgeRecordList(pageInfo: PageInfo, params: any) {
    const dto = {
        ...pageInfo,
        ...params,
    };

    const [res, shipTypeDict] = await Promise.all([
        getJudgeRecordApi(dto),
        getDictDataByType("archive_ship_type")
    ])

    matching(res.records, shipTypeDict, "shipType");
    matching(res.records, shipListTypeDict, "focusType");

    return {
        data: res.records,
        total: res.total,
    };
}

// 高危目标列表
export async function getJudgeRecordGroupByList(pageInfo: PageInfo, params: any) {
    const dto = {
        ...pageInfo,
        ...params,
    };

    const [res, shipTypeDict] = await Promise.all([
        getJudgeRecordGroupByApi(dto),
        getDictDataByType("archive_ship_type")
    ])

    matching(res.records, shipTypeDict, "shipType");
    matching(res.records, shipListTypeDict, "focusType");

    return {
        data: res.records,
        total: res.total,
    };
}

