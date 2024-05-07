import { Checkbox, Col, Row, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import Link from "antd/es/typography/Link";
import windowUI from "component/WindowUI";
import { focusTypeDict, riskLevelOptions, Type, WarnDangerDateTypeDict } from "helper/dictionary";
import { local } from "helper/storage";
import DateRangeSimple from "hooks/basis/DateRangeSimple";
import SelectSimple from "hooks/basis/SelectSimple";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLabelDict } from "server/label";
import { getWarnStatisticsCount } from "server/situation";
import { getDictDataByType } from "server/system";
import WarnStatistic from "./components/WarnStatistic";
import styles from "./index.module.sass";


const { Text } = Typography;

export const CONDITION_VALUE_C = 'CONDITION_VALUE_C'


const CardTitle: React.FC<{ title: string, color: string }> = ({ title, color }) => {
  console.debug('CardTitle')
  return (
    <div>
      <span className={styles.cardTitle}>{title}</span>
      <i className="fa fa-square" aria-hidden="true" style={{ color: color }}></i>
    </div>
  )
}

// 本地字典数据转换 name => label
const riskOptions = riskLevelOptions.map(item => {
  let color = ''
  switch (item.value) {
    case 1:
      color = '#ff4d4f'
      break;
    case 2:
      color = '#ffa940'
      break;
    case 3:
      color = '#fadb14'
      break;
    default:
      color = '#fadb14'
      break;
  }
  return {
    ...item,
    label:
      <span>
        <span className={styles.optionLabel}>{item.name}</span>
        <i className="fa fa-square" aria-hidden="true" style={{ color }}></i>
      </span>
  }
})

// const focusTypeOptions = focusTypeDict.map(item => ({ ...item, label: item.name }))


export interface WarnDangerValue {
  dateType: number
  dateRange: string[]
  unusual: string[]
  level: number[]
  type: number[]
  focusType: string
}

export const warnDangerDefaultValue: WarnDangerValue = {
  dateType: 0,
  dateRange: [],
  unusual: [],
  level: riskLevelOptions.map(item => item.value),
  type: [],
  focusType: ''
}

interface Props {
  value?: WarnDangerValue
  onChange?: (value: WarnDangerValue) => void
}

const WarnDanger: React.FC<Props> = ({ value, onChange }) => {
  console.debug('WarnDanger')


  const realValue = useMemo(() => {
    if (value) {
      return {
        ..._.clone(warnDangerDefaultValue),
        ...value
      }
    } else {
      return _.clone(warnDangerDefaultValue)
    }
  }, [value])


  const [unusualList, setUnusualList] = useState<any[]>([])
  const [riskTypeList, setRiskTypeList] = useState<Type<any>[]>([])
  const [statistic, setStatistic] = useState<any>({})

  // const [isCheckAllFouceType, setIsCheckAllFouceType] = useState(false)
  // const [isIndeterminateFouceType, setIsIndeterminateFouceType] = useState(false)

  const [isCheckAllUnusual, setIsCheckAllUnusual] = useState(false)
  const [isIndeterminateUnusual, setIsIndeterminateUnusual] = useState(false)

  const [isCheckAllLevelData, setIsCheckAllLevelData] = useState(false)
  const [isIndeterminateLevelData, setIsIndeterminateLevelData] = useState(false)

  const [isCheckAllTypeData, setIsCheckAllTypeData] = useState(false)
  const [isIndeterminateTypeData, setIsIndeterminateTypeData] = useState(false)


  // 获取船舶异常行为态势
  useEffect(() => {
    async function main() {
      const _unusualList = await getDictDataByType('behaviour_type')
      setUnusualList(_unusualList)
    }
    main()
  }, [])

  // 船舶风险类别态势
  useEffect(() => {
    async function main() {
      const _riskTypeList = await getLabelDict(7)
      setRiskTypeList(_riskTypeList)
    }
    main()
  }, [])

  // 数据统计
  useEffect(() => {
    async function main() {
      const vo = await getWarnStatisticsCount(realValue.dateType, realValue.focusType)
      setStatistic(vo)
    }
    main()
  }, [realValue.dateType, realValue.focusType])

  useEffect(() => {
    if (value) {
      // setIsCheckAllFouceType(value.focusType.length === focusTypeOptions.length)
      // setIsIndeterminateFouceType(value.focusType.length !== focusTypeOptions.length && value.focusType.length !== 0 && value.focusType.length < focusTypeOptions.length)

      setIsCheckAllUnusual(value.unusual.length === unusualList.length)
      setIsIndeterminateUnusual(value.unusual.length !== unusualList.length && value.unusual.length !== 0 && value.unusual.length < unusualList.length)

      setIsCheckAllTypeData(value.type.length === riskTypeList.length)
      setIsIndeterminateTypeData(value.type.length !== riskTypeList.length && value.type.length !== 0 && value.type.length < riskTypeList.length)

      setIsCheckAllLevelData(value.level.length === riskOptions.length)
      setIsIndeterminateLevelData(value.level.length !== riskOptions.length && value.level.length !== 0 && value.level.length < riskOptions.length)
    }
  }, [value, unusualList, riskTypeList])


  // // 船舶分类-全选
  // function handleCheckAllFouceType(e: CheckboxChangeEvent) {
  //   const result = e.target.checked ? focusTypeOptions.map(ele => ele.value) : []
  //   doChange('focusType', result)
  // }

  // // 船舶分类-选择
  // function handleCheckboxGroupFouceType(params: any[]) {
  //   doChange('focusType', params)
  // }

  // 风险等级-全选
  function handleCheckAllLevelData(e: CheckboxChangeEvent) {
    const result = e.target.checked ? riskOptions.map(ele => ele.value) : []
    doChange('level', result)
  }

  // 风险等级-选择
  function handleCheckboxGroupLevelData(params: any[]) {
    doChange('level', params)
  }

  // 风险类别-全选
  function handleCheckAllTypeData(e: CheckboxChangeEvent) {
    const result = e.target.checked ? riskTypeList.map(ele => ele.value) : []
    doChange('type', result)
  }
  // 风险类别-选择
  function handleCheckboxGroupTypeData(params: any[]) {
    doChange('type', params)
  }

  // 船舶异常行为态势-全选
  function handleCheckAllUnusual(e: CheckboxChangeEvent) {
    const _unusual = e.target.checked ? unusualList.map(ele => ele.value) : []
    doChange('unusual', _unusual)
  }

  // 船舶异常行为态势-选择
  function handleCheckboxGroupUnusual(params: any[]) {
    doChange('unusual', params)
  }

  // 便捷状态变更函数
  const doChange = useCallback(
    (path: string, val: any) => {
      if (onChange) {
        const _realValue = _.clone(realValue)
        _.set(_realValue, path, val)
        local(CONDITION_VALUE_C, _realValue)
        onChange(_realValue)
      }
    },
    [onChange, realValue],
  )

  const handleDateType = useCallback(
    (param: any) => {
      doChange('dateType', param)
    },
    [doChange],
  )

  const handleFouceType = useCallback(
    (param: any) => {
      doChange('focusType', param)
    },
    [doChange],
  )

  function handleFinish(params: string[]) {
    doChange('dateRange', params)
  }

  function handleStatistic() {
    windowUI(<WarnStatistic />, {
      title: '更多统计信息',
      key: 'PerceiveTarget.statistic',
      width: 'auto',
      height: 'auto',
      offset: [undefined, 100, 100]
    })
  }

  return (
    <article className={styles.wrapper}>

      <header>
        <div className={styles.dateSelect}>
          <div className={styles.dateLabel}>统计时间：</div>
          <div>
            <SelectSimple
              className={styles.selectSimple}
              dict={WarnDangerDateTypeDict}
              value={realValue.dateType}
              onChange={handleDateType}
              style={{ width: 90 }}
              size='small'
              allowClear={false} />
          </div>
          {realValue.dateType === 6 &&
            <DateRangeSimple
              size="small"
              style={{ width: 210 }}
              onFinish={handleFinish} />
          }
        </div>
        <div className={styles.dateSelect}>
          <div className={styles.dateLabel}>船舶分类：</div>
          <div>
            <div>
              <SelectSimple
                className={styles.selectSimple}
                dict={focusTypeDict}
                value={realValue.focusType}
                onChange={handleFouceType}
                style={{ width: 90 }}
                size='small'
                allowClear={false} />
            </div>
          </div>
          {/* <div className={styles.dateBox}>
            <div className={styles.dateGroup}>
              <Checkbox.Group
                options={focusTypeOptions}
                value={realValue.focusType}
                onChange={handleCheckboxGroupFouceType}
              />
            </div>
            <Checkbox
              indeterminate={isIndeterminateFouceType}
              checked={isCheckAllFouceType}
              onChange={handleCheckAllFouceType} >
              全选
            </Checkbox>
          </div> */}
        </div>
        <div className={styles.statisticBox}>
          <div className={styles.statisticCard}>
            <div className={styles.statisticIconAis}></div>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>预警记录</div>
              <div className={styles.statisticValue}>{statistic.total}</div>
            </div>
          </div>
          <div className={styles.statisticCard}>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>未处理</div>
              <div className={styles.statisticValue}>{statistic.unDealNum}</div>
            </div>
          </div>
          <div className={styles.statisticCard}>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>有警情</div>
              <div className={styles.statisticValue}>{statistic.alarmNum}</div>
            </div>
          </div>
          <div className={styles.statisticCard}>
            <div className={styles.statisticPanel}>
              <div className={styles.statisticLabel}>无警情</div>
              <div className={styles.statisticValue}>{statistic.noAlarmNum}</div>
            </div>
          </div>
        </div>
        <div className={styles.statisticCard} style={{ marginLeft: '0', width: '128px', marginTop: '8px' }}>
          <div className={styles.statisticPanel}>
            <div className={styles.statisticLabel}>其他</div>
            <div className={styles.statisticValue}>{statistic.otherAlarmNum || 0}</div>
          </div>
        </div>
        <Link onClick={handleStatistic}>更多统计信息</Link>
      </header>

      <section>

        {/* <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>船舶分类</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateFouceType}
                checked={isCheckAllFouceType}
                onChange={handleCheckAllFouceType} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              options={focusTypeOptions}
              value={realValue.focusType}
              onChange={handleCheckboxGroupFouceType}
            />
          </section>
        </article> */}

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>风险等级筛选</div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateLevelData}
                checked={isCheckAllLevelData}
                onChange={handleCheckAllLevelData} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              options={riskOptions}
              value={realValue.level}
              onChange={handleCheckboxGroupLevelData}
            />
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>
              <CardTitle title="船舶风险类别态势" color="#52c41a" />
            </div>
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
              value={realValue.type}
              onChange={handleCheckboxGroupTypeData}
            >
              <Row>
                {riskTypeList.map(ele => <Col key={ele.value} span={6}>
                  <Checkbox value={ele.value}>
                    <Text
                      className={styles.checkboxText}
                      ellipsis={{ tooltip: ele.name }}
                    >
                      {ele.name}
                    </Text>
                  </Checkbox>
                </Col>)}
              </Row>
            </Checkbox.Group>
          </section>
        </article>

        <article className={styles.groupCard}>
          <header className={styles.groupCardHeader}>
            <div className={styles.groupCardTitle}>
              <CardTitle title="船舶异常行为态势" color="#b0f4ff" />
            </div>
            <div className={styles.groupCardCheck}>
              <Checkbox
                indeterminate={isIndeterminateUnusual}
                checked={isCheckAllUnusual}
                onChange={handleCheckAllUnusual} >
                全选
              </Checkbox>
            </div>
          </header>
          <section>
            <Checkbox.Group
              value={realValue.unusual}
              onChange={handleCheckboxGroupUnusual}
            >
              <Row>
                {unusualList.map(ele => <Col key={ele.value} span={6}>
                  <Checkbox value={ele.value}>
                    <Text
                      className={styles.checkboxText}
                      ellipsis={{ tooltip: ele.name }}
                    >
                      {ele.name}
                    </Text>
                  </Checkbox>
                  {ele.count}
                </Col>)}
              </Row>
            </Checkbox.Group>
          </section>
        </article>

      </section>
    </article>
  )
}

export default WarnDanger