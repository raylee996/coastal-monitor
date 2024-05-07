import TabsRadio from "component/TabsRadio";
import { ControlTypeDict } from "helper/dictionary"
import { useState } from "react";
import PersonTable from "../PersonTable";
import ShipControlTable from "../ShipTable";
import styles from "./index.module.sass";

const options: any[] = [...ControlTypeDict]

const iconObj: { [key: string]: string } = {
  '1': 'chuanboliebiao',
  '2': 'yonghuguanli'
}
interface Props {
  onClosePopup?: Function
}
const ControlManageTabs: React.FC<Props> = ({ onClosePopup }) => {
  console.debug('ControlManageTabs')

  const [controlType, setControlType] = useState<string>('1')

  function handleChangeType(activeKey: string) {
    setControlType(activeKey);
  };
  function handleClousePopup() {
    onClosePopup && onClosePopup()
  }

  return (
    <section className={styles.wrapper}>
      <TabsRadio options={options.map(item => {
        item.value += ''
        item.icon = iconObj[item.value]
        return item
      })} defaultActive={controlType} onChange={handleChangeType} tabBarGutter={42} />
      {/* 船舶布控 */}
      {
        controlType === '1' && <ShipControlTable onClosePopup={handleClousePopup} />
      }
      {/* 人员布控 */}
      {
        controlType === '2' && <PersonTable  onClosePopup={handleClousePopup} />
      }
    </section>
  )
}

export default ControlManageTabs