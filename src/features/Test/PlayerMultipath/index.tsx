import { FloatButton } from "antd";
import _ from "lodash";
import { useCallback, useState } from "react";
import PlayerWindow from "./components/PlayerWindow";
import styles from "./index.module.sass";


const PlayerMultipath: React.FC = () => {
  console.debug('PlayerMultipath')


  const [pathList, setPathList] = useState<string[]>(() => {
    const result = _.times(16, () => '')
    return result
  })


  const handleMultipath = useCallback(
    (value: number) => {
      const result = _.times(value, () => '')
      setPathList(result)
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      {pathList.map(item =>
        <section className={styles.window} key={item}>
          <PlayerWindow />
        </section>
      )}
      <FloatButton.Group shape="square" style={{ right: 94 }}>
        <FloatButton description='4路' onClick={() => handleMultipath(4)} />
        <FloatButton description='8路' onClick={() => handleMultipath(8)} />
        <FloatButton description='16路' onClick={() => handleMultipath(16)} />
      </FloatButton.Group>
    </article>
  )
}

export default PlayerMultipath