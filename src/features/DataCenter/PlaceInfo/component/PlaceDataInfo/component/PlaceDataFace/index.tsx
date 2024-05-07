
import SelectPointMap from "component/SelectPointMap";
import { commonIntIsDict } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef, useMemo } from "react";
import { doUploadFile } from "server/common";
import { doGetGetTrackList } from "server/place";
import { getDictDataByType } from "server/system";
import styles from "./index.module.sass";
import './index.sass'

interface IFaceItem {
  data?: any
  onSelect?: any
}

const FaceItem: React.FC<IFaceItem> = (props) => {
  const { data, onSelect } = props

  return (
    <div className={styles.pdcarItems} onClick={() => {
      onSelect(true, data)
    }}>
      <div className={styles.boxL}>
        <div className={styles.imgs}>
          <ImageSimple className={styles.img} src={data.path} />
        </div>
        <div className={styles.imgs}>
          <ImageSimple className={styles.img} src={data.path2} />
        </div>
      </div>
      <div className={styles.boxR}>
        <div className={styles.infoRow}>
          <div className={styles.infoCol}>
            <span className={styles.infoIcon}>
              <span className={'iconfont icon-nv'}></span>
            </span>

            <span className={styles.infoIcon}>
              <span className={'iconfont icon-yanjing'}></span>
            </span>

            <span className={styles.infoIcon}>
              <span className={'iconfont icon-maozi'}></span>
            </span>

            <span className={styles.infoIcon}>
              <span className={'iconfont icon-kouzhao'}></span>
            </span>

            <span className={styles.infoIcon}>
              <span className={'iconfont icon-qingnian'}></span>
            </span>

          </div>
        </div>

        <div className={styles.siteRow}>
          <div className={styles.siteCol}>
            <span>地点：</span><span>{data.capAddress}</span>
          </div>
          <div className={styles.siteCol}>
            <span>{data.capTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


interface IPlaceDataFace {
  placeId: any
}
const PlaceDataFace: React.FC<IPlaceDataFace> = ({ placeId }) => {
  console.debug('PlaceDataFace')


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
    [
      '性别',
      'sex',
      InputType.selectRemote,
      {
        request: () => getDictDataByType("sys_user_sex"),
        allowClear: true
      }
    ],

    [
      '年龄段',
      'ageGroup',
      InputType.selectRemote,
      {
        request: () => getDictDataByType("age_group"),
        allowClear: true
      }
    ],

    [
      '戴口罩',
      'wearMask',
      InputType.select,
      {
        dict: commonIntIsDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '戴眼镜',
      'wearGlasses',
      InputType.select,
      {
        dict: commonIntIsDict,
        allowClear: true,
        style: { minWidth: '120px' }
      }
    ],
    [
      '戴帽子',
      'wearHat',
      InputType.select,
      {
        dict: commonIntIsDict,
        allowClear: true,
        style: { minWidth: '120px' }
      }
    ],
    ['图片', 'shipImgPath',
      InputType.uploadImg,
      ShowType.image,
      {
        isRow: true,
        maxCount: 2,
        useType: UseType.edit,
        uploadImgFn: doUploadFile,
        displayUrl: '',
        style: {
          width: '50px',
          height: '50px'
        }
      }
    ],
  ], [placeId])


  function handleClick(data?: any) {
    console.log(data)
  }

  return (
    <article className={`${styles.wrapper} tablesfaces`}>
      <TableInterface
        ref={tableRef}
        card={FaceItem}
        cardOptions={{
          onSelected: handleClick,
          isRadio: true,
          isSelectedFirst: false,
          isFlex: true
        }}
        extraParams={{ codeType: 0, focusPlaceId: placeId }}
        request={doGetGetTrackList}
        queryInputs={queryInputs}

      />
    </article>
  )
}

export default PlaceDataFace
