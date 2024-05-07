

import ImgSelect from "component/ImgSelect";
import XcRadios from "component/XcRadios";
import { getLabelTable } from "server/label";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MapPlace from "./component/MapPlace";
import styles from "./index.module.sass";
import { doEditPlacesListData, getDeviceAllAsync, getPlaceListDetailinfos } from "server/place";
import { getAreaList } from "server/dataCenter/caseArchive";
import { Form } from "antd";

/**重点场所 */
interface IPlaceDetail {
  type?: UseType
  id?: string
  onFinish?: Function
  onClosePopup?: Function
  onSuccess?: Function
}

/** 涵洞、易登陆点、易跳海点、探照灯、趸船 */
export const PlacePointType = ['3', '4', '5', '6', '11']

// 重点场所
const PlaceDetail: React.FC<IPlaceDetail> = ({ type, id, onClosePopup, onSuccess }) => {
  console.debug("PlaceDetail")

  const [labelList, setLabelList] = useState<any[]>([])

  const [form] = Form.useForm()

  const [isDrawMarker, setIsDrawMarker] = useState<boolean>(false)
  const [markIconType, setMarkIconType] = useState<string>('99')

  const handleLabelIdChange = useCallback((value: string) => {
    console.log(value, 'value')
    // 清除区域数据
    form?.setFieldValue('placeAreaMap', undefined)

    const selectLabel = labelList.find((ele) => ele.id === value);
    // 使用marker
    const IsDrawMarker = PlacePointType.includes(selectLabel?.subType)
    setIsDrawMarker(IsDrawMarker)
    // 地图打点图标
    IsDrawMarker && setMarkIconType(selectLabel.subType)
    // 切换图标
    if (selectLabel) {
      form?.setFieldValue('icon', selectLabel.subType)
      form?.setFieldValue('graph', null)
    }
  }, [form, labelList])

  const formInputs: any = useMemo(() => [
    [
      '场所名称',
      'name',
      {
        placeholder: '请输入场所名称',
        isRequired: true
      }
    ],
    [
      '风险等级',
      'level',
      InputType.component,
      {
        component: XcRadios,
        option: {
          data: [
            { name: '低风险', value: 3 },
            { name: '中风险', value: 2 },
            { name: '高风险', value: 1 }
          ]
        }
      }
    ],
    [
      '场所类型',
      'labelId',
      InputType.select,
      {
        dict: labelList.map(item => {
          return {
            name: item.labelName,
            value: item.id
          }
        }),
        allowClear: true,
        onChange: handleLabelIdChange
      }
    ],
    [
      '场所图标',
      'icon',
      InputType.component,
      {
        component: ImgSelect,
      }
    ],
    ['全景摄像头', 'allViewCameraId', InputType.selectRemote, {
      placeholder: '请选择',
      isRequired: true,
      request: getDeviceAllAsync,
      when: { labelId: 212, }
    }],
    ['细节摄像头', 'detailViewCameraId', InputType.selectRemote, {
      placeholder: '请选择',
      isRequired: true,
      request: getDeviceAllAsync,
      when: { labelId: 212, }
    }],
    [
      '场所说明',
      'comment',
      InputType.textArea,
      {
        placeholder: '请输入场所说明',
        isRow: true
      }
    ],
    [
      '场所地区',
      'areaCode',
      InputType.cascaderRemote,
      {
        remote: getAreaList,
        isRequired: true
        // colNum: 2
      }
    ],
    [
      '进出港识别',
      'isRecognition',
      InputType.component,
      {
        component: XcRadios,
        option: {
          //进出港识别（1开启 2关闭）
          data: [
            { name: '开启', value: 1 },
            { name: '关闭', value: 2 }
          ]
        }
      }
    ],
    ['场所详址', 'address', InputType.input, {
      isRequired: true,
      placeholder: '请输入场所详址',
    }],
    [
      '场所区域',
      'placeAreaMap',
      InputType.component,
      {
        component: MapPlace,
        tips: "请标注场所范围",
        isRow: true,
        isRequired: true,
        isHiddleControls: isDrawMarker,
        isDrawMarker,
        markIconType,
      }
    ]
  ], [handleLabelIdChange, isDrawMarker, labelList, markIconType])

  // 获取所有场所类型
  useEffect(() => {
    async function getLabelList() {
      const vo = await getLabelTable({ type: 9 })
      setLabelList(vo?.data || [])
    }
    getLabelList()
  }, [])

  // 获取场所详情
  useEffect(() => {
    async function main() {
      const res = await getPlaceListDetailinfos(id)
      console.log(res)
      if (!res?.labelId) {
        return
      }
      const selectLabel = labelList.find((ele) => ele.id === res?.labelId);
      // 使用marker
      const IsDrawMarker = PlacePointType.includes(selectLabel?.subType)
      setIsDrawMarker(IsDrawMarker)
      // 地图打点图标
      IsDrawMarker && setMarkIconType(selectLabel.subType)
      // form赋值
      form?.setFieldsValue(res)
      // 切换图标
      if (selectLabel) {
        form?.setFieldValue('icon', selectLabel.subType)
      }
    }
    id && main()
  }, [form, id, labelList])

  // 点击确定按钮
  async function handleFinish(data: any) {

    let params: any = data
    if (params.areaCode && (params.areaCode instanceof Array)) {
      params.areaCode = params.areaCode[params.areaCode.length - 1]
    }
    await doEditPlacesListData({ ...params, ...id ? { id } : {} })
    onClosePopup && onClosePopup() // 关闭POPUP
    onSuccess && onSuccess()
  }

  function handleReset() {
    onClosePopup && onClosePopup() // 关闭POPUP
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panelForm}>
        <FormInterface
          queryForm={form}
          inputs={formInputs}
          formType={type}
          formProps={{
            labelCol: {
              span: 6,
            }
          }}
          formData={{
            areaCode: '440305',
            level: 3, // 风险等级默认低风险
            isRecognition: 2, // 进出港识别默认低风险
          }}
          options={{
            submitText: '提交',
            column: 2,
            isShowClear: true
          }}
          onFinish={handleFinish}
          onClose={handleReset}
        />
      </div>
    </div>
  )
}

export default PlaceDetail