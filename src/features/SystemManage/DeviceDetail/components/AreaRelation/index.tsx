import { Button } from "antd";
import popup from "hooks/basis/Popup";
import { useCallback, useEffect, useMemo, useRef } from "react";
import MapFilterArea, { MapFilterAreaRefProps } from "../MapFilterArea";
import styles from "./index.module.sass";


interface Props {
  title?: string
  /** 是否支持编辑线条 */
  isLine?: boolean
  /** 是否支持编辑圆形 */
  isCircle?: boolean
  value?: any
  onChange?: (data: any) => void
}


const AreaRelation: React.FC<Props> = ({ title, isLine, isCircle, value, onChange }) => {
  console.debug('AreaRelation')


  const mapFilterAreaRef = useRef<MapFilterAreaRefProps>(null)


  const isAct = useMemo(() => !!value, [value])
  const text = useMemo(() => title || '地图选择', [title])
  const altText = useMemo(() => `已${title || '选择'}`, [title])


  const handleClick = useCallback(
    () => {
      popup(<MapFilterArea
        ref={mapFilterAreaRef}
        value={value}
        onChange={onChange}
        isLine={isLine}
        isCircle={isCircle}
      />, {
        title: text,
        size: 'middle'
      })
    },
    [value, onChange, isLine, isCircle, text],
  )


  useEffect(() => {
    mapFilterAreaRef.current?.onValue(value)
  }, [value])


  return (
    <article className={styles.wrapper}>
      <Button type="link" onClick={handleClick}>{text}</Button>
      {isAct &&
        <span className={styles.alt} >{altText}</span>
      }
    </article>
  )
}

export default AreaRelation