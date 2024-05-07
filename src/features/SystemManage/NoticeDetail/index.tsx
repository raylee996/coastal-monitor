import { getNotice } from "api/system";
import { noticeStatusDict, noticeTypeDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback, useMemo } from "react";
import { addNoticeData, editNoticeData } from "server/system";
import styles from "./index.module.sass";


const initData = {
  noticeType: '2',
  status: '0'
}
const formProps = { labelCol: { span: 5 } }
const options = {
  isShowReset: true
}

interface Props {
  onClosePopup?: Function
  onSuccess?: Function
  id?: number
  type?: UseType
}

const NoticeDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('NoticeDetail')


  const handleFinish = useCallback(
    async (params: any) => {
      if (id) {
        await editNoticeData(params)
      } else {
        await addNoticeData(params)
      }
      onSuccess && onSuccess()
      onClosePopup && onClosePopup()
    },
    [id, onClosePopup, onSuccess],
  )


  const inputs = useMemo(() => [
    ['公告标题', 'noticeTitle', {
      isRequired: true
    }],
    ['公告类型', 'noticeType', InputType.select, {
      dict: noticeTypeDict
    }],
    ['状态', 'status', InputType.radio, {
      dict: noticeStatusDict
    }],
    ['内容', 'noticeContent', InputType.textArea]
  ], [])


  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={id}
        getRequest={getNotice}
        formType={type}
        inputs={inputs}
        initData={initData}
        formProps={formProps}
        options={options}
        onAsyncFinish={handleFinish}
      />
    </article>
  )
}


export default NoticeDetail