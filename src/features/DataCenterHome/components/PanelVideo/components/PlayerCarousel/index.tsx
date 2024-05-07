import styles from "./index.module.sass";
// import arrowLeftSrc from "images/situation/arrow_left.png";
// import arrowRightSrc from "images/situation/arrow_right.png";
import { useCallback, useEffect, useMemo, useState } from "react";
import VideoCard from "../VideoCard";


interface Props {
  list?: any[]
}

const PlayerCarousel: React.FC<Props> = ({ list }) => {
  console.debug('PlayerCarousel')


  const [isAnim, setIsAnim] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)


  // const handlePrev = useCallback(
  //   () => {
  //     if (list) {
  //       setCurrentIdx(val => {
  //         let result = 0
  //         const _prev = val - 1
  //         if (_prev < 0) {
  //           setIsAnim(false)
  //           result = list.length - 2
  //         } else {
  //           setIsAnim(true)
  //           result = _prev
  //         }
  //         return result
  //       })
  //     }
  //   },
  //   [list]
  // )

  const handleNext = useCallback(
    () => {
      if (list) {
        setCurrentIdx(val => {
          let result = 0
          const _next = val + 1
          if (_next >= list.length - 1) {
            setIsAnim(false)
            result = 0
          } else {
            setIsAnim(true)
            result = _next
          }
          return result
        })
      }
    },
    [list]
  )


  useEffect(() => {
    let timer: NodeJS.Timer
    if (list) {
      timer = setInterval(() => {
        if (!document.fullscreenElement || document.fullscreenElement.getAttribute('data-video') !== 'VideoCard') {
          handleNext()
        }
      }, 10 * 1000)
    }
    return () => {
      clearInterval(timer)
    }
  }, [handleNext, list])


  const contentClass = useMemo(() => isAnim ? styles.contentAnim : styles.content, [isAnim])

  const contentStyle = useMemo(() => {
    const result = -50 * currentIdx
    return {
      transform: `translateX(${result}%)`
    }
  }, [currentIdx])


  return (
    <article className={styles.wrapper}>
      <section className={contentClass} style={contentStyle}>
        {list && list.map((item, index) =>
          <div className={styles.box} key={item.uniqueId}>
            <VideoCard
              className={styles.card}
              data={item}
              index={index}
              currentIdx={currentIdx}
              length={list.length}
            />
          </div>
        )}
      </section>
      {/* <img className={styles.prev} src={arrowLeftSrc} alt='' onClick={handlePrev} />
      <img className={styles.next} src={arrowRightSrc} alt='' onClick={handleNext} /> */}
    </article>
  )
}

export default PlayerCarousel