
import { Button, Col, DatePicker, Form, Radio, RadioChangeEvent, Row } from "antd";
import TargetTrackPlay from "component/TargetTrackPlay";
import dayjs from "dayjs";
import DataCheckbox from "features/DataCenter/components/DataCheckbox";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { queryHistoricalTrajectory } from "server/personnel";
import styles from "./index.module.sass";
import './index.sass';
const { RangePicker } = DatePicker;

interface IHistoricalTrajectory {
  carId: any
  carItem?: any
}

const columns = [
  ['数据内容', 'content'],
  ['图片', 'path', ColType.image],
  ['采集时间', 'capTime'],
  ['采集地址', 'capAddress'],
]

const HistoricalTrajectory: React.FC<IHistoricalTrajectory> = (props) => {
  console.debug('HistoricalTrajectory', props)
  const { carItem } = props

  const tableRef = useRef<any>(null)

  const [tarckListData, setTarckListData] = useState<any[]>([])

  const [tableSource, setTableSource] = useState<any[]>([])

  const [form] = Form.useForm();

  //Form表单值
  const [trackFormData, setTrackFormData] = useState<{
    returnTime: string,
    customTime: any
  }>({
    returnTime: 'lastFive',
    customTime: undefined
  });

  const [checkboxData, setCheckboxData] = useState<any[]>()

  const [checked, setChecked] = useState<string[]>([])

  const [selected, setSelected] = useState<string[]>(['licensePlate'])

  // 给表单赋初始值setFieldsValue
  useEffect(() => {
    form && form.setFieldsValue({
      returnTime: 'lastFive',
      customTime: undefined
    })
  }, [form]);

  useEffect(() => {
    if (!carItem) return;
    let data = []
    const { licensePlate } = carItem || {}
    licensePlate && data.push({ label: '车牌：', value: 'licensePlate', component: <span>{licensePlate}</span> })
    setCheckboxData(data)
  }, [carItem])

  useEffect(() => {
    if (checked?.length || !checkboxData?.length) return
    checkboxData.filter(item => item.value === 'licensePlate')?.length && setChecked(['licensePlate'])
  }, [checkboxData, checked])

  useEffect(() => {
    console.log(checked, "checked")
    if (!carItem) return;
    let data = []
    const { licensePlate } = carItem || {}
    // checked.includes('licensePlate') && data.push({ licensePlate })
    if (selected.length !== 0) {
      data.push({ licensePlate })
    }
    maps(data, trackFormData)
  }, [checked, carItem, trackFormData, selected])

  async function maps(data: any[], FormData: any) {
    // 获取目标物坐标
    const vo = await queryHistoricalTrajectory({ data, ...FormData })
    console.log(vo, "vo")
    setTarckListData(vo?.tarckData || [])
    setTableSource(vo?.data || [])
  }

  //radio改变的时候，时间输入框置灰切换
  function radioChange(e: RadioChangeEvent) {
    const value = e.target.value
    const data = {
      returnTime: value,
      customTime: value === 'custom' ? [dayjs(), dayjs().subtract(1, 'day')] : undefined
    }
    setTrackFormData(data)
    form?.setFieldsValue(data)
  }

  //获取表单的所有值
  function getFormValue() {
    const params = form.getFieldsValue()
    setTrackFormData(params)
  }

  return (
    <article className={styles.wrapper}>
      {/* <div>历史轨迹</div> */}
      <div className={styles.mapBox}>
        <div className={styles.panelTitle}>

          <div className={`${styles.titleBox} ${'dc-form'}`}>
            <Form
              form={form}
            >
              <Row className="HistoricalTrajectory__form" gutter={16}>
                <Col span={8}>
                  <Form.Item label="回放时间" name="returnTime" className={styles.returnTime}>
                    <Radio.Group value={trackFormData.returnTime} onChange={radioChange}>
                      <Radio value={'lastFive'}> 最近5次 </Radio>
                      <Radio value={'custom'}> 自定义 </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={13}>
                  <Form.Item name='customTime' className={styles.customTime}>
                    <RangePicker
                      showTime
                      disabled={trackFormData.returnTime === 'lastFive'}
                      value={trackFormData.customTime}
                      getPopupContainer={triggerNode => triggerNode}
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item>
                    <Button type={"primary"} htmlType="submit" onClick={getFormValue}>查看</Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

        </div>
        <div className={styles.content}>
          <DataCheckbox data={checkboxData} checked={checked} setChecked={setChecked} onFinish={(val: any) => {
            setSelected(val)
          }} />
        </div>
        <TargetTrackPlay isNotControlPanel={true} data={tarckListData} />
      </div>
      <div className={styles.panel}>
        <div className={styles.panelSubTitle}>
          <div className={'subTitle03'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>轨迹详情</div>
        </div>

        {/* 列表区 */}
        <TableInterface
          ref={tableRef}
          tableDataSource={tableSource}
          columns={columns}
        />
      </div>
    </article>
  )
}

export default HistoricalTrajectory
