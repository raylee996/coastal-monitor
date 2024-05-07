import { Carousel, CarouselProps } from "antd";
import { useMemo } from "react";
import styles from "./index.module.sass";


interface Props extends Omit<CarouselProps, 'className'> {
  className?: string,
  list?: any[]
  card: React.FC
}

const CarouselBanner: React.FC<Props> = ({ className, list, card, ...otherProps }) => {
  console.debug('CarouselBanner')

  const Card = card

  const articleClass = useMemo(() => className ? `${styles.wrapper} ${className}` : styles.wrapper, [className])

  const isShow = useMemo(() => list && list.length !== 0 && card, [list, card])


  return (
    <article className={articleClass}>
      {isShow &&
        <Carousel {...otherProps}>
          {list!.map(item => <Card {...item} />)}
        </Carousel>
      }
    </article>
  )
}

export default CarouselBanner