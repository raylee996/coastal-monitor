import { getDeviceGroup } from "api/device";
import { addMark, delMark, getMapCtrlArea, getMarkList, graphqlMap, workerPostGraphqlMap } from "api/map";
import { getPlacesList } from "api/place";
import matching, { deviceStatues } from "helper/dictionary";
import { graphAreaSort } from "helper/map/common";
import { getIconByDeviceType } from "helper/mapIcon";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import { LatLng } from "webgis/webgis";
import { getDictDataByType } from "./system";

export async function getMapTrack() {
  const dto = {
    query: `query {
      queryAISList{
        trackId
        lat
        lng
        speed
        course
        heading
      }
        }`,
    variables: {},
  };
  const res = await graphqlMap(dto);
  return res.data.data.queryAISList;
}

export async function getMapRadar(pageInfo: PageInfo) {
  const dto = {
    query: `query ($pageInfo: PageInfo){
            table(pageInfo: $pageInfo){
                id
                name
                src
            } 
        }`,
    variables: {
      pageInfo,
    },
  };
  const res = await graphqlMap(dto);
  return {
    data: res.data.data.table,
    total: 50,
  };
}

export function getShipWorker(cb: (data: any) => void) {
  const dto = {
    query: `query {
      queryAISList{
        trackId
        lat
        lng
        speed
        course
        heading
      }
        }`,
    variables: {},
  };
  return workerPostGraphqlMap(dto, cb);
}

export async function getHisShipTrack(trackId: string) {
  const dto = {
    query: `query {
      queryHisShipTrack{
        lat
        lng
        time
      }
        }`,
    variables: {
      id: trackId,
    },
  };
  const res = await graphqlMap(dto);
  return res.data.data.queryHisShipTrack;
}


/**重点场所列表 */
export async function getPlaceData(labelIds: number[], signal: AbortController) {

  let dto = {
    labelIds: labelIds.toString(),
    pageSize: -1,
    pageNumber: 1
  }

  const data = await getPlacesList(dto, { signal });

  const result = graphAreaSort(data.records)

  return result;
}


/** 布控区域列表 */
export async function getCtrlArea(val: number, signal: AbortController) {

  let dto: any = {}

  if (val === 1) {
    dto.isMine = 1
  }

  const data = await getMapCtrlArea(dto, { signal });

  return data;
}


/** 态势感知-基础设施-电子防区-标记 */
export async function getAllMarkList(type: number, signal: AbortController): Promise<any[]> {
  let dto = {
    type,
    pageSize: -1,
    pageNumber: 1
  }

  const vo = await getMarkList(dto, { signal });

  return _.filter(vo.records, (item: any) => item.latitude && item.longitude);
}

/**
 * 用于由geoman创建的Text标记
 * @param layer Text图层
 * @returns 
 */
export async function addMarkData(layer: any) {
  const latLng = layer.getLatLng()
  const name = layer.pm.textArea.value

  const dto = {
    type: 1,
    name,
    latitude: latLng.lat,
    longitude: latLng.lng
  }

  const vo = await addMark(dto);

  return vo.records;
}

export async function addTextMarker(data: any) {
  const dto = {
    type: 1,
    name: data.text,
    latitude: data.latlng.lat,
    longitude: data.latlng.lng
  }
  await addMark(dto)
}

export async function delMarkData(layer: any) {
  const latLng = layer.getLatLng()
  const name = layer.pm.textArea.value

  let dto = {
    pageSize: -1,
    pageNumber: 1
  }

  const vo = await getMarkList(dto);

  const target = vo.records.find((item: any) => {
    return item.name === name && item.latitude === latLng.lat && item.longitude === latLng.lng
  })

  if (target) {
    await delMark(target.id)
  }
}

export async function delTextMarker(data: any) {
  await delMark(data.id)
}

export async function removeTextMarker(data: { text: string, latlng: any }) {
  const latLng = data.latlng
  const name = data.text

  let dto = {
    pageSize: -1,
    pageNumber: 1
  }

  const vo = await getMarkList(dto);

  const target = vo.records.find((item: any) => {
    return item.name === name && item.latitude === latLng.lat && item.longitude === latLng.lng
  })

  if (target) {
    await delMark(target.id)
  }
}

export async function getAllDeviceMarkerGroupBySource(deviceTypes: string[], source: string[], signal: AbortController): Promise<any[]> {

  if (source.length) {
    const dto = {
      deviceTypes,
      deviceSource: source.length === 1 ? Number(source[0]) : undefined,
      pageNumber: 1,
      pageSize: -1
    }

    const vo = await getDeviceGroup(dto, { signal })
    // const deviceTypeDict = await getDictDataByType("device_type_02")
    const cameraTypeDict = await getDictDataByType<number>("camera_type", 'number')

    const result = vo.map((item: any[]) => {
      let ele: any
      const cameraDevice = item.find(device => device.cameraType !== 0)

      if (cameraDevice) {
        ele = cameraDevice
      }

      if (!ele) {
        const radarDevice = item.find(device => device.deviceType === '5' || device.deviceType === '6')
        if (radarDevice) {
          ele = radarDevice
        }
      }

      if (!ele) {
        const aisDevice = item.find(device => device.deviceType === '4')
        if (aisDevice) {
          ele = aisDevice
        }
      }

      if (!ele) {
        ele = item[0]
      }

      // matching(item, deviceTypeDict, 'deviceType')
      matching(item, deviceStatues, 'status')

      const lIcon = getIconByDeviceType(ele.deviceType, ele.cameraType)
      ele.latLng = [ele.latitude, ele.longitude]
      ele.lIcon = lIcon
      if (item.length > 1) {
        ele.group = item
      }

      const isCamera = cameraTypeDict.some(dict => dict.value === ele.cameraType)
      ele.isCamera = isCamera

      return ele
    })

    return result;
  } else {
    return []
  }

}

export async function getAllDeviceMarkerGroup(deviceTypes: string[], signal: AbortController): Promise<any[]> {

  const dto = {
    deviceTypes,
    pageNumber: 1,
    pageSize: -1
  }

  const vo = await getDeviceGroup(dto, { signal })
  // const deviceTypeDict = await getDictDataByType("device_type_02")
  const cameraTypeDict = await getDictDataByType<number>("camera_type", 'number')

  const result = vo.map((item: any[]) => {
    let ele: any
    const cameraDevice = item.find(device => device.cameraType !== 0)

    if (cameraDevice) {
      ele = cameraDevice
    }

    if (!ele) {
      const radarDevice = item.find(device => device.deviceType === '5' || device.deviceType === '6')
      if (radarDevice) {
        ele = radarDevice
      }
    }

    if (!ele) {
      const aisDevice = item.find(device => device.deviceType === '4')
      if (aisDevice) {
        ele = aisDevice
      }
    }

    if (!ele) {
      ele = item[0]
    }

    // matching(item, deviceTypeDict, 'deviceType')
    matching(item, deviceStatues, 'status')

    const lIcon = getIconByDeviceType(ele.deviceType, ele.cameraType)
    ele.latLng = [ele.latitude, ele.longitude]
    ele.lIcon = lIcon
    if (item.length > 1) {
      ele.group = item
    }

    const isCamera = cameraTypeDict.some(dict => dict.value === ele.cameraType)
    ele.isCamera = isCamera

    return ele
  })

  return result;

}

export async function addPinMarker(latlng: LatLng) {
  const dto = {
    iconType: 1,
    type: 2,
    latitude: latlng.lat,
    longitude: latlng.lng,
  }

  const id = await addMark(dto)

  return id
}