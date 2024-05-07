import { Form } from "antd";
import WisdomCommandDetail from "features/Core/components/WisdomCommand/WisdomCommandDetail";
import { opinionTypeDict, shipTypeDict } from "helper/dictionary"
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback, useMemo } from "react";
import { handlerWarningResult } from "server/core/earlyWarning"
import styles from "./index.module.sass";


const formProps = {
  labelCol: {
    span: 4,
  }
}

interface HandleWarningProps {
  /** 处理数据的id */
  id: any
  /** 是否是船舶 */
  isShipTarget: boolean
  /** 关闭弹窗 */
  onClosePopup?: Function
  /** 更新父组件table */
  onRefresh?: Function
}

const HandleWarningResult: React.FC<HandleWarningProps> = ({ id, isShipTarget, onClosePopup, onRefresh }) => {
  console.debug('HandleWarningResult')

  const [form] = Form.useForm()
  const opinionType = Form.useWatch('opinionType', form);

  const formInputs = useMemo(() => {
    const result: any[][] = [
      ['处理意见', 'opinionType', InputType.radio, {
        dict: opinionTypeDict,
        isRequired: true,
      }],
      [
        '备注',
        'remark',
        InputType.textArea,
        {
          placeholder: '请输入处理意见'
        }
      ]
    ]
    if (isShipTarget) {
      result.push(['船舶分类', 'focusType', InputType.radio, {
        dict: shipTypeDict,
        when: {
          opinionType: "01"
        }
      }])
    }
    return result
  }, [isShipTarget])


  const handleClose = useCallback(
    () => {
      onClosePopup && onClosePopup()
      onRefresh && onRefresh()
    },
    [onClosePopup, onRefresh],
  )

  const handleFinish = useCallback(
    async (data: any) => {
      const { focusType, ...obj } = data
      await handlerWarningResult({
        warnIds: [id],
        ...(focusType ? data : obj)
      })
      handleClose()
    },
    [handleClose, id],
  )

  const handleTask = useCallback(
    () => {
      popup(<WisdomCommandDetail />, { title: '新增任务', size: 'middle' })
    },
    [],
  )


  const options = useMemo(() => {
    if (opinionType === "01") {
      return {
        submitText: '确认',
        isShowClear: true,
        footerButtons: [{
          text: '实时指挥',
          onClick: handleTask
        }]
      }
    } else {
      return {
        submitText: '确认',
        isShowClear: true,
      }
    }
  }, [opinionType, handleTask])


  return (
    <article className={styles.wrapper}>
      <FormInterface
        form={form}
        inputs={formInputs}
        formProps={formProps}
        options={options}
        onAsyncFinish={handleFinish}
        onClose={handleClose}
      />
    </article>
  )
}

export default HandleWarningResult