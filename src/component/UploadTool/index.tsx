import { UploadOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button, Row, Space } from 'antd';
// import popup, { PopupProps } from 'hooks/basis/Popup';
import popupmini, { PopupProps } from "component/PopupMini";
import _ from 'lodash';
import { useState } from 'react';
import styles from "./index.module.sass";

interface IContent {
  /**下载模板按钮回调函数 */
  onDownloadTemplate?: () => void
  /**下载模板按钮回调函数，用于异步函数，能展示按钮加载动画 */
  asyncDownloadTemplate?: () => Promise<void>
  /**上传按钮回调函数 */
  onUploadFile?: (formData: FormData) => void
  /**上传按钮回调函数，用于异步函数，能展示按钮加载动画 */
  asyncUploadFile?: (formData: FormData) => Promise<void>
}

const Content: React.FC<IContent> = ({
  onDownloadTemplate,
  asyncDownloadTemplate,
  onUploadFile,
  asyncUploadFile
}) => {

  const [isLoading, setIsLoading] = useState(false)
  const [isUpLoading, setIsUpLoading] = useState(false)

  async function handleTemplate() {
    onDownloadTemplate && onDownloadTemplate()
    try {
      if (asyncDownloadTemplate) {
        setIsLoading(true)
        await asyncDownloadTemplate()
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleUpload() {
    const inputEle = document.createElement('input')
    inputEle.setAttribute('type', 'file')
    inputEle.setAttribute('accept', 'file')
    inputEle.onchange = async (evt: Event) => {
      const files = _.get(evt.currentTarget, 'files')
      const file = _.head(files) as File
      const formData = new FormData();
      formData.append('file', file)
      onUploadFile && onUploadFile(formData)
      try {
        if (asyncUploadFile) {
          setIsUpLoading(true)
          await asyncUploadFile(formData)
        }
      } finally {
        setIsUpLoading(false)
      }
    }
    inputEle.click()

  }

  return (
    <article className={styles.wapper}>
      <section style={{ color: '#a6cdff', fontSize: '14px' }}>
        <Row>1.下载导入模板，录入需导入的内容</Row>
        <Row>2.上传需导入的文件，完成导入</Row>
      </section>
      <footer>
        <Space>
          <Button type="primary" icon={<VerticalAlignBottomOutlined />} loading={isLoading} onClick={handleTemplate}>
            下载导入模板
          </Button>
          <Button type="primary" icon={<VerticalAlignTopOutlined />} loading={isUpLoading} onClick={handleUpload}>
            上传导入文件
          </Button>
        </Space>
      </footer>
    </article>
  )
}

interface Props extends IContent {
  /**按钮文本 */
  children?: string
  /**popup参数 */
  popupProps?: PopupProps
}

const UploadTool: React.FC<Props> = ({ children, popupProps, ...contentProps }) => {
  console.debug('UploadTool')

  const [buttonText] = useState(children || '导入')

  function handleClick() {
    popupmini(<Content {...contentProps} />, { title: '导入', size: 'auto', ...popupProps })
  }

  return <Button onClick={handleClick} icon={<UploadOutlined />}>{buttonText}</Button>
}

export default UploadTool