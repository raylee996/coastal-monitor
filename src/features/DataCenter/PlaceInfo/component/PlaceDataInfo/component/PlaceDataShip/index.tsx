
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { getPlaceQueryShipList } from "server/place";
import { getDictDataByType } from "server/system";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'


const queryInputs = [
  ['船舶', 'shipSearchValue', {
    placeholder: '请输入船名或者MMSI',
    allowClear: true
  }],
  ['船型', 'shipType', InputType.selectRemote, {
    request: async () => await getDictDataByType('archive_ship_type')
  }],
  ['时间', 'datetime', InputType.dateTimeRange],
]

const columns = [
  ['照片', 'shipImgPathFirst', {
    itemProps: {
      render: (text: any, record: any) => {
        return (
          <ImageSimple width={60} height={60} src={record.shipImgPathFirst} defaultSrc={shipDefSrc} />
        )
      }
    }
  }],
  ['MMSI', 'mmsi'],
  ['英文船名', 'enName'],
  ['中文船名', 'cnName'],
  ['船型', 'shipTypeName'],
  ['船籍', 'registry'],
  ['船长/米', 'shipL'],
  ['船宽/米', 'shipW'],
  ['船舶状态', 'shipStatusName'],
  // ['最近上报时间', 'updateTime'],
  // ['最近经过时间', 'updateTime'],
  ['涉案数量', 'caseNum'],
  ['船舶分类', 'focusTypeName'],
  // ['目标ID', 'targetId', ColType.tooltip],
  // ['雷达批号', 'radarNumber', ColType.tooltip],
  ['建档时间', 'createTime'],
  // ['标签', 'labelNames'],
  [
    [
      '详情',
      (record: any) => {
        popup(<ShipArchiveInfo id={record.id} dataType={record.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
      }
    ]
  ]
]

interface IPlaceDataShip {
  placeId: any
}

const PlaceDataShip: React.FC<IPlaceDataShip> = ({ placeId }) => {
  console.debug('PlaceDataShip')


  const tableRef = useRef<any>(null)


  return (
    <article className={styles.wapper}>
      <TableInterface
        ref={tableRef}
        queryInputs={queryInputs}
        columns={columns}
        extraParams={{ focusPlaceId: placeId, dataType: 1 }}
        request={getPlaceQueryShipList}
      />
    </article>
  )
}

export default PlaceDataShip
