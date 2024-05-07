import { Carousel, CarouselProps } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useCallback, useRef } from "react";
import styles from "./index.module.sass";
import arrowLeftSrc from "images/situation/arrow_left.png";
import arrowRightSrc from "images/situation/arrow_right.png";


const VideoCarousel: React.FC<CarouselProps> = (props) => {
  console.debug('VideoCarousel')


  const ref = useRef<CarouselRef>(null)


  const handlePrev = useCallback(
    () => {
      ref.current?.prev()
    },
    [],
  )

  const handleNext = useCallback(
    () => {
      ref.current?.next()
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <Carousel {...props} ref={ref}></Carousel>
      <img className={styles.prev} src={arrowLeftSrc} alt='' onClick={handlePrev} />
      <img className={styles.next} src={arrowRightSrc} alt='' onClick={handleNext} />
    </article>
  )
}

export default VideoCarousel