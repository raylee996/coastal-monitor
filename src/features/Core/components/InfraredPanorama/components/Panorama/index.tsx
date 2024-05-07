import { useEffect, useRef } from "react";
import styles from "./index.module.sass";

interface Props {
  /** 全景图 */
  imageUrl?: string
}

const Panorama: React.FC<Props> = ({ imageUrl }) => {
  console.debug('Panorama')

  const canvasARef = useRef<HTMLCanvasElement>(null)
  const canvasBRef = useRef<HTMLCanvasElement>(null)
  const canvasCRef = useRef<HTMLCanvasElement>(null)
  const canvasDRef = useRef<HTMLCanvasElement>(null)
  const canvasERef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    [canvasARef, canvasBRef, canvasCRef, canvasDRef, canvasERef].map((item, index) => {
      handleDrawCanvas(item.current, index, imageUrl)
      return item
    })
  }, [imageUrl])

  // 开始进行图片渲染
  function handleDrawCanvas(_canvasRef: HTMLCanvasElement | null, index: number, imageUrl: any) {
    if (_canvasRef) {
      const canvasContext = _canvasRef?.getContext('2d');
      // 获取图片
      const image = new Image();
      image.src = imageUrl;
      image.onload = function () {
        _canvasRef.width = image.width;
        _canvasRef.height = image.height;
        canvasContext?.clearRect(0, 0, _canvasRef?.width, _canvasRef?.height);
        canvasContext?.drawImage(image, image.width * index / 5, 0, image.width / 5, image.height, 0, 0, _canvasRef?.width, _canvasRef?.height);
        _canvasRef.style.width = '100%';
      }
    }
  }

  return (
    <article className={styles.wrapper} >
      {
        [canvasARef, canvasBRef, canvasCRef, canvasDRef, canvasERef].map((item, index) => {
          return <div key={index} className={styles.canvasBox}>
            <canvas ref={item} style={{ width: '100%', height: '100%' }} />
          </div>
        })
      }
    </article>
  )
}

export default Panorama