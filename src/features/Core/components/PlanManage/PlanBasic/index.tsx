import React, { useEffect, useRef, useState } from "react";
import styles from './index.module.sass'
import { Button, Form, Input, message, Select } from "antd";
import { Option } from "antd/es/mentions";
import TextArea from "antd/es/input/TextArea";
import { getLabelTable } from "../../../../../server/label";
import { getModelListAsync } from "../../../../../server/core/planManage";
import { getModelDetailAsync } from "../../../../../server/core/model";
import Flowgraph from "../../WisdomModel/component/flowgraph";
import Title from "../../../../../component/Title";
import { editPlan } from "api/core/planManagement";

interface Props {
  onClosePopup?: Function
  nextStep?: Function
  //表单信息
  setBasicInfo?: Function
  basicInfo?: any
  //流程图信息
  setGraphData?: any
  graphData?: any
  //  节点数据
  setNodes?: any
}

const PlanBasic: React.FC<Props> = ({
  onClosePopup,
  nextStep,
  setBasicInfo,
  basicInfo,
  setGraphData,
  graphData,
  setNodes
}) => {
  console.debug('PlanBasic')

  const [form] = Form.useForm();
  //预案下拉列表
  const [planTypeList, setPlanTypeList] = useState([]);
  //模型名称下拉列表
  const [modelList, setModelList] = useState([]);
  //模型预览数据
  const [modelData, setModelData] = useState<any>(graphData);
  const flowGraphRef = useRef<any>(null);
  const [modelId, setModelId] = useState(null);

  //给表单赋值
  useEffect(() => {
    if (basicInfo) {
      form.setFieldsValue(basicInfo)
    }
  }, [basicInfo, form]);

  //给模型id赋值，赋值后，可以给流程图赋值
  useEffect(() => {
    if (basicInfo && basicInfo.modelId) {
      setModelId(basicInfo.modelId)
    }
  }, [basicInfo]);

  //编辑时给流程赋值
  useEffect(() => {
    if (modelId) {
      //获取详情
      getModelDetailAsync(modelId).then(res => {
        setNodes && setNodes(JSON.parse(res.modelJson).eventParams)
        setModelData(res.originalJson)
        setGraphData && setGraphData(res.originalJson)
      })
    }
  }, [modelId, setNodes, setGraphData]);

  //预案下拉列表
  useEffect(() => {
    async function main() {
      const vo: any = await getLabelTable({ type: 12 })
      setPlanTypeList(vo.data)
    }
    main()
  }, []);

  //获取模型列表
  useEffect(() => {
    async function main() {
      const vo: any = await getModelListAsync({ pageSize: -1, pageNumber: 1 }, { hasFilterPlan: modelId ? false : true })
      setModelList(vo.records)
    }
    main();
  }, [modelId]);

  //取消
  function handleClose() {
    onClosePopup && onClosePopup()
  }

  //下一步
  async function nextBtn() {
    let formData = await form.validateFields()
    //把form表单的值保存
    setBasicInfo && setBasicInfo({
      ...basicInfo,
      ...formData
    })
    nextStep && nextStep(1)
  }

  //选择模型,改变右侧的预览模型数据
  function handleChangeModel(modelId: any) {
    setModelId(modelId)
    if (modelId === undefined) {
      setModelData(null)
      setGraphData && setGraphData(null)
    } else {
      //获取详情
      getModelDetailAsync(modelId).then(res => {
        setNodes && setNodes(JSON.parse(res.modelJson).eventParams)
        setModelData(res.originalJson)
        setGraphData && setGraphData(res.originalJson)
        setBasicInfo && setBasicInfo((val: any) => ({ ...val, modelData: res.originalJson }))
      })
    }
  }

  //表单数据变动
  async function handleFormChange() {
    let formData = form.getFieldsValue()
    //把form表单的值保存
    setBasicInfo && setBasicInfo({
      ...basicInfo,
      ...formData
    })
  }

  async function handleSave() {
    let formData = await form.validateFields()
    try {
      await editPlan({
        ...basicInfo,
        ...formData
      })
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    }


  }
  return <div className={styles.wrapper}>
    <div className={styles.planInfo}>
      <div className={styles.left}>
        <Title title={'基本信息'} />
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          onFieldsChange={handleFormChange}
        >
          <Form.Item label="预案名称" name='name' rules={[{ required: true, message: '预案名称不能为空' }]}
            className={styles.formItem}>
            <Input placeholder='请输入预案名称' />
          </Form.Item>
          <Form.Item name="planTypeId" label='预案类型' className={styles.formItem}>
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder='请选择预案类型'
            >
              {planTypeList && planTypeList.map((item: any) => {
                return <Option key={item.id} value={item.id}>{item.labelName}</Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item label="模型名称" name='modelId' rules={[{ required: true, message: '模型名称不能为空' }]}
            className={styles.formItem}>
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder='请选择模型名称'
              onChange={(value) => handleChangeModel(value)}
              disabled={modelId ? true : false}
            >
              {modelList && modelList.map((item: any) => {
                return <Option key={item.modelId} value={item.modelId}>{item.modelName}</Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item label="目的" name="purpose" className={styles.formItem}>
            <TextArea placeholder='请输入目的' />
          </Form.Item>
          <Form.Item label="指挥长" name='commanderName' className={styles.formItem}>
            <Input placeholder='指挥长' />
          </Form.Item>
          <Form.Item label="指挥长职位" name='commanderPost' className={styles.formItem}>
            <Input placeholder='指挥长职位' />
          </Form.Item>
          <Form.Item label="副指挥长" name='deputyCommanderName' className={styles.formItem}>
            <Input placeholder='副指挥长' />
          </Form.Item>
          <Form.Item label="副指挥长职位" name='deputyCommanderPost' className={styles.formItem}>
            <Input placeholder='副指挥长职位' />
          </Form.Item>
        </Form>
      </div>
      <div className={styles.right}>
        <Title title={'模型预览'} />
        <div className={styles.flowData}>
          <Flowgraph
            showCondition={false}
            data={modelData}
            ref={flowGraphRef}
            isNotShowConditionParams={false}
            isNotShowRemoveBtn={true}
            isShowMask={true}
          />
        </div>
      </div>
    </div>
    <div className={styles.bottom}>
      {basicInfo && basicInfo.id && <Button type="primary" onClick={handleSave}>保存</Button>}
      <Button type="default" onClick={handleClose}>取消</Button>
      <Button type="primary" onClick={nextBtn}>下一步</Button>
    </div>
  </div>
}

export default PlanBasic
