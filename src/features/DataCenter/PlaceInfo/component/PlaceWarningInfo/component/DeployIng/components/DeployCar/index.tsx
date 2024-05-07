import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback, useMemo } from "react";
import { addPlaceCtrlTarget, updatePlaceCtrlTarget } from "server/place";
import styles from "./index.module.sass";


const inputs = [
  ['车牌号', 'licensePlates', InputType.textArea, { placeholder: '多个已半角逗号隔开' }]
]

interface Props {
  placeId: number
  data?: any
  onFinish: () => void
  onClosePopup?: () => void
  controlLevel?: string | number
}

const DeployCar: React.FC<Props> = ({ placeId, data, onFinish, onClosePopup, controlLevel }) => {
  console.debug('DeployCar')


  const initData = useMemo(() => {
    if (data?.areaCtrlJson?.licensePlates) {
      return {
        licensePlates: data.areaCtrlJson.licensePlates,
      }
    } else {
      return {
        licensePlates: null
      }
    }
  }, [data])


  const handleAsyncFinish = useCallback(
    async (formData: any) => {

      const dto: any = {
        areaId: placeId,
        areaCtrlJson: {
          ...data?.areaCtrlJson
        },
        controlLevel: controlLevel || 3
      }

      if (formData.licensePlates) {
        dto.areaCtrlJson.licensePlates = formData.licensePlates
      } else {
        dto.areaCtrlJson.licensePlates = null
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
    [placeId, data, controlLevel, onFinish, onClosePopup]
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

export default DeployCar