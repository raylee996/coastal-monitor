import ShipPopup, { ShipPopupProps } from "features/Core/components/SituationalAnalysis/components/ShipPopup"
import { useEffect, useState } from "react"
import { getShipData } from "server/ship"


const HocShipPopup = (props: ShipPopupProps) => {

  const [params, setParams] = useState(props)

  useEffect(() => {
    async function main() {
      try {
        if (props.mmsi) {
          const dto = {
            mmsi: props.mmsi
          }
          const vo = await getShipData(dto)
          setParams(val => ({ ...val, name: vo.cnName || vo.enName }))
        }
      } catch (error) {
        console.error('获取船舶信息异常', error)
      }
    }
    main()
  }, [props])

  return <ShipPopup {...params} />
}

export default HocShipPopup