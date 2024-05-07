import dayjs, { Dayjs } from 'dayjs';
import { YMDHms } from './../helper/index';
import { graphqlTrack } from "api/track";
import _ from 'lodash';
import { getAISHistoryTrack, getRadarHistoryTrack } from 'api/ship';
import { TarckData } from 'component/ShipTrackPlay';
import moment from 'moment';
import { getHistoryTrackApi } from 'api/dataCenter/shipSailing';

export async function getShipTrack() {
  const dto = {
    query: `{
      table {
        lng
        lat
        speed
        course
        heading
        datetime
      }
    }`,
    variables: {}
  };
  const res = await graphqlTrack(dto);
  return res.data.data.table;
}

export async function getShipTrail() {
  const dto = {
    query: `{
      list {
        lng
        lat
        speed
        course
        heading
        datetime
      }
    }`,
    variables: {}
  };
  const res = await graphqlTrack(dto);
  return res.data.data.list;
}

/**
 * 查询AIS目标历史轨迹
 * @param range 时间范围
 * @param mmsi 
 * @returns 轨迹列表
 */
export async function getAISHistoryTrackData(range: [Dayjs, Dayjs], mmsi: any) {

  const [beginTimeMoment, endTimeMoment] = range

  const dto = {
    beginTime: beginTimeMoment.format(YMDHms),
    endTime: endTimeMoment.format(YMDHms),
    mmsi,
  }

  const vo = await getAISHistoryTrack(dto);

  const tarckList: TarckData[] = []

  if (_.has(vo.allTrace, mmsi)) {
    const trackData = _.get(vo.allTrace, mmsi).traceInfo
    trackData.forEach((ele: any) => {
      tarckList.push({
        lng: ele.longitude,
        lat: ele.latitude,
        datetime: moment(ele.capTime).format(YMDHms),
        course: ele.course,
        heading: ele.trueHeading,
        speed: ele.speed
      })
    });
  }
  return tarckList
}

/**
 * 查询雷达目标历史轨迹
 * @param range 时间范围
 * @param uniqueId 
 * @returns 轨迹列表
 */
export async function getRadarHistoryTrackData(range: [Dayjs, Dayjs], uniqueId: any) {

  const [beginTimeMoment, endTimeMoment] = range

  const dto = {
    beginTime: beginTimeMoment.format(YMDHms),
    endTime: endTimeMoment.format(YMDHms),
    uniqueId,
  }

  const vo = await getRadarHistoryTrack(dto);

  const tarckList: TarckData[] = []

  if (_.has(vo.allTrace, uniqueId)) {
    const trackData = _.get(vo.allTrace, uniqueId).traceInfo
    trackData.forEach((ele: any) => {
      tarckList.push({
        lng: ele.longitude,
        lat: ele.latitude,
        datetime: moment(ele.capTime).format(YMDHms),
        course: ele.course,
        heading: ele.trueHeading,
        speed: ele.speed
      })
    });
  }

  return tarckList
}

export async function getPlaceTargetTrack(params: any) {
  const dto = {
    beginTime: dayjs(params.capTime).subtract(1, 'h').format(YMDHms),
    endTime: params.capTime,
    current: 1,
    size: 9999
  }
  if (params.codeType === 7) {
    _.set(dto, 'uniqueId', params.codeValue)
  } else {
    _.set(dto, 'mmsi', params.codeValue)
  }
  const vo = await getHistoryTrackApi(dto)

  const result: TarckData[] = vo.content.map((item: any) => ({
    lng: item.longitude,
    lat: item.latitude,
    datetime: item.capTime,
    // course: item.course,
    // heading: item.trueHeading,
    // speed: item.speed
    speed: item.speed * 0.5144444444,
    heading: (!item.trueHeading || item.trueHeading === 511 ? item.course: item.trueHeading * Math.PI / 180.0),
    course: item.course * Math.PI / 180.0,
  })).sort((a: { datetime: number }, b: { datetime: number }) => {
    return dayjs(a.datetime).isAfter(dayjs(b.datetime)) ? 1 : -1;
  })

  return result
}