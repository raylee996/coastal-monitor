import { message } from "antd";
import TableInterface from "hooks/integrity/TableInterface"
import { InputType } from "hooks/flexibility/FormPanel";
import EchartsData from './EchartData'
import { useEffect, useMemo, useState } from "react";
// import moment from "moment";
import { doGetPersonInfo } from "server/personnel";
import { getDictDataByType } from "server/system";
import { shipTypeDict } from "helper/dictionary";
import { doGetStatisticsEventList } from "server/statistics";
import popup from "hooks/basis/Popup";
import AudioView from "component/AudioView";
import ImageSimple from "hooks/basis/ImageSimple";
import { ColType } from "hooks/flexibility/TablePanel";
import dayjs from "dayjs";


const columns = [
  ['模型名称', 'modelName', ColType.tooltip],
  ['目标', 'shipName', ColType.tooltip],
  ['船舶分类', 'focusTypeName'],
  ['行为', 'eventTypeName', ColType.tooltip],
  ['行为开始时间', 'firstTime', ColType.tooltip],
  ['开始船速/节', 'firstSpeed'],
  ['开始经纬度', 'firstLonLat', ColType.tooltip],
  ['行为结束时间', 'lastTime', ColType.tooltip],
  // ['备注', 'speed', ColType.tooltip],
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
  ['模型', 'modelName'],
  ['行为', 'eventType', InputType.selectRemote, {
    request: () => getDictDataByType("behaviour_type"),
    style: { width: '150px' }
  }],
  [
    '船舶分类',
    'focusType',
    InputType.select,
    {
      dict: shipTypeDict,
      placeholder: '请选择',
      style: { width: '180px' }
    }
  ],
  ['时间', 'dateTimeRange', InputType.dateTimeRange],
]

interface IWarnList {
  id?: any
}

const WarnList: React.FC<IWarnList> = ({ id }) => {
  console.debug('ShipWarndata')


  // 个人信息详情
  const [personInfo, setPersonInfo] = useState<any>({ faceid: '' })
  const [initQueryData] = useState({
    dateTimeRange: [dayjs().subtract(1, 'd'), dayjs()]
  })


  // 获取个人信息详情数据
  useEffect(() => {
    async function getPersonDetail() {
      const vo = await doGetPersonInfo({ id })
      setPersonInfo(vo)
    }
    id && getPersonDetail()
  }, [id])


  const extraParams = useMemo(() => ({ faceid: personInfo.faceid }), [personInfo])


  return (
    <article >
      <EchartsData personDetail={personInfo} />
      <TableInterface
        extraParams={extraParams}
        columns={columns}
        queryInputs={queryInputs}
        queryInit={initQueryData}
        request={doGetStatisticsEventList}
      />
    </article>
  )
}

export default WarnList
