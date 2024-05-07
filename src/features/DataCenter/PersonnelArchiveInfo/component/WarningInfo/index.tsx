import TableInterface from "hooks/integrity/TableInterface"
import { InputType } from "hooks/flexibility/FormPanel";
import EchartsData from './EchartData'
import { useEffect, useState } from "react";
import moment from "moment";
import { doGetPersonInfo, doGetPersonWarnTable } from "server/personnel";
import { getDictDataByType } from "server/system";
import styles from "./index.module.sass";
import ImageSimple from "hooks/basis/ImageSimple";
import AudioView from "component/AudioView";
import popup from "hooks/basis/Popup";
import { message } from "antd";

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
        return (<>
          {
            record.warnPic ? <ImageSimple onClick={(e) => openAudio(e, record.standFiles)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.warnPic} /> : '--'
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
            record.videoUrl ? <ImageSimple onClick={(e) => openAudio(e, record.standFiles)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.videoUrl?.picUrl} /> : '--'
          }
        </>)
      }
    }
  }]
]

// 打开视图信息
function openAudio(e: any, arr: any[]) {
  e.stopPropagation();
  if (!arr?.length) {
    message.error('暂无可查看视图信息')
    return
  }
  popup(<AudioView videoList={arr?.filter(item => ['02', '03'].includes(item.fileType))} imageList={arr?.filter(item => item.fileType === '01')} />, { title: '视图查看', size: "auto" })
}

const queryInputs = [
  ['预警时间', 'dateTimeRange', InputType.dateTimeRange],
  ['风险等级', 'riskLevel', InputType.selectRemote,
    {
      request: () => getDictDataByType("risk_level"),
    }
  ],
  ['数据类型', 'warnTypes', InputType.selectRemote, {
    request: () => getDictDataByType("target_data_type"),
  }]
]

interface IProps {
  id?: any
}

const WarningInfo: React.FC<IProps> = (props) => {
  console.debug('ShipWarndata')
  const { id } = props
  // 个人信息详情
  const [personInfo, setPersonInfo] = useState<any>({ faceid: '' })

  const [initQueryData] = useState({
    dateTimeRange: [moment().subtract(1, 'M'), moment()]
  })

  // 获取个人信息详情数据
  useEffect(() => {
    async function getPersonDetail() {
      const vo = await doGetPersonInfo({ id })
      setPersonInfo(vo)
    }
    id && getPersonDetail()
  }, [id])

  return (
    <article className={styles.wrapper}>
      <EchartsData personDetail={personInfo} />
      {
        personInfo?.faceid ? <TableInterface
          extraParams={{ faceid: personInfo.faceid }}
          columns={columns}
          queryInputs={queryInputs}
          queryInit={initQueryData}
          request={doGetPersonWarnTable}
        /> : <></>
      }

    </article>
  )
}

export default WarningInfo
