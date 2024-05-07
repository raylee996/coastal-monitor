import { Carousel } from "antd";
import SpinLoading from "component/SpinLoading";
import { useRef, useState } from "react";
import styles from "./index.module.sass";

interface IDataCarousel {
  /**显示的数据 */
  data?: any
  autoplay?: any
  /**自定义宽，需要在引用时，自定义样式 */
  variableWidth?: any
  /**播放的方向 */
  dotPosition?: any
  /**切换时间，单位毫秒 */
  autoplaySpeed?: any
  /**数据项样式 */
  itemStyle?: any

  infinite?: any
  /**每页显示的元素个数 */
  slidesToShow?: any
  /**每次滚动几个元素 */
  slidesToScroll?: any
  className?: any
  playBtn?: any

  isAfter?: any
}

const DataCarousel: React.FC<IDataCarousel> = (props) => {
  console.debug('DataCarousel')

  const { isAfter, data, autoplaySpeed, infinite, slidesToShow, slidesToScroll, className, dotPosition, playBtn, autoplay, variableWidth } = props

  const [playIndex, setPlayIndex] = useState(0)

  const carouselRef = useRef<any>(null)

  function handleAfterChange(dataIndex?: any) {
    if (isAfter) {
      setPlayIndex(dataIndex)
    }
  }

  return (
    <article className={styles.wrapper}>
      {
        playBtn && <div className={styles.playBtnBox}>

          <div className={`${styles.playBtn} ${styles.playBtnL}`} onClick={() => {
            carouselRef.current && carouselRef.current.prev()
          }}>
            <div className={styles.btnArrowLeft}></div>

          </div>

          <div className={`${styles.playBtn} ${styles.playBtnR}`} onClick={() => {
            carouselRef.current && carouselRef.current.next()
          }}>
            <div className={styles.btnArrowRight}></div>
          </div>
        </div>
      }
      {
        data !== undefined && data.length !== 0 ?
          <Carousel
            ref={carouselRef}
            autoplaySpeed={autoplaySpeed}
            dots={false}
            dotPosition={dotPosition}
            infinite={infinite}
            slidesToShow={slidesToShow}
            slidesToScroll={slidesToScroll}
            className={className}
            variableWidth={variableWidth}
            autoplay={autoplay}
            afterChange={handleAfterChange}
          >
            {
              data.map((item: any, index: number) => {
                return (
                  <div key={'caroItem_' + index}>

                    {
                      !item.isFunction ? item.component : <item.component {...item.componentProps} playIndex={playIndex} slidesToShow={slidesToShow} />
                    }

                  </div>
                )
              })
            }
          </Carousel>
          :
          <SpinLoading />
      }


    </article>
  )
}

DataCarousel.defaultProps = {
  data: [],
  autoplay: true,
  dotPosition: 'left',
  autoplaySpeed: 3000,
  infinite: true,//是否循环播放
  slidesToShow: 1,
  slidesToScroll: 1,
  className: '',
  playBtn: false,
  variableWidth: false
}
export default DataCarousel