import { CloseOutlined } from '@ant-design/icons'
import { Button, Col, Row } from 'antd'
import { dispatchPolice, followTypeDict, noManPlaneDict, noManShipDict, planDealDict, teamTypeDict } from 'helper/dictionary'
import SelectSimple from 'hooks/basis/SelectSimple'
import { InputType } from 'hooks/flexibility/FormPanel'
import FormInterface from 'hooks/integrity/FormInterface'
import _ from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import styles from './index.module.sass'


const inputs1 = [
  ['跟踪方式', 'followTypeId', InputType.radio, { dict: followTypeDict }],
  ['跟踪时长', 'followLastTime', InputType.number, { addonAfter: '秒' }]
]

export const initData1 = {
  followTypeId: '1',
  followLastTime: 30
}

const inputs2 = [
  ['无人机', 'plane', InputType.selectMultiple, { dict: noManPlaneDict }],
]
export const initData2 = {
  plane: [1],
}

const inputs3 = [
  ['广播内容', 'trumpetContent', InputType.textArea],
  ['广播次数', 'trumpetNum', InputType.number, { addonAfter: '次' }]
]

const initData3 = {
  trumpetContent: '',
  trumpetNum: 3
}

const inputs4 = [
  ['跟踪方式', 'followTypeId', InputType.radio, { dict: followTypeDict }],
  ['跟踪时长', 'followLastTime', InputType.number, { addonAfter: '秒' }]
]

const initData4 = {
  followTypeId: '1',
  followLastTime: 30
}


const inputs5 = [
  ['无人船', 'ship', InputType.selectMultiple, { dict: noManShipDict }],
]
const initData5 = {
  ship: [],
}

const inputs6 = [
  ['派遣警力', 'police', InputType.selectMultiple, { dict: dispatchPolice }],
  ['人数', 'policeMount', InputType.number, { addonAfter: '人' }]
]
const initData6 = {
  police: [],
  policeMount:2
}

const inputs7 = [
  ['专业队', 'selectIds', InputType.selectMultiple, { dict: teamTypeDict }],
  ['说明', 'teamNote', InputType.textArea]
]

const initData7 = {
  selectIds: [],
  teamNote: ''
}

interface Props {
  data: any
  onDelete: () => void
  onChange: (params: any) => void
}

const ActionContent: React.FC<Props> = ({ data, onDelete, onChange }) => {
  console.debug('ActionContent')

  const { type } = data

  const [formData] = useState<any>(data)
  const [, setInteriorData] = useState<any>(data)
  const [inputs, setInputs] = useState<any[]>(() => {
    if (type === '1') return inputs1
    else if (type === '3') return inputs3
    else if (type === '4') return inputs4
    else if (type === '7') return inputs7
    else return []
  })

  const formProps = useMemo(() => {
    const handle = (params: any[]) => {

      setInteriorData((val: any) => {
        const target = _.head(params)
        const name = target.name.toString()
        const result = _.cloneDeep(val)
        _.set(result, name, target.value)
        onChange(result)
        return result
      })

    }
    return {
      onFieldsChange: _.debounce(handle, 50)
    }
  }, [onChange])

  const handleType = useCallback((param: string) => {
    switch (param) {
      case '1':
        setInputs(inputs1)
        setInteriorData({ ...initData1, type: param })
        onChange({ ...initData1, type: param })
        break;
      case '2':
        setInputs(inputs2)
        setInteriorData({ ...initData2, type: param })
        onChange({ ...initData2, type: param })
        break;
      case '3':
        setInputs(inputs3)
        setInteriorData({ ...initData3, type: param })
        onChange({ ...initData3, type: param })
        break;
      case '4':
        setInputs(inputs4)
        setInteriorData({ ...initData4, type: param })
        onChange({ ...initData4, type: param })
        break;
        
      case '5':
        setInputs(inputs5)
        setInteriorData({ ...initData5, type: param })
        onChange({ ...initData5, type: param })
        break;
        
      case '6':
        setInputs(inputs6)
        setInteriorData({ ...initData6, type: param })
        onChange({ ...initData6, type: param })
        break;
      case '7':
        setInputs(inputs7)
        setInteriorData({ ...initData7, type: param })
        onChange({ ...initData7, type: param })
        break;
      default:
        break;
    }
  }, [onChange])

  return (
    <article className={styles.wrapper}>
      <header>
        <Row>
          <Col className={styles.label} span={6}>处理方式</Col>
          <Col className={styles.typeBox} span={18}>
            <SelectSimple
              value={type}
              onChange={handleType}
              style={{ width: '100%' }}
              dict={planDealDict}
              allowClear={false}
            />
            <Button className={styles.close} onClick={onDelete} shape='circle' icon={<CloseOutlined />} />
          </Col>
        </Row>
      </header>
      <section>
        <FormInterface
          formData={formData}
          inputs={inputs}
          options={{ isNotShowFooter: true }}
          formProps={formProps}
        />
      </section>
    </article>
  )
}

export default ActionContent