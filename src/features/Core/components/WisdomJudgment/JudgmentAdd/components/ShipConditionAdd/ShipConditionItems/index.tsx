import React, { useCallback, useEffect, useState } from "react";
import { DatePicker, Form, Radio, Select, InputNumber } from "antd";
import dayjs from "dayjs";
import styles from "./index.module.sass";
import AreaSelectInForm from "../../../../../../../../component/AreaSelectInForm";
import { YMDHm } from "../../../../../../../../helper";
import { getShipRegistryListAsync, getShipTypeListAsync } from "../../../../../../../../server/core/model";
import popup from "hooks/basis/Popup";
import ClueManage from "../../../../../ClueManage";
import { clueContentDict } from "../../../../../../../../helper/dictionary";
import _ from "lodash";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props {
  /** 传入的按钮类型，根据这个值显示不同的弹窗*/
  paramsType: string
  /** 传入的参数*/
  params: any,
  /** 修改node节点的data值*/
  onChange: Function
  /**默认的起始时间*/
  beginEndTime?: any
  /**默认区域*/
  areaId?: any
}

interface ComponentProps {
  onChange: Function,
  params: any
  beginEndTime?: any
  areaId?: any
}

//AIS
const AIS: React.FC<ComponentProps> = ({ onChange, params, beginEndTime, areaId }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = ''
      let endTime = ''
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      setFormData({ ...form.getFieldsValue(), eventName: '未开AIS', type: '1', eventType: '01', })
      onChange && onChange({ ...form.getFieldsValue(), eventName: '未开AIS', type: '1', eventType: '01', beginTime, endTime })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange, beginEndTime, areaId]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '未开AIS', type: '1', eventType: '01', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '未开AIS', type: '1', eventType: '01', areaId: val })
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            未开AIS
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '384px', paddingLeft: '10px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//超速
const HighSpeed: React.FC<ComponentProps> = ({ onChange, params, beginEndTime, areaId }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
    minSpeed: params.minSpeed
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '超速', type: '1', eventType: '02', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '超速', type: '1', eventType: '02' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
      minSpeed: params.minSpeed || 40
    })
    formDataOnChange()
  }, [form, params, formDataOnChange, beginEndTime, areaId]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '超速', type: '1', eventType: '02', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '超速', type: '1', eventType: '02', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            超速
          </Form.Item>
          <Form.Item label="航速" style={{ marginBottom: '8px' }} >
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="minSpeed" noStyle>
              <InputNumber size={"small"} style={{ width: 120 }} min={0} precision={2} value={formData.minSpeed} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>节以上</span>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//怠速
const LowSpeed: React.FC<ComponentProps> = ({ onChange, params, beginEndTime, areaId }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
    minSpeed: params.minSpeed
  });
  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '怠速', type: '1', eventType: '03', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '怠速', type: '1', eventType: '03' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
      minSpeed: params.minSpeed || 5
    })
    formDataOnChange();
  }, [form, params, formDataOnChange, beginEndTime, areaId]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '怠速', type: '1', eventType: '03', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '怠速', type: '1', eventType: '03', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            怠速
          </Form.Item>
          <Form.Item label="航速" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="minSpeed" noStyle>
              <InputNumber size={"small"} style={{ width: 120 }} min={0} precision={2} value={formData.minSpeed} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>节以下</span>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//越线
const CrossOver: React.FC<ComponentProps> = ({ onChange, params, beginEndTime }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    lineId: params.lineId,
    inOutType: params.inOutType
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '越线', type: '1', eventType: '04', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '越线', type: '1', eventType: '04' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      lineId: params.lineId,
      inOutType: params.inOutType || 3
    })
    formDataOnChange();
  }, [form, params, formDataOnChange, beginEndTime]);


  function getLineId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '越线', type: '1', eventType: '04', beginTime, endTime, lineId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '越线', type: '1', eventType: '04', lineId: val })
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            越线
          </Form.Item>
          <Form.Item label="进出方式" name="inOutType" style={{ marginBottom: '8px' }}>
            <Radio.Group onChange={formDataOnChange} value={formData.inOutType}>
              <Radio value={3}>{'A->B'}</Radio>
              <Radio value={4}>{'B->A'}</Radio>
              <Radio value={5}>{'A<->B'}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="警戒线" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-64px' }}>*</div>
            <Form.Item name="lineId" noStyle>
              <AreaSelectInForm isShowAB={true} value={formData.lineId} onChange={getLineId} chooseType='line' />
            </Form.Item>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//靠岸
const Landing: React.FC<ComponentProps> = ({ onChange, params, beginEndTime }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    lineId: params.lineId,
    minDistance: params.minDistance || 200
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', eventType: '05', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', eventType: '05' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      lineId: params.lineId,
      minDistance: params.minDistance || 200
    })
    formDataOnChange();
  }, [form, params, formDataOnChange, beginEndTime]);


  function getLineId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', eventType: '05', beginTime, endTime, lineId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '靠岸', type: '1', eventType: '05', lineId: val })
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            靠岸
          </Form.Item>
          <Form.Item label="岸线" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="lineId" noStyle>
              <AreaSelectInForm value={formData.lineId} onChange={getLineId}  chooseType='line' />
            </Form.Item>
          </Form.Item>
          <Form.Item label="距离" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="minDistance" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 120 }} value={formData.minDistance} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>米以下</span>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//进出区域
const InoutArea: React.FC<ComponentProps> = ({ onChange, params, beginEndTime, areaId }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
    inOutType: params.inOutType
  });
  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '进出区域', type: '1', eventType: '06', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '进出区域', type: '1', eventType: '06' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
      inOutType: params.inOutType || 1
    })
    formDataOnChange();
  }, [form, params, formDataOnChange, beginEndTime, areaId]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '进出区域', type: '1', eventType: '06', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '进出区域', type: '1', eventType: '06', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            进出区域
          </Form.Item>
          <Form.Item label="进出方式" name="inOutType" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.inOutType}>
              <Radio value={1}>进入</Radio>
              <Radio value={2}>离开</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//海面停泊
const SeaStop: React.FC<ComponentProps> = ({ onChange, params, beginEndTime, areaId }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
    minMinute: params.minMinute
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '海面停泊', type: '1', eventType: '07', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '海面停泊', type: '1', eventType: '07' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
      minMinute: params.minMinute || 10
    })
    formDataOnChange();
  }, [form, params, formDataOnChange, beginEndTime, areaId]);


  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '海面停泊', type: '1', eventType: '07', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '海面停泊', type: '1', eventType: '07', areaId: val })
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            海面停泊
          </Form.Item>
          <Form.Item label="停泊时长" style={{ marginBottom: '8px' }}>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 160 }} value={formData.minMinute} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>分钟</span>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//曾去地
const OnceWent: React.FC<ComponentProps> = ({ onChange, params, beginEndTime, areaId }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '曾去地', type: '1', eventType: '08', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '曾去地', type: '1', eventType: '08' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
    })
    formDataOnChange();
  }, [form, params, formDataOnChange, beginEndTime, areaId]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '曾去地', type: '1', eventType: '08', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '曾去地', type: '1', eventType: '08', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            曾去地
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-52px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//船型
const BoatType: React.FC<ComponentProps> = ({ onChange, params }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    includeFlag: params.includeFlag,
    shipType: params.shipType,
  });
  const [shipTypeList, setShipTypeList] = useState<any>()

  useEffect(() => {
    form.setFieldsValue({
      includeFlag: params.includeFlag || 1,
      shipType: params.shipType,
    })
    onChange && onChange({ ...form.getFieldsValue(), eventName: '船型', type: '1', eventType: '09' })
  }, [form, params, onChange]);

  //获取船型列表
  useEffect(() => {
    getShipTypeListAsync().then(res => {
      setShipTypeList(res)
    })
  }, []);


  //表单数据变化监控
  function formDataOnChange() {
    onChange && onChange({ ...form.getFieldsValue(), eventName: '船型', type: '1', eventType: '09' })
    setFormData({ ...form.getFieldsValue(), eventName: '船型', type: '1', eventType: '09' })
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            船型
          </Form.Item>
          <Form.Item label="满足与否" name="includeFlag" style={{ marginBottom: '8px' }}>
            <Radio.Group value={formData.includeFlag}>
              <Radio value={1}>是</Radio>
              <Radio value={2}>非</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="船型" name="shipType" style={{ marginBottom: '8px' }}>
            <Select value={formData.shipType} mode="multiple">
              {shipTypeList && shipTypeList.map((item: any) => {
                return <Option value={item.value} key={item.value}>{item.name}</Option>
              })}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//船籍
const BoatRegister: React.FC<ComponentProps> = ({ onChange, params }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    includeFlag: params.includeFlag,
    shipRegistry: params.shipRegistry || ['China'],
  });
  const [shipRegisterList, setShipRegisterList] = useState<any>()

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({ ...form.getFieldsValue(), eventName: '船籍', type: '1', eventType: '10' })
      setFormData({ ...form.getFieldsValue(), eventName: '船籍', type: '1', eventType: '10' })
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
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            船籍
          </Form.Item>
          <Form.Item label="满足与否" name="includeFlag" style={{ marginBottom: '8px' }}>
            <Radio.Group onChange={formDataOnChange} value={formData.includeFlag}>
              <Radio value={1}>是</Radio>
              <Radio value={2}>非</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="船籍" name="shipRegistry" style={{ marginBottom: '8px' }}>
            <Select value={formData.shipRegistry} mode="multiple">
              {shipRegisterList && shipRegisterList.map((item: any) => {
                return <Option value={item.value} key={item.value}>{item.name}</Option>
              })}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/*
* 线索目标
* */
//线索目标
const ClueTarget: React.FC<ComponentProps> = ({ onChange, params }) => {

  const [formData, setFormData] = useState(() => {
    const _formData = {
      eventName: '线索目标',
      eventType: '16',
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
/**
 * 走走停停
 * */
const GoStop: React.FC<ComponentProps> = ({ onChange, params, beginEndTime, areaId }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    runMinute: params.runMinute || [3, 10],
    runMinute1: (params.runMinute && params.runMinute[0]) || 3,
    runMinute2: (params.runMinute && params.runMinute[1]) || 10,
    stayMinute: params.stayMinute || [3, 10],
    stayMinute1: (params.stayMinute && params.stayMinute[0]) || 3,
    stayMinute2: (params.stayMinute && params.stayMinute[1]) || 10,
    circleNum: params.circleNum || 3,
    areaId: params.areaId || areaId,
    rangeTime: params.rangeTime || beginEndTime,
  })

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      let runMinute = [form.getFieldValue('runMinute1'), form.getFieldValue('runMinute2')]
      let stayMinute = [form.getFieldValue('stayMinute1'), form.getFieldValue('stayMinute2')]
      onChange && onChange({ ...form.getFieldsValue(), eventName: '走走停停', type: '1', eventType: '19', runMinute, stayMinute, beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '走走停停', type: '1', eventType: '19' })
    },
    [onChange, form],
  );


  useEffect(() => {
    form.setFieldsValue({
      runMinute: params.runMinute || [3, 10],
      runMinute1: (params.runMinute && params.runMinute[0]) || 3,
      runMinute2: (params.runMinute && params.runMinute[1]) || 10,
      stayMinute: params.stayMinute || [3, 10],
      stayMinute1: (params.stayMinute && params.stayMinute[0]) || 3,
      stayMinute2: (params.stayMinute && params.stayMinute[1]) || 10,
      circleNum: params.circleNum || 3,
      areaId: params.areaId || areaId,
      rangeTime: params.rangeTime || beginEndTime,
    })
    formDataOnChange()
  }, [form, params, formDataOnChange, beginEndTime, areaId]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    let runMinute = [form.getFieldValue('runMinute1'), form.getFieldValue('runMinute2')]
    let stayMinute = [form.getFieldValue('stayMinute1'), form.getFieldValue('stayMinute2')]
    onChange && onChange({ ...form.getFieldsValue(), eventName: '走走停停', type: '1', eventType: '19', runMinute, stayMinute, beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '走走停停', type: '1', eventType: '19', areaId: val })
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            走走停停
          </Form.Item>
          <Form.Item label="行走时长" style={{ marginBottom: '8px', height: '34px' }}>
            <div className={styles.redFlag} style={{ left: '-75px' }}>*</div>
            <Form.Item className={styles.inputNumber} name='runMinute1'>
              <InputNumber min={1} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item className={styles.inputNumber} name='runMinute2'>
              <InputNumber min={formData.runMinute1} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>分钟</span>
          </Form.Item>
          <Form.Item label="停留时长" name="includeFlag" style={{ marginBottom: '8px', height: '34px' }}>
            <div className={styles.redFlag} style={{ left: '-75px' }}>*</div>
            <Form.Item className={styles.inputNumber} name='stayMinute1'>
              <InputNumber min={1} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item className={styles.inputNumber} name='stayMinute2'>
              <InputNumber min={formData.stayMinute1} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>分钟</span>
          </Form.Item>
          <Form.Item label="循环次数" style={{ marginBottom: '8px', height: '34px' }}>
            <div className={styles.redFlag} style={{ left: '-75px' }}>*</div>
            <Form.Item className={styles.inputNumber} name="circleNum">
              <InputNumber min={1} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>次以上</span>
          </Form.Item>
          <Form.Item label="区域" style={{ marginBottom: '8px', width: '320px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**
 * 折返分析
 * */
const BrokenLineAnalysis: React.FC<ComponentProps> = ({ onChange, params, areaId, beginEndTime }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    areaId: params.areaId || areaId,
    rangeTime: params.rangeTime || beginEndTime,
    stayMinute: params.stayMinute || [3, 10],
    stayMinute1: (params.stayMinute && params.stayMinute[0]) ? params.stayMinute[0] : 3,
    stayMinute2: (params.stayMinute && params.stayMinute[1]) || 10,
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      let stayMinute = [form.getFieldValue('stayMinute1'), form.getFieldValue('stayMinute2')]
      onChange && onChange({ ...form.getFieldsValue(), eventName: '折返分析', type: '1', eventType: '20', stayMinute, beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '折返分析', type: '1', eventType: '20' })
    },
    [onChange, form],
  );


  useEffect(() => {
    let stayMinute1 = 3
    if(params.stayMinute){
      if(params.stayMinute[0] === 0){
        stayMinute1 = 0;
      }else{
        stayMinute1 = params.stayMinute[0]
      }
    }
    form.setFieldsValue({
      areaId: params.areaId || areaId,
      rangeTime: params.rangeTime || beginEndTime,
      stayMinute: params.stayMinute || [3, 10],
      stayMinute1,
      stayMinute2: (params.stayMinute && params.stayMinute[1]) || 10,
    })
    formDataOnChange()
  }, [form, params, formDataOnChange, areaId, beginEndTime]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    let stayMinute = [form.getFieldValue('stayMinute1'), form.getFieldValue('stayMinute2')]
    onChange && onChange({ ...form.getFieldsValue(), eventName: '折返分析', type: '1', eventType: '20', stayMinute, beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '折返分析', type: '1', eventType: '20', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            折返分析
          </Form.Item>
          <Form.Item label="停留时长" style={{ marginBottom: '8px', height: '34px' }}>
            <Form.Item name='stayMinute1' className={styles.inputNumber}>
              <InputNumber min={0} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item name='stayMinute2' className={styles.inputNumber}>
              <InputNumber min={formData.stayMinute1} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>分钟</span>
          </Form.Item>
          <Form.Item label="折返区域" style={{ marginBottom: '8px', width: '320px', marginLeft: '16px' }}>
            <div className={styles.redFlag} style={{ left: '-75px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '364px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**
 * 往返分析
 * */
const GoBackAnalysis: React.FC<ComponentProps> = ({ onChange, params, areaId, beginEndTime }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    circleNum: params.circleNum || 3,
    circleAreaOne: params.circleAreaOne || areaId,
    circleAreaTwo: params.circleAreaTwo || areaId,
    rangeTime: params.rangeTime || beginEndTime,
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '往返分析', type: '1', eventType: '21', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '往返分析', type: '1', eventType: '21', beginTime, endTime })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      circleNum: params.circleNum || 3,
      circleAreaOne: params.circleAreaOne || areaId,
      circleAreaTwo: params.circleAreaTwo || areaId,
      rangeTime: params.rangeTime || beginEndTime,
    })
    formDataOnChange()
  }, [form, params, formDataOnChange, areaId, beginEndTime]);

  function getCircleArea1(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '往返分析', type: '1', eventType: '21', beginTime, endTime, circleAreaOne: val })
    setFormData({ ...form.getFieldsValue(), eventName: '往返分析', type: '1', eventType: '21', circleAreaOne: val })
  }
  function getCircleArea2(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '往返分析', type: '1', eventType: '21', beginTime, endTime, circleAreaTwo: val })
    setFormData({ ...form.getFieldsValue(), eventName: '往返分析', type: '1', eventType: '21', circleAreaTwo: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            往返分析
          </Form.Item>
          <Form.Item label="往返次数" style={{ marginBottom: '8px', height: '34px' }}>
            <div className={styles.redFlag} style={{ left: '-75px' }}>*</div>
            <Form.Item name="circleNum" className={styles.inputNumber}>
              <InputNumber min={1} size={"small"} style={{ width: '100px' }} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>次以上</span>
          </Form.Item>
          <Form.Item label="往返区域1" style={{ marginBottom: '8px', width: '320px', marginLeft: '20px' }}>
            <div className={styles.redFlag} style={{ left: '-85px' }}>*</div>
            <Form.Item name="circleAreaOne" noStyle style={{ marginLeft: '14px' }}>
              <AreaSelectInForm value={formData.circleAreaOne} onChange={getCircleArea1} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="往返区域2" style={{ marginBottom: '8px', width: '320px', marginLeft: '20px' }}>
            <div className={styles.redFlag} style={{ left: '-85px' }}>*</div>
            <Form.Item name="circleAreaTwo" noStyle>
              <AreaSelectInForm value={formData.circleAreaTwo} onChange={getCircleArea2} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '384px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**
 * 两船靠泊
 * */
//两船靠岸
const TwoBoatStop: React.FC<ComponentProps> = ({ onChange, params, areaId, beginEndTime }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
    minMinute: params.minMinute
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', eventType: '11', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', eventType: '11' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
      minMinute: params.minMinute || 0
    })
    formDataOnChange()
  }, [form, params, formDataOnChange, areaId, beginEndTime]);

  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', eventType: '11', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '两船靠泊', type: '2', eventType: '11', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            两船靠泊
          </Form.Item>
          <Form.Item label="靠泊时长" style={{ marginBottom: '8px' }}>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 160 }} value={formData.minMinute} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>分钟</span>
          </Form.Item>
          <Form.Item label="靠泊区域" style={{ marginBottom: '8px', width: '400px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '384px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//并行行驶
const TogetherGo: React.FC<ComponentProps> = ({ onChange, params, areaId, beginEndTime }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
    minMinute: params.minMinute || 1
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '并行行驶', type: '2', eventType: '12', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '并行行驶', type: '2', eventType: '12' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
      minMinute: params.minMinute || 1
    })
    formDataOnChange()
  }, [form, params, formDataOnChange, areaId, beginEndTime]);


  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '并行行驶', type: '2', eventType: '12', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '并行行驶', type: '2', eventType: '12', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            并行行驶
          </Form.Item>
          <Form.Item label="并行时长" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 160 }} value={formData.minMinute} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>分钟</span>
          </Form.Item>
          <Form.Item label="并行区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '384px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//尾随行驶
const AfterGo: React.FC<ComponentProps> = ({ onChange, params, areaId, beginEndTime }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    areaId: params.areaId || areaId,
    minMinute: params.minMinute || 1
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')) {
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
      }
      onChange && onChange({ ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', eventType: '13', beginTime, endTime })
      setFormData({ ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', eventType: '13' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      areaId: params.areaId || areaId,
      minMinute: params.minMinute || 1
    })
    formDataOnChange()
  }, [form, params, formDataOnChange, areaId, beginEndTime]);


  function getAreaId(val: any) {
    let beginTime = null
    let endTime = null
    if (form.getFieldValue('rangeTime')) {
      beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format(YMDHm)
      endTime = dayjs(form.getFieldValue('rangeTime')[1]).format(YMDHm)
    }
    onChange && onChange({ ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', eventType: '13', beginTime, endTime, areaId: val })
    setFormData({ ...form.getFieldsValue(), eventName: '尾随行驶', type: '2', eventType: '13', areaId: val })
  }
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            尾随行驶
          </Form.Item>
          <Form.Item label="尾随时长" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="minMinute" noStyle>
              <InputNumber min={0} size={"small"} style={{ width: 160 }} value={formData.minMinute} />
            </Form.Item>
            <span className={styles.paramsName} style={{ marginLeft: '10px' }}>分钟</span>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" rules={[{ required: true }]} style={{ marginBottom: '8px', width: '384px' }}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item label="尾随区域" style={{ marginBottom: '8px', width: '350px' }}>
            <Form.Item name="areaId" noStyle>
              <AreaSelectInForm value={formData.areaId} onChange={getAreaId} />
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**
 * 交集运算*/
const WithCount: React.FC<ComponentProps> = ({ onChange, params }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    threshold: params.threshold || 1,
  });

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({ ...form.getFieldsValue(), eventName: '交集运算', type: '2', eventType: '14' })
      setFormData({ ...form.getFieldsValue(), eventName: '交集运算', type: '2', eventType: '14' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      threshold: params.threshold || 1,
    })
    formDataOnChange()
  }, [form, params, formDataOnChange]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            交集运算
          </Form.Item>
          <Form.Item label="阈值" style={{ marginBottom: '8px' }}>
            <div className={styles.redFlag} style={{ left: '-78px' }}>*</div>
            <Form.Item name="threshold" noStyle>
              <InputNumber size={"small"} style={{ width: 160 }} value={formData.threshold} min={2} />
            </Form.Item>
          </Form.Item>
          <Form.Item label="说明" className={styles.paramsName}>
            多个条件中有阈值数量的条件同时满足
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//并集运算
const OrCount: React.FC<ComponentProps> = ({ onChange }) => {
  const [form] = Form.useForm();

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({ ...form.getFieldsValue(), eventName: '并集运算', type: '2', eventType: '15' })
    },
    [onChange, form],
  );

  useEffect(() => {
    formDataOnChange()
  }, [formDataOnChange]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            并集运算
          </Form.Item>
          <Form.Item label="说明" className={styles.paramsName}>
            多个条件满足任意一个
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//差集运算
const DiffCount: React.FC<ComponentProps> = ({ onChange, params }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    differType: params.differType || 1,
  });

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({ ...form.getFieldsValue(), eventName: '差集运算', type: '2', eventType: '17' })
      setFormData({ ...form.getFieldsValue(), eventName: '差集运算', type: '2', eventType: '17' })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      differType: params.differType || 1,
    })
    formDataOnChange()
  }, [formDataOnChange, form, params]);

  return (
    <div className={styles.wrapper} style={{ width: '400px' }}>
      <p className={styles.title}>条件参数</p>
      <div style={{ padding: '0 10px' }}>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            差集运算
          </Form.Item>
          <Form.Item label="求差方式" name="differType" style={{ marginBottom: '8px' }}>
            <Radio.Group onChange={formDataOnChange} value={formData.differType}>
              <Radio value={1}>{'A-B'}</Radio>
              <Radio value={2}>{'(A-B)+(B-A)'}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="说明" className={styles.paramsName}>
            {formData.differType === 1 ? '只保留第一个条件的差集' : '保留所有条件的差集，即所有条件只满足其中一个的结果'}
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//右下角条件参数设置弹窗
const ShipConditionItems: React.FC<Props> = ({ paramsType, params, onChange, beginEndTime, areaId }) => {
  function handlerChange(val: any) {
    onChange && onChange({
      ...params,
      ...val
    })
  }
  let result = null;
  switch (paramsType) {
    case 'ais':
      result = <AIS areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'highSpeed':
      result = <HighSpeed areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'lowSpeed':
      result = <LowSpeed areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'crossOver':
      result = <CrossOver areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'landing':
      result = <Landing areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'inoutArea':
      result = <InoutArea areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'seaStop':
      result = <SeaStop areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'onceWent':
      result = <OnceWent areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    case 'boatType':
      result = <BoatType areaId={areaId} onChange={handlerChange} params={params} />
      break;
    case 'boatRegister':
      result = <BoatRegister areaId={areaId} onChange={handlerChange} params={params} />
      break;
    /** 线索目标*/
    case 'clueTarget':
      result = <ClueTarget areaId={areaId} onChange={handlerChange} params={params} />
      break;
    /**走走停停*/
    case 'goStop':
      result = <GoStop areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    /**折返分析*/
    case 'brokenLineAnalysis':
      result = <BrokenLineAnalysis areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    /**往返分析*/
    case 'goBackAnalysis':
      result = <GoBackAnalysis areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    /**两船靠泊*/
    case 'twoBoatStop':
      result = <TwoBoatStop areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    /**并行行驶*/
    case 'togetherGo':
      result = <TogetherGo areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    /**尾随行驶*/
    case 'afterGo':
      result = <AfterGo areaId={areaId} beginEndTime={beginEndTime} onChange={handlerChange} params={params} />
      break;
    /**交集运算*/
    case 'withCount':
      result = <WithCount onChange={handlerChange} params={params} />
      break;
    /**并集运算*/
    case 'orCount':
      result = <OrCount onChange={handlerChange} params={params} />
      break;
    /**差集运算*/
    case 'diffCount':
      result = <DiffCount onChange={handlerChange} params={params} />
      break;
  }
  return result
}

export default ShipConditionItems
