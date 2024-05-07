import { useAppSelector } from "app/hooks"
import { useMemo } from "react"
import { currentParams } from "slice/funMenuSlice"
import RealTimeMonitor from "../RealTimeMonitor"


const HOCRealTimeMonitor = () => {
  console.debug('HOCRealTimeMonitor')


  const params = useAppSelector(currentParams)


  const checkCameraList = useMemo(() => {
    let result: string[] | undefined = undefined
    if (Array.isArray(params?.checkCameraList) && params.checkCameraList.length > 0) {
      result = params.checkCameraList
    }
    return result
  }, [params])

  const placeId = useMemo(() => params?.placeId, [params])


  return <RealTimeMonitor checkCameraList={checkCameraList} placeId={placeId} />
}

export default HOCRealTimeMonitor