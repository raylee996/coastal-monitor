import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.sass'
import { Button, Checkbox, Form, Radio, DatePicker, RadioChangeEvent, message, TableProps } from "antd";
// import ShipTrackPlay from 'component/ShipTrackPlay';
import { drawHistoryTrack, queryImageVideoList } from 'server/dataCenter/shipSailing';
import TableInterface from 'hooks/integrity/TableInterface';
import CommonMedia from '../CommonMedia';
import TargetTrackPlay, { TargetTrackPlayRefProps } from 'component/TargetTrackPlay';
import dayjs from 'dayjs';
import { TableOptions } from 'hooks/flexibility/TablePanel';
import ImageSimple from 'hooks/basis/ImageSimple';
// import VideoSimple from 'component/VideoSimple';
const { RangePicker } = DatePicker;

interface Props {
  /** 船舶信息 */
  shipData?: any
}

// const mapAttribute = { zoom: 14, minZoom: 13, maxZoom: 16 }

//历史轨迹
const HistoryTrack: React.FC<Props> = ({ shipData }) => {
  console.debug('HistoryTrack')

  // fusionStatus	数据类型（1AIS数据 2雷达 3融合 4无AIS及雷达）
  const { radarNumber, mmsi, dataType } = shipData


  const trackPlayRef = useRef<TargetTrackPlayRefProps>(null)


  const [form] = Form.useForm();

  //Form表单值
  const [formData, setFormData] = useState<any>({
    returnTime: 'lastHour',
    trackType: dataType === 2 ? ['radar'] : ['ais'],
    customTime: [dayjs().subtract(3, 'days').startOf('day'), dayjs()]
  });
  const [trackData, setTrackData] = useState<any[]>()
  const [dataSource, setDataSource] = useState<any[]>()
  // 历史数据根据档案数据获取的固定参数 ais获取数据类型-aisDateType 船舶唯一标识-mmsi 雷达目标唯一标识-uniqueId
  const [mediaParams, setMediaParams] = useState<any>()
  const [resetEmpty, setResetEmpty] = useState<boolean>()
  const [isLoading, setIsLoading] = useState(false)


  const columns = useMemo(() => {
    if (mmsi) {
      return [
        ['时间', 'time'],
        ['经纬度', 'capAddress'],
        ['航速', 'speed'],
        ['航向', 'course'],
        ['船艏向', 'trueHeading'],
        ['状态', 'trackStatusStrName'],
        ['轨迹类型', 'codeTypeStrName'],
        ['图片', 'picUrl', {
          itemProps: {
            width: '80px',
            render: (text: any, record: any) => {
              return (<>
                {record.picUrl && <div className={styles.imgBox}>
                  {record.picUrl ? <ImageSimple src={record.picUrl} /> : ''}
                </div>
                }
              </>
              )
            }
          }
        }],
        ['']
        /* ['视频', 'videoUrl', {
          itemProps: {
            width: '140px',
            render: (text: any, record: any) => {
              return (<>
                {record.videoUrl && < div className={styles.imgBox}>
                  {record.videoUrl ? <VideoSimple
                    getVideoParams={{
                      startTime: record.videoData.vstartTime,
                      endTime: record.videoData.vendTime,
                      deviceChannelCode: record.videoData.channel,
                      deviceCode: record.videoData.deviceCode,
                    }}
                    posterImage={record.videoUrl}
                  /> : ''}
                </div>
                }
              </>
              )
            }
          }
        }] */
      ]
    } else {
      return [
        ['时间', 'time'],
        ['经纬度', 'capAddress'],
        ['航速', 'speed'],
        ['航向', 'course'],
        ['轨迹类型', 'codeTypeStrName'],
        ['雷达批号', 'content'],
        ['图片', 'picUrl']
      ]
    }
  }, [mmsi])


  // 给表单赋初始值setFieldsValue
  useEffect(() => {
    form.setFieldsValue({
      returnTime: 'lastHour',
      trackType: dataType === 1 ? ['ais'] : ['radar'],
      customTime: [dayjs().subtract(3, 'days').startOf('day'), dayjs()]
    })
  }, [dataType, form]);

  const queryTrackData = useCallback(
    async (params: any) => {
      try {
        setIsLoading(true)
        let tableSource: any = []
        if (params?.trackType?.length === 2) {
          const res = await drawHistoryTrack(params, shipData)
          setTrackData(res?.trackData)
          // setDataSource(res?.tableData)
          tableSource = res?.tableData
        } else if (params?.trackType?.length === 1) {// AIS与Radar勾选其一
          const { mmsi, uniqueId, ...obj } = params
          let data = {}
          // 选中ais
          if (params?.trackType.includes('ais') && !params?.trackType.includes('radar')) {
            mmsi ? data = { mmsi, aisDateType: 0 } : data = { uniqueId, aisDateType: 0 }
          } else {
            // 选中雷达
            uniqueId ? data = { uniqueId, aisDateType: 2 } : data = { mmsi, aisDateType: 2 }
          }
          const res = await drawHistoryTrack({ ...obj, ...data }, shipData)
          setTrackData(res?.trackData)
          // setDataSource(res?.tableData)
          tableSource = res?.tableData
        }
        setDataSource(tableSource)
        let imageVideoList = await queryImageVideoList(mediaParams)
        for (let i = 0; i < tableSource.length; i++) {
          for (let j = 0; j < imageVideoList.image.length; j++) {
            if (dayjs(tableSource[i].capTime).format('YYYY-MM-DD HH:mm') === dayjs(imageVideoList.image[j].capTime).format('YYYY-MM-DD HH:mm')) {
              tableSource[i].picUrl = imageVideoList.image[j].picUrl
            }
          }
          for (let k = 0; k < imageVideoList.video.length; k++) {
            if (dayjs(tableSource[i].capTime).format('YYYY-MM-DD HH:mm') === dayjs(imageVideoList.video[k].capTime).format('YYYY-MM-DD HH:mm')) {
              tableSource[i].videoUrl = imageVideoList.video[k].picUrl
              tableSource[i].videoData = imageVideoList.video[k]
            }
          }
        }
        setDataSource(tableSource)
      } finally {
        setIsLoading(false)
      }
    },
    [shipData, mediaParams],
  )

  useEffect(() => {
    const params = form.getFieldsValue()
    queryTrackData({
      mmsi,
      uniqueId: radarNumber,
      ...params
    })
  }, [form, mmsi, queryTrackData, radarNumber])

  // radio改变的时候，时间输入框置灰切换
  const radioChange = useCallback(
    (e: RadioChangeEvent) => {
      setFormData((val: any) => {
        return {
          ...val,
          returnTime: e.target.value,
          customTime: [dayjs().subtract(3, 'days').startOf('day'), dayjs()]
        }
      })
    },
    [],
  )

  //获取表单的所有值
  const getFormValue = useCallback(
    () => {
      const params = form.getFieldsValue()
      if (params.returnTime === 'custom' && !params.customTime) {
        message.warning('请选择时间段')
        return
      }
      params?.trackType?.length || message.warning('请选择轨迹类型')
      if (shipData?.id) {
        // 轨迹类型勾选AIS与雷达
        params?.trackType?.length === 2 && setMediaParams({ archiveId: shipData.id, archiveType: shipData.dataType === 1 ? '3' : '4', ...params });
        // 轨迹类型勾选AIS
        params?.trackType?.length === 1 && params?.trackType.includes('ais') && setMediaParams({ archiveId: shipData.id, archiveType: shipData.dataType === 1 ? '3' : '4', codeType: '6', codeValue: shipData.mmsi, ...params });
        // 轨迹类型勾选雷达
        params?.trackType?.length === 1 && params?.trackType.includes('radar') && setMediaParams({ archiveId: shipData.id, archiveType: shipData.dataType === 1 ? '3' : '4', codeType: '7', codeValue: shipData.radarNumber, ...params });
        // 取消所有勾选，置空
        !params?.trackType?.length && setResetEmpty(true)
      }
      queryTrackData({
        mmsi,
        uniqueId: radarNumber,
        ...params
      })
    },
    [form, mmsi, queryTrackData, radarNumber, shipData],
  )


  const tableOptions = useMemo<TableOptions>(() => {
    const handleRowClick = (record: any) => {
      trackPlayRef.current?.onDatetimeCurrent(record.capTime)
    }

    return {
      onRowClick: handleRowClick
    }
  }, [])

  const tableProps: TableProps<any> = useMemo(() => {
    return {
      loading: isLoading
    }
  }, [isLoading])


  return (
    <article className={styles.wrapper}>
      <section className={styles.top}>
        <article className={styles.panelBox}>
          <header className={styles.formBox}>
            <Form
              form={form}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              layout="inline">
              <Form.Item label="回放时间" name="returnTime" className={styles.returnTime}>
                <Radio.Group value={formData.returnTime} onChange={radioChange}>
                  <Radio value={'lastHour'}> 最后一小时 </Radio>
                  <Radio value={'custom'}> 自定义 </Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name='customTime'>
                <RangePicker showTime disabled={formData.returnTime === 'lastHour'} value={formData.customTime} style={{ width: '360px' }} />
              </Form.Item>
              <Form.Item label="轨迹类型" name="trackType" className={styles.trackType}>
                <Checkbox.Group value={formData.trackType}>
                  <Checkbox value='ais'>AIS轨迹</Checkbox>
                  <Checkbox value='radar'>雷达轨迹</Checkbox>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item>
                <Button type={"primary"} htmlType="submit" onClick={getFormValue}>查看</Button>
              </Form.Item>
            </Form>
          </header>
          <section className={styles.mapBox}>
            <TargetTrackPlay ref={trackPlayRef} data={trackData} />
          </section>
        </article>
        <section className={styles.infoBox}>
          <CommonMedia request={queryImageVideoList} params={mediaParams} resetEmpty={resetEmpty} />
        </section>
      </section>
      <section className={styles.table}>
        <p className={styles.title}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>轨迹点详情</p>
        <TableInterface
          className={styles.tableData}
          columns={columns}
          tableDataSource={dataSource}
          tableOptions={tableOptions}
          tableProps={tableProps}
        />
      </section>
    </article>
  );
}

export default HistoryTrack;
