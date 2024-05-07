import { Button, Checkbox, Form, DatePicker, Select } from "antd";
import EchartPanel from "../../../../../../hooks/flexibility/EchartPanel";
import styles from './index.module.sass'
import { getAllDeviceData } from "server/system";
import { getCollectCountOptions } from "server/search";
import { useEffect, useState } from "react";
import { YMDHms, getCollectOptions } from '../../../../../../helper/index';
import dayjs from 'dayjs'


const { RangePicker } = DatePicker;

const initialValues = {
  customTime: [dayjs().subtract(1, 'M'), dayjs()]
}

interface props {
  title?: string
  device?: string
  /** 设备类型支持多个 */
  type?: string
  /** 设备功能 */
  businessFunction?: number
  // 显示仅统计融合雷达目标
  isShowFusion?: boolean
}

const ComponentEchart: React.FC<props> = ({ title, device, type, businessFunction, isShowFusion }) => {
  console.debug('ComponentEchart')


  const [form] = Form.useForm();


  const [selectOption, setSelectOption] = useState()
  const [controlEchart, setcontrolEchart] = useState<any>()
  const [params, setParams] = useState<any>(() => {
    const [sTime, eTime] = initialValues.customTime
    let _params: any = {}
    if (isShowFusion) {
      _params = {
        type: device,
        beginTime: sTime.format(YMDHms),
        endTime: eTime.format(YMDHms),
        isRepeat: false,
        isFusion: false,
        deviceCode: ''
      }
    } else {
      _params = {
        type: device,
        beginTime: sTime.format(YMDHms),
        endTime: eTime.format(YMDHms),
        isRepeat: false,
        deviceCode: ''
      }
    }
    return _params
  })


  //获取设备
  useEffect(() => {
    async function main() {
      const vo = await getAllDeviceData({ type, ...(device && ['1', '2'].includes(device) ? { businessFunction } : {}) })
      setSelectOption(vo)
    }
    main()
  }, [businessFunction, device, type])


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const [xAxisData, seriesData] = await getCollectCountOptions(params, ctr)
      const option = getCollectOptions(title, xAxisData, seriesData)
      setcontrolEchart(option)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [title, params])


  //获取表单的所有值
  function getFormValue() {
    let forms = form.getFieldsValue()
    let _params: any = {}
    if (isShowFusion) {
      _params = {
        type: device,
        beginTime: '',
        endTime: '',
        isRepeat: forms.isRepeat ? forms.isRepeat : false,
        deviceCode: forms.deviceCode.join(','),
        isFusion: forms.isFusion ? forms.isFusion : false,
      }
    } else {
      _params = {
        type: device,
        beginTime: '',
        endTime: '',
        isRepeat: forms.isRepeat ? forms.isRepeat : false,
        deviceCode: forms.deviceCode.join(',')
      }
    }
    if (forms.customTime) {
      _params.beginTime = forms.customTime[0].format(YMDHms)
      _params.endTime = forms.customTime[1].format(YMDHms)
    }
    setParams(_params)
  }


  return (
    <article >
      <div className={`${styles.modelTitle}`}>
        <span className={`icon iconfont icon-zhuangshitubiao ${styles.iconColor}`} />
        <span>{title}</span>
        <div style={{ display: 'inline-block', marginLeft: '20px' }}>
          <Form
            form={form}
            initialValues={initialValues}
            layout="inline">
            <Form.Item label="点位选择" name="deviceCode" >
              <Select
                getPopupContainer={triggerNode => triggerNode.parentElement}
                style={{ width: 260 }}
                placeholder={'全域空间'}
                options={selectOption}
                mode='multiple'
                maxTagCount={1}
                allowClear>
              </Select>
            </Form.Item>
            <Form.Item label="时间范围" name='customTime'>
              <RangePicker showTime getPopupContainer={triggerNode => triggerNode} />
            </Form.Item>
            <Form.Item name="isRepeat" valuePropName="checked">
              <Checkbox>去重</Checkbox>
            </Form.Item>
            {isShowFusion && <Form.Item name="isFusion" valuePropName="checked">
              <Checkbox>仅统计融合雷达目标</Checkbox>
            </Form.Item>
            }
            <Form.Item>
              <Button type={"primary"} htmlType="submit" onClick={getFormValue}>统计</Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className={styles.echartHeight}>
        <EchartPanel option={controlEchart} />
        {/* <XcEcharts option={controlEchart} /> */}
      </div>
    </article>
  )
}

export default ComponentEchart