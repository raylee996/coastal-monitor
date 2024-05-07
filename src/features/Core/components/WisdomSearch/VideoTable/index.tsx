import { Form } from "antd";
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import dayjs from "dayjs";
import { InputType } from "hooks/flexibility/FormPanel"
import TableInterface from "hooks/integrity/TableInterface"
import { useCallback, useRef, useState } from "react";
import { querySearchVideoList } from "server/core/wisdomSearch"
import { WisdomProps } from ".."
import VideoTableCardItem from "./components/VideoTableCardItem";
import styles from "./index.module.sass";


export const VideoInputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: false
  }],
  ['点位', 'pointJsonList', InputType.component, {
    component: AreaPointDrawFrom,
    inputProps: {
      size: 'middle',
      style: { width: '180px' }
    },
    pointProps: {
      isPoint: true,
      params: {
        businessFunctions: ['1'],
        deviceTypes: ['1']
      }
    },
  }],
  ['目标', 'codeValue', {
    placeholder: '请输入MMSI/雷达/目标ID',
    allowClear: true
  }],
]


const paginationProps = {
  showTotal: (total: number) => {
    return `总数 : ${total}`
  }
}

const cardOptions = {
  isFlex: true
}

const VideoTable: React.FC<WisdomProps> = ({ params }) => {
  console.debug('VideoTable')


  const tableRef = useRef<any>(null)


  const [form] = Form.useForm()


  const [queryInit] = useState({
    datetime: [dayjs().subtract(1, 'day'), dayjs()],
    ...params
  })


  const handleFormReset = useCallback(
    () => {
      if (params?.datetime) {
        const { datetime } = params
        const [sTime, eTime] = datetime
        return {
          datetime: [dayjs(sTime), dayjs(eTime)]
        }
      } else {
        return {
          datetime: [dayjs().subtract(1, 'day'), dayjs()]
        }
      }
    },
    [params],
  )


  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        card={VideoTableCardItem}
        cardOptions={cardOptions}
        queryInputs={VideoInputs}
        queryInit={queryInit}
        queryForm={form}
        request={querySearchVideoList}
        onFormReset={handleFormReset}
        paginationProps={paginationProps}
      />
    </article>
  )
}

export default VideoTable