import { Popover, Radio, RadioChangeEvent } from "antd";
import { mapTileDict } from "helper/dictionary";
import { MapTileType } from "helper/Map2D";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import "./index.css";


interface Props {
  value: MapTileType
  onChange: (value: MapTileType) => void
}

const TileSelect: React.FC<Props> = ({ value, onChange }) => {
  console.debug('TileSelect')

  const [mapType, setMapType] = useState(MapTileType.street)
  const [imgSrc, setImgSrc] = useState('')
  const [labelText, setLabelText] = useState('')

  useEffect(() => {
    const result = mapTileDict.find(item => item.value.type === value)
    if (result) {
      setImgSrc(result.value.imgSrc)
      setLabelText(result.name)
    }
    setMapType(value)
  }, [value])

  function handleChange(evt: RadioChangeEvent) {
    onChange(evt.target.value)
  }

  const content = (
    <Radio.Group className='TileSelect__RadioGroup' value={mapType} onChange={handleChange}>
      {mapTileDict.map(item =>
        <Radio.Button key={item.value.type} value={item.value.type}>
          <div className={styles.mapCard}>
            <img className={styles.mapImg} src={item.value.imgSrc} alt="地图类型" />
            <div className={styles.mapName}>{item.name}</div>
          </div>
        </Radio.Button>
      )}
    </Radio.Group>
  )

  return (
    <article className={styles.wrapper}>
      <Popover content={content} placement="leftBottom" trigger="hover">
        <section className={styles.box}>
          <img src={imgSrc} alt="" />
          <span>{labelText}</span>
        </section>
      </Popover>
    </article>
  )
}

export default TileSelect