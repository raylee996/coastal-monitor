import { useAppDispatch } from "app/hooks";
import _ from "lodash";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { selectTarget } from "slice/selectTargetSlice";
import styles from "./index.module.sass";

interface Props {
  data: any
}
const DataCard: React.FC<Props> = ({ data }) => {
  console.debug('DataCard')

  const navigate = useNavigate();
  const dispatch = useAppDispatch()


  const speed = useMemo(() => _.floor(data.speed * 0.5144444444, 2), [data])


  const handleClick = useCallback(
    () => {
      dispatch(selectTarget({
        radar: data.uniqueid,
        isCenter: true
      }))
      navigate('core')
    },
    [navigate, dispatch, data],
  )



  return (
    <div className={styles.wrapper} onClick={handleClick} >
      <span className={styles.item}>{data.mmsi || data.uniqueid}\</span>
      <span className={styles.item}>{speed}节\</span>
      <span className={styles.item}>{data.lng},{data.lat}\</span>
      <span className={styles.item}>{data.capTime}</span>
    </div>
  )
}
export default DataCard