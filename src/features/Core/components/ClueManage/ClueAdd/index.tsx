import React, { useEffect, useState } from "react";
import { InputType } from "hooks/flexibility/FormPanel";
import styles from './index.module.sass'
import { addClueAsync, editClueAsync } from "../../../../../server/core/clue";
import { message } from "antd";
import CustomerGetIds from "../CustomerGetIds";
import FormInterface from "hooks/integrity/FormInterface";
import { doUploadFile } from "../../../../../server/common";

interface Props {
  refreshTable?: Function
  onClosePopup?: Function,
  //编辑默认值
  defaultData?: any
}

const ClueAdd: React.FC<Props> = ({ refreshTable, onClosePopup, defaultData }) => {
  const inputs = [
    ['线索名称', 'name', InputType.input, {
      placeholder: '请输入线索名称',
      itemProps: {
        rules: [{ required: true }],
      },
    }],
    ['线索类型', 'type', InputType.radio, {
      dict: [
        { name: '船舶', value: 1 },
        { name: '人车', value: 2 },
      ]
    }],
    ['船舶档案', 'shipArchive', InputType.checkbox, {
      dict: [
        { name: '重点船舶', value: 2 },
        { name: '关注船舶', value: 3 },
        // { name: '一般船舶', value: 4 },
        { name: '自定义', value: 9 },
      ],
      when: { type: { '!=': 2 } }
    }],
    ['自定义船舶档案', 'archiveIds', InputType.component, {
      component: CustomerGetIds,
      when: { shipArchive: { in: [9] }, type: 1 },
      inputProps: {
        chooseType: 'ship'
      },
    }],
    ['AIS', 'ais', InputType.textArea, {
      placeholder: '请输入AIS，多个以英文逗号隔开',
      when: { type: 1 }
    }],
    ['目标ID', 'targetId', InputType.textArea, {
      placeholder: '请输入目标ID，多个以英文逗号隔开',
      when: { type: 1 }
    }],
    ['雷达批号', 'radarId', InputType.textArea, {
      placeholder: '请输入雷达批号，多个以英文逗号隔开',
      when: { type: 1 }
    }],

    ['人员档案', 'personArchive', InputType.checkbox, {
      dict: [
        { name: '重点人员', value: 2 },
        { name: '关注人员', value: 3 },
        { name: '一般人员', value: 4 },
        { name: '自定义', value: 9 },
      ],
      when: { type: 2 }
    }],
    ['自定义人员档案', 'personArchiveIds', InputType.component, {
      component: CustomerGetIds,
      inputProps: {
        chooseType: 'man'
      },
      when: { personArchive: { in: [9] }, type: 2 }
    }],
    ['车辆档案', 'carArchive', InputType.checkbox, {
      dict: [
        { name: '重点车辆', value: 2 },
        { name: '关注车辆', value: 3 },
        { name: '一般车辆', value: 4 },
        { name: '自定义', value: 9 },
      ],
      when: { type: 2 }
    }],
    ['自定义车辆档案', 'carArchiveIds', InputType.component, {
      component: CustomerGetIds,
      when: { carArchive: { in: [9] }, type: 2 },
      inputProps: {
        chooseType: 'car'
      },
    }],
    ['车辆', 'car', InputType.textArea, {
      placeholder: '请输入车牌，多个以英文逗号隔开',
      when: { type: 2 }
    }],
    ['人脸', 'imageUrl', InputType.uploadImg, {
      when: { type: 2 },
      uploadImgFn: doUploadFile,
      maxCount: 4
    }],
  ]

  const [formData, setFormData] = useState<any>();

  //编辑赋值
  useEffect(() => {
    if (defaultData) {
      let result: any = {};
      let content = JSON.parse(defaultData.content);
      result.name = defaultData.name;
      result.type = defaultData.type;
      if (defaultData.type === 1) {
        //船舶
        let aisArr = content.filter((item: any) => item.codeType === 6) || []
        let targetIds = content.filter((item: any) => item.codeType === 8) || []
        let shipArchive = content.filter((item: any) => item.archiveType === 3) || []
        let radarIds = content.filter((item: any) => item.codeType === 7) || []
        //船舶档案选中项
        if (shipArchive.length > 0) {
          result.shipArchive = shipArchive[0].archiveKind
          //自定义船舶档案
          result.archiveIds = shipArchive[0].archiveIds
        } else {
          result.shipArchive = []
          result.archiveIds = []
        }


        //ais
        let ais = [];
        for (let i = 0; i < aisArr.length; i++) {
          ais.push(aisArr[i].codeValue)
        }
        result.ais = ais.join(',')

        //目标id
        let ids = [];
        for (let i = 0; i < targetIds.length; i++) {
          ids.push(targetIds[i].codeValue)
        }
        result.targetId = ids.join(',')

        //雷达批号
        let radarId = [];
        for (let i = 0; i < radarIds.length; i++) {
          radarId.push(radarIds[i].codeValue)
        }
        result.radarId = radarId.join(',')

      } else if (defaultData.type === 2) {
        //人车
        let personArchive = content.filter((item: any) => item.archiveType === 0) || []
        let carArchive = content.filter((item: any) => item.archiveType === 1) || []
        let car = content.filter((item: any) => item.codeType === 1) || []
        let imageUrl = content.filter((item: any) => item.codeType === 0) || []
        //人员档案选中项
        if (personArchive.length > 0) {
          result.personArchive = personArchive[0].archiveKind
          //自定义人员档案
          result.personArchiveIds = personArchive[0].archiveIds
        } else {
          result.personArchive = []
          result.personArchiveIds = []
        }
        //车辆档案选中项
        if (carArchive.length > 0) {
          result.carArchive = carArchive[0].archiveKind
          //自定义车辆档案
          result.carArchiveIds = carArchive[0].archiveIds
        } else {
          result.carArchive = []
          result.carArchiveIds = []
        }

        //车辆赋值
        let ids = [];
        for (let i = 0; i < car.length; i++) {
          ids.push(car[i].codeValue)
        }
        result.car = ids.join(',')

        //人脸赋值
        let faceUrl = [];
        for (let i = 0; i < imageUrl.length; i++) {
          faceUrl.push({
            name: new Date().getTime(),
            id: imageUrl[i].codeValue,
            path: imageUrl[i].imageUrl
          })
        }
        result.imageUrl = faceUrl
      }
      setFormData({
        ...result,
        type: defaultData ? defaultData.type : 1
      })
    } else {
      setFormData({
        type: defaultData ? defaultData.type : 1
      })
    }
  }, [defaultData]);

  //确认新增
  /**
   * 0-人脸
   * 1-车牌
   * 2-侦码
   * 3-Imei
   * 4-Mac
   * 5-手机
   * 6-MMSI
   * 7-雷达批号
   * 8-目标ID
   * {
   *     "archiveType": 0, # 档案类型 0:人员  1:车辆  2:手机  3:船舶  9:自定义
   *     "archiveKind": [2, 3] # 类别 2:重点  3:关注 4:一般
   *     "archiveIds": [21, 34] # 档案id
   *   },
   * */
  const onFinish = (formData: any) => {
    //格式化后台数据格式
    const data: any = {
      name: formData.name,
      type: formData.type,
      content: []
    }
    //如果没有包含自定义的船舶，则自定义船舶为空
    if (formData.type === 1 && formData.shipArchive && !formData.shipArchive.includes(9)) {
      formData.archiveIds = []
    }
    //如果没有包含自定义的人员，则自定义人员为空
    if (formData.type === 2 && formData.personArchive && !formData.personArchive.includes(9)) {
      formData.personArchiveIds = []
    }
    //如果没有包含自定义的车辆，则自定义车辆为空
    if (formData.type === 2 && formData.carArchive && !formData.carArchive.includes(9)) {
      formData.carArchiveIds = []
    }
    //船舶
    if (formData.type === 1) {
      // 船舶档案
      data.content.push({
        archiveType: 3,
        archiveKind: formData.shipArchive,
        archiveIds: formData.archiveIds
      })
      // AIS,codeType 为 6
      if (formData.ais) {
        let aisArr = (formData.ais).split(',')
        for (let i = 0; i < aisArr.length; i++) {
          data.content.push({
            codeValue: aisArr[i],
            codeType: 6,
          })
        }
      }
      // 目标ID
      if (formData.targetId) {
        let targetIds = formData.targetId.split(',')
        for (let i = 0; i < targetIds.length; i++) {
          data.content.push({
            codeValue: targetIds[i],
            codeType: 8,
          })
        }
      }
      // 雷达批号
      if (formData.radarId) {
        let radarId = formData.radarId.split(',')
        for (let i = 0; i < radarId.length; i++) {
          data.content.push({
            codeValue: radarId[i],
            codeType: 7,
          })
        }
      }
    } else if (formData.type === 2) {
      //人员档案
      data.content.push({
        archiveType: 0,
        archiveKind: formData.personArchive,
        archiveIds: formData.personArchiveIds
      })
      //车辆档案
      data.content.push({
        archiveType: 1,
        archiveKind: formData.carArchive,
        archiveIds: formData.carArchiveIds
      })
      //车辆
      if (formData.car) {
        let carArr = (formData.car).split(',')
        for (let i = 0; i < carArr.length; i++) {
          data.content.push({
            codeValue: carArr[i],
            codeType: 1,
          })
        }
      }
      //人脸
      if (formData.imageUrl && formData.imageUrl.length > 0) {
        for (let i = 0; i < formData.imageUrl.length; i++) {
          data.content.push({
            codeValue: formData.imageUrl[i].id,
            codeType: 0,
            imageUrl: formData.imageUrl[i].path
          })
        }
      }
    }
    data.content = JSON.stringify(data.content);

    if (!defaultData) {
      //新增
      addClueAsync(data).then(() => {
        message.success('添加成功')
        //关闭弹窗
        onClosePopup && onClosePopup();
        //刷新表格
        refreshTable && refreshTable()
      })
    } else {
      //编辑
      data.id = defaultData.id
      editClueAsync(data).then(() => {
        message.success('编辑成功')
        //关闭弹窗
        onClosePopup && onClosePopup();
        //刷新表格
        refreshTable && refreshTable()
      })
    }
  }


  return <div className={styles.wrapper}>
    <FormInterface
      initData={formData}
      onFinish={onFinish}
      inputs={inputs}
      formProps={{
        labelCol: {
          span: 3,
        }
      }}
      options={{
        isShowReset: false,
        submitText: defaultData ? '确定编辑' : '确定新增',
      }} />
  </div>
}

export default ClueAdd
