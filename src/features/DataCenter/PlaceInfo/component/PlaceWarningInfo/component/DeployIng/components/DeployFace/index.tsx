import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import _ from "lodash";
import { useCallback, useMemo } from "react";
import { doUploadFile } from "server/common";
import { addPlaceCtrlTarget, updatePlaceCtrlTarget } from "server/place";
import styles from "./index.module.sass";


const inputs = [
  ['人脸', 'faceList', InputType.uploadImg, {
    maxCount: 8,
    uploadImgFn: doUploadFile,
  }]
]

interface Props {
  placeId: number
  data?: any
  onFinish: () => void
  onClosePopup?: () => void
  controlLevel?: string | number
}

const DeployFace: React.FC<Props> = ({ placeId, data, onFinish, onClosePopup, controlLevel }) => {
  console.debug('DeployFace')


  const initData = useMemo(() => {
    if (data?.areaCtrlJson?.faceDtoList) {
      return {
        faceList: data.areaCtrlJson.faceDtoList?.map((item: any) => ({
          id: _.uniqueId('faceId'),
          name: _.uniqueId('name'),
          path: item.url
        }))
      }
    } else {
      return {
        faceList: null
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

      if (formData.faceList) {
        const faceDtoList = formData.faceList?.map((item: any) => ({
          faceId: null,
          url: item.path
        }))
        dto.areaCtrlJson.faceDtoList = faceDtoList
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

export default DeployFace