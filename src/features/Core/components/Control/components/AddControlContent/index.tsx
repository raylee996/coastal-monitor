import { Form } from "antd";
import { AlarmConditionDict, CommonScopeDict } from "helper/dictionary";
import FormPanel, { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { doUploadFile } from "server/common";
import { FormProps } from "../../ShipAdd";
import RadioSimple from "../RadioSimple";
import styles from "./index.module.sass";

interface ContentProps {
  /** 类型 */
  controlType: number
  /** 人员类型集合 */
  personCtrlType: number[]
  /** form表单回显 */
  contentFormData?: any
}

type NumberKeyObj = { [key: number]: string }

type ObjectKey = {
  [key: string]: any
}

interface ObjectForm extends ObjectKey {
  /** 所有、指定 */
  controlScope?: string
  alarmCondition?: string
  focusPersonScope?: number
}

function concatName(data: any[], key: string, concat: string) {
  return data.map(item => {
    let obj = { ...item }
    obj[key] += concat
    return obj
  })
}

const AddControlContent = forwardRef(({ controlType, personCtrlType, contentFormData }: ContentProps, ref) => {
  console.debug('AddControlContent')

  const [form] = Form.useForm();
  const [formPeople] = Form.useForm();
  const [formCar] = Form.useForm();
  const [keyToName] = useState<NumberKeyObj>({ 0: 'phoneConditionDto', 1: 'personCtrlJson', 2: 'carConditionDto' })
  const [getFrom] = useState<ObjectKey>({ 'phoneConditionDto': form, 'shipConditionJson': form, 'personCtrlJson': formPeople, 'carConditionDto': formCar })
  const [formList, setFormList] = useState(controlType === 1 ? ['shipConditionJson'] : personCtrlType.map(v => keyToName[v]))

  const [speed, setSpeed] = useState<string>('')

  const [initData, setInitData] = useState<FormProps>()

  const InputsObj: ObjectKey = useMemo(() => {
    return {
      shipConditionJson: [
        ['布控范围', 'controlScope',
          InputType.radio,
          {
            dict: CommonScopeDict,
            isRequired: true,
          }
        ],
        [
          '预警条件',
          'alarmCondition',
          InputType.component,
          {
            component: RadioSimple,
            options: AlarmConditionDict,
            prefixSuffix: ['，航速大于', '节'],
            inputFunc: getShipSpeed,
            isRequired: true,
            suffixValue: contentFormData?.speed
          }
        ],
        ['船名', 'alarmConditionShipNames', {
          placeholder: '请输入船名，多个用逗号隔开',
          when: { controlScope: '1' },
          allowClear: true,
        }],
        ['MMSI', 'alarmConditionShipMmsis', {
          placeholder: '请输入MMSI，多个用逗号隔开',
          when: { controlScope: '1' },
          allowClear: true,
        }],
        [
          '船脸',
          'alarmConditionShipFaceIds',
          InputType.uploadImg,
          ShowType.image,
          {
            isRow: true,
            maxCount: 9,
            useType: UseType.edit,
            uploadImgFn: doUploadFile,
            displayUrl: '',
            when: { controlScope: '1' },
          },
        ],
      ],
      phoneConditionDto: [
        ['布控范围', 'controlScope',
          InputType.radio,
          {
            dict: CommonScopeDict,
          }
        ],
        ['IMSI', 'imsi', {
          placeholder: '请输入IMSI，多个用逗号隔开'
        }],
        ['IMEI', 'imei', {
          placeholder: '请输入IMEI，多个用逗号隔开'
        }],
        ['MAC', 'mac', {
          placeholder: '请输入MAC，多个用逗号隔开'
        }],
        ['归属地', 'belongArea', {
          placeholder: '请输入归属地，多个用逗号隔开'
        }],
      ],
      personCtrlJson: [
        ['布控范围', 'controlScope',
          InputType.radio,
          {
            dict: concatName(CommonScopeDict, 'name', '人员'),
          }
        ],
        [
          '人脸',
          'faceIds',
          InputType.uploadImg,
          ShowType.image,
          {
            isRow: true,
            maxCount: 1,
            useType: UseType.edit,
            uploadImgFn: doUploadFile,
            displayUrl: ''
          }
        ],
        ['证件', 'idCards', {
          placeholder: '请输入证件号码，多个用逗号隔开'
        }],
        ['重点人员', 'focusPersonScope',
          InputType.radio,
          {
            dict: concatName(CommonScopeDict, 'name', '重点人员'),
          }
        ],
      ],
      carConditionDto: [
        ['布控范围', 'controlScope',
          InputType.radio,
          {
            dict: concatName(CommonScopeDict, 'name', '车辆'),
          }
        ],
        ['车牌', 'belongArea', {
          placeholder: '请输入车牌，多个用逗号隔开'
        }],
      ],
    }
  }, [contentFormData?.speed])

  useEffect(() => {
    if (controlType === 2) {
      setFormList(personCtrlType.map(v => keyToName[v]))
    }
  }, [controlType, keyToName, personCtrlType])

  useEffect(() => {
    setInitData(e => {
      return contentFormData ? { ...e, shipConditionJson: contentFormData } :
        {
          shipConditionJson: {
            controlScope: '0',
            alarmCondition: '0',
          },
          phoneConditionDto: {
            controlScope: '0',
          },
          personCtrlJson: {
            controlScope: '0',
            focusPersonScope: 0
          },
          carConditionDto: {
            controlScope: '0',
          },
        }
    })
    // if (contentFormData) {
    //   console.log(contentFormData, 'contentFormData')
    //   setFormData((e) => {
    //     return { ...e, shipConditionJson: contentFormData }
    //   })
    // }
  }, [contentFormData])

  useImperativeHandle(ref, () => ({
    getContentData: () => {
      const all = Promise.all(formList.map(async item => {
        let obj: ObjectForm = {}
        obj[item] = await getFrom[item].validateFields()
        if (!obj[item].controlScope) obj[item].controlScope = '0'
        if (item === 'shipConditionJson' && !obj[item].alarmCondition) obj[item].alarmCondition = '0'
        if (item === 'personCtrlJson' && !obj[item].focusPersonScope) obj[item].focusPersonScope = 0
        // 添加速度
        if (item === 'shipConditionJson' && speed) obj[item].speed = speed
        return obj
      }))
      console.log(all)
      return all
    }
  }))

  function getShipSpeed(e: any) {
    console.log(e, 'getShipSpeed')
    setSpeed(e)
  }

  return (
    <>
      {
        formList.map(item => {
          return (
            <section key={item} className={styles.formBox}>
              <FormPanel
                inputs={InputsObj[item]}
                form={getFrom[item]}
                initData={initData ? initData[item] : null}
                formProps={{
                  labelCol: {
                    span: 3,
                  }
                }}
              />
            </section>
          )
        })
      }
    </>
  )
})

export default AddControlContent