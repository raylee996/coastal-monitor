import React, { useEffect, useRef, useState } from "react";
import {
  publicMethod,
  realTimeWarning,
} from "../../../../../../helper/dictionary";
import Flowgraph from "../flowgraph";
import styles from './index.module.sass'
import { Form, Input, message, Select, Radio, Tooltip, InputNumber, Button } from "antd";
// import Yuyan from './yuyan.png'
import popup from "hooks/basis/Popup";
import {
  modelTaskAddAsync,
  modelTaskEditAsync,
  validateModelConditionComplete
} from "../../../../../../server/core/model";
import _ from "lodash";
import { QuestionCircleOutlined } from '@ant-design/icons';
import LabelManage from "../../../../../../component/LabelManage";
import { getLabelTable } from "../../../../../../server/label";
import dayjs from "dayjs";

const { Option } = Select;

interface Props {
  /*表格和流程图数据*/
  data?: any
  /*编辑成功后，data需要重置*/
  setData?: Function

  //添加完后，刷新表格数据
  refreshTable?: Function,
  //编辑完后，编辑界面切换成新增界面
  changeToAdd?: Function,
  /** 关闭popup */
  onClosePopup?: Function
  /**添加完后，返回添加的对象record*/
  getRecord?: Function
}
const ModelDetail: React.FC<Props> = ({ data,
  refreshTable,
  changeToAdd,
  getRecord,
  onClosePopup,
  setData }) => {
  console.debug("ModelDetail")
  const [form] = Form.useForm();
  const flowGraphRef: any = useRef(null);
  const [graphData, setGraphData] = useState({});
  const [cateGory, setCateGory] = useState([]);
  // const [showTimeByStatus, setShowTimeByStatus] = useState(true);

  //初始化表单，流程图
  useEffect(() => {
    let effectiveTime: any = '';
    if (_.isEmpty(data)) {
      form.setFieldsValue({
        status: data.status || 1,
        day: 0,
        hour: 2,
        minute: 0,
        publicType: 1,
        effectiveTime: dayjs().add(7, 'day')
      })
      /*  if (data.status === 0) {
         setShowTimeByStatus(false)
       } else {
         setShowTimeByStatus(true)
       } */
    } else {
      if (data.effectiveTime && data.status === 1) {
        effectiveTime = dayjs(data.effectiveTime, 'YYYY-MM-DD')
      } else if (data.status === 0) {
        effectiveTime = dayjs().add(7, 'day')
      }
      form.setFieldsValue({
        status: data.status || 1,
        ...data,
        effectiveTime,
      })
      /*  if (data.status === 0) {
         setShowTimeByStatus(false)
       } else {
         setShowTimeByStatus(true)
       } */
      if (data.originalJson) {
        setGraphData(data.originalJson)
      }
    }

  }, [data, form]);

  useEffect(() => {
    async function main() {
      const vo: any = await getLabelTable({ type: 7 })
      setCateGory(vo.data)
    }

    main()
  }, []);


  //提交，获取form表单值和图标数据
  async function getFormAndGraphData() {
    //取消流程图的选中，
    flowGraphRef.current.cancelSelection();

    let formValidate = false; //form表单验证是否通过
    let formData = null
    try {//校验成功
      formData = await form.validateFields();
      formValidate = true
    } catch (errorInfo) {//校验失败
      return false
    }
    //获取流程图数据之前，需要判断是否只有一个叶子节点
    const flowGraphData = flowGraphRef.current.getFlowData()
    //格式化截止日期
    if (formData.effectiveTime) {
      formData.effectiveTime = dayjs(formData.effectiveTime).format('YYYY-MM-DD') || ''
    } else {
      formData.effectiveTime = ''
    }
    formData.effectiveTime = '2099-12-30'
    //格式化回溯时间
    formData.backDuration = `${formData.day || 0}#${formData.hour || 0}#${formData.minute || 0}`

    if (formValidate && flowGraphData && validateModelConditionComplete(flowGraphData)) {
      if (data.modelId) {
        //编辑
        editModel(formData, flowGraphData)
      } else {
        //新增
        addModel(formData, flowGraphData)
      }
    }
  }


  //编辑模型
  function editModel(formData: any, flowGraphData: any) {
    let isGraphDataEmpty = JSON.parse(flowGraphData).cells
    if (isGraphDataEmpty.length === 0) {
      message.warning('请在右侧添加预警条件')
      return;
    }
    modelTaskEditAsync({
      ...data,
      ...formData,
      originalJson: flowGraphData
    }).then(() => {
      //编辑成功
      message.success('编辑成功');
      //清空表单
      form.resetFields();
      form.setFieldsValue({
        status: data.status || 1,
        day: 0,
        hour: 2,
        minute: 0,
        publicType: 1,
        effectiveTime: dayjs().add(7, 'day')
      })
      //清空画布
      flowGraphRef.current.clearFlowData();
      // 刷新列表数据
      refreshTable && refreshTable()
      //切换至新增界面
      changeToAdd && changeToAdd(true)
      setData && setData({})
    })
  }

  //新增模型
  function addModel(formData: any, flowGraphData: any) {
    let isGraphDataEmpty = JSON.parse(flowGraphData).cells
    if (isGraphDataEmpty.length === 0) {
      message.warning('请在右侧添加预警条件')
      return;
    }
    modelTaskAddAsync({
      ...formData,
      originalJson: flowGraphData
    }).then((res) => {
      //新增成功
      message.success('添加成功');
      //清空表单
      form.resetFields();
      form.setFieldsValue({
        status: data.status || 1,
        day: 0,
        hour: 2,
        minute: 0,
        publicType: 1,
        effectiveTime: dayjs().add(7, 'day')
      })
      // setShowTimeByStatus(true)
      //清空画布
      flowGraphRef.current.clearFlowData();
      // 刷新列表数据
      refreshTable && refreshTable()
      //添加成功后，返回该添加后的对象
      getRecord && onClosePopup && onClosePopup()
      getRecord && getRecord(res)
    })
  }

  //类别管理
  function showCategory() {
    popup(<LabelManage type={7} hasSystem={false} typeName='风险类别' />,
      {
        title: '风险类别管理', size: 'middle', onCloseCallback: function () {
          async function main() {
            const vo: any = await getLabelTable({ type: 7 })
            setCateGory(vo.data)
          }
          main()
        }
      })
  }

  //预演
  /*  function showYuyan() {
     popup(<><img src={Yuyan} width='100%' height='100%' alt={''} /></>, { title: '', size: 'large' })
   } */
  //重置表单
  function resetForm() {
    if (_.isEmpty(data)) {
      // 新增时重置
      form.resetFields();
      form.setFieldsValue({
        status: data.status || 1,
        day: 0,
        hour: 2,
        minute: 0,
        publicType: 1,
        effectiveTime: dayjs().add(7, 'day')
      })
      // setShowTimeByStatus(true)
      //清空画布
      flowGraphRef.current.clearFlowData();
    } else {
      // 编辑时重置
      let effectiveTime: any = '';
      if (data.effectiveTime && data.status === 1) {
        effectiveTime = dayjs(data.effectiveTime, 'YYYY-MM-DD')
      } else if (data.status === 0) {
        effectiveTime = dayjs().add(7, 'day')
      }
      form.setFieldsValue({
        status: data.status || 1,
        ...data,
        effectiveTime,
      })
      /*  if (data.status === 0) {
         setShowTimeByStatus(false)
       } else {
         setShowTimeByStatus(true)
       } */
      setGraphData({})
      if (data.originalJson) {
        setTimeout(() => {
          setGraphData(data.originalJson)
        }, 600)
      }
    }

  }
  //表单数据改变触发
  function handlerFieldsChange() {
    //取消流程图的选中，
    flowGraphRef.current.cancelSelection();
    /*  let showTime = form.getFieldValue('status') !== 0
     setShowTimeByStatus(showTime) */
  }
  //禁用今天之前的时间
  /*   const disabledDate = (current: any) => {
      return current && current < dayjs().endOf('day');
    }; */
  return <div className={styles.wrapper}>
    <div className={styles.left}>
      <div className={styles.littleTitle}>
        <span className={`icon iconfont ${styles.iconColor}`}>&#xe67c;</span>
        基本信息：
      </div>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        autoComplete="off"
        onFieldsChange={handlerFieldsChange}
      >
        <Form.Item label="模型名称" name='modelName' rules={[{ required: true }]} style={{ marginBottom: '14px' }}>
          <Input placeholder="请输入模型名称" maxLength={50} showCount />
        </Form.Item>
        <Form.Item label="回溯时长" name='backDuration' className={styles.redFlag}
          style={{ marginBottom: '0', height: '50px' }}>
          <Form.Item style={{ width: '70px', float: 'left' }}>
            <Form.Item name="day" noStyle rules={[{ required: true, message: '输入天' }]}>
              <InputNumber style={{ width: '50px' }} max={30} min={0} />
            </Form.Item>
            <span className={styles.time}>天</span>
          </Form.Item>
          <Form.Item style={{ width: '70px', float: 'left' }}>
            <Form.Item name="hour" noStyle rules={[{ required: true, message: '输入时' }]}>
              <InputNumber style={{ width: '50px' }} min={0} max={23} />
            </Form.Item>
            <span className={styles.time}>时</span>
          </Form.Item>
          <Form.Item style={{ width: '70px', float: 'left' }}>
            <Form.Item name="minute" noStyle rules={[{ required: true, message: '输入分' }]}>
              <InputNumber style={{ width: '50px' }} max={59} min={0} />
            </Form.Item>
            <span className={styles.time}>分</span>
          </Form.Item>
          <Form.Item style={{ width: '20px', float: 'left' }}>
            <Tooltip placement="top" title={'是指添加多个条件时，这些条件需要在回溯时长内同时满足才会预警'}>
              <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
            </Tooltip>
          </Form.Item>
        </Form.Item>
        <Form.Item label="公开方式" name='publicType' rules={[{ required: true }]} style={{ marginBottom: '14px' }}>
          <Select placeholder='请选择公开方式' getPopupContainer={triggerNode => triggerNode.parentElement}>
            {publicMethod.map((item) => {
              return <Option key={item.value} value={item.value}>{item.name}</Option>
            })}
          </Select>
        </Form.Item>
        <Form.Item label="风险类别" style={{ marginBottom: '14px' }} className={styles.redFlag}>
          <Form.Item name="riskTypeId" label='风险类别' noStyle rules={[{ required: true, message: '请选择风险类别' }]}>
            <Select placeholder='请选择风险类别' style={{ width: 160 }} getPopupContainer={triggerNode => triggerNode.parentElement}>
              {cateGory && cateGory.map((item: any) => {
                return <Option key={item.id} value={item.id}>{item.labelName}</Option>
              })}
            </Select>
          </Form.Item>
          <span className={styles.cate} onClick={showCategory}>类别管理</span>
        </Form.Item>
        <Form.Item label="模型描述" name='remark' style={{ marginBottom: '14px' }}>
          <Input.TextArea placeholder='输入模型描述' />
        </Form.Item>
        <Form.Item label="模型状态" name='status' style={{ marginBottom: '14px' }}>
          <Radio.Group>
            {realTimeWarning.map((item) => {
              return <Radio key={item.value} value={item.value}>{item.name}</Radio>
            })}
          </Radio.Group>
        </Form.Item>
        {/*   {showTimeByStatus && <Form.Item label='截止日期' name='effectiveTime' style={{ marginBottom: '14px' }}>
          <DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' disabledDate={disabledDate} getPopupContainer={triggerNode => triggerNode} />
        </Form.Item>} */}
      </Form>
      <div className={styles.formAction}>
        <Button type={"default"} onClick={resetForm}>重置</Button>
        {/* <Button type={"default"} onClick={showYuyan}>预演</Button> */}
        <Button type={"primary"} onClick={getFormAndGraphData}>提交模型</Button>
      </div>
    </div>
    {/*右侧条件和编辑*/}
    <div className={styles.right}>
      <Flowgraph ref={flowGraphRef} data={graphData} />
    </div>
  </div>
}

export default ModelDetail
