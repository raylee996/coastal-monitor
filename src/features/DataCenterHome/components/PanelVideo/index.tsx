import { useEffect, useState } from "react";
import { doGetDeviceAndChannelCodeV2 } from "server/situation";
import CardTitle from "../CardTitle"
import PlayerCarousel from "./components/PlayerCarousel";
import styles from "./index.module.sass";


const PanelVideo: React.FC = () => {
  console.debug('PanelVideo')


  const [list, setList] = useState<any[]>()


  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()
      const vo = await doGetDeviceAndChannelCodeV2(signal)
      setList(vo)
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [])


  return (
    <article className={styles.wrapper}>
      <CardTitle text="实时视频" />
      <article className={styles.content}>
        {list && <PlayerCarousel list={list} />}
      </article>
    </article>
  )
}

export default PanelVideo