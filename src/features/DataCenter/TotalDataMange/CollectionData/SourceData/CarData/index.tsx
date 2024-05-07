
import styles from './index.module.sass'
import { InputType } from "hooks/flexibility/FormPanel"
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import TableInterface from "hooks/integrity/TableInterface"
import { getAllSisdomSearchList } from "server/core/wisdomSearch"
import Carcomponent from './Carcomponent'
import './index.sass'
import dayjs from 'dayjs';
import { getCarColor, getCarMake, getCarType, getPlateColor } from 'server/car';
import { useMemo } from 'react';
import { PaginationProps } from 'antd/lib/pagination';
import { useLocation } from 'react-router-dom';

const paginationProps: PaginationProps = {
  pageSize: 12,
  pageSizeOptions: [12, 24, 48, 96]
}

const CarInputs = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: true
  }],
  ['点位', 'pointJsonList', InputType.component, {
    component: AreaPointDrawFrom,
    inputProps: {
      size: 'middle',
      style: { width: '180px' }
    },
    pointProps: {
      isPoint: true,
      params: {
        businessFunctions: ['4'],
        deviceTypes: ['1'],
        cameraTypes: [9]
      }
    },
  }],
  ['车牌', 'searchCondition'],
  [
    '车牌颜色',
    'plateColor',
    InputType.selectRemote,
    {
      request: getPlateColor,
      allowClear: true
    }
  ],

  [
    '车身颜色',
    'carColor',
    InputType.selectRemote,
    {
      request: getCarColor,
      allowClear: true
    }
  ],

  [
    '车品牌',
    'carBrand',
    InputType.selectRemote,
    {
      request: getCarMake,
      allowClear: true
    }
  ],
  [
    '车型',
    'carType',
    InputType.selectRemote,
    {
      request: getCarType,
      allowClear: true,
      width: 160
    }
  ],
]

const extraParams = { codeType: 1 }


const CarData: React.FC = () => {
  console.debug('CarData')


  const { state } = useLocation() as { state: any }


  const queryInit = useMemo(() => {
    const result: any = {
      datetime: [dayjs().subtract(1, 'day'), dayjs()]
    }
    if (state && state.deviceCode) {
      result.pointJsonList = [state.deviceCode]
    }
    return result
  }, [state])


  return (
    <article className={`${styles.wrapper} tablesCar`}>
      <TableInterface
        card={Carcomponent}
        queryInputs={CarInputs}
        extraParams={extraParams}
        queryInit={queryInit}
        request={getAllSisdomSearchList}
        paginationProps={paginationProps}
      />
    </article>
  )
}

export default CarData