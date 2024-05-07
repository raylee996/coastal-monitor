import styles from "./index.module.sass";
import aisSrc from 'images/situation/dark/ship_ais.png'
import radarSrc from 'images/situation/dark/ship_radar.png'
import fusionSrc from 'images/situation/dark/ship_fusion.png'
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "app/hooks";
import { setIndex } from "slice/funMenuSlice";


interface Props {
  data?: any
}

const Statistics: React.FC<Props> = ({ data }) => {
  console.debug('Statistics')


  const navigate = useNavigate();
  const dispatch = useAppDispatch()


  const realData = useMemo(() => {
    const result = {
      aisCount: '',
      focusCount: '',
      followCount: '',
      radarCount: '',
      fusionCount: ''
    }
    if (data) {
      result.aisCount = data.aisCount
      result.focusCount = data.aisConcernCount
      result.followCount = data.aisFocusCount
      result.radarCount = data.radarCount
      result.fusionCount = data.fusionCount
    }
    return result
  }, [data])


  const handleClick = useCallback(
    () => {
      navigate('core')
      dispatch(setIndex(1))
    },
    [navigate, dispatch],
  )


  return (
    <article className={styles.wrapper} onClick={handleClick}>

      <img className={styles.aisImg} src={aisSrc} alt="" />

      <section className={styles.ais}>
        <div>AIS目标</div>
        <div>{realData.aisCount}</div>
      </section>

      <section className={styles.foucs}>
        <div>重点船舶<span>{realData.focusCount}</span></div>
        <div>关注船舶<span>{realData.followCount}</span></div>
      </section>

      <section className={styles.box}>
        <div>
          <img src={radarSrc} alt="" />
          <div className={styles.info}>
            <div>雷达目标</div>
            <div>{realData.radarCount}</div>
          </div>
        </div>
        <div>
          <img src={fusionSrc} alt="" />
          <div className={styles.info}>
            <div>融合目标</div>
            <div>{realData.fusionCount}</div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default Statistics