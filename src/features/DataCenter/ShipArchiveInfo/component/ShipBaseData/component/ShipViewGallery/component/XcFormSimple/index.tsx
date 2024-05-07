
import { Button, DatePicker, Form } from "antd";
import styles from "./index.module.sass";

const { RangePicker } = DatePicker;

// enum ColStyle {
//   md = 24,
//   lg = 12
// }
// type LayoutType = Parameters<typeof Form>[0]['layout'];


interface XcFormProps {
  getForm?: any
  option?: any
  onChange?:any
}


const XcFormSimple: React.FC<XcFormProps> = (props: any) => {
  console.debug('XcFormSimple')

  const [form] = Form.useForm();//FORM的实例

  // const [formData, setFormData] = useState({
  //   returnTime: 'lastHour',
  //   trackType: ['ais'],
  // });

  // const [formLayout, setFormLayout] = useState<LayoutType>('horizontal');

  const formLayout= 'horizontal'
  const buttonItemLayout =
    formLayout === 'horizontal'
      ? {
        wrapperCol: { span: 14, offset: 4 },
      }
      : null;



  function getFormValue() {
    //收集表单数据
    console.log(form.getFieldsValue())
    if (props.getForm) {
      props.getForm(form.getFieldsValue())
    }
  }

  return (
    <div className={styles.wrapper}>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        layout="inline">
        <Form.Item name='customTime' className={styles.customTime}>
          <RangePicker showTime className={styles.customRangePicker} />
        </Form.Item>

        <Form.Item {...buttonItemLayout}>
          <Button type={"primary"} htmlType="submit" onClick={getFormValue}>查看</Button>
        </Form.Item>
      </Form>
    </div>
  )
}


export default XcFormSimple