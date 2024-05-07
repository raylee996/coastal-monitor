import styles from "./index.module.sass";
import DeviceItem from "./components/DeviceItem";
import DeviceGroup from "./components/DeviceGroup";


export interface DevicePopupData {
  id: number
  deviceCode: string
  deviceType: string
  deviceTypeName: string
  businessFunction: string
  name: string
  statusName: string
  status: number
  cameraType: number
}

interface Data extends DevicePopupData {
  group?: DevicePopupData[]
}

interface Props {
  data: Data
}

const DevicePopup: React.FC<Props> = ({ data }) => {
  console.debug('DevicePopup')



  return (
    <article className={`${styles.wrapper} core__popup-descriptions`}>
      {data.group ? <DeviceGroup data={data.group} /> : <DeviceItem data={data} />}
    </article>
  )
}

export default DevicePopup