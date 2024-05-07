import React from "react";
import styles from './index.module.sass'
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import BehaviorEcharts from "./BehaviorEcharts";
import { getWarnListSpecial, getWisdomRecordList } from "../../../../../../server/core/model";
import { shipListTypeDict } from "../../../../../../helper/dictionary";
import dayjs from "dayjs";
import { message } from 'antd'
import AudioView from "component/AudioView";
import popup from "hooks/basis/Popup";
import ImageSimple from "hooks/basis/ImageSimple";

const BehaviorRecord: React.FC = () => {
  const columns = [
    /* ['序号', 'index', {
      itemProps: {
        width: '100px'
      }
    }], */
    ['模型名称', 'modelName'],
    ['目标', 'targetName'],
    ['行为', 'eventName'],
    ['船舶分类', 'focusTypeName'],
    ['行为开始时间', 'firstTime'],
    ['开始航速/节', 'firstSpeed'],
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
          const arr = record?.standFiles || []
          const imgList = arr?.filter((item: any) => item.fileType === '01')
          let previewImg = <ImageSimple width={60} height={60} preview={true} src={record.picUrl} />
          let previewImgs = <ImageSimple onClick={(e) => openAudio(e, record.standFiles, true)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.picUrl} />
          return (<>
            {
              (imgList.length === 0 && record.picUrl) ? previewImg : (arr?.length && record.picUrl) ? previewImgs : '--'
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
    ['模型', 'modelName'],
    ['行为', 'eventType', InputType.selectMultipleRemote, {
      remote: getWarnListSpecial,
      placeholder: '请选择行为',
      style: {
        width: '200px'
      }
    }],
    ['船舶分类', 'focusType', InputType.select, {
      dict: shipListTypeDict,
      style: {
        width: '160px'
      }
    }],
    ['时间', 'datetime', InputType.dateTimeRange],
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
  return <article className={styles.chartsWrapper}>
    <BehaviorEcharts />
    <div style={{ marginTop: '20px' }}>
      <TableInterface
        queryInit={{
          datetime: [dayjs().subtract(1, 'month'), dayjs()]
        }}
        columns={columns}
        queryInputs={queryInputs}
        request={getWisdomRecordList}
      />
    </div>

  </article>
}

export default BehaviorRecord
