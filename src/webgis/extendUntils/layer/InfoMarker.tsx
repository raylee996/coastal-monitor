
import { ReactElement, useMemo } from 'react';
import styles from "./InfoMarker.module.sass";
import './InfoMarker.css';
import createElementByComponent from 'webgis/untils/elementComponent';


const InfoMarkerComponent: React.FC<{
  content: ReactElement,
  lineColor?: string
  isNotShowLine?: boolean,
  position?: 'topRight' | 'bottomRight'
}> = ({ content, lineColor, isNotShowLine, position }) => {
  console.debug('InfoMarkerComponent')

  const contentClass = useMemo(() => isNotShowLine ? styles.notLineContent : styles.content, [isNotShowLine])

  return (
    <article className={styles.wrapper}>
      {(!position || position === 'topRight') && <div className={styles.topRight}>
        {!isNotShowLine &&
          <div className={styles.line} style={{ backgroundColor: lineColor || 'red' }}></div>
        }
        <section className={contentClass}>
          {content}
        </section>
      </div>}
      {(position === 'bottomRight') && <div className={styles.bottomRight}>
        {!isNotShowLine &&
          <div className={styles.line} style={{ backgroundColor: lineColor || 'red' }}></div>
        }
        <section className={contentClass}>
          {content}
        </section>
      </div>}
    </article>
  )
}

export interface CreateProps {
  /** 经纬度 */
  latLng: number[] | { lat: number, lng: number };
  /** 内容 */
  content: ReactElement
  /** 线的颜色 */
  lineColor?: string
  /** 是否不展示线 */
  isNotShowLine?: boolean
  /** 额外参数 */
  extraData?: any
  /** 标签位置 */ 
  position?: 'topRight' | 'bottomRight'
}

class InfoMarker {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create({ latLng, content, lineColor, isNotShowLine, extraData,position }: CreateProps) {

    const html = createElementByComponent(<InfoMarkerComponent
      isNotShowLine={isNotShowLine}
      lineColor={lineColor}
      content={content}
      position = {position}
    />)

    const conentIcon = L.divIcon({
      html,
      className: 'webgis__layer_InfoMarker',
      iconSize: [4, 4]
    });

    const marker = L.marker(latLng, {
      icon: conentIcon,
      extraData
    })

    return marker;
  }

}

export default InfoMarker;
