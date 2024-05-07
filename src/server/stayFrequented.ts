import { searchStayApi, stayTaskApi } from "api/stayFrequented";
import dayjs from "dayjs";

const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";

/** 提交常去地任务 */
export async function submitStayTask(params: any) {
  const { searchTime, ...obj } = params;
  if (searchTime) {
    obj.endTime = dayjs(searchTime[0]).format(dateTimeFormat);
    obj.startTime = dayjs(searchTime[1]).format(dateTimeFormat);
  }
  const res = await stayTaskApi(obj);
  return res;
}

/** 常去地结果查询 */
export async function searchStayFrequented(params: any) {
  const res = await searchStayApi(params);
  res.result =
    res?.result?.map((item: any, index: number) => {
      return {
        id: index,
        lat: item.latitude,
        lng: item.longitude,
        label: item.address,
        ...item,
      };
    }) || [];
  return res;
}
