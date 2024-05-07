
import { message } from "antd";
import AudioView from "component/AudioView";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useMemo } from "react";
import { getDailyWarningOptions, getFocusAreaWarnList, getMonitorTypeDict, getRiskLevelOptions, getWarningActionOptions, getWarningTimeOptions } from "server/place";
import { getModelTypeDict, getRiskLevelDict } from "server/system";
import DataList from "./component/DataList";
import EchartsBox from "./component/EchartsBox";
import styles from "./index.module.sass";


const queryInputs = [
  ['预警时间', 'dateTimeRange', InputType.dateTimeRange, {
    style: { width: "280px" }
  }],
  ['风险等级', 'riskLevel', InputType.selectRemote, {
    request: getRiskLevelDict,
  }],
  ['预警行为', 'warnTypes', InputType.selectMultipleRemote, {
    remote: getModelTypeDict,
    style: {
      minWidth: '120px',
      maxWidth: '420px'
    },
    maxTagCount: 3
  }],
  ['预警模块', 'monitorType', InputType.selectMultipleRemote, {
    remote: getMonitorTypeDict,
    style: {
      minWidth: '120px',
      maxWidth: '420px'
    },
    maxTagCount: 3
  }]
]

const columns = [
  // ['序号', 'index', { itemProps: { width: 60 } }],
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
        let list: any = []
        arr.forEach((it: any) => { if (it.fileType === '01') { list.push(it) } })
        let previewImg = <ImageSimple width={60} height={60} preview={true} src={record.warnPic} />
        let previewImgs = <ImageSimple onClick={(e) => openAudio(e, record.standFiles, true)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.warnPic} />
        return (<>
          {
            (!list?.length && record.warnPic) ? previewImg : (arr?.length && record.warnPic) ? previewImgs : '--'
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

const condData = [{ label: '近一月', value: 'month' }, { label: '近一年', value: 'year' }]

const condProps = { style: { width: '240px' } }

interface IWarningInfo {
  placeId?: any
}

const WarningInfo: React.FC<IWarningInfo> = ({ placeId }) => {
  console.debug('WarningInfo')

  const extraParams = useMemo(() => ({ id: placeId, monitorType: '04' }), [placeId])

  const tableExtraParams = useMemo(() => ({ areaId: placeId }), [placeId])


  return (
    <article className={styles.wapper}>
      <div className={styles.panelStatistics}>
        <div className={styles.item}>
          <EchartsBox
            title='风险等级'
            condVal='month'
            condData={condData}
            extraParams={extraParams}
            request={getRiskLevelOptions}
          />
        </div>

        <div className={styles.item}>
          <EchartsBox
            title='预警行为统计'
            condVal='month'
            condData={condData}
            extraParams={extraParams}
            request={getWarningActionOptions}
          />
        </div>

        <div className={styles.item}>
          <DataList
            title='预警时段统计'
            condVal='month'
            condData={condData}
            extraParams={extraParams}
            request={getWarningTimeOptions}
          />
        </div>

        <div className={styles.item}>
          <EchartsBox
            title='每日预警统计'
            condType='DateTimeRangeSimple'
            condData={condData}
            extraParams={extraParams}
            request={getDailyWarningOptions}
            condProps={condProps}
          />
        </div>
      </div>

      <div className={styles.panelTable}>
        <TableInterface
          extraParams={tableExtraParams}
          columns={columns}
          queryInputs={queryInputs}
          request={getFocusAreaWarnList}
        />
      </div>

    </article>
  )
}

export default WarningInfo
