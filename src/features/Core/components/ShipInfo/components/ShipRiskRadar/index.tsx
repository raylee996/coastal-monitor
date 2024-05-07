import EchartPanel from "hooks/flexibility/EchartPanel";
import { useEffect, useState } from "react";
import { getRiskRadarOption } from "server/alarm";
import styles from "./index.module.sass";


interface Props {
  data?: {
    batchNum?: string,
    mmsi?: string
  }
}

const ShipRiskRadar: React.FC<Props> = ({ data }) => {
  console.debug('ShipRiskRadar')

  const [option, setOption] = useState<any>()

  useEffect(() => {
    async function main() {
      if (data) {
        const _option = await getRiskRadarOption(data)
        setOption(_option)
      }
    }
    main()
  }, [data])

  return (
    <article className={styles.wrapper}>
      <EchartPanel option={option} />
    </article>
  )
}

export default ShipRiskRadar