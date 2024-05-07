import React, {useCallback, useEffect, useState} from "react";
import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Tooltip,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import styles from "./index.module.sass";
import { QuestionCircleOutlined } from '@ant-design/icons';
import popup from "hooks/basis/Popup";
import ClueManage from "../../../../../ClueManage";
import {clueContentDict} from "../../../../../../../../helper/dictionary";
import _ from "lodash";
import SelectPointMap from "../../../../../../../../component/SelectPointMap";
import {getPointListAsync} from "../../../../../../../../server/device";
import UploadImg from "hooks/basis/UploadImg";
import {doUploadFile} from "../../../../../../../../server/common";

const {RangePicker} = DatePicker;

interface Props {
  /** 传入的按钮类型，根据这个值显示不同的弹窗*/
  paramsType: string
  /** 传入的参数*/
  params: any,
  /** 修改node节点的data值*/
  onChange: Function
  /**默认的起始时间*/
  beginEndTime?:any
  /**点位*/
  devicesId?:any
}

interface ComponentProps {
  onChange: Function,
  params: any
  /**默认的起始时间*/
  beginEndTime?:any
  /**点位*/
  devicesId?:any
}

//格式化点位
async function formatDevices(devicesId:any[]){
  if (devicesId && devicesId.length>0){
    const devicesList = await getPointListAsync() || []
    let arr = [];
    for (let i = 0; i<devicesList.length; i++){
      for (let j = 0; j<devicesId.length; j++){
        if (devicesList[i].id === devicesId[j]){
          arr.push({
            deviceCode: devicesList[i].deviceCode,
            type: devicesList[i].type,
            siteCode: devicesList[i].siteCode,
          })
        }
      }
    }
   return arr
  }
}

/**
 * 碰撞分析
 * */
const KnockAnalysis: React.FC<ComponentProps> = ({onChange, params,beginEndTime,devicesId}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    devicesId: params.devicesId || devicesId,
    dataType: params.dataType || '01',
    threshold: params.threshold
  });
  //阈值的最大值为点位的长度
  const [pointListLength,setPointListLength] = useState(1)

  const formDataOnChange = useCallback(
    async () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let devices = await formatDevices(form.getFieldValue('devicesId')) || [];
      setFormData({...form.getFieldsValue(), eventName: '碰撞分析', type: '1',eventType:'22'})
      onChange && onChange({...form.getFieldsValue(), eventName: '碰撞分析', type: '1',eventType:'22', beginTime, endTime,devices})
     
      let devicesId = form.getFieldValue('devicesId')
      let threshold = form.getFieldValue('threshold')
      if(devicesId && devicesId.length>0){
        setPointListLength(devicesId.length)
      }else{
        setPointListLength(1)
      }
      if(devicesId && devicesId.length < threshold){
        form.setFieldsValue({
          threshold: devicesId.length
        })
      }
      if(devicesId && devicesId.length === 0){
        form.setFieldsValue({
          threshold: 1
        })
      }
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      devicesId: params.devicesId || devicesId,
      dataType: params.dataType || '01',
      threshold: params.threshold || null
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            碰撞分析
          </Form.Item>
          <Form.Item label="数据类型" rules={[{required: true}]} name="dataType" style={{marginBottom: '8px'}}>
            <Radio.Group onChange={formDataOnChange} value={formData.dataType}>
              <Radio value='01'>人脸</Radio>
              <Radio value='02'>车辆</Radio>
              {/* <Radio value='03'>侦码</Radio> */}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="阈值" style={{marginBottom: '8px'}}>
            <Form.Item name="threshold" noStyle>
              <InputNumber min={1} max={pointListLength} size={"small"} style={{width: 160}} value={formData.threshold}/>
            </Form.Item>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**
 * 伴随分析
 * */
const FollowAnalysis: React.FC<ComponentProps> = ({onChange, params,beginEndTime,devicesId}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    dataType: params.dataType || '01',
    knownType: params.knownType || '01',
    threshold: params.threshold || 5,//伴随次数
    minDeviceNum: params.minDeviceNum || 2, //伴随点位数
    minNum: params.minNum || 5, //伴随间隔
    licensePlate: params.licensePlate || null, //伴随车辆
    codeValue: params.codeValue || '', //伴随侦码
    faceId: params.faceId || null, //人脸
    faceDataList: params.faceDataList || [],
    devicesId: params.devicesId || devicesId, //点位
  });

  const formDataOnChange = useCallback(
    async () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let faceId = null
      if (form.getFieldValue('faceDataList').length>0){
        faceId = form.getFieldValue('faceDataList')[0].id
      }

      let devices:any = []
      if (form.getFieldValue('knownType')==='02'){
        devices = await formatDevices(form.getFieldValue('devicesId'))
      }
      setFormData({...form.getFieldsValue(), eventName: '伴随分析', type: '1',eventType:'23'})
      onChange && onChange({...form.getFieldsValue(), eventName: '伴随分析', type: '1',eventType:'23',faceId, beginTime, endTime,devices})
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      dataType: params.dataType || '01',
      knownType: params.knownType || '01',
      threshold: params.threshold || 5,//伴随次数
      minDeviceNum: params.minDeviceNum || 2, //伴随点位数
      minNum: params.minNum || 5, //伴随间隔
      licensePlate: params.licensePlate || null, //伴随车辆
      codeValue: params.codeValue || '', //伴随侦码
      faceId: params.faceId || null, //人脸
      faceDataList: params.faceDataList || [],
      devicesId: params.devicesId || devicesId, //点位
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);


  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            伴随分析
          </Form.Item>
          <Form.Item label="数据类型" name="dataType" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <Radio.Group onChange={formDataOnChange} value={formData.dataType}>
              <Radio value='01'>人脸</Radio>
              <Radio value='02'>车辆</Radio>
              {/* <Radio value='03'>侦码</Radio> */}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="已知数据" name="knownType" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <Radio.Group onChange={formDataOnChange} value={formData.knownType}>
              <Radio value='01'>已知人</Radio>
              <Radio value='02'>已知点位</Radio>
            </Radio.Group>
          </Form.Item>
          {(formData.dataType==='01' && formData.knownType==='01') &&
          <Form.Item label="伴随人脸" name="faceDataList" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <UploadImg uploadImgFn={doUploadFile} maxCount={1}/>
          </Form.Item>}
          {(formData.dataType==='02' && formData.knownType==='01') &&<Form.Item label="伴随车辆" name="licensePlate" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <Input placeholder="请输入一个车牌号" size={"small"}/>
          </Form.Item>}
          {(formData.dataType==='03' && formData.knownType==='01') &&<Form.Item label="伴随侦码" name="codeValue" rules={[{required: true}]} style={{marginBottom: '8px'}}>
              <Input placeholder="请输入一个侦码" size={"small"}/>
          </Form.Item>}
          { formData.knownType === '02' && <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>}
          <Form.Item label="伴随次数" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="threshold" noStyle>
              <InputNumber min={1} size={"small"} style={{width: 160}} />
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>次以上</span>
          </Form.Item>
          <Form.Item label="伴随点位数" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-84px'}}>*</div>
            <Form.Item name="minDeviceNum" noStyle>
              <InputNumber min={1} size={"small"} style={{width: 160}} />
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>个以上</span>
          </Form.Item>
          <Form.Item label="伴随间隔" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="minNum" noStyle>
              <InputNumber min={1} max={5} size={"small"} style={{width: 160}} />
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>分钟以下</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**
 * 昼伏夜出
 * */
const DayNightAnalysis:React.FC<ComponentProps> = ({onChange,params,beginEndTime,devicesId})=>{
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    dataType: params.dataType || ['01'],
    rangeTime: params.rangeTime || beginEndTime,
    devicesId: params.devicesId || devicesId,
    backDuration:params.backDuration || 15,
    frontEndStartHour: params.frontEndStartHour,
    frontEndEndHour: params.frontEndEndHour,
    frontEndStartHourTwo: params.frontEndStartHourTwo,
    frontEndEndHourTwo: params.frontEndEndHourTwo,
    threshold: params.threshold || 0,
    thresholdTwo: params.thresholdTwo || 0,
  });

  const formDataOnChange = useCallback(
    async () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let startHour = null
      let endHour = null
      if (form.getFieldValue('frontEndStartHour')){
        startHour = dayjs(form.getFieldValue('frontEndStartHour')).format('HH:mm')
      }
      if (form.getFieldValue('frontEndEndHour')){
        endHour = dayjs(form.getFieldValue('frontEndEndHour')).format('HH:mm')
      }
      let startHourTwo = null
      let endHourTwo = null
      if (form.getFieldValue('frontEndStartHourTwo')){
        startHourTwo = dayjs(form.getFieldValue('frontEndStartHourTwo')).format('HH:mm')
      }
      if (form.getFieldValue('frontEndEndHourTwo')){
        endHourTwo = dayjs(form.getFieldValue('frontEndEndHourTwo')).format('HH:mm')
      }
      let devices = await formatDevices(form.getFieldValue('devicesId')) || [];
      setFormData({...form.getFieldsValue(), eventName: '昼伏夜出', type: '1',eventType:'24'})
      onChange && onChange({
        ...form.getFieldsValue(),
        eventName: '昼伏夜出',
        type: '1',
        eventType:'24',
        beginTime,
        endTime,
        startHour,
        endHour,
        startHourTwo,
        endHourTwo,
        devices
      })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      dataType: params.dataType || ['01'],
      rangeTime: params.rangeTime || beginEndTime,
      devicesId: params.devicesId || devicesId,
      backDuration:params.backDuration || 15,
      frontEndStartHour: params.frontEndStartHour || dayjs('06:00', 'HH:mm'),
      frontEndEndHour: params.frontEndEndHour || dayjs('22:00', 'HH:mm'),
      frontEndStartHourTwo: params.frontEndStartHourTwo || dayjs('22:00', 'HH:mm'),
      frontEndEndHourTwo: params.frontEndEndHourTwo || dayjs('06:00', 'HH:mm'),
      threshold: params.threshold || 30,
      thresholdTwo: params.thresholdTwo || 30,
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            昼伏夜出
          </Form.Item>
          <Form.Item label="数据类型" name="dataType" style={{marginBottom: '8px'}}>
            <Checkbox.Group onChange={formDataOnChange} value={formData.dataType}>
              <Checkbox value='01'>人脸</Checkbox>
              <Checkbox value='02'>车辆</Checkbox>
              {/* <Checkbox value='03'>侦码</Checkbox> */}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="回溯时长" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="backDuration" noStyle>
              <InputNumber size={"small"} style={{width: 160}} min={0}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天</span>
          </Form.Item>
          <Form.Item label="昼伏时段" style={{marginBottom: '8px',height:'34px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name='frontEndStartHour' className={styles.inputNumber}>
              <TimePicker format={'HH:mm'} size={"small"} placeholder={'开始时间'}/>
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item name='frontEndEndHour' className={styles.inputNumber}>
              <TimePicker format={'HH:mm'} size={"small"} placeholder={'结束时间'}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="昼伏阈值" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="threshold" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={0} max={100}/>
            </Form.Item>
            <span style={{marginLeft: '10px'}}>%</span>
          </Form.Item>
          <Form.Item label="夜出时段" style={{marginBottom: '8px',height:'34px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name='frontEndStartHourTwo' className={styles.inputNumber}>
              <TimePicker format={'HH:mm'} size={"small"} placeholder={'开始时间'}/>
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item name='frontEndEndHourTwo' className={styles.inputNumber}>
              <TimePicker format={'HH:mm'} size={"small"} placeholder={'结束时间'}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="夜出阈值" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="thresholdTwo" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={0} max={100}/>
            </Form.Item>
            <span style={{marginLeft: '10px'}}>%</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
/**
 * 团伙分析
 * */
const GangAnalysis:React.FC<ComponentProps> = ({onChange,params,beginEndTime})=>{
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    dataType: params.dataType || ['01','02','03'],
    threshold: params.threshold || 30,
    faceId: params.faceId || null, //人脸
    faceDataList: params.faceDataList || [],
    licensePlate: params.licensePlate || null,
    codeValue: params.codeValue
  });

  const formDataOnChange = useCallback(
    () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let faceId:any = []
      if (form.getFieldValue('faceDataList').length>0){
        for (let i = 0; i < form.getFieldValue('faceDataList').length; i++) {
          faceId.push(form.getFieldValue('faceDataList')[i].id)
        }
      }
      setFormData({...form.getFieldsValue(), eventName: '团伙分析', type: '1',eventType:'25'})
      onChange && onChange({
        ...form.getFieldsValue(),
        eventName: '团伙分析',
        type: '1',
        eventType:'25',
        faceId:faceId.join(','),
        beginTime,
        endTime})
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      dataType: params.dataType || ['01','02','03'],
      threshold: params.threshold || 30,
      faceId: params.faceId || null, //人脸
      faceDataList: params.faceDataList || [],
      licensePlate: params.licensePlate||null,
      codeValue: params.codeValue
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px',maxWidth:'430px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            团伙分析
          </Form.Item>
          <Form.Item label="数据类型" name="dataType" style={{marginBottom: '8px'}}>
            <Checkbox.Group onChange={formDataOnChange} value={formData.dataType}>
              <Checkbox value='01'>人脸</Checkbox>
              <Checkbox value='02'>车辆</Checkbox>
              {/*<Checkbox value='03'>侦码</Checkbox>*/}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          {formData.dataType.includes('01') && <Form.Item label="分析人脸" name="faceDataList" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <UploadImg uploadImgFn={doUploadFile} maxCount={100}/>
          </Form.Item>}
          {formData.dataType.includes('02') &&<Form.Item name="licensePlate" label="分析车辆" style={{marginBottom: '8px'}}>
            <Input size={"small"} placeholder='请输入车牌号,多个以英文逗号隔开'/>
          </Form.Item>}
         {/* <Form.Item name="codeValue" label="分析号码" style={{marginBottom: '8px'}}>
            <Input size={"small"} placeholder='请输入IMSI,多个以英文逗号隔开'/>
          </Form.Item>*/}
          <Form.Item label="共轨阈值" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="threshold" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={1} max={100}/>
            </Form.Item>
            <span style={{marginLeft: '10px'}}>%</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/*套牌车分析*/
const CloneCarAnalysis:React.FC<ComponentProps> = ({onChange,params,beginEndTime,devicesId})=>{
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    analyzeType: params.analyzeType || '01',
    devicesId: params.devicesId || '',
    licensePlate: params.licensePlate || null,
    backDuration: params.backDuration || 0
  });

  const formDataOnChange = useCallback(
    async() => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let devices = await formatDevices(form.getFieldValue('devicesId')) || [];
      setFormData({...form.getFieldsValue(), eventName: '套牌车分析', type: '1',eventType:'26'})
      onChange && onChange({...form.getFieldsValue(), eventName: '套牌车分析', type: '1',eventType:'26', beginTime, endTime,devices})
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      analyzeType: params.analyzeType || '01',
      devicesId: params.devicesId || devicesId,
      licensePlate: params.licensePlate || '',
      backDuration: params.backDuration || 3
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            套牌车分析
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="分析方式" rules={[{required: true}]} name="analyzeType" style={{marginBottom: '8px'}}>
            <Radio.Group value={formData.analyzeType}>
              <Radio value='01'>批量分析</Radio>
              <Radio value='02'>指定车分析</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.analyzeType==='01' && <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>}
          {formData.analyzeType==='02' && <Form.Item label="分析车辆" name="licensePlate" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <Input placeholder="请输入一个车牌号" size={"small"}/>
          </Form.Item>}
          <Form.Item label="回溯时长" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="backDuration" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={0} max={30}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**
 * 首次出现
 * */
const AppearFirst:React.FC<ComponentProps> = ({onChange,params,beginEndTime,devicesId})=>{
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    devicesId: params.devicesId || devicesId,
    dataType: params.dataType || ['01'],
    backDuration: params.backDuration || 0
  });

  const formDataOnChange = useCallback(
    async () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let devices = await formatDevices(form.getFieldValue('devicesId')) || [];
      setFormData({...form.getFieldsValue(), eventName: '首次出现', type: '1',eventType:'27'})
      onChange && onChange({...form.getFieldsValue(), eventName: '首次出现', type: '1',eventType:'27', beginTime, endTime,devices})
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      devicesId: params.devicesId || devicesId,
      dataType: params.dataType || ['01'],
      backDuration: params.backDuration || 3
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            首次出现
          </Form.Item>
          <Form.Item label="数据类型" name="dataType" style={{marginBottom: '8px'}}>
            <Checkbox.Group onChange={formDataOnChange} value={formData.dataType}>
              <Checkbox value='01'>人脸</Checkbox>
              <Checkbox value='02'>车辆</Checkbox>
              {/* <Checkbox value='03'>侦码</Checkbox> */}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="回溯时长" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="backDuration" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={1}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**徘徊分析*/
const LingerAnalysis:React.FC<ComponentProps> = ({onChange,params,beginEndTime,devicesId})=>{
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    devicesId: params.devicesId || devicesId,
    dataType: params.dataType || ['01'],
    threshold: params.threshold || 1,
    analyzeType: params.analyzeType || '03',
    dailyFrequency: params.dailyFrequency || [3,10],
    dailyFrequency1: (params.dailyFrequency && params.dailyFrequency[0]) || 3,
    dailyFrequency2: (params.dailyFrequency && params.dailyFrequency[1]) || 10,
  });

  //5.出现天数：必填项，默认1天，可设置大于等于1小于等于选中的时间天数的值；
  const [thresholdMax, setThresholdMax] = useState(()=>{
    if (formData.rangeTime){
      let startDay = dayjs(formData.rangeTime[0]).format('YYYY-MM-DD HH:mm')
      let endDay = dayjs(formData.rangeTime[1]).format('YYYY-MM-DD HH:mm')
      //计算两个时间直接的天数差
      let diff = dayjs(startDay).diff(endDay, 'day')
      if (diff>0){
        return diff
      }else {
        return 1
      }
    }
  });

  const formDataOnChange = useCallback(
    async () => {
      //下限需小于等于上限
      if (form.getFieldValue('dailyFrequency2') && form.getFieldValue('dailyFrequency1')>form.getFieldValue('dailyFrequency2')){
        form.setFieldValue('dailyFrequency1',form.getFieldValue('dailyFrequency2'))
      }
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      //出现天数的最大值限定
      if (beginTime && endTime){
        let diff = dayjs(endTime).diff(beginTime,'day')
        setThresholdMax(diff)
      }
      let dailyFrequency = [form.getFieldValue('dailyFrequency1'),form.getFieldValue('dailyFrequency2')]
      let devices = await formatDevices(form.getFieldValue('devicesId')) || [];
      setFormData({...form.getFieldsValue(), eventName: '徘徊分析', type: '1',eventType:'28'})
      onChange && onChange({
        ...form.getFieldsValue(),
        eventName: '徘徊分析',
        type: '1',
        eventType:'28',
        beginTime,
        endTime,
        dailyFrequency,
        devices
      })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      devicesId: params.devicesId || devicesId,
      dataType: params.dataType || ['01'],
      threshold: params.threshold || 1,
      analyzeType: params.analyzeType || '03',
      dailyFrequency: params.dailyFrequency || [3,10],
      dailyFrequency1: (params.dailyFrequency && params.dailyFrequency[0]) || 3,
      dailyFrequency2: (params.dailyFrequency && params.dailyFrequency[1]) || 10,
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            徘徊分析
          </Form.Item>
          <Form.Item label="数据类型" name="dataType" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <Checkbox.Group onChange={formDataOnChange} value={formData.dataType}>
              <Checkbox value='01'>人脸</Checkbox>
              <Checkbox value='02'>车辆</Checkbox>
              {/* <Checkbox value='03'>侦码</Checkbox> */}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="徘徊方式" name="analyzeType" rules={[{required: true}]} style={{marginBottom: '8px'}}>
            <Radio.Group onChange={formDataOnChange} value={formData.analyzeType}>
              <Radio value='03'>点位徘徊
                <Tooltip title="点位徘徊是指每个点位独立分析徘徊数据">
                  <QuestionCircleOutlined className={styles.question}/>
                </Tooltip>
              </Radio>
              <Radio value='04'>场所徘徊
                <Tooltip title="场所徘徊是指所有点位统一分析徘徊数据">
                  <QuestionCircleOutlined className={styles.question}/>
                </Tooltip>
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="出现天数" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="threshold" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={1} max={thresholdMax}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天</span>
          </Form.Item>
          <Form.Item label="每天频次" style={{marginBottom: '8px',height:'34px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name='dailyFrequency1' className={styles.inputNumber}>
              <InputNumber
                size={"small"}
                value={formData.dailyFrequency1}
                min={1}
                max={_.isEmpty(!formData.dailyFrequency2 && formData.dailyFrequency2>0) ? formData.dailyFrequency2 : Number.MAX_SAFE_INTEGER}
                style={{width:96}}/>
            </Form.Item>
            <Form.Item className={styles.inputNumberSplit}>--</Form.Item>
            <Form.Item name='dailyFrequency2' className={styles.inputNumber}>
              <InputNumber size={"small"} value={formData.dailyFrequency2} min={1} style={{width:96}}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>次</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/**常住人口*/
const PermanentPopulation:React.FC<ComponentProps> = ({onChange,params,beginEndTime,devicesId})=>{
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    devicesId: params.devicesId || devicesId,
    dataType: params.dataType || ['01'],
    backDuration: params.backDuration || 30,
    threshold: params.threshold || 20,
    thresholdTwo: params.thresholdTwo || 3,
  });

  const formDataOnChange = useCallback(
    async () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let devices = await formatDevices(form.getFieldValue('devicesId')) || [];
      setFormData({...form.getFieldsValue(), eventName: '常住人口', type: '1',eventType:'29'})
      onChange && onChange({...form.getFieldsValue(), eventName: '常住人口', type: '1',eventType:'29', beginTime, endTime,devices})
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      devicesId: params.devicesId || devicesId,
      dataType: params.dataType || ['01'],
      backDuration: params.backDuration || 30,
      threshold: params.threshold || 20,
      thresholdTwo: params.thresholdTwo || 3,
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            常住人口
          </Form.Item>
          <Form.Item label="数据类型" name="dataType" style={{marginBottom: '8px'}}>
            <Checkbox.Group onChange={formDataOnChange} value={formData.dataType}>
              <Checkbox value='01'>人脸</Checkbox>
              <Checkbox value='02'>车辆</Checkbox>
              {/* <Checkbox value='03'>侦码</Checkbox> */}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="每月出现" style={{marginBottom: '8px'}}>
            <Form.Item name="threshold" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={1}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天以上</span>
          </Form.Item>
          <Form.Item label="每天出现" style={{marginBottom: '8px'}}>
            <Form.Item name="thresholdTwo" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={1}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>次以上</span>
          </Form.Item>
          <Form.Item label="回溯时长" style={{marginBottom: '8px'}}>
            <Form.Item name="backDuration" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={0} max={90}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

/*流动人口*/
const FlowPopulation:React.FC<ComponentProps> = ({onChange,params,beginEndTime,devicesId})=>{
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    rangeTime: params.rangeTime || beginEndTime,
    devicesId: params.devicesId || devicesId,
    dataType: params.dataType || ['01'],
    backDuration: params.backDuration || 30,
    threshold: params.threshold || 20
  });

  const formDataOnChange = useCallback(
    async () => {
      let beginTime = null
      let endTime = null
      if (form.getFieldValue('rangeTime')){
        beginTime = dayjs(form.getFieldValue('rangeTime')[0]).format('YYYY-MM-DD HH:mm')
        endTime = dayjs(form.getFieldValue('rangeTime')[1]).format('YYYY-MM-DD HH:mm')
      }
      let devices = await formatDevices(form.getFieldValue('devicesId')) || [];
      setFormData({
        ...form.getFieldsValue(),
        eventName: '流动人口',
        type: '1',
        eventType:'30'
      })
      onChange && onChange({
        ...form.getFieldsValue(),
        eventName: '流动人口',
        type: '1',
        eventType:'30',
        beginTime,
        endTime,
        devices
      })
    },
    [onChange, form],
  );

  useEffect(() => {
    form.setFieldsValue({
      rangeTime: params.rangeTime || beginEndTime,
      devicesId: params.devicesId || devicesId,
      dataType: params.dataType || ['01'],
      backDuration: params.backDuration || 30,
      threshold: params.threshold || 20,
    })
    //初始化需要给节点默认值
    formDataOnChange()
  }, [form, params, formDataOnChange,beginEndTime,devicesId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            流动人口
          </Form.Item>
          <Form.Item label="数据类型" name="dataType" style={{marginBottom: '8px'}}>
            <Checkbox.Group onChange={formDataOnChange} value={formData.dataType}>
              <Checkbox value='01'>人脸</Checkbox>
              <Checkbox value='02'>车辆</Checkbox>
              {/* <Checkbox value='03'>侦码</Checkbox> */}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="时间" name="rangeTime" style={{marginBottom: '8px', width: '364px'}}>
            <RangePicker size={'small'} value={formData.rangeTime} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
          </Form.Item>
          <Form.Item label="点位" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-52px'}}>*</div>
            <Form.Item name="devicesId" noStyle>
              <SelectPointMap value={formData.devicesId}/>
            </Form.Item>
          </Form.Item>
          <Form.Item label="每月出现" style={{marginBottom: '8px'}}>
            <Form.Item name="threshold" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={0}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天以上</span>
          </Form.Item>
          <Form.Item label="回溯时长" style={{marginBottom: '8px'}}>
            <Form.Item name="backDuration" noStyle>
              <InputNumber size={"small"} style={{width: 160}}  min={0}/>
            </Form.Item>
            <span className={styles.paramsName} style={{marginLeft: '10px'}}>天</span>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

//线索目标
const ClueTarget:React.FC<ComponentProps> = ({onChange,params})=>{

  const [formData, setFormData] = useState(()=>{
    const _formData = {
      eventName:'线索目标',
      type:'1',
      eventType:'16',
      clueInfo:[]
    }
    onChange && onChange(_formData)
    return _formData
  });

  useEffect(() => {
    if (params.clueInfo){
      setFormData((val:any)=>{
        const _formData = {
          ...val,
          clueInfo:params.clueInfo
        }
        onChange && onChange(_formData)
        return _formData
      })
    }
  }, [params,onChange]);


  function handleGetInfo(info:any){
    setFormData((val:any)=>{
      const _formData = {
        ...val,
        clueInfo:info
      }
      onChange && onChange(_formData)
      return _formData
    })
  }

  /*线索管理*/
  function openClueManage() {
    popup(<ClueManage onChange={handleGetInfo} defaultChoosenClue={formData.clueInfo} objType={2} />,
      { title: '线索管理',
        size:'large'
      })
  }
  return<div className={styles.wrapper}>
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
        {clueContentDict.map((item:any,index:any)=>{
          return <div key={index}>
            <ClueTags choosenClue={formData.clueInfo} type={item.value}/>
            {/*{filterClueType(formData.clueInfo,item.value).length>0 && <span className={styles.clueTargetAdd} onClick={openClueManage}>添加</span>}*/}
          </div>
        })}
      </div>
    </div>
  </div>
}


interface ClueTagsProps{
  choosenClue: any,
  type: any,
}

const ClueTags:React.FC<ClueTagsProps> = ({choosenClue,type})=>{
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
 * 交集运算*/
const WithCount: React.FC<ComponentProps> = ({onChange, params}) => {
  const [form] = Form.useForm();
  const [formData,setFormData] = useState({
    threshold: params.threshold || 1,
  });

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({...form.getFieldsValue(),eventName:'交集运算',type:'2',eventType:'14'})
      setFormData({...form.getFieldsValue(),eventName:'交集运算',type:'2',eventType:'14'})
    },
    [onChange,form],
  );

  useEffect(() => {
    form.setFieldsValue({
      threshold: params.threshold || 1,
    })
    formDataOnChange()
  }, [form, params,formDataOnChange]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 5}}
          wrapperCol={{span: 19}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            交集运算
          </Form.Item>
          <Form.Item label="阈值" style={{marginBottom: '8px'}}>
            <div className={styles.redFlag} style={{left: '-78px'}}>*</div>
            <Form.Item name="threshold" noStyle>
              <InputNumber size={"small"} style={{width: 160}} value={formData.threshold} min={2}/>
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
const OrCount: React.FC<ComponentProps> = ({onChange}) => {
  const [form] = Form.useForm();

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({...form.getFieldsValue(),eventName:'并集运算',type:'2',eventType:'15'})
    },
    [onChange,form],
  );

  useEffect(() => {
    formDataOnChange()
  }, [formDataOnChange]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 6}}
          wrapperCol={{span: 18}}
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
const DiffCount:React.FC<ComponentProps> = ({onChange,params})=>{
  const [form] = Form.useForm();
  const [formData,setFormData] = useState({
    differType: params.differType || 1,
  });

  const formDataOnChange = useCallback(
    () => {
      onChange && onChange({...form.getFieldsValue(),eventName:'差集运算',type:'2',eventType:'17'})
      setFormData({...form.getFieldsValue(),eventName:'差集运算',type:'2',eventType:'17'})
    },
    [onChange,form],
  );

  useEffect(() => {
    form.setFieldsValue({
      differType: params.differType || 1,
    })
    formDataOnChange()
  }, [formDataOnChange,form,params]);

  return (
    <div className={styles.wrapper} style={{width:'400px'}}>
      <p className={styles.title}>条件参数</p>
      <div style={{padding: '0 10px'}}>
        <Form
          form={form}
          labelCol={{span: 6}}
          wrapperCol={{span: 18}}
          autoComplete="off"
          onFieldsChange={formDataOnChange}
        >
          <Form.Item label="条件名称" className={styles.paramsName}>
            差集运算
          </Form.Item>
          <Form.Item label="求差方式" name="differType" style={{marginBottom: '8px'}}>
            <Radio.Group onChange={formDataOnChange} value={formData.differType}>
              <Radio value={1}>{'A-B'}</Radio>
              <Radio value={2}>{'(A-B)+(B-A)'}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="说明" className={styles.paramsName}>
            {formData.differType===1? '只保留第一个条件的差集' :'保留所有条件的差集，即所有条件只满足其中一个的结果'}
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}


const PeopleCarConditionItems: React.FC<Props> = ({onChange, params, paramsType,beginEndTime,devicesId}) => {
  function handlerChange(val: any) {
    onChange && onChange({
      ...params,
      ...val
    })
  }

  let result = null;
  switch (paramsType) {
    /**碰撞分析*/
    case 'knockAnalysis':
      result = <KnockAnalysis beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**伴随分析*/
    case 'followAnalysis':
      result = <FollowAnalysis beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**昼伏夜出*/
    case 'dayNightAnalysis':
      result = <DayNightAnalysis beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**团伙分析*/
    case 'gangAnalysis':
      result = <GangAnalysis beginEndTime={beginEndTime} onChange={handlerChange} params={params}/>
      break;
    /**套牌车分析*/
    case 'cloneCarAnalysis':
      result = <CloneCarAnalysis beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**首次出现*/
    case 'appearFirst':
      result = <AppearFirst beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**徘徊分析*/
    case 'lingerAnalysis':
      result = <LingerAnalysis beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**常住人口*/
    case 'permanentPopulation':
      result = <PermanentPopulation beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**流动人口*/
    case 'flowPopulation':
      result = <FlowPopulation beginEndTime={beginEndTime} devicesId={devicesId} onChange={handlerChange} params={params}/>
      break;
    /**线索目标*/
    case 'clueTarget':
      result = <ClueTarget onChange={handlerChange} params={params}/>
      break;
    /**交集运算*/
    case 'withCount':
      result = <WithCount onChange={handlerChange} params={params}/>
      break;
    /**并集运算*/
    case 'orCount':
      result = <OrCount onChange={handlerChange} params={params}/>
      break;
    /**差集运算*/
    case 'diffCount':
      result = <DiffCount onChange={handlerChange} params={params}/>
      break;
  }
  return result
}
export default PeopleCarConditionItems
