
import { PaginationProps } from "antd/lib/pagination";
import SelectPointMap from "component/SelectPointMap";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useMemo, useRef } from "react";
import { doUploadFile } from "server/common";
import { doGetGetTrackList } from "server/place";
import { getDictDataByType } from "server/system";
import PDCarItem from "./components/PDCarItem";
import styles from "./index.module.sass";
import './index.sass'


interface Props {
  placeId: any
}
const  paginationProps: PaginationProps={
  pageSize: 12,
  pageSizeOptions: [12,24,48,96]
}
const PlaceDataCar: React.FC<Props> = ({ placeId }) => {
  console.debug('PlaceDataCar')


  const tableRef = useRef<any>(null)


  const queryInputs = useMemo(() => [
    [
      '点位',
      'deviceCodes',
      InputType.component,
      {
        component: SelectPointMap,
        placeId: placeId,
        deviceType: 1,
        isDeviceCode: true
      }
    ],
    ['时间', 'datetime', InputType.dateTimeRange],
    ['车牌号',
      'searchCondition',
      {
        placeholder: '请输入车牌号',
        allowClear: true
      }
    ],
    [
      '车牌颜色',
      'plateColor',
      InputType.selectRemote,
      {
        request: () => getDictDataByType("archive_plate_color"),
        allowClear: true
      }
    ],
    [
      '车型',
      'carType',
      InputType.selectRemote,
      {
        request: () => getDictDataByType("archive_car_type"),
        allowClear: true
      }
    ],
    [
      '车身颜色',
      'carColor',
      InputType.selectRemote,
      {
        request: () => getDictDataByType("archive_car_color"),
        allowClear: true
      }
    ],
    ['照片', 'platePath',
      InputType.uploadImg,
      ShowType.image,
      {
        isRow: true,
        maxCount: 2,
        useType: UseType.edit,
        uploadImgFn: doUploadFile,
        displayUrl: ''
      }
    ],
  ], [placeId])

  const handleClick = useCallback(
    (data?: any) => {
      console.log(data)
    },
    [],
  )

  const cardOptions = useMemo(() => ({
    onSelected: handleClick,
    isRadio: true,
    isSelectedFirst: false,
    isFlex: true
  }), [handleClick])

  const extraParams = useMemo(() => ({
    codeType: 1,
    focusPlaceId: placeId
  }), [placeId])


  return (
    <article className={`${styles.wrapper} tablesCars`}>
      <TableInterface
        ref={tableRef}
        card={PDCarItem}
        cardOptions={cardOptions}
        extraParams={extraParams}
        request={doGetGetTrackList}
        queryInputs={queryInputs}
        paginationProps={paginationProps}
      />
    </article>
  )
}

export default PlaceDataCar
