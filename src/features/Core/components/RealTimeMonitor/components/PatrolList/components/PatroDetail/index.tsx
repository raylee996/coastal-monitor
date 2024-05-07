import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback, useMemo } from "react";
import { addVedioTConfigData, editVedioTConfigData, getVedioTConfigInfoData } from "server/admin";
import { getAllCameraDict } from "server/device";
import ScreenType from "../ScreenType";
import styles from "./index.module.sass";


const options = {
  isRequired: true
}

const initData = {
  ttl: 30,
  splitType: '9'
}

// const inputs = [
//   ['轮巡组名', 'groupName'],
//   ['切换时间', 'ttl', InputType.number, { addonAfter: "秒", min: 1 }],
//   ['分屏模式', 'splitType', InputType.component, { component: ScreenType }],
//   ['添加设备', 'deviceCodeList', InputType.transferRemote, { remote: getAllCameraDict }]
// ]

interface Props {
  id?: number
  onClosePopup?: () => void
  onSuccess?: () => void
}

const PatroDetail: React.FC<Props> = ({ id, onClosePopup, onSuccess }) => {
  console.debug('PatroDetail')


  const handleFinish = useCallback(
    async (params: any) => {
      if (id) {
        await editVedioTConfigData({ ...params, id })
      } else {
        await addVedioTConfigData(params)
      }
      onClosePopup && onClosePopup()
      onSuccess && onSuccess()
    },
    [id, onClosePopup, onSuccess],
  )


  const inputs = useMemo(
    () => {
      if (id === -1) {
        return [
          ['切换时间', 'ttl', InputType.number, { addonAfter: "秒", min: 1 }],
          ['分屏模式', 'splitType', InputType.component, { component: ScreenType }],
        ]
      } else {
        return [
          ['轮巡组名', 'groupName'],
          ['切换时间', 'ttl', InputType.number, { addonAfter: "秒", min: 1 }],
          ['分屏模式', 'splitType', InputType.component, { component: ScreenType }],
          ['添加设备', 'deviceCodeList', InputType.transferRemote, { remote: getAllCameraDict }]
        ]
      }
    },
    [id],
  )

  const realId = useMemo(() => id === -1 ? id : id, [id])


  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={realId}
        initData={initData}
        inputs={inputs}
        options={options}
        onAsyncFinish={handleFinish}
        getRequest={getVedioTConfigInfoData}
      />
    </article>
  )
}

export default PatroDetail