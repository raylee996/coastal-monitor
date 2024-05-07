import { ControlScopeDict } from "helper/dictionary"
import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import _ from "lodash"
import { useCallback, useMemo } from "react"
import { doUploadFile } from "server/common"
import { addPlaceCtrlTarget, updatePlaceCtrlTarget } from "server/place"
import styles from "./index.module.sass";


const inputs = [
  ['布控对象', 'controlScope', InputType.radio, { dict: ControlScopeDict }],
  ['MMSI', 'alarmConditionShipMmsis', InputType.textArea, { placeholder: '多个已半角逗号隔开', when: { controlScope: '1' } }],
  ['船名', 'alarmConditionShipNames', InputType.textArea, { placeholder: '多个已半角逗号隔开', when: { controlScope: '1' } }],
  ['船脸', 'alarmConditionShipFaceList', InputType.uploadImg, {
    maxCount: 8,
    uploadImgFn: doUploadFile,
    when: {
      controlScope: '1',
    }
  }]
]

interface Props {
  placeId: number
  data?: any
  onFinish: () => void
  onClosePopup?: () => void,
  controlLevel?: string | number
}

const DeployShip: React.FC<Props> = ({ placeId, data, onFinish, onClosePopup, controlLevel }) => {
  console.debug('DeployShip')


  const initData = useMemo(() => {
    if (data?.areaCtrlJson) {
      let result: any = {
        controlScope: data.areaCtrlJson.controlScope || '1'
      }
      if (data.areaCtrlJson.alarmConditionShipMmsis) {
        result.alarmConditionShipMmsis = data.areaCtrlJson.alarmConditionShipMmsis
      }

      if (data.areaCtrlJson.alarmConditionShipNames) {
        result.alarmConditionShipNames = data.areaCtrlJson.alarmConditionShipNames
      }

      if (data.areaCtrlJson.alarmConditionShipFaceList) {
        const alarmConditionShipFaceList = data.areaCtrlJson.alarmConditionShipFaceList?.map((item: any) => ({
          id: _.uniqueId('shipFace'),
          path: item.url,
          name: 'shipFace'
        }))
        result.alarmConditionShipFaceList = alarmConditionShipFaceList
      }

      return result
    } else {
      return {
        controlScope: '1'
      }
    }
  }, [data?.areaCtrlJson])


  const handleAsyncFinish = useCallback(
    async (formData: any) => {

      const dto: any = {
        areaId: placeId,
        controlLevel: controlLevel || 3
      }

      if (data?.areaCtrlJson) {
        dto.areaCtrlJson = {
          ...data.areaCtrlJson,
          controlScope: formData.controlScope
        }
      } else {
        dto.areaCtrlJson = {
          controlScope: formData.controlScope
        }
      }

      if (formData.controlScope === '1') {
        dto.areaCtrlJson.alarmConditionShipMmsis = formData.alarmConditionShipMmsis
        dto.areaCtrlJson.alarmConditionShipNames = formData.alarmConditionShipNames
        dto.areaCtrlJson.alarmConditionShipFaceList = formData.alarmConditionShipFaceList?.map((item: any) => ({ url: item.path, shipFaceId: item.imgName }))
      } else {
        dto.areaCtrlJson.alarmConditionShipMmsis = null
        dto.areaCtrlJson.alarmConditionShipNames = null
        dto.areaCtrlJson.alarmConditionShipFaceList = null
      }

      if (data) {
        dto.id = data.id
        await updatePlaceCtrlTarget(dto)
      } else {
        await addPlaceCtrlTarget(dto)
      }

      onFinish && onFinish()
      onClosePopup && onClosePopup()
    },
    [placeId, controlLevel, data, onFinish, onClosePopup]
  )


  return (
    <article className={styles.wrapper}>
      <FormInterface
        initData={initData}
        inputs={inputs}
        onAsyncFinish={handleAsyncFinish}
      />
    </article>
  )
}

export default DeployShip