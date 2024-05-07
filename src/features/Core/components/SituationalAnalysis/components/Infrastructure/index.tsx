import { Checkbox, Col, Row, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Type } from "helper/dictionary";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";
import DeviceStatistic from "./components/DeviceStatistic";
import { getDeviceStatusStatisticData } from "server/statistics";
import { getDeviceSourceOptions, getDeviceTypeCount } from "server/device";
import { local } from "helper/storage";
import Link from "antd/es/typography/Link";
import windowUI from "component/WindowUI";
import { getPlaceLabelAll } from "server/place";


export const CONDITION_VALUE_B = 'CONDITION_VALUE_B'

interface DeviceType extends Type<any> {
  count?: number
}

export interface InfrastructureValue {
  source: string[]
  device: string[]
  fence: {
    control: {
      is: boolean,
      value: number
    },
    marker: boolean
    videoWarn: boolean
  }
  place: number[]
  other: {
    latlngGird: boolean
    fixedMarker: boolean
  }
}

export const infrastructureDefaultValue: InfrastructureValue = {
  source: [],
  device: [],
  fence: {
    control: {
      is: false,
      value: 1
    },
    marker: true,
    videoWarn: true
  },
  place: [],
  other: {
    latlngGird: false,
    fixedMarker: false
  }
}

interface Props {
  value?: InfrastructureValue
  onChange?: (value: InfrastructureValue) => void
}

const Infrastructure: React.FC<Props> = ({ value, onChange }) => {
  console.debug('Infrastructure')


  const realValue = useMemo(() => {
    if (value) {
      return {
        ..._.clone(infrastructureDefaultValue),
        ...value
      }
    } else {
      return _.clone(infrastructureDefaultValue)
    }
  }, [value])


  const [isCheckAllFence, setIsCheckAllFence] = useState(false)
  const [isIndeterminateFence, setIsIndeterminateFence] = useState(true)
  const [isCheckAllDevice, setIsCheckAllDevice] = useState(true)
  const [isIndeterminateDevice, setIsIndeterminateDevice] = useState(false)
  const [deviceList, setDeviceList] = useState<DeviceType[]>([])
  const [isCheckAllPlace, setIsCheckAllPlace] = useState(false)
  const [isIndeterminatePlace, setIsIndeterminatePlace] = useState(false)
  const [placeList, setPlaceList] = useState<any[]>([])
  const [statistic, setStatistic] = useState<any>({})
  const [deviceSourceList, setDeviceSourceList] = useState<any[]>([])
  const [isCheckAllDeviceSource, setIsCheckAllDeviceSource] = useState(false)
  const [isIndeterminateDeviceSource, setIsIndeterminateDeviceSource] = useState(true)


  // 获取在线数量
  useEffect(() => {
    async function main() {
      const vo = await getDeviceStatusStatisticData()
      setStatistic(vo)
    }
    main()
  }, [])


  // 获取设备来源类型
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const vo = await getDeviceSourceOptions(ctr)
      setDeviceSourceList(vo)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [])


  // 获取所有设备类型
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const _deviceList = await getDeviceTypeCount(realValue.source, ctr)
      setDeviceList(_deviceList)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [realValue.source])

  // 获取所有重点场所类型
  useEffect(() => {
    async function main() {
      const _deviceList = await getPlaceLabelAll()
      setPlaceList(_deviceList)
    }
    main()
  }, [])

  useEffect(() => {
    if (value) {
      setIsCheckAllDevice(value.device.length === deviceList.length);
      setIsIndeterminateDevice(value.device.length !== deviceList.length && value.device.length !== 0 && value.device.length < deviceList.length)

      setIsCheckAllFence(value.fence.control.is && value.fence.marker);
      if (value.fence.control.is
        && value.fence.marker
        && value.fence.videoWarn) { //都选中时，需要置为false
        setIsIndeterminateFence(false)
      } else {
        setIsIndeterminateFence(value.fence.control.is
          || value.fence.marker
          || value.fence.videoWarn)
      }

      setIsCheckAllPlace(value.place.length === placeList.length);
      setIsIndeterminatePlace(value.place.length !== placeList.length && value.place.length !== 0 && value.place.length < placeList.length);

      setIsCheckAllDeviceSource(value.source.length === deviceSourceList.length)
      setIsIndeterminateDeviceSource(value.place.length !== deviceSourceList.length && value.place.length !== 0 && value.place.length < deviceSourceList.length)
    }
  }, [value, deviceList, placeList, deviceSourceList])


  // 便捷状态变更函数
  const doChange = useCallback(
    (path: string, val: any) => {
      if (onChange) {
        const _realValue = _.clone(realValue)
        _.set(_realValue, path, val)
        local(CONDITION_VALUE_B, _realValue)
        onChange(_realValue)
      }
    },
    [onChange, realValue]
  )

  // 感知设备来源-全选
  const handleCheckAllDeviceSource = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? deviceSourceList.map(ele => ele.value) : []
      doChange('source', result)
    },
    [doChange, deviceSourceList]
  )

  // 感知设备来源-选择
  const handleCheckboxGroupDeviceSource = useCallback(
    (params: any[]) => {
      doChange('source', params)
    },
    [doChange]
  )

  // 感知设备-全选
  const handleCheckAllDevice = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? deviceList.map(ele => ele.value) : []
      doChange('device', result)
    },
    [doChange, deviceList]
  )

  // 感知设备-选择
  const handleCheckboxGroupDevice = useCallback(
    (params: any[]) => {
      doChange('device', params)
    },
    [doChange]
  )

  // 电子防区-全选
  const handleCheckAllFence = useCallback(
    (e: CheckboxChangeEvent) => {
      const _fence = {
        control: {
          is: e.target.checked,
          value: realValue.fence.control.value
        },
        marker: e.target.checked,
        videoWarn: e.target.checked
      }
      doChange('fence', _fence)
    },
    [doChange, realValue]
  )

  // 电子防区-布控区域
  const handleFenceControl = useCallback(
    (e: CheckboxChangeEvent) => {
      doChange('fence.control.is', e.target.checked)
    },
    [doChange]
  )

  // 电子防区-布控区域-类型选择
  const handleControlValue = useCallback(
    (param: number) => {
      doChange('fence.control.value', param)
    },
    [doChange]
  )

  // 电子防区-布控区域-标记
  const handleMarker = useCallback(
    (e: CheckboxChangeEvent) => {
      doChange('fence.marker', e.target.checked)
    },
    [doChange],
  )

  // 电子防区-布控区域-视频预警范围
  const handleVideoWarn = useCallback(
    (e: CheckboxChangeEvent) => {
      doChange('fence.videoWarn', e.target.checked)
    },
    [doChange],
  )

  // 重点场所-全选
  const handleCheckAllPlace = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? placeList.map(ele => ele.id) : []
      doChange('place', result)
    },
    [doChange, placeList]
  )

  // 重点场所-选择
  const handleCheckboxGroupPlace = useCallback(
    (params: any[]) => {
      doChange('place', params)
    },
    [doChange]
  )

  // 其他-选择
  const handleLatlngGird = useCallback(
    (e: CheckboxChangeEvent) => {
      doChange('other.latlngGird', e.target.checked)
    },
    [doChange]
  )

  // 海面固定物-选择
  const handleFixedMarker = useCallback(
    (e: CheckboxChangeEvent) => {
      doChange('other.fixedMarker', e.target.checked)
    },
    [doChange],
  )

  const handleStatistic = useCallback(
    () => {
      windowUI(<DeviceStatistic />, {
        title: '更多统计信息',
        key: 'PerceiveTarget.statistic',
        width: 'auto',
        height: 'auto',
        offset: [undefined, 100, 100]
      })
    },
    []
  )


  return (
    <article className={styles.wrapper}>

      <header>
        <div className={styles.statisticBox}>
          <div className={styles.statisticCard}>
            <div className={styles.statisticIconAis}></div>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>设备总数</div>
              <div className={styles.statisticValue}>{statistic.totalNum}</div>
            </div>
          </div>
          <div className={styles.statisticCard}>
            <div className={styles.statisticIconAis}></div>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>在线</div>
              <div className={styles.statisticValue}>{statistic.onlineNum}</div>
            </div>
          </div>
          <div className={styles.statisticCard}>
            <div className={styles.statisticIconAis}></div>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>离线</div>
              <div className={styles.statisticValue}>{statistic.offlineNum}</div>
            </div>
          </div>
        </div>
        <Link onClick={handleStatistic}>更多统计信息</Link>
      </header>

      <section>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>设备来源</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateDeviceSource}
                checked={isCheckAllDeviceSource}
                onChange={handleCheckAllDeviceSource} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              options={deviceSourceList}
              value={realValue.source}
              onChange={handleCheckboxGroupDeviceSource}
            />
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>感知设备</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateDevice}
                checked={isCheckAllDevice}
                onChange={handleCheckAllDevice} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              value={realValue.device}
              onChange={handleCheckboxGroupDevice}
            >
              <Row>
                {deviceList.map(ele => <Col key={ele.name} span={12}>
                  <Checkbox value={ele.value}>
                    <>
                      <span>{ele.name}</span>
                      <span className={styles.checkboxCount}>{ele.count}</span>
                    </>
                  </Checkbox>

                </Col>)}
              </Row>
            </Checkbox.Group>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>电子防区</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateFence}
                checked={isCheckAllFence}
                onChange={handleCheckAllFence} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Row>
              <Col span={18}>
                <Checkbox checked={realValue.fence.control.is} onChange={handleFenceControl}>布控区域</Checkbox>
                <Select
                  value={realValue.fence.control.value}
                  style={{ width: 180 }}
                  onChange={handleControlValue}
                  options={[
                    {
                      value: 1,
                      label: '我布控的区域',
                    },
                    {
                      value: 2,
                      label: '所有区域',
                    }
                  ]}
                />
              </Col>
              <Col span={6}>
                <Checkbox checked={realValue.fence.marker} onChange={handleMarker}>标记</Checkbox>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Checkbox checked={realValue.fence.videoWarn} onChange={handleVideoWarn}>视频预警范围</Checkbox>
              </Col>
            </Row>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>重点场所</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminatePlace}
                checked={isCheckAllPlace}
                onChange={handleCheckAllPlace} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              value={realValue.place}
              onChange={handleCheckboxGroupPlace}
            >
              <Row>
                {placeList.map(ele =>
                  <Col key={ele.id} span={12}>
                    <Checkbox value={ele.id}>
                      {ele.labelName}
                      <span className={styles.checkboxCount}>{ele.countNum}</span>
                    </Checkbox>
                  </Col>
                )}
              </Row>
            </Checkbox.Group>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>其他</div>
          </header>
          <section>
            <Row>
              <Col span={8}>
                <Checkbox checked={realValue.other.latlngGird} onChange={handleLatlngGird}>经纬度网格</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox checked={realValue.other.fixedMarker} onChange={handleFixedMarker}>海面固定物</Checkbox>
              </Col>
            </Row>
          </section>
        </article>

      </section>
    </article>
  )
}

export default Infrastructure