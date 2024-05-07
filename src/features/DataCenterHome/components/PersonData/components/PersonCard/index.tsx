import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback, useMemo, useState } from "react"
import styles from "./index.module.sass";
import { Image } from "antd";


interface Props {
  data: any
  onClick: (data: any) => void
}

const PersonCard: React.FC<Props> = ({ data, onClick }) => {
  console.debug('PersonCard')
  const [visible, setVisible] = useState(false)
  const handleClick = useCallback(() => {
    onClick(data)
  }, [data, onClick])
  const handlePreview = useCallback(
    () => {
      setVisible(true)
    },
    [],
  )

  const preview = useMemo(() => {
    return {
      visible,
      current: 0,
      onVisibleChange: (is: boolean) => setVisible(is),
    }
  }, [visible])

  return (
    <article className={styles.wrapper} >
      <section>
        <ImageSimple className={styles.img} src={data.picUrl1} onClick={handlePreview} preview={false} />
      </section>
      <section className={styles.data} onClick={handleClick}>
        {/* <div className={styles.info}>
          <div>人员:</div>
          <div>{data.name}</div>
          <div className={styles.mark}>
            {data.mask === 1 && <i className="iconfont icon-kouzhao" />}
            {data.glass === 1 && <i className="iconfont icon-yanjing" />}
            {data.hat === 1 && <i className="iconfont icon-maozi" />}
          </div>
        </div> */}
        <div className={styles.info}>
          <div>地点:</div>
          <div>{data.deviceName}</div>
        </div>
        <div className={styles.info}>
          <div>时间:</div>
          <div>{data.capTime}</div>
        </div>
      </section>
      <aside className={styles.previewGroup}>
        <Image.PreviewGroup preview={preview}>
          <Image key={data.picUrl2} src={data.picUrl2} />
        </Image.PreviewGroup>
      </aside>

    </article>
  )
}

export default PersonCard