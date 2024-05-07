import { Button, Descriptions } from "antd"

import windowUI from "component/WindowUI";
import { useCallback, useMemo } from "react"
import AreaTargetPopup from "../AreaTargetPopup";
import styles from "./index.module.sass";


interface Props {
  layer: any
}

const AreaPopup: React.FC<Props> = ({ layer }) => {
  console.debug('AreaPopup')

  const value = useMemo(() => {
    let result = 0
    if (layer.pm._shape === 'Circle') {
      result = Math.PI * Math.pow(layer._mRadius, 2)
    } else {
      let pointList = layer._latlngs[0].map((val: any) => [val.lng, val.lat])
      pointList.push(pointList[0])
      const polygon = turf.polygon([pointList])
      result = turf.area(polygon)
    }
    const value = Math.trunc(result).toLocaleString()
    return value
  }, [layer])

  const handleClick = useCallback(() => {
    windowUI(<AreaTargetPopup layer={layer} />, {
      title: `区域设备`,
      key: '区域设备',
      width: 330,
      height: 360,
      offset: [480, 100]
    })
  }, [layer])

  return (
    <article className={`${styles.wrapper} core__popup-descriptions`}>
      <section>
        <Descriptions size='small' column={1}>
          <Descriptions.Item label="面积">{value}(平方米)</Descriptions.Item>
        </Descriptions>
      </section>
      <footer>
        <Button type="link" onClick={handleClick}>查看区域</Button>
      </footer>
    </article>
  )
}

export default AreaPopup