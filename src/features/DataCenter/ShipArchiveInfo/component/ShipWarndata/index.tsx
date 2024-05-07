import TableInterface from "hooks/integrity/TableInterface"
import { InputType } from "hooks/flexibility/FormPanel";
import EchartsData from './EchartData'
import { getShipWarnTable } from "server/ship";
import { getModelTypeDict } from "server/system";
import { useState } from "react";
import { riskLevelOptions } from "helper/dictionary";
import dayjs from "dayjs";
import ImageSimple from "hooks/basis/ImageSimple";
import AudioView from "component/AudioView";
import { message } from "antd";
import popup from "hooks/basis/Popup";
import { useMemo } from "react";
import styles from "./index.module.sass";


const columns = [
  ['预警模块', 'monitorTypeName'],
  ['预警时间', 'warnTime'],
  ['预警内容', 'warnContent'],
  ['风险等级', 'riskLevelName'],
  ['预警名称', 'monitorName'],
  ['预警行为', 'warnTypeName'],
  ['设备类型', 'deviceTypeName'],
  ['预警地址', 'warnAddr'],
  ['航速/节', 'speed'],
  ['经纬度', 'longitudeLatitude'],
  ['图片', 'warnPic', {
    itemProps: {
      render: (text: any, record: any) => {
        const arr = record?.standFiles || []
        const imgList = arr?.filter((item: any) => item.fileType === '01')
        let previewImg = <ImageSimple width={60} height={60} preview={true} src={record.warnPic} />
        let previewImgs = <ImageSimple onClick={(e) => openAudio(e, record.standFiles, true)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.warnPic} />
        return (<>
          {
            (imgList.length === 0 && record.warnPic) ? previewImg : (arr?.length && record.warnPic) ? previewImgs : '--'
          }
        </>)
      }
    }
  }],
  /*   ['图片', 'warnPic', {
      itemProps: {
        render: (text: any, record: any) => {
          return (<>
            {
              record.warnPic ? <ImageSimple className={styles.img} onClick={(e) => openAudio(e, record.standFiles, true)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.warnPic} /> : '--'
            }
          </>)
        }
      }
    }], */
  ['视频', 'videoUrl', {
    itemProps: {
      render: (text: any, record: any) => {
        return (<>
          {
            record.videoUrl ? <ImageSimple className={styles.img} onClick={(e) => openAudio(e, record.standFiles, false)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.videoUrl?.picUrl} /> : '--'
          }
        </>)
      }
    }
  }]
]

// 打开视图信息
function openAudio(e: any, arr: any[], activeImage: boolean) {
  e.stopPropagation();
  if (!arr?.length) {
    message.error('暂无可查看视图信息')
    return
  }
  popup(<AudioView isActiveImage={activeImage} videoList={arr?.filter(item => ['02', '03'].includes(item.fileType))} imageList={arr?.filter(item => item.fileType === '01')} />, { title: '视图查看', size: "auto" })
}

const queryInputs = [
  ['预警时间', 'dateTimeRange', InputType.dateTimeRange],
  ['风险等级', 'riskLevels', InputType.select, {
    dict: riskLevelOptions,
    style: { width: '150px' }
  }],
  ['预警行为', 'warnTypes', InputType.selectRemote, {
    request: getModelTypeDict,
    mode: "multiple",
    maxTagCount: 3,
    style: { width: '180px' }
  }]
]

interface Props {
  /** 船舶信息 */
  shipData?: any
}

const ShipWarndata: React.FC<Props> = ({ shipData }) => {
  console.debug('ShipWarndata')


  const [initQueryData] = useState({
    dateTimeRange: [dayjs().subtract(1, 'M'), dayjs()]
  })


  const extraParams = useMemo(() => ({ shipData }), [shipData])


  return (
    <article style={{ width: '100%' }}>
      <EchartsData shipData={shipData} />
      <TableInterface
        extraParams={extraParams}
        columns={columns}
        queryInputs={queryInputs}
        queryInit={initQueryData}
        request={getShipWarnTable}
      />
    </article>
  )
}

export default ShipWarndata
