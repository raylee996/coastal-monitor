import React, { useEffect, useRef, useState } from "react";
import styles from './index.module.sass'
import { Button, DatePicker, Form, Input, Select, Checkbox } from "antd";
import PeopleCarConditionAdd from "./components/PeopleCarConditionAdd";
import ShipConditionAdd from "./components/ShipConditionAdd";
import AreaSelectInForm from "../../../../../component/AreaSelectInForm";
import popup from "hooks/basis/Popup";
import JudgmentModelTable from "../JudgmentModelTable";
import JudgmentModelAdd from "../JudgmentModelAdd";
import {
  getAnalyzeModelListPages,
  getRelationCaseList, judgmentTaskAddAsync
} from "../../../../../server/core/wisdomJudgment";
import dayjs from "dayjs";
import _ from "lodash";
import SelectPointMap from "../../../../../component/SelectPointMap";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Props {
  refreshTable?: Function
  //研判数据
  data?: any
}

const JudgmentDetail: React.FC<Props> = ({ refreshTable, data }) => {
  const [form] = Form.useForm();
  const shipConditionRef = useRef<any>(null);
  const peopleCarConditionRef = useRef<any>(null);

  const [relationCaseList, setRelationCaseList] = useState([]);
  //模型下拉框
  const [modelList, setModelList] = useState([]);

  //新添加的模型，添加后需要选中它
  const [addedModelData, setAddedModelData] = useState<any>(undefined);

  //右侧流程图数据
  const [graphData, setGraphData] = useState<any>({});

  // 根据数据类型，筛选设备列表
  const [selectDeviceByDataType, setselectDeviceByDataType] = useState<number[]>([])

  const [formData, setFormData] = useState<any>({
    modelName: '智能研判' + dayjs(new Date()).format('YYYYMMDDHHmmss') + _.random(10000),
    objType: 1,
    dataType: ['04', '05'],
    time: [dayjs().subtract(8, 'hour'), dayjs()],
    areaId: undefined,
    devices: undefined,
    caseId: undefined,
    modelId: undefined
  })

  useEffect(() => {
    async function main() {
      const vo: any = await getAnalyzeModelListPages({ pageNumber: 10, pageSize: -1 }, { modelType: formData.objType })
      //  获取刚刚添加的模型
      let currentModel = vo.data.filter((item: any) => {
        return item.modelName === addedModelData
      })
      if (currentModel.length > 0) {
        form.setFieldValue('modelId', currentModel[0].id)
      }
    }
    main()
  }, [addedModelData, form, formData.objType]);

  useEffect(() => {
    form.setFieldsValue({
      modelName: '智能研判' + dayjs(new Date()).format('YYYYMMDDHHmmss') + _.random(10000),
      objType: 1,
      dataType: ['04', '05'],
      time: [dayjs().subtract(8, 'hour'), dayjs()],
      areaId: undefined,
      devices: undefined,
      caseId: undefined,
      modelId: undefined
    })
  }, [form]);

  //获取关联案件下拉框内容
  useEffect(() => {
    async function main() {
      const vo: any = await getRelationCaseList()
      setRelationCaseList(vo)
    }
    main()
  }, []);

  //获取模型列表
  useEffect(() => {
    async function main() {
      const vo: any = await getAnalyzeModelListPages({ pageNumber: 10, pageSize: -1 }, { modelType: formData.objType })
      setModelList(vo.data)
    }
    main()
  }, [formData]);

  //切换模型时，需要更改流程图数据
  useEffect(() => {
    setGraphData((val: any) => {
      if (_.isEmpty(val)) {
        return '{}'
      } else {
        return val
      }
    })
  }, [formData.modelId]);

  //外部传递数据
  useEffect(() => {
    //外部出入data调用,只有一个目标线索
    if (data && !data.id) {
      form.setFieldsValue({
        modelName: '智能研判' + dayjs(new Date()).format('YYYYMMDDHHmmss') + _.random(10000),
        objType: data.objType,
        dataType: data.dataType,
        time: [dayjs().subtract(8, 'hour'), dayjs()],
        areaId: undefined,
        devices: undefined,
        caseId: undefined,
        modelId: undefined
      })
      //创建一个线索目标
      let originJson = {
        "cells": [
          {
            "position": { "x": 390, "y": 110 },
            "size": { "width": 110, "height": 30 },
            "attrs": {
              "body": { "stroke": "#2f689e", "strokeWidth": 1, "fill": "#062238", "height": "30px", "rx": 4, "ry": 4 },
              "label": { "text": "线索目标", "fill": "#a6cdff", "fontSize": 12, "textWrap": { "width": -10, "height": -10, "ellipsis": true } },
              "img": { "height": 16, "width": 16, "x": 6, "xlink:href": "", "y": 6 }
            },
            "visible": true,
            "shape": "rect",
            "id": "ad0bcd40-7ce0-43fb-9bd4-2efa72c9ea8e",
            "type": "clueTarget",
            "data": { "eventName": "线索目标", "type": "1", "clueInfo": [] },
            "markup": [
              { "tagName": "rect", "selector": "body" },
              { "tagName": "image", "selector": "img" },
              { "tagName": "text", "selector": "label" }],
            "ports": {
              "groups": {
                "top": { "position": "top", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } },
                "bottom": { "position": "bottom", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } },
                "left": { "position": "left", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } },
                "right": { "position": "right", "attrs": { "circle": { "r": 4, "magnet": true, "stroke": "#2D8CF0", "strokeWidth": 1, "fill": "#fff" } } }
              },
              "items": [{ "id": "port3", "group": "left" }, { "id": "port4", "group": "right" }]
            },
            "zIndex": 1
          }]
      }
      originJson.cells[0].data = {
        ...originJson.cells[0].data,
        ...data
      }
      setGraphData(JSON.stringify(originJson))
      setFormData({ ...form.getFieldsValue() })
      // @ts-ignore
      async function main() {
        const vo: any = await getAnalyzeModelListPages({ pageNumber: 10, pageSize: -1 }, { modelType: data.objType })
        setModelList(vo.data)
      }
      main()
    } else if (data && data.id) {
      //点位id转换
      let devices = data.devices && JSON.parse(data.devices);
      let deviceIds = [];
      if (devices && devices.length > 0) {
        for (let i = 0; i < devices.length; i++) {
          deviceIds.push(devices[i].deviceId)
        }
      }
      // 区域id转换
      let areaId: number[] = []
      let areaString = data.areaId && data.areaId.split(',')
      if (areaString && areaString.length > 0) {
        for (let i = 0; i < areaString.length; i++) {
          areaId.push(Number(areaString[i]))
        }
      }

      //再次创建，相当于编辑赋值
      form.setFieldsValue({
        modelName: '智能研判' + dayjs(new Date()).format('YYYYMMDDHHmmss') + _.random(10000),
        objType: Number(data.objType),
        dataType: JSON.parse(data.dataType),
        time: [dayjs(data.beginTime), dayjs(data.endTime)],
        areaId,
        devices: deviceIds,
        caseId: Number(data.caseId) || undefined,
        modelId: Number(data.modelId) || undefined
      })
      setGraphData(data.originalJson)
      setFormData({ ...form.getFieldsValue() })
      // @ts-ignore
      async function main() {
        const vo: any = await getAnalyzeModelListPages({ pageNumber: 10, pageSize: -1 }, { modelType: data.objType })
        setModelList(vo.data)
      }
      main()
    }
  }, [data, form]);

  //提交任务
  async function submitTask() {
    let formData = null
    try {//校验成功
      formData = await form.validateFields();
    } catch (errorInfo) {//校验失败
      return false
    }
    let jsonData
    //船舶条件设置JSON数据
    if (formData.objType === 1) {
      jsonData = shipConditionRef && shipConditionRef.current.getFlowData()
      //取消流程图的选中，
      shipConditionRef.current.cancelSelection();
    } else if (formData.objType === 2) {
      jsonData = peopleCarConditionRef && peopleCarConditionRef.current.getFlowData()
      //取消流程图的选中，
      peopleCarConditionRef.current.cancelSelection();
    }
    if (!jsonData) {
      return false
    }
    //新增研判
    let addJudgment = await judgmentTaskAddAsync(formData, jsonData)

    if (!addJudgment) {
      return false
    }

    //刷新列表
    refreshTable && refreshTable()
    //重置表单
    await resetForm()
  }

  //点位切换时，取消流程图选中效果，以免影响流程图数据
  function handleDevicesChange() {
    //船舶条件设置JSON数据
    if (formData.objType === 1) {
      //取消流程图的选中，
      shipConditionRef.current.cancelSelection();
    } else if (formData.objType === 2) {
      //取消流程图的选中，
      peopleCarConditionRef.current.cancelSelection();
    }
  }
  //重置表单
  async function resetForm() {
    form.resetFields()
    form.setFieldsValue({
      modelName: '智能研判' + dayjs(new Date()).format('YYYYMMDDHHmmss') + _.random(10000),
      objType: 1,
      dataType: ['04', '05'],
      time: [dayjs().subtract(8, 'hour'), dayjs()],
      areaId: undefined,
      devices: undefined,
      caseId: undefined,
      modelId: undefined
    })
    setFormData(form.getFieldsValue())
    setAddedModelData(undefined)
    setGraphData({})
    if (formData.objType === 1) {
      //清空画布，
      shipConditionRef.current.clearFlowData();
    } else if (formData.objType === 2) {
      //清空画布，
      peopleCarConditionRef.current.clearFlowData();
    }
    const vo: any = await getAnalyzeModelListPages({ pageNumber: 10, pageSize: -1 }, { modelType: 1 })
    setModelList(vo.data)
  }
  //表单值变化
  function onFormDataChange() {
    setFormData({ ...form.getFieldsValue() })

    let dataType = form.getFieldValue('dataType')
    let businessList = [];
    if (dataType.includes('01')) {//人脸
      businessList.push(3)
    }
    if (dataType.includes('02')) {//车辆
      businessList.push(4)
    }
    setselectDeviceByDataType(businessList)
  }
  //区域切换的时候，把流程图的选中效果去掉。
  function handleAreaChange() {
    if (formData.objType === 1) {
      //取消流程图的选中，
      shipConditionRef && shipConditionRef.current.cancelSelection();
    } else if (formData.objType === 2) {
      //取消流程图的选中，
      peopleCarConditionRef && peopleCarConditionRef.current.cancelSelection();
    }
  }
  //研判对象切换
  function changeObjType(val: any) {
    form.setFieldValue('modelId', null)
    setGraphData({})
    if (val === 1) {
      form.setFieldValue('dataType', ['04', '05'])
    } else if (val === 2) {
      // form.setFieldValue('dataType',['01','02','03'])
      form.setFieldValue('dataType', ['01', '02'])
    }
  }
  //模型切换
  function handleChangeModel(val: any) {
    let currentModel: any = modelList.filter((item: any) => {
      return item.id === val
    })
    if (currentModel.length > 0 && currentModel[0].originalJson) {
      setGraphData(currentModel[0].originalJson)
    } else {
      setGraphData({})
    }
  }

  //打开模型管理列表
  function openModelTable() {
    popup(<JudgmentModelTable />, {
      title: '模型管理', size: 'middle', onCloseCallback: async function () {
        const vo: any = await getAnalyzeModelListPages({ pageNumber: 10, pageSize: -1 }, { modelType: formData.objType })
        form.setFieldValue('modelId', null) //预防把当前选中的值删除后，提交出问题
        if (formData.objType === 1) {
          //清空画布，
          shipConditionRef.current.clearFlowData();
        } else if (formData.objType === 2) {
          //清空画布，
          peopleCarConditionRef.current.clearFlowData();
        }
        setModelList(vo.data)
      }
    })
  }

  //新增模型
  function openModelAdd() {
    popup(<JudgmentModelAdd onCallback={handlerGetAddedModelData} />, {
      title: '新增模型', size: 'small', onCloseCallback: async function () {
        const vo: any = await getAnalyzeModelListPages({ pageNumber: 10, pageSize: -1 }, { modelType: formData.objType })
        setModelList(vo.data)
      }
    })
  }
  //获取新增的模型，然后选中
  function handlerGetAddedModelData(val: any) {
    setAddedModelData(val.modelName)
  }
  return <article className={styles.wrapper}>
    {/*基本信息*/}
    <div className={styles.left}>
      <div className={styles.littleTitle}>
        <span className={`icon iconfont icon-zhuangshitubiao ${styles.iconColor}`} />
        基本信息
      </div>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        autoComplete="off"
        onFieldsChange={onFormDataChange}
      >
        <Form.Item label="任务名称" name='modelName' rules={[{ required: true }]} className={styles.formItem} >
          <Input allowClear placeholder="请输入任务名称" value={formData.modelName} maxLength={50} showCount />
        </Form.Item>
        <Form.Item label="研判对象" name='objType' rules={[{ required: true }]} className={styles.formItem}>
          <Select placeholder='选择研判对象' allowClear value={formData.objType} onChange={changeObjType}>
            <Option value={1}>船舶</Option>
            <Option value={2}>人车</Option>
          </Select>
        </Form.Item>
        {formData.objType === 1 && <Form.Item label="数据类型" name='dataType' rules={[{ required: true }]} className={styles.formItem}>
          <Checkbox.Group value={formData.dataType}>
            <Checkbox value="04">AIS</Checkbox>
            <Checkbox value="05">雷达</Checkbox>
          </Checkbox.Group>
        </Form.Item>}
        {formData.objType === 2 && <Form.Item label="数据类型" name='dataType' rules={[{ required: true }]} className={styles.formItem}>
          <Checkbox.Group value={formData.dataType}>
            <Checkbox value="01">人脸</Checkbox>
            <Checkbox value="02">车辆</Checkbox>
            {/*<Checkbox value="03">侦码</Checkbox>*/}
          </Checkbox.Group>
        </Form.Item>}
        <Form.Item label='时间' name='time' rules={[{ required: true }]} className={styles.formItem}>
          <RangePicker allowClear
            value={formData.time}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm" />
        </Form.Item>
        {formData.objType === 1 && <Form.Item label='区域' name='areaId' rules={[{ required: true }]} className={styles.formItem}>
          <AreaSelectInForm value={formData.areaId} size={'default'} onChange={handleAreaChange} />
        </Form.Item>}
        {formData.objType === 2 && <Form.Item label='点位' name='devices' rules={[{ required: true }]} className={styles.formItem}>
          <SelectPointMap
            value={formData.devices}
            onChange={handleDevicesChange}
            businessFunctions={selectDeviceByDataType}
          />
        </Form.Item>}
        <Form.Item label="关联案件" name='caseId' className={styles.formItem}>
          <Select placeholder='选择关联案件' allowClear showSearch optionFilterProp="children">
            {relationCaseList && relationCaseList.map((item: any, index) => {
              return <Option value={item.value} key={index}>{item.name}</Option>
            })}
          </Select>
        </Form.Item>
        <Form.Item label="模型" className={styles.formItem}>
          <Form.Item name='modelId' noStyle>
            <Select placeholder='选择模型'
              allowClear
              style={{ width: '220px', marginRight: '10px' }}
              onChange={handleChangeModel}
              showSearch
              optionFilterProp='children'
            >
              {modelList && modelList.map((item: any) => {
                return <Option value={item.id} key={item.id}>{item.modelName}</Option>
              })}
            </Select>
          </Form.Item>
          <Button size={'middle'} onClick={openModelAdd}>新增</Button>
        </Form.Item>
      </Form>
      <div className={styles.formAction}>
        <Button type={"default"} style={{ marginRight: '20px' }} onClick={openModelTable}>模型管理</Button>
        <Button type={"default"} onClick={() => { resetForm() }} style={{ marginRight: '20px' }}>重置</Button>
        <Button type={"primary"} onClick={submitTask}>提交任务</Button>
      </div>
    </div>
    {/*条件设置*/}
    <div className={styles.right}>
      {formData.objType === 1 &&
        <ShipConditionAdd
          beginEndTime={formData.time}
          areaId={formData.areaId}
          data={graphData}
          ref={shipConditionRef} />}
      {formData.objType === 2 &&
        <PeopleCarConditionAdd
          beginEndTime={formData.time}
          devicesId={formData.devices}
          data={graphData}
          ref={peopleCarConditionRef} />}
    </div>
  </article>
}

export default JudgmentDetail
