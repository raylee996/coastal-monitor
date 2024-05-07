import { PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Input, Radio, RadioChangeEvent, Row, Tag } from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import UploadFaceButton from "component/UploadFaceButton";
import DataListChoose from "features/DataCenter/components/DataListChoose";
import { CtrlWarnDict } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { doGetPersonList } from "server/personnel";
import styles from "./index.module.sass";


const checkboxOptions = [
  { label: '车辆布控', value: 2 },
  { label: '人员布控', value: 1 }
]

const personOptions = [
  { label: '所有人员', value: 1 },
  { label: '指定人员', value: 2 }
]

const carOptions = [
  { label: '所有车辆', value: 1 },
  { label: '指定车辆', value: 2 }
]

const focusPersonScopeOptions = [
  { label: '所有重点人员', value: 0 },
  { label: '指定重点人员', value: 1 }
]

const ctrlWarnOptions = CtrlWarnDict.map(val => ({ ...val, label: val.name }))

type Face = { id: number, url: string }

interface Props {
  value?: any
  onChange?: (data: any) => void
}

const ControlContent: React.FC<Props> = ({ onChange, value }) => {
  console.debug('ControlContent')

  const [checkboxValue, setCheckboxValue] = useState<number[]>([2])
  const [personValue, setPersonValue] = useState(1)
  const [personWarn, setPersonWarn] = useState(3)
  const [carValue, setCarValue] = useState(2)
  const [carWarn, setCarWarn] = useState(3)
  const [faceList, setFaceList] = useState<Face[]>([])
  const [personList, setPersonList] = useState<any[]>([])
  const [idCardText, setIdCardText] = useState('')
  const [licensePlateText, setLicensePlateText] = useState('')

  const [onChangeValue, setOnChangeValue] = useState<any>()

  const [focusPersonScope, setFocusPersonScope] = useState<any>(1)

  const curValue = useMemo<any>(() => {
    let personCtrlJson = {}
    if (checkboxValue.includes(1)) {
      let _idCardList: any[] = []
      if (idCardText) {
        _idCardList = idCardText.split(',').map(val => ({
          idCard: val,
          faceId: '',
          licensePlate: ''
        }))
      }
      const target = {
        personConditionDto: {
          alarmCondition: String(personWarn),
          controlScope: String(personValue - 1),
          faceDtoList: faceList.map(item => ({ faceId: String(item.id), url: item.url })),
          idCardList: _idCardList,
          focusPersonScope,
          focusPersonList: personList.map(item => ({
            id: item.id,
            faceid: item.faceid,
            licensePlate: item.licensePlate,
            name: item.name,
            url: item.facePath
          }))
        }
      }
      personCtrlJson = {
        ...personCtrlJson,
        ...target
      }
    }
    if (checkboxValue.includes(2)) {
      const target = {
        carConditionDto: {
          alarmCondition: String(carWarn),
          controlScope: String(carValue - 1),
          licensePlates: licensePlateText
        }
      }
      personCtrlJson = {
        ...personCtrlJson,
        ...target
      }
    }
    return _.isEmpty(personCtrlJson) ? undefined : personCtrlJson
  }, [checkboxValue, idCardText, personWarn, personValue, faceList, focusPersonScope, personList, carWarn, carValue, licensePlateText])

  const personKeys = useMemo(() => {
    return personList.map(item => item.id)
  }, [personList])

  useEffect(() => {
    if (onChange && curValue && !_.isEqual(curValue, onChangeValue)) {
      onChange(curValue)
      setOnChangeValue(curValue)
    }
  }, [onChange, curValue, onChangeValue])

  useEffect(() => {
    if (value) {
      const _checkboxValue = []
      let _personValue = 1
      let _personWarn = 3
      let _personFoucs = 1
      const _faceList: Face[] = []
      const _personList: any[] = []
      let _idCardText = ''
      if (value.personConditionDto) {
        const data = value.personConditionDto
        _checkboxValue.push(1)
        _personValue = Number(data.controlScope) + 1
        _personWarn = Number(data.alarmCondition)
        _personFoucs = Number(data.focusPersonScope)
        data.faceDtoList.forEach((item: any) => {
          _faceList.push({
            ...item,
            id: Number(item.faceId)
          })
        })
        _idCardText = data.idCardList?.map((item: any) => item.idCard).toString()
        data.focusPersonList?.forEach((item: any) => {
          _personList.push({
            ...item,
            facePath: item.url
          })
        })
      }

      let _carValue = 1
      let _carWarn = 3
      let _licensePlateText = ''
      if (value.carConditionDto) {
        const data = value.carConditionDto
        _checkboxValue.push(2)
        _carValue = Number(data.controlScope) + 1
        _carWarn = Number(data.alarmCondition)
        _licensePlateText = data.licensePlates
      }

      setFocusPersonScope(_personFoucs)
      setPersonValue(_personValue)
      setPersonWarn(_personWarn)
      setFaceList(_faceList)
      setIdCardText(_idCardText)
      setPersonList(_personList)

      setCarValue(_carValue)
      setCarWarn(_carWarn)
      setLicensePlateText(_licensePlateText)

      setCheckboxValue(_checkboxValue)
      setOnChangeValue(value)
    }
  }, [value])

  function handleCheckboxChange(checkedValue: CheckboxValueType[]) {
    setCheckboxValue(checkedValue as number[])
  }

  function handlePerson({ target: { value } }: RadioChangeEvent) {
    setPersonValue(value)
  }

  function handleCar({ target: { value } }: RadioChangeEvent) {
    setCarValue(value)
  }

  function handleCarWarn({ target: { value } }: RadioChangeEvent) {
    setCarWarn(value)
  }

  function handlePersonWarn({ target: { value } }: RadioChangeEvent) {
    setPersonWarn(value)
  }

  function handleIdCardText({ target: { value } }: any) {
    setIdCardText(value)
  }

  function handleClearIdCardText() {
    setIdCardText('')
  }

  function handleLicensePlateText({ target: { value } }: any) {
    setLicensePlateText(value)
  }

  function handleClearLicensePlateText() {
    setLicensePlateText('')
  }

  function handleFace(param: Face) {
    setFaceList(val => {
      return [...val, param]
    })
  }

  function handleDeleteFace(param: Face) {
    setFaceList(val => {
      _.remove(val, item => item.id === param.id)
      return [...val]
    })
  }

  function handleClearFaceList() {
    setFaceList([])
  }

  function handleSelectPerson(list: any[]) {
    setPersonList(list)
  }

  function handleDeletePerson(param: any) {
    setPersonList(val => {
      _.remove(val, item => item.id === param.id)
      return [...val]
    })
  }

  function handleClearPersonList() {
    setPersonList([])
    setFocusPersonScope(1)
  }

  function handleFocusPerson({ target: { value } }: any) {
    setFocusPersonScope(value)
  }

  return (
    <article className={styles.wrapper}>
      <header>
        <Checkbox.Group options={checkboxOptions} value={checkboxValue} onChange={handleCheckboxChange} />
      </header>
      {checkboxValue.includes(1) &&
        <section className={styles.box}>
          <header>
            <span className={styles.label}>人员布控</span>
            <Radio.Group options={personOptions} onChange={handlePerson} value={personValue} />
          </header>
          {personValue === 1 &&
            <section className={styles.card}>
              <span className={styles.label}>预警条件</span>
              <Radio.Group options={ctrlWarnOptions} onChange={handlePersonWarn} value={personWarn} />
            </section>
          }
          {personValue === 2 &&
            <>
              <Row className={styles.boxTableHeader}>
                <Col span={4}>内容类型</Col>
                <Col span={16}>预警内容</Col>
                <Col span={4}>操作</Col>
              </Row>
              <Row className={styles.boxTable}>
                <Col span={4} className={styles.text}>人脸</Col>
                <Col span={16}>
                  <div>
                    {faceList.map(face => (
                      <Tag key={face.id} closable onClose={(evt: React.MouseEvent) => {
                        evt.preventDefault()
                        handleDeleteFace(face)
                      }}>
                        <ImageSimple className={styles.faceImg} src={face.url} />
                      </Tag>
                    ))}
                  </div>
                  <div><UploadFaceButton onSuccess={handleFace} /></div>
                </Col>
                <Col span={4} className={styles.text}><Button type="link" onClick={handleClearFaceList}>清除</Button></Col>
              </Row>
              <Row className={styles.boxTable}>
                <Col span={4} className={styles.text}>证件</Col>
                <Col span={16}><Input placeholder="多个证件号以英文逗号隔开" value={idCardText} onChange={handleIdCardText} /></Col>
                <Col span={4} className={styles.text}><Button type="link" onClick={handleClearIdCardText}>清除</Button></Col>
              </Row>
              <Row className={styles.boxTable}>
                <Col span={4} className={styles.text}>档案人员</Col>
                <Col span={16} style={{ minHeight: '120px' }}>
                  <header style={{ marginTop: '6px' }}>
                    <Radio.Group options={focusPersonScopeOptions} onChange={handleFocusPerson} value={focusPersonScope} />
                  </header>
                  {focusPersonScope === 1 && <>
                    <div>
                      {personList.map(person => (
                        <Tag key={person.id} closable onClose={(evt: React.MouseEvent) => {
                          evt.preventDefault()
                          handleDeletePerson(person)
                        }}>
                          {person.name}
                        </Tag>
                      ))}
                    </div>
                    <div>
                      <DataListChoose
                        isUseButton={true}
                        buttonProps={{ icon: <PlusOutlined /> }}
                        btnTxt={'添加人员'}
                        popTitle={'人员选择'}
                        request={doGetPersonList}
                        dataType={'person'}
                        onFinish={handleSelectPerson}
                        rowSelectionType={'checkbox'}
                        defaultSelectedKey={personKeys}
                      />
                    </div>
                  </>}
                </Col>
                <Col span={4} className={styles.text}><Button type="link" onClick={handleClearPersonList}>清除</Button></Col>
              </Row>
            </>
          }
        </section>
      }
      {checkboxValue.includes(2) &&
        <section className={styles.box}>
          <header>
            <span className={styles.label}>车辆布控</span>
            <Radio.Group options={carOptions} onChange={handleCar} value={carValue} />
          </header>
          {carValue === 1 &&
            <section className={styles.card}>
              <span className={styles.label}>预警条件</span>
              <Radio.Group options={ctrlWarnOptions} onChange={handleCarWarn} value={carWarn} />
            </section>
          }
          {carValue === 2 &&
            <>
              <Row className={styles.boxTableHeader}>
                <Col span={4}>内容类型</Col>
                <Col span={16}>预警内容</Col>
                <Col span={4}>操作</Col>
              </Row>
              <Row className={styles.boxTable}>
                <Col span={4} className={styles.text}>车牌</Col>
                <Col span={16}><Input placeholder="多个车牌号以英文逗号隔开" value={licensePlateText} onChange={handleLicensePlateText} /></Col>
                <Col span={4} className={styles.text}><Button type="link" onClick={handleClearLicensePlateText}>清除</Button></Col>
              </Row>
            </>
          }
        </section>
      }
    </article>
  )
}

export default ControlContent