import { Checkbox, Col, InputNumber, Row, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import Link from "antd/es/typography/Link";
import windowUI from "component/WindowUI";
import { dataLayerOptions, shipFocusOptions, shipLevelOptions, shipSizeOptions, shipStateOptions, Type } from "helper/dictionary";
import { local } from "helper/storage";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getPlacePortList } from "server/place";
import { getTargetStatisticWorker } from "server/statistics";
import { getDictDataByType, getShipTypeDictDataOnlyIcon } from "server/system";
import TargetStatistic from "./components/TargetStatistic";
import styles from "./index.module.sass";
import './index.sass'

const { Text } = Typography;
export const CONDITION_VALUE_A = 'CONDITION_VALUE_A'

// 本地字典数据转换 name => label
const dataOptions = dataLayerOptions.map(item => {
  let className = ''
  switch (item.value) {
    case "1":
      className = styles.shipIconAis
      break;
    case "2":
      className = styles.shipIconRadar
      break;
    case "3":
      className = styles.shipIconTarget
      break;
    default:
      break;
  }
  return {
    ...item,
    label:
      <>
        <span>{item.name}</span>
        <span className={className}></span>
      </>
  }
})
const riskOptions = shipLevelOptions.map(item => {
  let color = ''
  switch (item.value) {
    case '1':
      color = '#ff4d4f'
      break;
    case '2':
      color = '#ffa940'
      break;
    case '3':
      color = '#fadb14'
      break;
    case '4':
      color = '#52c41a'
      break;
    default:
      color = '#52c41a'
      break;
  }
  return {
    ...item,
    label:
      <>
        <span className={styles.optionLabel}>{item.name}</span>
        <i className="fa fa-square" aria-hidden="true" style={{ color }}></i>
      </>
  }
})
const sizeOptions = shipSizeOptions.map(item => ({ ...item, label: item.name }))
const stateOptions = shipStateOptions.map(item => ({ ...item, label: item.name }))
const focusOptions = shipFocusOptions.map(item => {
  let color = ''
  switch (item.value) {
    case '5':
      color = '#000000'
      break;
    case '2':
      color = '#be25f0'
      break;
    case '3':
      color = '#46ccff'
      break;
    case '4':
      color = '#25F076'
      break;
    default:
      color = '#25F076'
      break;
  }
  return {
    ...item,
    label:
      <>
        <span className={styles.optionLabel}>{item.name}</span>
        <i className="fa fa-square" aria-hidden="true" style={{ color }}></i>
      </>
  }
})

interface Trails {
  is: boolean
  value: number
}

export interface PerceiveTargetValue {
  baseData: string[]
  riskData: string[]
  sizeData: string[]
  typeData: string[]
  stateData: string[]
  portData: string[]
  focusData: string[]
  iconData: string[]
  trails: {
    ais: Trails,
    radar: Trails
  }
}

export const perceiveTargetDefaultValue: PerceiveTargetValue = {
  baseData: dataLayerOptions.map(ele => ele.value),
  riskData: shipLevelOptions.map(ele => ele.value),
  sizeData: shipSizeOptions.map(ele => ele.value),
  typeData: [],
  stateData: shipStateOptions.map(ele => ele.value),
  portData: [],
  focusData: focusOptions.map(ele => ele.value),
  iconData: [],
  trails: {
    ais: {
      is: true,
      value: 5
    },
    radar: {
      is: true,
      value: 5
    }
  }
}

interface Props {
  value?: PerceiveTargetValue
  onChange?: (value: PerceiveTargetValue) => void
}

const PerceiveTarget: React.FC<Props> = ({ value, onChange }) => {
  console.debug('PerceiveTarget')


  const realValue = useMemo(() => {
    if (value) {
      return {
        ..._.clone(perceiveTargetDefaultValue),
        ...value
      }
    } else {
      return _.clone(perceiveTargetDefaultValue)
    }
  }, [value])


  const [isCheckAllBaseData, setIsCheckAllBaseData] = useState(true)
  const [isIndeterminateBaseData, setIsIndeterminateBaseData] = useState(false)

  const [isCheckAllRiskData, setIsCheckAllRiskData] = useState(true)
  const [isIndeterminateRiskData, setIsIndeterminateRiskData] = useState(false)

  const [isCheckAllSizeData, setIsCheckAllSizeData] = useState(true)
  const [isIndeterminateSizeData, setIsIndeterminateSizeData] = useState(false)

  const [isCheckAllTypeData, setIsCheckAllTypeData] = useState(true)
  const [isIndeterminateTypeData, setIsIndeterminateTypeData] = useState(false)

  const [isCheckAllStateData, setIsCheckAllStateData] = useState(true)
  const [isIndeterminateStateData, setIsIndeterminateStateData] = useState(false)

  const [isCheckAllPortData, setIsCheckAllPortData] = useState(false)
  const [isIndeterminatePortData, setIsIndeterminatePortData] = useState(false)

  const [isCheckAllFocusData, setIsCheckAllFocusData] = useState(false)
  const [isIndeterminateFocusData, setIsIndeterminateFocusData] = useState(false)

  const [isCheckAllIconData, setIsCheckAllIconData] = useState(true)
  const [isIndeterminateIconData, setIsIndeterminateIconData] = useState(false)

  const [typeData, setTypeData] = useState<Type<string>[]>([])
  const [iconData, setIconData] = useState<Type<string>[]>([])
  const [portData, setPortData] = useState<Type<string>[]>([])

  const [targetStatistic, setTargetStatistic] = useState<any>({})


  // 获取远程数据
  useEffect(() => {
    async function main() {
      const _typeData = await getDictDataByType('archive_ship_type')
      setTypeData(_typeData)

      const _portData = await getPlacePortList()
      setPortData(_portData)

      const _iconData = await getShipTypeDictDataOnlyIcon()
      setIconData(_iconData)
    }
    main()
  }, [])

  // 轮询查询统计接口
  useEffect(() => {
    const _worker = getTargetStatisticWorker((res: any) => {
      if (res.code === 200) {
        setTargetStatistic(res.data)
      }
    })
    return () => {
      _worker && _worker.terminate()
    }
  }, [])

  useEffect(() => {
    if (value) {
      setIsCheckAllBaseData(value.baseData.length === dataOptions.length)
      setIsIndeterminateBaseData(value.baseData.length !== dataOptions.length && value.baseData.length !== 0 && value.baseData.length < dataOptions.length)

      setIsCheckAllRiskData(value.riskData.length === riskOptions.length)
      setIsIndeterminateRiskData(value.riskData.length !== riskOptions.length && value.riskData.length !== 0 && value.riskData.length < riskOptions.length)

      setIsCheckAllSizeData(value.sizeData.length === sizeOptions.length)
      setIsIndeterminateSizeData(value.sizeData.length !== sizeOptions.length && value.sizeData.length !== 0 && value.sizeData.length < sizeOptions.length)

      setIsCheckAllStateData(value.stateData.length === stateOptions.length)
      setIsIndeterminateStateData(value.stateData.length !== stateOptions.length && value.stateData.length !== 0 && value.stateData.length < stateOptions.length)

      setIsCheckAllTypeData(value.typeData.length === typeData.length)
      setIsIndeterminateTypeData(value.typeData.length !== typeData.length && value.typeData.length !== 0 && value.typeData.length < typeData.length)

      setIsCheckAllPortData(value.portData.length === portData.length)
      setIsIndeterminatePortData(value.portData.length !== portData.length && value.portData.length !== 0 && value.portData.length < portData.length)

      setIsCheckAllFocusData(value.focusData.length === focusOptions.length)
      setIsIndeterminateFocusData(value.focusData.length !== focusOptions.length && value.focusData.length !== 0 && value.focusData.length < focusOptions.length)

      setIsCheckAllIconData(value.iconData.length === iconData.length)
      setIsIndeterminateIconData(value.iconData.length !== iconData.length && value.iconData.length !== 0 && value.iconData.length < iconData.length)
    }
  }, [value, typeData, portData, iconData])

  // 便捷状态变更函数
  const doChange = useCallback(
    (path: string, val: any) => {
      if (onChange) {
        const _realValue = _.clone(realValue)
        _.set(_realValue, path, val)
        local(CONDITION_VALUE_A, _realValue)
        onChange(_realValue)
      }
    },
    [onChange, realValue]
  )


  // 基础数据-全选
  const handleCheckAllBaseData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? dataLayerOptions.map(ele => ele.value) : []
      doChange('baseData', result)
    },
    [doChange]
  )
  // 基础数据-选择
  const handleCheckboxGroupBaseData = useCallback(
    (params: any[]) => {
      doChange('baseData', params)
    },
    [doChange]
  )

  // 风险等级-全选
  const handleCheckAllRiskData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? shipLevelOptions.map(ele => ele.value) : []
      doChange('riskData', result)
    },
    [doChange]
  )
  // 风险等级-选择
  const handleCheckboxGroupRiskData = useCallback(
    (params: any[]) => {
      doChange('riskData', params)
    },
    [doChange]
  )

  // 船舶分类-全选
  const handleCheckAllFocusData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? focusOptions.map(ele => ele.value) : []
      doChange('focusData', result)
    },
    [doChange]
  )
  // 船舶分类-选择
  const handleCheckboxGroupFocusData = useCallback(
    (params: any[]) => {
      doChange('focusData', params)
    },
    [doChange]
  )

  // 目标大小-全选
  const handleCheckAllSizeData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? shipSizeOptions.map(ele => ele.value) : []
      doChange('sizeData', result)
    },
    [doChange]
  )
  // 目标大小-选择
  const handleCheckboxGroupSizeData = useCallback(
    (params: any[]) => {
      doChange('sizeData', params)
    },
    [doChange]
  )

  // 船舶类型-全选
  const handleCheckAllTypeData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? typeData.map(ele => ele.value) : []
      doChange('typeData', result)
    },
    [doChange, typeData]
  )
  // 船舶类型-选择
  const handleCheckboxGroupTypeData = useCallback(
    (params: any[]) => {
      doChange('typeData', params)
    },
    [doChange]
  )

  // 运动状态-全选
  const handleCheckAllStateData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? stateOptions.map(ele => ele.value) : []
      doChange('stateData', result)
    },
    [doChange]
  )
  // 运动状态-选择
  const handleCheckboxGroupStateData = useCallback(
    (params: any[]) => {
      doChange('stateData', params)
    },
    [doChange]
  )

  // 船舶来源-全选
  const handleCheckAllPortData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? portData.map(ele => ele.value) : []
      doChange('portData', result)
    },
    [doChange, portData],
  )
  // 船舶来源-选择
  const handleCheckboxGroupPortData = useCallback(
    (params: any[]) => {
      doChange('portData', params)
    },
    [doChange]
  )

  // 船舶图标-全选
  const handleCheckAllIconData = useCallback(
    (e: CheckboxChangeEvent) => {
      const result = e.target.checked ? iconData.map(ele => ele.value) : []
      doChange('iconData', result)
    },
    [doChange, iconData]
  )
  // 船舶图标-选择
  const handleCheckboxGroupIconData = useCallback(
    (params: any[]) => {
      doChange('iconData', params)
    },
    [doChange]
  )

  //尾迹-ais
  const handleTrailsAis = useCallback(
    (e: CheckboxChangeEvent) => {
      doChange('trails.ais.is', e.target.checked)
    },
    [doChange]
  )
  const handleTrailsAisValue = useCallback(
    (value: any) => {
      doChange('trails.ais.value', value)
    },
    [doChange]
  )

  //尾迹-雷达
  const handleTrailsRadar = useCallback(
    (e: CheckboxChangeEvent) => {
      doChange('trails.radar.is', e.target.checked)
    },
    [doChange]
  )
  const handleTrailsRadarValue = useCallback(
    (value: any) => {
      doChange('trails.radar.value', value)
    },
    [doChange]
  )

  const handleStatistic = useCallback(
    () => {
      windowUI(<TargetStatistic />, {
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
              <div className={styles.statisticLabel}>AIS目标</div>
              <div className={styles.statisticValue}>{targetStatistic.aisCount}</div>
            </div>
            <div className={styles.statistic}>
              <div>
                <span className={styles.statisticAlt}>重点：</span>
                <span className={styles.statisticVal}>{targetStatistic.aisFocusCount}</span>
              </div>
              <div>
                <span className={styles.statisticAlt}>关注：</span>
                <span className={styles.statisticVal}>{targetStatistic.aisConcernCount}</span>
              </div>
            </div>
          </div>
          <div className={styles.statisticCard}>
            <div className={styles.statisticIconAis}></div>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>雷达目标</div>
              <div className={styles.statisticValue}>{targetStatistic.radarCount}</div>
            </div>
          </div>
          <div className={styles.statisticCard}>
            <div className={styles.statisticIconAis}></div>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>融合目标</div>
              <div className={styles.statisticValue}>{targetStatistic.fusionCount}</div>
            </div>
          </div>
        </div>
        <Link onClick={handleStatistic}>更多统计信息</Link>
      </header>

      <section>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>基础数据</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateBaseData}
                checked={isCheckAllBaseData}
                onChange={handleCheckAllBaseData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              options={dataOptions}
              value={realValue.baseData}
              onChange={handleCheckboxGroupBaseData}
            />
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>风险等级筛选</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateRiskData}
                checked={isCheckAllRiskData}
                onChange={handleCheckAllRiskData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              options={riskOptions}
              value={realValue.riskData}
              onChange={handleCheckboxGroupRiskData}
            />
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>船舶分类筛选</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateFocusData}
                checked={isCheckAllFocusData}
                onChange={handleCheckAllFocusData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              options={focusOptions}
              value={realValue.focusData}
              onChange={handleCheckboxGroupFocusData}
            />
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>AIS目标大小</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateSizeData}
                checked={isCheckAllSizeData}
                onChange={handleCheckAllSizeData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              className={styles.checkboxGroup}
              value={realValue.sizeData}
              onChange={handleCheckboxGroupSizeData}
            >
              {sizeOptions.map(ele => <div className={styles.checkbox} key={ele.name}>
                <Checkbox value={ele.value}>
                  <Text className={styles.checkboxText} ellipsis={{ tooltip: ele.name }} >
                    {ele.name}
                  </Text>
                </Checkbox>
              </div>)}
            </Checkbox.Group>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>运动状态</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateStateData}
                checked={isCheckAllStateData}
                onChange={handleCheckAllStateData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              options={stateOptions}
              value={realValue.stateData}
              onChange={handleCheckboxGroupStateData}
            />
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>船舶来源</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminatePortData}
                checked={isCheckAllPortData}
                onChange={handleCheckAllPortData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              className={styles.checkboxGroup}
              value={realValue.portData}
              onChange={handleCheckboxGroupPortData}
            >
              {portData.map(ele => <div className={styles.checkbox} key={ele.name}>
                <Checkbox value={ele.value}>
                  <Text className={styles.checkboxText} ellipsis={{ tooltip: ele.name }} >
                    {ele.name}
                  </Text>
                </Checkbox>
              </div>)}
            </Checkbox.Group>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>船舶类型</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateTypeData}
                checked={isCheckAllTypeData}
                onChange={handleCheckAllTypeData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              className={styles.checkboxGroup}
              value={realValue.typeData}
              onChange={handleCheckboxGroupTypeData}
            >
              {typeData.map(ele => <div className={styles.checkbox} key={ele.name} ><Checkbox value={ele.value}>{ele.name}</Checkbox></div>)}
            </Checkbox.Group>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>船舶图标</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateIconData}
                checked={isCheckAllIconData}
                onChange={handleCheckAllIconData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              className={styles.checkboxGroup}
              value={realValue.iconData}
              onChange={handleCheckboxGroupIconData}
            >
              {iconData.map(ele => <div className={styles.checkboxs} key={ele.name} ><Checkbox value={ele.value}>{ele.name}</Checkbox><i className={`ship-icon-${[Number(ele.value)]}`}></i></div>)}
            </Checkbox.Group>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>船舶尾迹</div>
          </header>
          <section>
            <Row>
              <Col span={12}>
                <Checkbox checked={realValue.trails.ais.is} onChange={handleTrailsAis}>AIS展示</Checkbox>
                <InputNumber
                  min={1}
                  value={realValue.trails.ais.value}
                  formatter={(value) => `${value} 分钟`}
                  onChange={handleTrailsAisValue}
                />
              </Col>
              <Col span={12}>
                <Checkbox checked={realValue.trails.radar.is} onChange={handleTrailsRadar}>雷达展示</Checkbox>
                <InputNumber
                  min={1}
                  value={realValue.trails.radar.value}
                  formatter={(value) => `${value} 分钟`}
                  onChange={handleTrailsRadarValue}
                />
              </Col>
            </Row>
          </section>
        </article>

      </section>
    </article>
  )
}

export default PerceiveTarget