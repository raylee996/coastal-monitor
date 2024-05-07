import PlaceInfo from "features/DataCenter/PlaceInfo"
import { useEffect, useState } from "react"
import { getPlaceInfoById } from "server/place"

interface Props {
  /** 场所id */
  id: number
}

const HOCPlaceInfo: React.FC<Props> = ({ id }) => {
  console.debug('HOCPlaceInfo')


  const [data, setData] = useState<any>()


  useEffect(() => {
    async function main() {
      const _data = await getPlaceInfoById(id)
      setData(_data)
    }
    main()
  }, [id])


  return (
    <>
      {data
        ? <PlaceInfo id={id} labelId={data.labelId} placeInfo={data} defaultTargetKey='2' />
        : <span>数据加载中</span>
      }
    </>
  )
}

export default HOCPlaceInfo