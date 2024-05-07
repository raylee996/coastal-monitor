
import { AccountBookOutlined, AimOutlined } from "@ant-design/icons";
import { ageRangeDict, bottomsTypeDict, carColorDict, clothesTypeDict, commonTFDict, directionDict, hairTypeDict, sexDict, sizeDict } from "helper/dictionary";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doUploadFile } from "server/common";
import { getShipListTable } from "server/ship";
import styles from "./index.module.sass";


interface IBodyItem {
  data?: any
  onSelect?: any
}

const BodyItem: React.FC<IBodyItem> = (props) => {
  const { data, onSelect } = props

  return (
    <div className={styles.pdcarItems} onClick={() => {
      onSelect(true, data)
    }}>
      <div className={styles.boxL}>
        <div className={styles.imgs}><img className={styles.img} alt="" src={'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?undefined'} /></div>
        <div className={styles.imgs}><img className={styles.img} alt="" src={'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp'} /></div>
      </div>
      <div className={styles.boxR}>
        <div className={styles.infoRow}>
          <div className={styles.infoCol}>
            <span className={styles.infoIcon}><AimOutlined /></span>
            <span className={styles.infoIcon}><AccountBookOutlined /></span>
            <span className={styles.infoIcon}><AccountBookOutlined /></span>
            <span className={styles.infoIcon}><AccountBookOutlined /></span>
            <span className={styles.infoIcon}><AccountBookOutlined /></span>
            <span className={styles.infoIcon}><AccountBookOutlined /></span>
            <span className={styles.infoIcon}><AccountBookOutlined /></span>
          </div>
        </div>

        <div className={styles.siteRow}>
          <div className={styles.siteCol}>
            <span>地点：</span><span>广东省深圳市宝安区金湾大道3088号</span>
          </div>

          <div className={styles.siteCol}>
            <span>2022-11-18 14:50:01</span>
          </div>


        </div>
      </div>
    </div>
  )
}


interface IPlaceDataBody {
  placeId: any
}
const PlaceDataBody: React.FC<IPlaceDataBody> = (props) => {
  console.debug('PlaceDataBody')
  const { placeId } = props
  console.log(placeId)
  const tableRef = useRef<any>(null)

  const queryInputs = [
    [
      '点位',
      'site',
      InputType.component,
      {
        component: null,

      }
    ],
    ['时间', 'datetime', InputType.dateTimeRange],
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
    [
      '上衣颜色',
      'clothesColor',
      InputType.select,
      {
        dict: carColorDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '上衣类型',
      'clothesType',
      InputType.select,
      {
        dict: clothesTypeDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '下装颜色',
      'bottomsColor',
      InputType.select,
      {
        dict: carColorDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '下装类型',
      'bottomsType',
      InputType.select,
      {
        dict: bottomsTypeDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '目标方向',
      'targetDirection',
      InputType.select,
      {
        dict: directionDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '目标大小',
      'sizeType',
      InputType.select,
      {
        dict: sizeDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '发型',
      'hairType',
      InputType.select,
      {
        dict: hairTypeDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '骑车',
      'ride',
      InputType.select,
      {
        dict: commonTFDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '性别',
      'sex',
      InputType.select,
      {
        dict: sexDict,
        allowClear: true,
        style: { minWidth: '120px' }
      }
    ],
    [
      '年龄段',
      'age',
      InputType.select,
      {
        dict: ageRangeDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '戴眼镜',
      'glass',
      InputType.select,
      {
        dict: commonTFDict,
        allowClear: true,
        style: { minWidth: '120px' }
      }
    ],
    [
      '戴口罩',
      'mask',
      InputType.select,
      {
        dict: commonTFDict,
        allowClear: true,
        style: { minWidth: '100px' }
      }
    ],
    [
      '戴帽子',
      'hat',
      InputType.select,
      {
        dict: commonTFDict,
        allowClear: true,
        style: { minWidth: '120px' }
      }
    ],
    [
      '背包',
      'knapsack',
      InputType.select,
      {
        dict: commonTFDict,
        allowClear: true,
        style: { minWidth: '120px' }
      }
    ],
    [
      '拎东西',
      'carry',
      InputType.select,
      {
        dict: commonTFDict,
        allowClear: true,
        style: { minWidth: '120px' }
      }
    ],

  ]


  function handleClick(data?: any) {
    console.log(data)
  }

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        card={BodyItem}
        cardOptions={{
          onSelected: handleClick,
          isRadio: true,
          isSelectedFirst: false,
          isFlex: true
        }}
        request={getShipListTable}
        queryInputs={queryInputs}
        paginationProps={{ pageSize: 12 }}
      />
    </article>
  )
}

export default PlaceDataBody
