
import styles from "./index.module.sass";
import TableInterface from "hooks/integrity/TableInterface"
import { getAllSisdomSearchList } from "server/core/wisdomSearch"
import { InputType } from "hooks/flexibility/FormPanel"
import DramAreaInForm from "component/DramAreaInForm";
import { getDictDataByType } from "server/system";
import { useMemo } from "react";
import { useAppSelector } from "app/hooks";
import { selectCoreArea } from "slice/coreAreaSlice";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";


const validatorHigt = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (Number(value) < 0 || Number(value) > 70) {
        return Promise.reject(new Error('请输入0~70的航速！'));
      }
      /*  if (!(/^\d{1,2}$/.test(value))) {
         return Promise.reject(new Error('请输入0~70的航速！'));
       } */
      return Promise.resolve()
    } else {
      return Promise.resolve()
    }
  }
}

const controlInputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: true,
    style: { width: '330px' }
  }],
  ['区域', 'areaJsonList', InputType.component, {
    component: DramAreaInForm,
    inputProps: {
      placeholder: '请选择区域',
    },
    isNotCircle: true,
    isNotPolygon: true,
    isNotLine: true
  }],
  ['船舶', 'searchCondition', {
    placeholder: 'MMSI/船名',
    allowClear: true,
    style: { width: '150px' }
  }],
  ['船型', 'shipType', InputType.selectRemote,
    {
      request: () => getDictDataByType("archive_ship_type"),
      placeholder: '请选择船型',
      style: { width: '150px' }
    }],
  ['航行状态', 'shipStatus', InputType.selectRemote,
    {
      request: () => getDictDataByType("nav_status"),
      placeholder: '请选择状态',
      style: { width: '150px' }
    }
  ],
  ['航速', 'firstSpeed', {
    placeholder: '最小航速',
    allowClear: true,
    itemProps: { rules: [validatorHigt] },
    style: { width: '120px' }
  }],
  ['', 'lastSpeed', {
    placeholder: '最大航速',
    allowClear: true,
    itemProps: { rules: [validatorHigt] },
    style: { width: '120px' }
  }]
]

const columns = [
  ['点位', 'device_name'],
  ['船名', 'shipName'],
  ['时间', 'capTime'],
  ['MMSI', 'content'],
  ['IMO', 'imo_num'],
  ['呼号', 'callsign'],
  ['船型', 'ship_typeName'],
  ['船籍', 'registry'],
  ['目的港', 'destination'],
  ['状态', 'trackStatusStrName'],
  ['经纬度', 'LatLng'],
  ['航速(节)', 'speed'],
  ['船艏向', 'trueHeading'],
  ['航向', 'course']
]

const extraParams = { codeType: 6 }

const AisData: React.FC = () => {
  console.debug('AisData')


  const { state } = useLocation() as { state: any }


  const { layer } = useAppSelector(selectCoreArea)


  const queryInit = useMemo(() => {
    const result: any = {
      datetime: [dayjs().subtract(1, 'hour'), dayjs()]
    }
    if (layer) {
      const geo = layer.toGeoJSON()
      if (layer.pm._shape === "Circle") {
        geo.properties.subType = layer.pm._shape
        geo.properties.radius = layer._mRadius
      }
      result.areaJsonList = geo
    }
    if (state && state.deviceCode) {
      result.deviceCodes = state.deviceCode
    }

    return result
  }, [state, layer])


  return (
    <article className={styles.wrapper}>
      <TableInterface
        columns={columns}
        extraParams={extraParams}
        queryInit={queryInit}
        queryInputs={controlInputs}
        request={getAllSisdomSearchList}
      />
    </article>
  )
}

export default AisData