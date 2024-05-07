import {Button, Form, DatePicker, Select,Pagination,Upload,Row,Col,Image} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from './index.module.sass'
const HumanData: React.FC = () => {
    console.debug('HumanData')
    const { RangePicker } = DatePicker;
    const [form] = Form.useForm();
    const selectOption=[
        {id: 0,label:'测试1',value:1},
        {id: 1,label:'测试2',value:2},
        {id: 2,label:'测试3',value:3}
    ]
    const faceCont = [
        {id: 0,addr:"深圳"},
        {id: 0,addr:"深圳"},
        {id: 0,addr:"深圳"},
        {id: 0,addr:"深圳"},
        {id: 0,addr:"深圳"},
        {id: 0,addr:"深圳"},
        {id: 0,addr:"深圳"},
        {id: 0,addr:"深圳"}
    ]

    return (
        <article >
           <Form style={{marginTop:10}} form={form} >
                <Row>
                    <Col span={4}>
                        <Form.Item label="点位" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                            <Button size={'small'} type={"primary"}>地图选择</Button>
                        </Form.Item>
                    </Col>
                    <Col span={7}>
                        <Form.Item label="时间范围" name='customTime' >
                            <RangePicker showTime/>
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="照片">
                            <Upload listType="picture-card">
                                <div>
                                    <PlusOutlined/>
                                    <div style={{marginTop:8}}>上传</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="上衣颜色" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="上衣类型" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    
                    <Col span={3}>
                        <Form.Item label="下装颜色" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="下装类型" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="目标方向" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="目标大小" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="发型" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="骑车" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="戴口罩" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={3}>
                        <Form.Item label="年龄段" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="性别" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="戴眼镜" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="戴帽子" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="背包" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="拎东西" name="device" >
                            <Select style={{width:120}} options={selectOption}></Select>
                        </Form.Item>
                    </Col>
                    
                    <Col span={5}>
                        <Form.Item>
                            <Button type={"primary"} htmlType="submit">查询</Button>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
            <div className={styles.bottoms}>
                {faceCont.map((item:any)=>{
                    return (
                        <div className={styles.contents} >
                            <p>
                            <Image height={100} width={100}/>
                            </p>
                            <div>
                                <p></p>
                                <p>地址：{item.addr}</p>
                                <p>2022-10-10 12:00:00</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            <Pagination className={styles.pages} defaultCurrent={1} total={50} showQuickJumper/>
        </article>
    )
}

export default HumanData