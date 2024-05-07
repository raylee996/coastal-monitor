// 标签管理API
import { Config, get, post, put, requestDelete } from "helper/ajax"

// 开发
export function graphqlLabel(dto: any) {
    return post('/graphql/label', dto, { isNotToken: true, isGraphql: true })
}

// 对接阶段
// 新增标签
export function addLabel(dto: any) {
    return post('/admin/label/add', dto)
}

export function addLabelUseResponse(dto: any) {
    return post('/admin/label/add', dto, { isUseResponse: true })
}

// 删除标签
export function delLabel(dto: any) {
    return requestDelete(`/admin/label/${dto.id}`, dto, { successText: '删除标签' })
}

// 获取标签列表
export function getLabelList(dto: any, config?: Config) {
    return post('/admin/label/list', dto, config)
}

// 获取重点场所标签项
export function getPlaceLabel(config?: Config) {
    return get('/archive/place/countPlaceByLabel', null, config)
}

// 修改标签
export function editLabel(dto: any) {
    return put('/admin/label/edit', dto)
}