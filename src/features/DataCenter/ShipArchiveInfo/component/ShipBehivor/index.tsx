import TableInterface from "hooks/integrity/TableInterface"
import styles from "./index.module.sass";
import { InputType } from "hooks/flexibility/FormPanel";
import EchartsData from './EchartData'
import { doGetBehavirecordList } from "server/ship";
import { getWarnListSpecial } from "server/core/model";
import { message } from 'antd'
import dayjs from "dayjs";
import AudioView from "component/AudioView";
import popup from "hooks/basis/Popup";
import ImageSimple from "hooks/basis/ImageSimple";
import { useMemo } from "react";


function openAudio(e: any, arr: any[], activeImg: boolean) {
  e.stopPropagation();
  if (!arr?.length) {
    message.error('暂无可查看视图信息')
    return
  }
  popup(<AudioView isActiveImage={activeImg} videoList={arr?.filter(item => ['02', '03'].includes(item.fileType))} imageList={arr?.filter(item => item.fileType === '01')} />, { title: '视图查看', size: "auto" })
}
const columns = [
  // ['序号', 'ordinal', { itemProps: { width: 60 } }],
  ['目标', 'targetName'],
  ['行为', 'eventName'],
  ['行为开始时间', 'firstTime'],
  ['开始航速/节', 'firstSpeed'],
  ['模型', 'modelName'],
  ['开始经纬度', 'lonLatName'],//自定义组装
  ['行为结束时间', 'lastTime'],
  ['备注', 'msg', {
    itemProps: {
      render: (text: any, record: any) => {
        return (<>
          {
            record.bcodeValue ? `与${record.bcodeValue} ${record.eventName}` : ''
          }
        </>)
      }
    }
  }],
  ['图片', 'picUrl', {
    itemProps: {
      render: (text: any, record: any) => {
        return (<>
          {
            record.picUrl ? <ImageSimple onClick={(e) => openAudio(e, record.standFiles, true)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.picUrl} /> : '--'
          }
        </>)
      }
    }
  }],
  ['视频', 'videoUrl', {
    itemProps: {
      render: (text: any, record: any) => {
        return (<>
          {
            record.videoUrl ? <ImageSimple onClick={(e) => openAudio(e, record.standFiles, false)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.videoUrl?.picUrl} /> : '--'
          }
        </>)
      }
    }
  }]
]

const queryInputs = [
  ['行为', 'eventType', InputType.selectRemote,
    {
      request: getWarnListSpecial,
      placeholder: '请选择行为',
    }
  ],
  [
    '时间',
    'datetime',
    InputType.dateTimeRange,
    {
      defaultValue: [dayjs().subtract(1, 'M'), dayjs()]
    }
  ]
]

interface Props {
  shipData?: any
}

const ShipBehivordata: React.FC<Props> = ({ shipData }) => {
  console.debug('ShipBehivordata')


  const id = useMemo(() => shipData ? shipData.id : undefined, [shipData])

  const archiveType = useMemo(() => {
    if (shipData) {
      if (shipData.dataType === 2) { //雷达
        return 4
      } else { //船舶
        return 3
      }
    } else {
      return 3
    }
  }, [shipData])

  const extraParams = useMemo(() => {
    if (shipData) {
      return {
        id: shipData.id,
        archiveType
      }
    } else {
      return undefined
    }
  }
    , [archiveType, shipData])


  return (
    <article className={styles.wrapper}>
      <div className={styles.panelEcharts}>
        <EchartsData id={id} archiveType={archiveType} />
      </div>
      <div className={styles.panelTable}>
        <TableInterface
          queryInit={{ datetime: [dayjs().subtract(1, 'M'), dayjs()] }}
          isMustExtraParams={true}
          extraParams={extraParams}
          columns={columns}
          queryInputs={queryInputs}
          request={doGetBehavirecordList}
        />
      </div>
    </article>
  )
}

export default ShipBehivordata
