import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { useCallback, useMemo } from "react"
import { doGetPersonList } from "server/personnel"
import { addPlaceCtrlTarget, updatePlaceCtrlTarget } from "server/place"
import ChooseMan from "./ChooseMan"
import styles from "./index.module.sass";


const inputs = [
  [
    '选择人员',
    'personList',
    InputType.component,
    {
      component: ChooseMan,
      isRow: true,
      btnTxt: '选择人员',
      popTitle: '人员档案列表',
      dataType: 'person',
      rowSelectionType: "checkbox",
      request: doGetPersonList
    }
  ]
]

interface Props {
  placeId: number
  data?: any
  onFinish: () => void
  onClosePopup?: () => void,
  controlLevel?: string | number
}

const DeployFocusPerson: React.FC<Props> = ({ placeId, data, onFinish, onClosePopup, controlLevel }) => {
  console.debug('DeployFocusPerson')


  const initData = useMemo(() => {
    if (data?.areaCtrlJson?.focusPersonList) {
      return {
        personList: data.areaCtrlJson.focusPersonList?.map((item: any) => ({
          id: item.id,
          facePath: item.url,
          name: item.name
        }))
      }
    } else {
      return {
        personList: null
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

      if (formData.personList) {
        const focusPersonList = formData.personList?.map((item: any) => ({
          faceId: item.faceid,
          id: item.id,
          licensePlate: item.licensePlate,
          name: item.name,
          url: item.facePath
        }))
        dto.areaCtrlJson.focusPersonList = focusPersonList
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

export default DeployFocusPerson