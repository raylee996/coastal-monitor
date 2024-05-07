import { Button, Col, DatePicker, Form, message, Radio, RadioChangeEvent, Row, Spin } from "antd"
import ShipTrackPlay from "component/ShipTrackPlay"
import FormPanel, { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel"
import { useCallback, useEffect, useMemo, useState } from "react"
import { doUploadFile } from "server/common"
import { WisdomProps } from "../../.."
import styles from "./index.module.sass"
import { getAllSisdomSearchList } from "server/core/wisdomSearch"
import { getAllHistoryTrack } from "server/dataCenter/shipSailing"
import ImageSimple from "hooks/basis/ImageSimple"
import SearchDetail from "../../../components/SearchDetails"
import popup from "hooks/basis/Popup"
import WisdomModel from "features/Core/components/WisdomModel"
import WisdomJudgment from "features/Core/components/WisdomJudgment"
import WisdomCommandDetail from "features/Core/components/WisdomCommand/WisdomCommandDetail"
import XcEmpty from "../../../../../../../component/XcEmpty";
import popupUI from "component/PopupUI"
import PersonDetail from "features/Core/components/Control/PersonDetail"
import ShipAdd from "features/Core/components/Control/ShipAdd"
import dayjs from "dayjs"
import _ from "lodash"
const { RangePicker } = DatePicker;

export const OverallInputs: any[] = [
  ['关键字', 'searchCondition', {
    placeholder: '请输入关键字',
    allowClear: true
  }],
  [
    '人脸',
    'faceId',
    InputType.uploadImg,
    ShowType.image,
    {
      useType: UseType.edit,
      uploadImgFn: doUploadFile,
    }
  ],
]

// 0人脸 1 车牌 2 IMSI 3 IMEI 4 MAC 5 手机 6 AIS 7 RADAR 8融合 9视频 -1全局智搜  faceId imei imsi licensePlate mmsi uniqueId
export const codeTypeToKey: { [key: number]: string } = {
  0: 'faceId',
  1: 'licensePlate',
  2: 'imsi',
  3: 'imei',
  4: 'mac',
  5: 'phone',
  6: 'mmsi',
  7: 'uniqueId',
  8: 'targetId'
}

// 数据类型dataType: 01-人脸，02-车辆，03-侦码，04-AIS，05-雷达
const codeTypeToDataType: { [key: number]: string } = {
  0: '01',
  1: '02',
  2: '03',
  3: '03',
  4: '03',
  5: '03',
  6: '04',
  7: '05'
}

const OverallSituationItem: React.FC<WisdomProps> = ({ params }) => {
  console.debug('OverallSituationItem')


  const [form] = Form.useForm();
  const [overallForm] = Form.useForm();


  const [isMMSIRadar, setIsMMSIRadar] = useState<boolean>(true)
  const [isRadarTarget, setIsRadarTarget] = useState<boolean>(false)
  const [tarckList, setTarckList] = useState([])
  const [searchResult, setSearchResult] = useState([])
  const [active, setActive] = useState<any>()
  const [trackFormData, setTrackFormData] = useState<{
    returnTime: string;
    customTime: any
  }>();
  const [isLoading, setIsLoading] = useState(false)


  // 给表单赋初始值setFieldsValue
  useEffect(() => {
    form.setFieldsValue({
      returnTime: 'custom',
      customTime: [dayjs().subtract(1, 'day'), dayjs()],
    })
  }, [form]);

  useEffect(() => {
    if (active?.codeType) {
      setIsMMSIRadar([6, 7].includes(active?.codeType))
      setTrackFormData((val: any) => {
        return {
          ...val,
          returnTime: 'custom',
          customTime: [dayjs().subtract(1, 'day'), dayjs()]
        }
      })
    }
  }, [active?.codeType, form])

  // 查询轨迹信息
  useEffect(() => {
    if (!active || !trackFormData) return
    let obj: { [key: string]: any } = {}
    obj[codeTypeToKey[active.codeType]] = active.content
    queryTrackData({ ...obj, ...trackFormData }, active.codeType)
  }, [active, trackFormData])

  const handleFinish = useCallback(
    async (params: any) => {
      setIsLoading(true)
      const res = await getAllSisdomSearchList({ pageNumber: 1, pageSize: -1 }, { codeType: -1, ...(params || {}) })
      const data = res?.data || []
      setIsLoading(false)
      setSearchResult(data)
      setActive(data?.length ? data[0] : null)
    },
    [],
  )


  // 初始化
  useEffect(() => {
    // params && setFormData(params)
    overallForm && params && overallForm.setFieldsValue({ codeType: -1, ...params })
    handleFinish(params)
  }, [handleFinish, overallForm, params])


  function handelClick(data: any) {
    setActive(data)
  }

  // radio改变的时候，时间输入框置灰切换
  function radioChange(e: RadioChangeEvent) {
    setTrackFormData((val: any) => {
      return {
        ...val,
        returnTime: e.target.value,
        customTime: undefined
      }
    })
    // 重置RangePicker
    form.resetFields(['customTime'])
  }

  //获取表单的所有值
  function getFormValue() {
    const params = form.getFieldsValue()
    setTrackFormData(params)
  }

  // 获取轨迹信息
  async function queryTrackData(params: any, codeType: number) {
    const dto = {
      ...params,
      aisDateType: _.has(params, 'mmsi') ? 0 : 2
    }
    const res = await getAllHistoryTrack(dto)
    setTarckList(res || [])
    res?.length && setIsRadarTarget(codeType === 7)
  }

  const handleJudgmentModeling = useCallback(
    (isModeling?: boolean) => {
      if (!active) {
        message.warning(`请选择数据`);
        return;
      }
      const clueInfo = [{
        ...{
          codeType: active.codeType,
          codeValue: active.content
        },
        ...(active.codeType === 0 ? { imageUrl: active.path } : {})
      }]
      console.log(clueInfo, 'clueInfo')
      // 智能研判额外参数
      const otherInfo = {
        objType: [6, 7].includes(active.codeType) ? 1 : 2,
        dataType: codeTypeToDataType[active.codeType]
      }
      isModeling ? popup(<WisdomModel data={{ clueInfo }} />, { title: '智慧建模', size: 'fullscreen' }) : popup(<WisdomJudgment data={{ clueInfo, ...otherInfo }} />, { title: '智能研判', size: 'fullscreen' })
    },
    [active],
  )


  const tools = useMemo(() => [
    ['布控', {
      onClick: () => {
        if (!active) {
          message.warning(`请选择数据`);
          return;
        }
        // 判断打开船舶布控或人车布控
        if ([6, 7].includes(active.codeType)) {
          const params = {
            controlScope: "1",
            alarmConditionShipMmsis: active.content,
          }
          popupUI(<ShipAdd controlType={1} params={params} />, { title: '新增布控', size: "middle", })
        }
        else if ([0, 1].includes(active.codeType)) {
          const personCtrlJson = active.codeType === 0 ? {
            personConditionDto: {
              controlScope: 1,
              faceDtoList: [{
                id: Number(active.content),
                url: active.path
              }]
            }
          } : {
            carConditionDto: {
              controlScope: 1,
              licensePlates: active.content
            }
          }
          popupUI(<PersonDetail params={{ personCtrlJson }} />, { title: '新增布控', size: "middle", })
        }
      }
    }],
    ['智能研判', {
      onClick: () => {
        handleJudgmentModeling()
      }
    }],
    ['智慧建模', {
      onClick: () => {
        handleJudgmentModeling(true)
      }
    }],
    ['实时指挥', {
      onClick: () => {
        if (!active) {
          message.warning(`请选择数据`);
          return;
        }
        console.log(active, "active")
        if (![6, 7].includes(active.codeType)) {
          message.warning(`目前仅支持船舶实时指挥`);
          return
        }
        const defaultData = {
          targetCode: active.content,
          latLng: active.latitude && active.longitude ? [{ lat: active.latitude, lng: active.longitude }] : null
        }
        popup(<WisdomCommandDetail defaultData={defaultData} />, { title: '新增任务', size: 'middle' })
      }
    }],
  ], [active, handleJudgmentModeling])


  return (
    <article className={styles.wrapper}>
      <FormPanel
        form={overallForm}
        inputs={OverallInputs}
        formProps={{
          layout: "inline",
        }}
        options={{
          isShowItemButton: true,
          isNotShowFooter: true,
          submitText: '搜索'
        }}
        onFinish={handleFinish} />
      <div className={styles.btnBox}>
        {
          tools.map((item: any, index: number) => {
            return (
              <section className={styles.btnStyle} key={index}>
                <Button {...item[1]}>{item[0]}</Button>
              </section>
            )
          })
        }
      </div>
      <div className={styles.contentLabel}>
        <span className={`${styles.labelIcon} iconfont icon-zhuangshitubiao`}></span>
        &nbsp;
        搜索结果
      </div>
      <div className={styles.content}>
        {/* 搜索结果 */}
        <div className={styles.searchList}>
          {isLoading
            ? <div className={styles.loading}><Spin size="large" /></div>
            : searchResult?.length
              ? searchResult.map((item: any, index: number) => {
                return <section className={`${styles.searchListBox} ${active?.content === item.content ? styles.activeBgc : ''}`} key={index}>
                  <div onClick={() => handelClick(item)}>
                    {item.codeType === 0 ? <ImageSimple className={`${styles.image} ${styles.matchImageColor}`} src={item.path} /> : <div className={styles.matchColor}>{item.content}</div>}
                    <div>{`最近采集时间：${item.capTime}`}</div>
                    <div>{`${[6, 7, 8].includes(item.codeType) ? '经纬度' : '最近采集点位'}：${item.capAddress}`}</div>
                  </div>
                </section>
              })
              : <XcEmpty />
          }
        </div>
        {/* 轨迹信息 */}
        <div className={styles.shipTrack}>
          {/*顶部检索条件表单*/}
          <Form
            form={form}>
            <Row>
              {
                !isMMSIRadar && <Col span={7}>
                  <Form.Item label="回放时间" name="returnTime" className={styles.returnTime}>
                    <Radio.Group value={trackFormData?.returnTime} onChange={radioChange}>
                      <Radio value={'lastFive'}> 最近5次 </Radio>
                      <Radio value={'custom'}> 自定义 </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              }
              <Col span={12}>
                <Form.Item name='customTime' className={styles.customTime}>
                  <RangePicker showTime disabled={trackFormData?.returnTime === 'lastFive'} value={trackFormData?.customTime} />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item>
                  <Button type={"primary"} htmlType="submit" onClick={getFormValue}>查看</Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div className={styles.mapBox}>
            <ShipTrackPlay tarckList={tarckList} isRadarTarget={isRadarTarget} isShowStart={true} />
          </div>
        </div>
        {/* 搜索结果的选中详情 */}
        <div className={styles.detail}>
          {isLoading
            ? <div className={styles.loading}><Spin size="large" /></div>
            : active
              ? <SearchDetail active={{ id: active.content, customTime: trackFormData?.customTime, ...active }} />
              : <XcEmpty />}
        </div>
      </div>
    </article>
  )
}

export default OverallSituationItem
