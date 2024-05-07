import { addArchiveRelation } from "api/archive";


/** 图数据库添加档案实体与关系，双方都有档案id,目前只支持人员档案使用 */
export async function addArchiveRelationData(params: any) {
    const dto = {

    }
    await addArchiveRelation(dto);
}