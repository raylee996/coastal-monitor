import React, { useCallback, useEffect, useState } from "react";
import styles from './index.module.sass'
import { DatePicker, Form, InputNumber, Radio, Select } from "antd";
import { getShipRegistryListAsync, getShipTypeListAsync } from "../../../../../../../server/core/model";
import AreaSelectInForm from "../../../../../../../component/AreaSelectInForm";
import popup from "hooks/basis/Popup";
import ClueManage from "../../../../ClueManage";
import { clueContentDict } from "../../../../../../../helper/dictionary";
import _ from "lodash";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props {
  /** 传入的按钮类型，根据这个值显示不同的弹窗*/
  paramsType: string
  /** 传入的参数*/
  params: any,
  /** 修改node节点的data值*/
  onChange: Function
  isShowMask?: boolean
}

interface ComponentProps {
  onChange: Function,
  params: any
  isShowMask?: boolean
}

// 条件遮罩层，用于不能编辑时候使用
const Mask: React.FC = () => {
  return <div className={styles.mask}></div>
}

//AIS
const AIS: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || null,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId || ''
  });

  const formDataOnChange = useCallback(
    () => {
      let startHour = ''
      let endHour = ''
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '未开AIS', type: '1' })
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '未开AIS', type: '1', startHour, endHour })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange]);


  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '未开AIS', type: '1', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '未开AIS', type: '1', areaId: val })
  }

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            未开AIS
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//超速
const HighSpeed: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId,
    minSpeed: params.minSpeed || 40,
    minMinute: params.minMinute || 0
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = ''
    let endHour = ''
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '超速', type: '1', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '超速', type: '1', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '超速', type: '1' })
    },
    [onChange, form],
  );
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId,
      minSpeed: params.minSpeed || 40,
      minMinute: params.minMinute || 0
    })
    formDataOnChange()
  }, [form, params, formDataOnChange]);

  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '超速', type: '1', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '超速', type: '1', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            超速
          </Form.Item>
          <Form.Item label="航速" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="minSpeed" noStyle>
              <InputNumber size={"small"} type={'number'} min={0} precision={2} style={{ width: 120 }} value={formData.minSpeed} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>节以上</span>
          </Form.Item>
          <Form.Item label="超速时长" style={{ marginBottom: '8px' }}>
            <Form.Item name="minMinute" noStyle>
              <InputNumber size={"small"} style={{ width: 148 }} min={0} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>秒以上</span>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
              {/*<Input size={"small"} style={{width: 160}} value={formData.areaId}/>*/}
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//怠速
const LowSpeed: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId,
    minSpeed: params.minSpeed || 5,
    minMinute: params.minMinute || 0
  });
  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '怠速', type: '1', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '怠速', type: '1', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '怠速', type: '1' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId,
      minSpeed: params.minSpeed || 5,
      minMinute: params.minMinute || 0
    })
    formDataOnChange()
  }, [form, params, formDataOnChange]);

  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '怠速', type: '1', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '怠速', type: '1', areaId: val })
  }

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            怠速
          </Form.Item>
          <Form.Item label="航速" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="minSpeed" noStyle>
              <InputNumber size={"small"} style={{ width: 120 }} min={0} precision={2} value={formData.minSpeed} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>节以下</span>
          </Form.Item>
          <Form.Item label="怠速时长" style={{ marginBottom: '8px' }}>
            <Form.Item name="minMinute" noStyle>
              <InputNumber size={"small"} style={{ width: 148 }} min={0} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>秒以上</span>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              {/*<Input size={"small"} style={{width: 160}} value={formData.areaId}/>*/}
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//越线
const CrossOver: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    lineId: params.lineId,
    inOutType: params.inOutType
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '越线', type: '1', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '越线', type: '1', startHour, endHour })

      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '越线', type: '1' })
    },
    [onChange, form],
  );


  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      lineId: params.lineId,
      inOutType: params.inOutType || 5
    })
    // setFormData({...form.getFieldsValue(),eventName:'越线',type:'1'})
    formDataOnChange()
  }, [form, params, formDataOnChange]);

  function getLineId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '越线', type: '1', startHour, endHour, lineId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '越线', type: '1', lineId: val })
  }

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            越线
          </Form.Item>
          <Form.Item label="进出方式" name="inOutType" style={{ marginBottom: '8px' }}>
            <Radio.Group onChange={formDataOnChange} value={formData.inOutType}>
              <Radio value={3}>{'A->B'}</Radio>
              <Radio value={4}>{'B->A'}</Radio>
              <Radio value={5}>{'A<->B'}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="警戒线" style={{ marginBottom: '8px', width: '350px' }}>
            <div className={styles.redFlag} style={{ left: '-64px' }}>*</div>
            <Form.Item name="lineId" noStyle>
              <AreaSelectInForm isShowAB={true} value={formData.lineId} onChange={getLineId} chooseType='line' />
              {/*<Input size={"small"} style={{width: 160}} value={formData.lineId}/>*/}
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//靠岸
const Landing: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    lineId: params.lineId,
    areaId: params.areaId,
    minMinute: params.minMinute || 5
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '靠岸', type: '1', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '靠岸', type: '1' })
    },
    [onChange, form],
  );


  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      lineId: params.lineId,
      areaId: params.areaId,
      minMinute: params.minMinute || 5
    })
    // setFormData({...form.getFieldsValue(),eventName:'靠岸',type:'1'})
    formDataOnChange()
  }, [form, params, formDataOnChange]);


  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', areaId: val })
  }
  function getLineId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', startHour, endHour, lineId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', lineId: val })
  }

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            靠岸
          </Form.Item>
          <Form.Item label="预到时长" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="minMinute" noStyle>
              <InputNumber size={"small"} style={{ width: 148 }} min={0} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>分钟内</span>
          </Form.Item>
          <Form.Item label="岸线" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag}>*</div>
            <Form.Item name="lineId" noStyle>
              <AreaSelectInForm value={formData.lineId} onChange={getLineId} chooseType='line' isShowAB={true} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="检测区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
              {/*<Input size={"small"} style={{width: 160}} value={formData.areaId}/>*/}
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//进出区域
const InoutArea: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId,
    inOutType: params.inOutType
  });
  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '进出区域', type: '1', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '进出区域', type: '1', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '进出区域', type: '1' })
    },
    [onChange, form],
  );


  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId,
      inOutType: params.inOutType || 1
    })
    formDataOnChange()
    // setFormData({...form.getFieldsValue(),eventName:'进出区域',type:'1'})
  }, [form, params, formDataOnChange]);

  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '进出区域', type: '1', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '进出区域', type: '1', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            进出区域
          </Form.Item>
          <Form.Item label="进出方式" name="inOutType" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.inOutType}>
              <Radio value={1}>进入</Radio>
              <Radio value={2}>离开</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px', width: '350px' }}>
            <div className={styles.redFlag}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
              {/*<Input size={"small"} style={{width: 160}} value={formData.areaId}/>*/}
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//海面停泊
const SeaStop: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId,
    minMinute: params.minMinute || 10
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '海面停泊', type: '1', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '海面停泊', type: '1', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '海面停泊', type: '1' })
    },
    [onChange, form],
  );


  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId,
      minMinute: params.minMinute || 10
    })
    formDataOnChange()
    // setFormData({...form.getFieldsValue(),eventName:'海面停泊',type:'1'})
  }, [form, params, formDataOnChange]);

  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '海面停泊', type: '1', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '海面停泊', type: '1', areaId: val })
  }

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            海面停泊
          </Form.Item>
          <Form.Item label="停泊时长" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="minMinute" noStyle>
              <InputNumber size={"small"} style={{ width: 160 }} min={0} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>分钟</span>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px', width: '350px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

// 偏航
const OffCourse: React.FC<ComponentProps> = ({ params, onChange, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    yawDistance: params.yawDistance || 50,
    minDistance: params.minDistance || 50,
    areaId: params.areaId,
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '偏航', type: '1', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '偏航', type: '1' })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '偏航', type: '1' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      yawDistance: params.yawDistance || 50,
      minDistance: params.minDistance || 50,
      areaId: params.areaId,
    })
    formDataOnChange()
    // setFormData({...form.getFieldsValue(),eventName:'曾去地',type:'1'})
  }, [form, params, formDataOnChange]);


  function getAreaId(val: any) {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '偏航', type: '1', areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '偏航', type: '1', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 17 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            偏航
          </Form.Item>
          <Form.Item label="偏航距离" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="yawDistance" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 146 }} value={formData.yawDistance} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>米以上</span>
          </Form.Item>
          <Form.Item label="航道行驶距离" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-106px' }}>*</div>
            <Form.Item name="minDistance" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 146 }} value={formData.minDistance} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>米以上</span>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="航道" style={{ marginBottom: '8px', width: '350px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} chooseType='yaw' />
            </Form.Item>
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//曾去地
const OnceWent: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    minMinute: params.minMinute,
    areaId: params.areaId,
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '曾去地', type: '1' })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '曾去地', type: '1' })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '曾去地', type: '1' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      minMinute: params.minMinute || 30,
      areaId: params.areaId,
    })
    formDataOnChange()
    // setFormData({...form.getFieldsValue(),eventName:'曾去地',type:'1'})
  }, [form, params, formDataOnChange]);


  function getAreaId(val: any) {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '曾去地', type: '1', areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '曾去地', type: '1', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            曾去地
          </Form.Item>
          <Form.Item label="曾去时间" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} max={999} size={"small"} style={{ width: 146 }} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>分钟内</span>
          </Form.Item>
          <Form.Item label="曾去区域" style={{ marginBottom: '8px', width: '350px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//船型
const BoatType: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    includeFlag: params.includeFlag,
    shipType: params.shipType,
  });
  const [shipTypeList, setShipTypeList] = useState<any>([])

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '船型', type: '1' })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({ ...form.getFieldsValue(), eventName: '船型', type: '1' })
      setFormData({ ...form.getFieldsValue(), eventName: '船型', type: '1' })
    },
    [onChange, form],
  );

  useEffect(() => {
    if (params.shipType) {
      form.setFieldsValue({
        includeFlag: params.includeFlag || 1,
        shipType: params.shipType,
      })
    } else if (shipTypeList.length > 0) {
      form.setFieldsValue({
        includeFlag: params.includeFlag || 1,
        shipType: [shipTypeList[0].value] || [],
      })
    } else {
      form.setFieldsValue({
        includeFlag: params.includeFlag || 1,
        shipType: params.shipType || [],
      })
    }

    formDataOnChange()
  }, [form, params, formDataOnChange, shipTypeList]);

  //获取船型列表
  useEffect(() => {
    getShipTypeListAsync().then(res => {
      setShipTypeList(res)
    })
  }, []);

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            船型
          </Form.Item>
          <Form.Item label="满足与否" name="includeFlag" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.includeFlag}>
              <Radio value={1}>是</Radio>
              <Radio value={2}>非</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="船型" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-50px' }}>*</div>
            <Form.Item name="shipType" noStyle>
              <Select value={formData.shipType} mode="multiple">
                {shipTypeList && shipTypeList.map((item: any) => {
                  return <Option value={item.value} key={item.value}>{item.name}</Option>
                })}
              </Select>
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//船籍
const BoatRegister: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    includeFlag: params.includeFlag,
    shipRegistry: params.shipRegistry || ['China'],
  });
  const [shipRegisterList, setShipRegisterList] = useState<any>()

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '船籍', type: '1' })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({ ...form.getFieldsValue(), eventName: '船籍', type: '1' })
      setFormData({ ...form.getFieldsValue(), eventName: '船籍', type: '1' })
    },
    [onChange, form],
  );


  useEffect(() => {
    form.setFieldsValue({
      includeFlag: params.includeFlag || 1,
      shipRegistry: params.shipRegistry || ['China'],
    })
    formDataOnChange()
  }, [form, params, formDataOnChange]);

  //获取船籍列表
  useEffect(() => {
    getShipRegistryListAsync().then(res => {
      setShipRegisterList(res)
    })
  }, []);


  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            船籍
          </Form.Item>
          <Form.Item label="满足与否" name="includeFlag" style={{ marginBottom: '8px' }}>
            <Radio.Group onChange={formDataOnChange} value={formData.includeFlag}>
              <Radio value={1}>是</Radio>
              <Radio value={2}>非</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="船籍" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-50px' }}>*</div>
            <Form.Item name="shipRegistry" noStyle>
              <Select value={formData.shipRegistry} mode="multiple">
                {shipRegisterList && shipRegisterList.map((item: any) => {
                  return <Option value={item.value} key={item.value}>{item.name}</Option>
                })}
              </Select>
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//两船靠岸
const TwoBoatStop: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId,
    minMinute: params.minMinute
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '两船靠泊', type: '2' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId,
      minMinute: params.minMinute || null
    })
    formDataOnChange()
    // setFormData({...form.getFieldsValue(),eventName:'两船靠泊',type:'2'})
  }, [form, params, formDataOnChange]);

  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            两船靠泊
          </Form.Item>
          <Form.Item label="靠泊时长" style={{ marginBottom: '8px' }}>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 160 }} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>分钟</span>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          <Form.Item label="靠泊区域" style={{ marginBottom: '8px', width: '400px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
              {/*<Input size={"small"} style={{width: 160}} value={formData.areaId}/>*/}
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//并行行驶
const TogetherGo: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId,
    minMinute: params.minMinute || 1,
    /* minDistance: params.minDistance || 0,
    maxDistance: params.maxDistance || 100 */
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '并行行驶', type: '2', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '并行行驶', type: '2', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '并行行驶', type: '2' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId,
      minMinute: params.minMinute || 1,
      /*  minDistance: params.minDistance || 0,
       maxDistance: params.maxDistance || 100 */
    })
    formDataOnChange()
    // setFormData({...form.getFieldsValue(),eventName:'并行行驶',type:'2'})
  }, [form, params, formDataOnChange]);


  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '并行行驶', type: '2', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '并行行驶', type: '2', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            并行行驶
          </Form.Item>
          <Form.Item label="并行时长" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 160 }} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>分钟</span>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          {/*  <Form.Item label="两船间距" style={{ marginBottom: '8px', height: '34px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item className={styles.inputNumber} name='minDistance'>
              <InputNumber min={0} max={formData.maxDistance ? formData.maxDistance : Number.MAX_SAFE_INTEGER} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item className={styles.inputNumber} name='maxDistance'>
              <InputNumber min={formData.minDistance ? formData.minDistance : 0} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>米</span>
          </Form.Item> */}
          <Form.Item label="并行区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
              {/*<Input size={"small"} style={{width: 160}} value={formData.areaId}/>*/}
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//尾随行驶
const AfterGo: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime,
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    areaId: params.areaId,
    minMinute: params.minMinute || 1,
    /* minDistance: params.minDistance || 100,
    maxDistance: params.maxDistance || 300 */
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', startHour, endHour })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let startHour = null
      let endHour = null
      if (form.getFieldValue('rangeTime')) {
        startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
        endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
      }
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', startHour, endHour })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '尾随行驶', type: '2' })
    },
    [onChange, form],
  );


  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      rangeTime: params.rangeTime,
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      areaId: params.areaId,
      minMinute: params.minMinute || 1,
      /*  minDistance: params.minDistance || 100,
       maxDistance: params.maxDistance || 300 */
    })
    formDataOnChange()
    // setFormData({...form.getFieldsValue(),eventName:'尾随行驶',type:'2'})
  }, [form, params, formDataOnChange]);


  function getAreaId(val: any) {
    let startHour = null
    let endHour = null
    if (form.getFieldValue('rangeTime')) {
      startHour = dayjs(form.getFieldValue('rangeTime')[0]).format('HH:mm:ss')
      endHour = dayjs(form.getFieldValue('rangeTime')[1]).format('HH:mm:ss')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', startHour, endHour, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            尾随行驶
          </Form.Item>
          <Form.Item label="尾随时长" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 160 }} value={formData.minMinute} />
            </Form.Item>
            <span style={{ marginLeft: '10px', color: '#a6cdff' }}>分钟</span>
          </Form.Item>
          <Form.Item label="时段" name="rangeTime" style={{ marginBottom: '8px' }}>
            <RangePicker picker="time" size={'small'} value={formData.rangeTime} />
          </Form.Item>
          {/*  <Form.Item label="两船间距" style={{ marginBottom: '8px', height: '34px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item className={styles.inputNumber} name='minDistance'>
              <InputNumber min={0} max={formData.maxDistance ? formData.maxDistance : Number.MAX_SAFE_INTEGER} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item className={styles.inputNumber} name='maxDistance'>
              <InputNumber min={formData.minDistance ? formData.minDistance : 0} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>米</span>
          </Form.Item> */}
          <Form.Item label="尾随区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
              {/*<Input size={"small"} style={{width: 160}} value={formData.areaId}/>*/}
            </Form.Item>
            {/*<span style={{marginLeft: '10px'}}>添加</span>*/}
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//与运算
const WithCount: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '与运算', type: '2' })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '与运算', type: '2' })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '与运算', type: '2' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3
    })
    formDataOnChange()
  }, [form, params, formDataOnChange]);

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            与运算
          </Form.Item>
          <Form.Item label="说明" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            多个条件中有阈值数量的条件同时满足
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//或运算
const OrCount: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    isWarn: params.isWarn || 0,
    riskLevel: params.riskLevel || 3,
    value: params.value
  });

  //解决切换是否预警后，数据更新到节点data不及时的问题
  useEffect(() => {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '或运算', type: '2' })
  }, [formData, onChange, form]);

  const formDataOnChange = useCallback(
    () => {
      let riskLevel = form.getFieldValue('riskLevel')
      onChange && onChange({ riskLevel, ...form.getFieldsValue(), eventName: '或运算', type: '2' })
      setFormData({ riskLevel, ...form.getFieldsValue(), eventName: '或运算', type: '2' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      isWarn: params.isWarn || 0,
      riskLevel: params.riskLevel || 3,
      value: params.value || 2
    })
    formDataOnChange()
  }, [form, params, formDataOnChange]);

  return (
    <div className={styles.wrapper}>
      {isShowMask && <Mask></Mask>}
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            或运算
          </Form.Item>
          <Form.Item label="说明" style={{ marginBottom: '8px', color: '#a6cdff' }}>
            多个条件满足任意一个
          </Form.Item>
          <Form.Item label="是否预警" name="isWarn" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.isWarn}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.isWarn === 1 && <Form.Item label="风险等级" name="riskLevel" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.riskLevel}>
              <Radio value={1}>高风险</Radio>
              <Radio value={2}>中风险</Radio>
              <Radio value={3}>低风险</Radio>
            </Radio.Group>
          </Form.Item>}
        </Form>
      </div>
    </div>
  )
}

//线索目标
const ClueTarget: React.FC<ComponentProps> = ({ onChange, params, isShowMask }) => {

  const [formData, setFormData] = useState(() => {
    const _formData = {
      eventName: '线索目标',
      type: '1',
      clueInfo: []
    }
    onChange && onChange(_formData)
    return _formData
  });

  useEffect(() => {
    if (params.clueInfo) {
      setFormData((val: any) => {
        const _formData = {
          ...val,
          clueInfo: params.clueInfo
        }
        onChange && onChange(_formData)
        return _formData
      })
    }
  }, [params, onChange]);


  function handleGetInfo(info: any) {
    setFormData((val: any) => {
      const _formData = {
        ...val,
        clueInfo: info
      }
      onChange && onChange(_formData)
      return _formData
    })
  }

  /*线索管理*/
  function openClueManage() {
    popup(<ClueManage onChange={handleGetInfo} defaultChoosenClue={formData.clueInfo} objType={1} />,
      {
        title: '线索管理',
        size: 'large'
      })
  }
  return <div className={styles.wrapper}>
    {isShowMask && <Mask></Mask>}
    <p className={styles.title}>条件参数</p>
    <div className={styles.clueTarget}>
      <div className={styles.clueTargetItem}>
        <span>条件名称: </span>
        <span>线索目标</span>
      </div>
      <div className={styles.clueTargetItem}>
        {<span className={styles.clueTargetAdd} onClick={openClueManage}>添加线索</span>}
      </div>
      <div className={styles.clueTargetItem}>
        {clueContentDict.map((item: any, index: any) => {
          return <div key={index}>
            <ClueTags choosenClue={formData.clueInfo} type={item.value} />
            {/*{filterClueType(formData.clueInfo,item.value).length>0 && <span className={styles.clueTargetAdd} onClick={openClueManage}>添加</span>}*/}
          </div>
        })}
      </div>
    </div>
  </div>
}


interface ClueTagsProps {
  choosenClue: any,
  type: any,
}

const ClueTags: React.FC<ClueTagsProps> = ({ choosenClue, type }) => {
  const filteredClueByType = filterClueByType(choosenClue, type)
  return <>
    {/*无档案*/}
    {filteredClueByType.arr.length > 0 && <div className={styles.clueInfoItem}>
      {clueContentDict.map((item: any) => {
        return <React.Fragment key={item.value}>{type === item.value && <span className={styles.clueInfoTitle}>{item.name}：</span>}</React.Fragment>
      })}
      {filteredClueByType.arr.length || 0}个
    </div>}
    {/*有船舶档案*/}
    {filteredClueByType.ship.arr.length > 0 && type === 9 && <div className={styles.clueInfoItem}>
      <span className={styles.clueInfoTitle}>船舶档案：</span>
      {filteredClueByType.ship.arr.length || 0}个
    </div>
    }
    {/*有车辆档案*/}
    {filteredClueByType.car.arr.length > 0 && type === 10 && <div className={styles.clueInfoItem}>
      <span className={styles.clueInfoTitle}>车辆档案：</span>
      {filteredClueByType.car.arr.length || 0}个
    </div>
    }
    {/*有人员档案*/}
    {filteredClueByType.man.arr.length > 0 && type === 11 && <div className={styles.clueInfoItem}>
      <span className={styles.clueInfoTitle}>人员档案：</span>
      {filteredClueByType.man.arr.length || 0}个
    </div>
    }
  </>
}

function filterClueByType(contentArr: any, type: number) {
  let obj: any = {
    arr: [],
    ship: {
      arr: []
    },
    man: {
      arr: []
    },
    car: {
      arr: []
    }
  };
  if (contentArr.length > 0) {
    contentArr.forEach((item: any) => {
      //无档案
      if (item.codeType === type) {
        obj.arr.push(item)
      } else {
        //有档案（船舶，车辆，人员档案）
        if (item.archiveType === 3) {
          //船舶档案
          obj.ship.info = item
          if (item.archiveKind && item.archiveKind.includes(2)) {
            obj.ship.arr.push('重点船舶')
          }
          if (item.archiveKind && item.archiveKind.includes(3)) {
            obj.ship.arr.push('关注船舶')
          }
          if (item.archiveKind && item.archiveKind.includes(4)) {
            obj.ship.arr.push('一般船舶')
          }
          if (item.archiveIds && item.archiveIds.length > 0) {
            obj.ship.arr.push(...item.archiveIds)
          }
          obj.ship.arr = _.uniq(obj.ship.arr)
        } else if (item.archiveType === 0) {
          //人员档案
          obj.man.info = item
          if (item.archiveKind && item.archiveKind.includes(2)) {
            obj.man.arr.push('重点人员')
          }
          if (item.archiveKind && item.archiveKind.includes(3)) {
            obj.man.arr.push('关注人员')
          }
          if (item.archiveKind && item.archiveKind.includes(4)) {
            obj.man.arr.push('一般人员')
          }
          if (item.archiveIds && item.archiveIds.length > 0) {
            obj.man.arr.push(...item.archiveIds)
          }
          obj.man.arr = _.uniq(obj.man.arr)
        } else if (item.archiveType === 1) {
          //车辆档案
          obj.man.info = item
          if (item.archiveKind && item.archiveKind.includes(2)) {
            obj.car.arr.push('重点车辆')
          }
          if (item.archiveKind && item.archiveKind.includes(3)) {
            obj.car.arr.push('关注车辆')
          }
          if (item.archiveKind && item.archiveKind.includes(4)) {
            obj.car.arr.push('一般车辆')
          }
          if (item.archiveIds && item.archiveIds.length > 0) {
            obj.car.arr.push(...item.archiveIds)
          }
          obj.car.arr = _.uniq(obj.car.arr)
        }
      }
    })
  }
  return obj
}

//条件参数设置
const ConditionParams: React.FC<Props> = ({ paramsType, params, onChange, isShowMask }) => {
  function handlerChange(val: any) {
    onChange && onChange(val)
  }

  let result = null;
  switch (paramsType) {
    /** 未开AIS*/
    case 'ais':
      result = <AIS onChange={handlerChange} params={params} isShowMask={isShowMask} />;
      break;
    /** 超速*/
    case 'highSpeed':
      result = <HighSpeed onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 怠速*/
    case 'lowSpeed':
      result = <LowSpeed onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 越线*/
    case 'crossOver':
      result = <CrossOver onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 靠岸*/
    case 'landing':
      result = <Landing onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 进出区域*/
    case 'inoutArea':
      result = <InoutArea onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 海面停泊*/
    case 'seaStop':
      result = <SeaStop onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    case 'offCourse':
      result = <OffCourse onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 曾去地*/
    case 'onceWent':
      result = <OnceWent onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 船型*/
    case 'boatType':
      result = <BoatType onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 船籍*/
    case 'boatRegister':
      result = <BoatRegister onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 线索目标*/
    case 'clueTarget':
      result = <ClueTarget onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 两船靠泊*/
    case 'twoBoatStop':
      result = <TwoBoatStop onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 并行行驶*/
    case 'togetherGo':
      result = <TogetherGo onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 尾随行驶*/
    case 'afterGo':
      result = <AfterGo onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 与运算*/
    case 'withCount':
      result = <WithCount onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
    /** 或运算*/
    case 'orCount':
      result = <OrCount onChange={handlerChange} params={params} isShowMask={isShowMask} />
      break;
  }
  return result
}

export default ConditionParams
