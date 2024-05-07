
import styles from "./index.module.sass";
import TableInterface from "hooks/integrity/TableInterface"
import { getAllSisdomSearchList } from "server/core/wisdomSearch"
import { InputType } from "hooks/flexibility/FormPanel"
import DramAreaInForm from "component/DramAreaInForm";
import { useAppSelector } from "app/hooks";
import { selectCoreArea } from "slice/coreAreaSlice";
import { useState } from "react";
import dayjs from "dayjs";


const validatorHigt = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (value < 0 || value > 70) {
        return Promise.reject(new Error('请输入0~70的航速！'));
      }
      if (!(/^\d{1,2}$/.test(value))) {
        return Promise.reject(new Error('请输入0~70的航速！'));
      }
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
  ['雷达批号', 'searchCondition', {
    placeholder: '请输入雷达批号',
    allowClear: true,
    style: { width: '170px' }
  }],
  ['航速', 'firstSpeed', {
    placeholder: '最小航速',
    allowClear: true,
    itemProps: { rules: [validatorHigt] },
    style: { width: '100px' }
  }],
  ['', 'lastSpeed', {
    placeholder: '最大航速',
    allowClear: true,
    itemProps: { rules: [validatorHigt] },
    style: { width: '100px' }
  }]
]

const columns = [
  // ['序号', 'index'],
  ['时间', 'capTime'],
  ['点位', 'device_name'],
  ['雷达批号', 'content'],
  ['经纬度', 'LatLng'],
  ['航速(节)', 'speed'],
  ['航向', 'course']
]

const extraParams = { codeType: 7 }

const RadarData: React.FC = () => {
  console.debug('RadarData')


  const { layer } = useAppSelector(selectCoreArea)


  const [queryInit] = useState(() => {
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
    return result
  })


  return (
    <article className={styles.wrapper}>
      <TableInterface
        columns={columns}
        queryInputs={controlInputs}
        extraParams={extraParams}
        queryInit={queryInit}
        request={getAllSisdomSearchList}
      />
    </article>
  )
}

export default RadarData