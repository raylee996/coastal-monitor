import { Form, Typography } from "antd";
import TargetTrackPlay, { targetTrackColorList } from "component/TargetTrackPlay";
import DoubleImageSwiper from "features/DataCenter/components/DoubleImageSwiper";
import { coincidenceDict } from "helper/dictionary";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import { DayjsRange } from "hooks/hooks";
import TableInterface from "hooks/integrity/TableInterface";
import { useState } from "react";
import { getAdjointTrack } from "server/personnel";
// import AccompanyNumber from "./component/AccompanyNumber";
import styles from "./index.module.sass";


const inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange],
  ['轨迹类型', 'coincidence', InputType.select, { dict: coincidenceDict }]
]

const initialValues: any = {
  type: 0
}

interface Props {
  /** 档案数据 */
  data?: any
}

const AccompanyInfo: React.FC<Props> = ({ data }) => {
  console.debug('AccompanyInfo', data)

  const [form] = Form.useForm()

  const [targetData, setTargetData] = useState<any>()
  const [trackData, setTrackData] = useState<any[]>([])
  const [tableData, setTableData] = useState<any[]>([])

  const columns: any[] = [
    ['序号', 'ordinal', ColType.backgroundColor, {
      getColor: (record: any) => {
        const result = record.content === data.faceid || record.content === data.licensePlate || record.content === data.mmsi
        return result ? targetTrackColorList[0] : targetTrackColorList[1]
      },
      itemProps: { width: 60 }
    }],
    ['数据类型', 'codeTypeName'],
    ['数据内容', 'content'],
    ['采集时间', 'capTime'],
    ['采集地址', 'capAddress']
  ]


  async function handleSelect(params: any, queryDateRange: DayjsRange) {

    const queryParams = {
      coincidence: false,
      datetime: queryDateRange
    }

    form.setFieldsValue(queryParams)

    const [_tableData, _trackData] = await getAdjointTrack(data, params, queryParams)

    setTargetData(params)
    setTrackData(_trackData)
    setTableData(_tableData)
  }

  async function handleFinish(params: any) {
    const [_tableData, _trackData] = await getAdjointTrack(data, targetData, params)
    setTrackData(_trackData)
    setTableData(_tableData)
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>

        {data && data.faceid &&
          <article className={styles.box}>
            <header>
              <div className={styles.title}>伴随人脸</div>
            </header>
            <section>
              <DoubleImageSwiper
                params={{
                  srcCodeType: 0,
                  srcCode: data.faceid,
                  tagCodeType: 0,
                }}
                onSelect={handleSelect} />
              {/* <DoubleImageSwiper taskId={'601'} onSelect={handleSelect} /> */}
            </section>
          </article>
        }

        {/* {data && data.imsi &&
          <article className={styles.box}>
            <header>
              <div className={styles.title}>伴随号码</div>
            </header>
            <section>
              <AccompanyNumber params={{
                srcCodeType: 2,
                srcCode: data.imsi,
                tagCodeType: 2
              }} />
            </section>
          </article>
        } */}

        {data && data.licensePlate &&
          <article className={styles.box}>
            <header>
              <div className={styles.title}>伴随车辆</div>
            </header>
            <section>
              <DoubleImageSwiper
                params={{
                  srcCodeType: 1,
                  srcCode: data.licensePlate,
                  tagCodeType: 1
                }}
                onSelect={handleSelect} />
              {/* <DoubleImageSwiper taskId={'604'} onSelect={handleSelect} /> */}
            </section>
          </article>
        }

        {data && data.mmsi &&
          <article className={styles.box}>
            <header>
              <div className={styles.title}>伴随船舶</div>
            </header>
            <section>
              <DoubleImageSwiper
                params={{
                  srcCodeType: 6,
                  srcCode: data.mmsi,
                  tagCodeType: 6
                }}
                onSelect={handleSelect} />
              {/* <DoubleImageSwiper taskId={'605'} onSelect={handleSelect} /> */}
            </section>
          </article>
        }

      </section>
      <section className={styles.content}>
        <header>
          <Typography.Title level={5}>轨迹信息</Typography.Title>
          <section className={styles.query}>
            <FormPanel
              form={form}
              inputs={inputs}
              formProps={{
                layout: 'inline',
                initialValues
              }}
              options={{
                isShowItemButton: true,
                isNotShowFooter: true,
                submitText: '查询'
              }}
              onFinish={handleFinish} />
          </section>
        </header>
        <section className={styles.mapBox} >
          <TargetTrackPlay data={trackData} />
        </section>
        <footer className={styles.table}>
          <TableInterface
            columns={columns}
            tableProps={{
              rowKey: 'capAddress'
            }}
            tableDataSource={tableData}
          />
        </footer>
      </section>
    </article>
  )
}

export default AccompanyInfo