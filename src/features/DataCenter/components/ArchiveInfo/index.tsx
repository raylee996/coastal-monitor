import CarArchiveInfo from "features/DataCenter/CarArchiveInfo";
import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import { showMessage } from "helper/common";
import _ from "lodash";
import styles from "./index.module.sass";

interface IArchiveInfo {
  /**档案的ID */
  id?: any
  /**档案类型 1 船舶档案，2：人员档案，3：车辆档案 */
  type?: any
  /**扩展参数 */
  extraParams?: any
}

const ArchiveInfo: React.FC<IArchiveInfo> = (props) => {
  const { id, type, extraParams } = props

  if (_.isNil(id) || _.isNil(type)) {
    showMessage({ type: 'error', msg: '请指定档案类型,id' })
  }

  return (
    <article className={styles.wrapper}>
      {
        type === 1 && !_.isNil(id) && <ShipArchiveInfo id={id} dataType={1} {...extraParams} />
      }
      {
        type === 2 && !_.isNil(id) && <PersonnelArchiveInfo id={id} {...extraParams} />
      }
      {
        type === 3 && !_.isNil(id) && <CarArchiveInfo carId={id} {...extraParams} />
      }
    </article>
  )
}

export default ArchiveInfo