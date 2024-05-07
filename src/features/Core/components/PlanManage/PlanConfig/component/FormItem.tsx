import React, {useState} from "react";
import styles from "../index.module.sass";
import {Button, Checkbox, Form, Input, InputNumber, Radio, Select} from "antd";
import {planDealMethods} from "../../../../../../helper/dictionary";
import TextArea from "antd/es/input/TextArea";
import {CloseOutlined} from "@ant-design/icons";

/**
 {value:0,name:"视频跟拍"},
 {value:1,name:"无人机跟拍"},
 {value:2,name:"喇叭喊话"},
 {value:3,name:"探照灯跟踪"},
 {value:4,name:"无人船抵近"},
 {value:5,name:"派遣警力"},
 {value:6,name:"派遣专业队"},
 * */
//动态表单item
interface FormItemProps {
  /*上一步，下一步，步骤数据*/
  stepItem: any
  index: number
  defaultData?: any
  //添加处理
  addMethod?: Function
  //删除手动添加的处理方式
  removeMethod?: Function
  //隐藏主体处理方式
  hideMainMethod?: Function
}

const FormItem:React.FC<FormItemProps> = ({
                                            stepItem,
                                            index,
                                            defaultData,
                                            addMethod,
                                            removeMethod,
                                            hideMainMethod
                                          })=>{
  //formItem默认值
  const [formItemInitialValue, setFormItemInitialValue] = useState<any>(() => {
    if (defaultData) {
      return defaultData
    } else {
      return {
        id: stepItem.id,
        eventId: stepItem.eventId, //事件ID
        eventName: stepItem.eventName,//事件名称
        isAddManually: stepItem.isAddManually,//自定义字段，用于判断是否手动添加的
        typeId: '1',
        followTypeId: '1', //跟踪方式
        followLastTime: 10,//跟踪时长
        trumpetContent: '',//广播内容
        trumpetNum: 3, //广播次数
        selectIds: [1], //专业队
        teamNote: '' //专业队说明
      }
    }
  });

  //处理方式切换
  function handleChange(typeId: any) {
    setFormItemInitialValue((val: any) => {
      return {
        ...val,
        typeId: typeId
      }
    })
  }

  //添加处理方式
  function addMethodHandler(){
    addMethod && addMethod(index)
  }

  //删除处理方式
  function removeMethodHandler(){
    removeMethod && removeMethod(index)
  }
  //删除主处理方式
  function removeMainHandler(){
    hideMainMethod && hideMainMethod(index)
  }

  return <div className={`${styles.formItemWrapper} ${stepItem.isAddManually? styles.formItemBg:''}`}>
    {!stepItem.isAddManually && <div className={styles.title}>
        <span className={styles.eventName}>{stepItem.eventName}</span>
        <Button type={"link"} onClick={addMethodHandler}>+添加处理</Button>
    </div>}
    <Form.Item className={styles.hiddenItem} name={['stepItem', index, 'eventId']} initialValue={formItemInitialValue.eventId}>
      <Input/>
    </Form.Item>
    <Form.Item className={styles.hiddenItem} name={['stepItem', index, 'id']} initialValue={formItemInitialValue.id}>
      <Input/>
    </Form.Item>
    <Form.Item className={styles.hiddenItem} name={['stepItem', index, 'isAddManually']} initialValue={formItemInitialValue.isAddManually}>
      <Input/>
    </Form.Item>
    <Form.Item className={styles.hiddenItem} name={['stepItem', index, 'eventName']} initialValue={formItemInitialValue.eventName}>
      <Input/>
    </Form.Item>
    {(stepItem.isShow!==false) && <div style={{paddingRight:'30px',position:'relative'}}>
      {stepItem.isAddManually &&<Button className={styles.closeButton} type="text" icon={<CloseOutlined />} onClick={removeMethodHandler} />}
      {/*非手动添加的，右上角的删除*/}
      {!stepItem.isAddManually &&<Button className={styles.closeButton} type="text" icon={<CloseOutlined />} onClick={removeMainHandler} />}
      <Form.Item
        label="处理方式"
        name={['stepItem', index, 'typeId']}
        className={styles.formItem}
        initialValue={formItemInitialValue.typeId}
      >
        <Select
          options={planDealMethods}
          onChange={(val) => handleChange(val)}
        />
      </Form.Item>
      {/*视频跟拍，探照灯跟踪*/}
      {(formItemInitialValue.typeId === '1' || formItemInitialValue.typeId === '4') && <>
          <Form.Item
              label="跟踪方式"
              name={['stepItem', index, 'followTypeId']}
              className={styles.formItem}
              initialValue={formItemInitialValue.followTypeId}
          >
              <Radio.Group>
                  <Radio value={'1'}>持续跟踪</Radio>
                  <Radio value={'2'}>短暂跟踪</Radio>
              </Radio.Group>
          </Form.Item>
          <Form.Item label="跟踪时长" className={styles.formItem}>
              <Form.Item
                  name={['stepItem', index, 'followLastTime']}
                  noStyle
                  initialValue={formItemInitialValue.followLastTime}
              >
                  <InputNumber style={{width: 160}} min={0}/>
              </Form.Item>
              <span className={styles.afterFont}>秒</span>
          </Form.Item>
      </>}

      {/*无人机跟拍*/}
      {/* {typeId === 2 && <>
        <Form.Item
            label="无人机"
            name={['stepItem', index, 'plane']}
            initialValue={formItemInitialValue.plane}
            className={styles.formItem}
        >
            <Select>
                <Option value={0}>就近选择</Option>
                <Option value={1}>1号无人机</Option>
                <Option value={2}>2号无人机</Option>
                <Option value={3}>3号无人机</Option>
            </Select>
        </Form.Item>
    </>}*/}

      {/*喇叭喊话*/}
      {formItemInitialValue.typeId === '3' && <>
          <Form.Item
              label="广播内容"
              className={styles.formItem}
              name={['stepItem', index, 'trumpetContent']}
              initialValue={formItemInitialValue.trumpetContent}
          >
              <TextArea placeholder='广播内容'/>
          </Form.Item>
          <Form.Item label="广播次数" className={styles.formItem}>
              <Form.Item
                  name={['stepItem', index, 'trumpetNum']}
                  initialValue={formItemInitialValue.trumpetNum}
                  noStyle
              >
                  <InputNumber min={0}/>
              </Form.Item>
              <span className={styles.afterFont}>次</span>
          </Form.Item>
      </>}

      {/*无人船*/}
      {/* {typeId === 5 && <>
        <Form.Item
            label="无人船"
            name={['stepItem', index, 'boat']}
            className={styles.formItem}
            initialValue={formItemInitialValue.boat}
        >
            <Select>
                <Option value={0}>就近选择</Option>
                <Option value={1}>1号无人船</Option>
                <Option value={2}>2号无人船</Option>
                <Option value={3}>3号无人船</Option>
            </Select>
        </Form.Item>
    </>}*/}

      {/*警力派遣*/}
      {/*{typeId === 6 && <>
        <Form.Item
            label="民警"
            name={['stepItem', index, 'police']}
            className={styles.formItem}
            initialValue={formItemInitialValue.police}
        >
            <Select style={{width: '200px'}} allowClear>
                <Option value={0}>就近选择</Option>
                <Option value={1}>张三</Option>
                <Option value={2}>李四</Option>
                <Option value={3}>王五</Option>
            </Select>
        </Form.Item>
        <Form.Item label="人数" className={styles.formItem}>
            <Form.Item
                name={['stepItem', index, 'policeNum']}
                noStyle
                initialValue={formItemInitialValue.manCount}
            >
                <InputNumber min={0}/>
            </Form.Item>
            <span className={styles.afterFont}>人</span>
        </Form.Item>
    </>}*/}

      {/*派遣专业队*/}
      {formItemInitialValue.typeId === '7' && <>
          <Form.Item
              label="专业队"
              name={['stepItem', index, 'selectIds']}
              className={styles.formItem}
              initialValue={formItemInitialValue.selectIds}
          >
              <Checkbox.Group>
                  <Checkbox value={1}>医疗专业队</Checkbox>
                  <Checkbox value={2}>消防专业队</Checkbox>
                  <Checkbox value={3}>环保专业队</Checkbox>
              </Checkbox.Group>
          </Form.Item>
          <Form.Item
              label="说明"
              name={['stepItem', index, 'teamNote']}
              initialValue={formItemInitialValue.teamNote}
          >
              <TextArea placeholder='说明'/>
          </Form.Item>
      </>}
    </div>}

  </div>
}

export default FormItem
