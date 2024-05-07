import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Radio, Space, Input, Row, Col } from "antd"
import TextArea from "antd/lib/input/TextArea";
import { caseProgressTypeDict } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import TextSimple from "hooks/basis/TextSimple";
import UploadImg from "hooks/basis/UploadImg";
import { UseType } from "hooks/flexibility/FormPanel";
import { useEffect, useState } from "react";
import { doUploadFile } from "server/common";
import { addEditCaseProgressItem } from "server/dataCenter/caseArchive";
import styles from "./index.module.sass";
import './index.sass';

type ID = any;

interface ClueEvidence {
  type: string
  id: number
  content: string
  image: any[]
}

interface Props {
  /** 案件档案id */
  caseId: number
  /** 展示详情时，数据请求所使用的ID */
  id?: ID
  /** 传入id时，需要调用的数据返回异步函数 */
  getRequest?: (id: ID) => Promise<any>
  /** 显示类型 */
  useType?: UseType,
  /** 判断是否已结案 */
  setShowBtn?: Function
  /** 新增编辑后更新页面 */
  resetForm?: Function
  /** 关闭弹窗 */
  onClosePopup?: Function
}

const CaseProgressDetail: React.FC<Props> = ({ caseId, id, getRequest, useType, setShowBtn, onClosePopup, resetForm }) => {
  console.debug('CaseProgressDetail')

  const [form] = Form.useForm();

  const [clueEvidenceList, setClueEvidenceList] = useState<ClueEvidence[]>([
    // { type: '0', id: new Date().getTime(), content: '', image: [] },
  ])

  const [initData, setInitData] = useState<any>()

  useEffect(() => {
    async function main() {
      if (id && getRequest) {
        const vo = await getRequest(id)
        const clueEvidenceList = vo?.caseClueList || []
        const caseProgress = vo?.caseProgress || {}
        setClueEvidenceList(clueEvidenceList)
        setInitData({
          typeName: caseProgress.typeName || '--',
          type: caseProgress.type || '',
          content: caseProgress.content || '--',
          clueEvidenceList: clueEvidenceList
        })
        // 解决点击左侧，右侧不变化的问题
        form.setFieldsValue({
          typeName: caseProgress.typeName || '--',
          type: caseProgress.type || '',
          content: caseProgress.content || '--',
          clueEvidenceList: clueEvidenceList
        })
        setShowBtn && setShowBtn(caseProgress.type !== '1')
      }
    }
    main()
  }, [id, getRequest, setShowBtn, form])

  function add(type: string) {
    return setClueEvidenceList(() => {
      const { clueEvidenceList } = form?.getFieldsValue()
      form.setFieldsValue({ "clueEvidenceList": [{ type, id: new Date().getTime(), content: '', image: [] }, ...clueEvidenceList || []] })
      return [{ type, id: new Date().getTime(), content: '', image: [] }, ...clueEvidenceList || []]
    })
  }

  function remove(index: number) {
    return setClueEvidenceList(() => {
      const { clueEvidenceList } = form?.getFieldsValue()
      const list = clueEvidenceList || []
      form.setFieldsValue({ "clueEvidenceList": [...list.slice(0, index), ...list.slice(index + 1)] })
      return [...list.slice(0, index), ...list.slice(index + 1)]
    })
  }

  function getTitle(type: string) {
    let result: any
    switch (type) {
      case '0':
        result = '线索'
        break;
      case '1':
        result = '证据'
        break;
      default:
        break;
    }
    return result
  }

  function getLabel(type: string, id: number) {
    const data = clueEvidenceList.filter((item: any) => item.type === type)
    const index = data.findIndex((item: any) => item.id === id)
    return `${getTitle(type)}${data.length - index}`
  }

  const onChange = (index: number, name: string, event: any) => {
    let tempArray = [...clueEvidenceList];
    if (name === 'content')
      tempArray[index] = { ...tempArray[index], content: event.target.value }
    else
      tempArray[index] = { ...tempArray[index], image: event }
    return setClueEvidenceList(tempArray)
  }

  async function handleOnFinish() {
    const result = await form.validateFields()
    await addEditCaseProgressItem({ ...result, id, caseId })
    onClosePopup && onClosePopup()
    resetForm && resetForm('')
    setTimeout(() => {
      resetForm && resetForm(caseId)
    }, 100)
  };

  const clueEvidenceItems = clueEvidenceList.map((item, index) => {
    return <section key={item.id}>
      <Row>
        <Col span={2}></Col>
        <Col span={18}>
          <div className={styles.label}>{getLabel(item.type, item.id)}</div>
        </Col>
      </Row>
      <Form.Item
        labelCol={{ span: 3 }}
        name={['clueEvidenceList', index, 'type']}
        style={{ display: 'none' }}
      >
        <Input />
      </Form.Item>
      <Form.Item
        labelCol={{ span: 3 }}
        name={['clueEvidenceList', index, 'id']}
        style={{ display: 'none' }}
      >
      </Form.Item>
      <div className={`${styles.box} ${styles.formItem}`}>
        <div className={styles.content}>
          <Form.Item
            label={`${getTitle(item.type)}说明`}
            name={['clueEvidenceList', index, 'content']}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
          >
            {useType === UseType.show ? <TextSimple /> : <TextArea rows={4} placeholder="请输入证据说明" maxLength={1000} onChange={(event) => onChange(index, 'content', event)} />}
          </Form.Item>
          <Form.Item
            label="照片"
            name={['clueEvidenceList', index, 'image']}
          >
            {useType === UseType.show ? <div className={styles.imageBox}>
              {
                clueEvidenceList[index]?.image.map((src, index) => {
                  return <div key={index} className={styles.image}>
                    <ImageSimple src={src} width={'100%'} height={'100%'} />
                  </div>
                })
              }
            </div> :
              <UploadImg uploadImgFn={doUploadFile} useType={useType} maxCount={10} />
            }
          </Form.Item>
        </div>
        {useType !== UseType.show &&
          <div className={styles.icon}>
            <MinusCircleOutlined onClick={() => remove(index)} />
          </div>
        }
      </div>
    </section>
  })

  return (
    useType === UseType.add || initData ?
      <div className={styles.wrapper}>
        <Form
          name="user_form"
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 20 }}
          autoComplete="off"
          initialValues={initData}
          className={`${styles.forms} CaseProgressDetail__Form`}
        >
          {
            useType !== UseType.show &&
            <Form.Item name="type" className={styles.labels} label="进展类型" rules={[{ required: true, message: '请选择进展类型' }]}>
              <Radio.Group>
                {caseProgressTypeDict.map(item =>
                  <Radio key={item.value} value={item.value}>{item.name}</Radio>
                )}
              </Radio.Group>
            </Form.Item>
          }
          {
            useType === UseType.show &&
            <Form.Item name="typeName" label="进展类型" rules={[{ required: true, message: '请选择进展类型' }]}>
              <TextSimple />
            </Form.Item>
          }
          <Form.Item name="content" label="进展内容" rules={[{ required: true, message: '请输入进展内容' }]}>
            {useType === UseType.show ? <TextSimple /> : <TextArea rows={4} placeholder="请输入进展内容" maxLength={1000} />}
          </Form.Item>
          {useType !== UseType.show &&
            <Form.Item>
              <Row>
                <Col span={4}></Col>
                <Col span={18}>
                  <Space>
                    <Button onClick={() => add('0')}>添加线索</Button>
                    <Button onClick={() => add('1')}>添加证据</Button>
                  </Space>
                </Col>
              </Row>

            </Form.Item>
          }
          <div className={styles.contentBox}>
            {clueEvidenceItems}
          </div>
        </Form>
        {useType !== UseType.show &&
          <div className={styles.btnBox}>
            <Button type="primary" onClick={handleOnFinish}>
              确定
            </Button>
            <Button
              style={{ margin: '0 8px' }}
              onClick={() => {
                form.resetFields();
              }}
            >
              重置
            </Button>
          </div>
        }
      </div>
      : <></>
  )
}

export default CaseProgressDetail