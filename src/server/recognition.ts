import { getFaceList } from "api/recognition";
import { PageInfo } from "hooks/integrity/TableInterface";


/** 获取人脸对比列表 */
export async function doGetFaceLists(pageInfo: PageInfo, params: any) {
  const dto = {
    ...pageInfo,
    ...params
  };

  const [res] = await Promise.all([
    getFaceList(dto),
  ])

  return {
    data: res.records,
    total: res.total,
  };
}