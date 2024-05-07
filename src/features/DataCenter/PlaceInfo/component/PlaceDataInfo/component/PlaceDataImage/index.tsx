
import SelectPointMap from "component/SelectPointMap";
import ImageSimple from "hooks/basis/ImageSimple";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useMemo, useRef } from "react";
import { getPlaceImgTable } from "server/place";
import styles from "./index.module.sass";


interface IFaceItem {
  data?: any
  onSelect?: any
}

const ImageItem: React.FC<IFaceItem> = (props) => {
  const { data, onSelect } = props

  return (
    <div className={styles.pdcarItems} onClick={() => {
      onSelect(true, data)
    }}>
      <div className={styles.boxL}>
        <div className={styles.imgs}>
          <ImageSimple className={styles.img} src={data.path} />
        </div>
      </div>
      <div className={styles.boxR}>
        <div className={styles.siteRow}>
          <div className={styles.siteCol}>
            <span>点位：{data.address}</span>
          </div>
          <div className={styles.siteCol}>
            <span>时间：{data.capTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const paginationProps = {
  pageSize: 20
}

interface IPlaceDataImage {
  placeId: any
}
const PlaceDataImage: React.FC<IPlaceDataImage> = ({ placeId }) => {
  console.debug('PlaceDataImage')


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
    ['时间', 'datetime', InputType.dateTimeRange]
  ], [placeId])


  const handleClick = useCallback(
    (data?: any) => {
      console.log(data)
    },
    [],
  )


  const extraParams = useMemo(() => {
    return {
      codeType: 10,
      focusPlaceId: placeId
    }
  }, [placeId])

  const cardOptions = useMemo(() => {
    return {
      onSelected: handleClick,
      isRadio: true,
      isSelectedFirst: false,
      isFlex: false
    }
  }, [handleClick])


  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        card={ImageItem}
        cardOptions={cardOptions}
        extraParams={extraParams}
        request={getPlaceImgTable}
        queryInputs={queryInputs}
        paginationProps={paginationProps}
      />
    </article>
  )
}

export default PlaceDataImage
