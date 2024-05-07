
import TableInterface from "hooks/integrity/TableInterface"
import { InputType } from "hooks/flexibility/FormPanel";
import { doGetStatisticsWarnInfoList } from "server/statistics";
import { message } from 'antd'
import popup from "hooks/basis/Popup";
import AudioView from "component/AudioView";
import ImageSimple from "hooks/basis/ImageSimple";
import { getControlDict } from "server/alarm";
import { ColType } from "hooks/flexibility/TablePanel";
import { useState } from "react";
import dayjs from "dayjs";


const columns = [
  ['预警时间', 'warnTime'],
  ['预警内容', 'warnContent', ColType.tooltip],
  ['风险等级', 'riskLevelName'],
  ['预警类别', 'monitorTypeName'],
  ['布控名称', 'monitorName', ColType.tooltip],
  ['预警类型', 'warnTypeName'],
  ['预警设备', 'deviceName', ColType.tooltip],
  ['预警地址', 'warnAddr', ColType.tooltip],
  ['经纬度', 'lonlat', ColType.tooltip],
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
  }],
]

// 打开视图信息
function openAudio(e: any, arr: any[], activeImg: boolean) {
  e.stopPropagation();
  if (!arr?.length) {
    message.error('暂无可查看视图信息')
    return
  }
  popup(<AudioView isActiveImage={activeImg} videoList={arr?.filter(item => ['02', '03'].includes(item.fileType))} imageList={arr?.filter(item => item.fileType === '01')} />, { title: '视图查看', size: "auto" })
}

const queryInputs = [
  ['布控类别', 'monitorType', InputType.selectRemote, {
    request: getControlDict,
    style: { width: '150px' }
  }],
  ['预警内容', 'warnContent'],
  ['预警时间', 'warnTime', InputType.dateTimeRange],
]

const WarnDatas: React.FC = () => {
  console.debug('WarnDatas')


  const [queryinit] = useState({
    warnTime: [dayjs().subtract(1, 'd'), dayjs()]
  })


  return (
    <article style={{ height: '100%', paddingRight: '10px' }}>
      <TableInterface
        columns={columns}
        queryInputs={queryInputs}
        queryInit={queryinit}
        request={doGetStatisticsWarnInfoList}
      />
    </article>
  )
}

export default WarnDatas
