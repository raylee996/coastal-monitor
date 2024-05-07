import { message } from "antd";
import AudioView from "component/AudioView";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useMemo, useRef } from "react";
import { doGetCarWarnListV2 } from "server/car";
import styles from "./index.module.sass";

interface ICarEarlyWarning {
  carId: any
  carItem?: any
}
const CarEarlyWarning: React.FC<ICarEarlyWarning> = (props) => {
  console.debug('TrajectoryInfo')
  const { carId, carItem } = props
  console.log(carId, carItem)

  const tableRef = useRef<any>(null)


  const extraParams = useMemo(() => {
    return {
      warnContent: carItem.licensePlate
    }
  }, [carItem])
  const queryInputs = [
    ['预警内容',
      'warnContent',
      {
        placeholder: '请输入',
        allowClear: true
      }
    ],
    ['预警时间', 'warnTime', InputType.dateTimeRange]
  ]

  const columns = [
    ['预警时间', 'warnTime'],
    ['预警内容', 'warnContent'],
    ['布控名称', 'monitorName'],
    ['预警类型', 'eventName'],
    ['预警设备', 'deviceName'],
    ['预警地址', 'warnAddr'],
    ['经纬度', 'longitudeLatitude'],
    ['图片', 'warnPic', {
      itemProps: {
        render: (text: any, record: any) => {
          const arr = record?.standFiles || []
          let previewImg = <ImageSimple width={60} height={60} preview={true} src={record.warnPic} />
          let previewImgs = <ImageSimple onClick={(e) => openAudio(e, record.standFiles)} title="点击查看视图信息" width={60} height={60} preview={false} src={record.warnPic} />
          return (<>
            {
              (!arr?.length && record.warnPic) ? previewImg : (arr?.length && record.warnPic) ? previewImgs : '--'
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

  return (
    <article className={styles.wrapper}>
      <TableInterface
        extraParams={extraParams}
        ref={tableRef}
        request={doGetCarWarnListV2}
        queryInputs={queryInputs}
        columns={columns}
        paginationProps={{
          showQuickJumper: false,
          showSizeChanger: false,
        }}
      />
    </article>
  )
}
export default CarEarlyWarning
