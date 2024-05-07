import { Badge, Progress } from "antd"
import ImageSimple from "hooks/basis/ImageSimple"
import UploadImg from "hooks/basis/UploadImg";
import { useEffect, useState } from "react";
import { doUploadFile } from "server/common";
import { queryFaceCompare } from "server/core/wisdomSearch";
import styles from "./index.module.sass";

interface Props {
  /** 是否仅做显示 */
  isShow?: boolean
  /** 图片1 */
  image1?: string
  /** 图片1 */
  image2?: string
  /** 比对相似度 */
  similarity?: number
}

const RelationFaces: React.FC<Props> = ({ isShow, image1, image2 }) => {
  console.debug('RelationFaces')

  const [uploadImage1, setUploadImage1] = useState<string>()
  const [uploadImage2, setUploadImage2] = useState<string>()

  const [similarity, setSimilarity] = useState<number>(0)

  useEffect(() => {
    image1 && image2 && contrast(image1, image2)
  }, [image1, image2])

  useEffect(() => {
    uploadImage1 && uploadImage2 && contrast(uploadImage1, uploadImage2)
  }, [uploadImage1, uploadImage2])

  function onChangeImage(e: any) {
    setUploadImage1(e?.length ? e[e.length - 1].path : '')
  }

  function onChangeOtherImage(e: any) {
    setUploadImage2(e?.length ? e[e.length - 1].path : '')
  }

  async function contrast(image1: string, image2: string) {
    const res = await queryFaceCompare({ image1, image2 })
    console.log(res)
    res?.length && setSimilarity(Number(((res[0]?.score || 0) * 100).toFixed(2)))
  }

  return (
    <article className={styles.wrapper}>
      {
        isShow ?
          <div className={styles.comparsonBox}>
            <Badge.Ribbon text="原图" className={styles.image}>
              <ImageSimple src={image1} />
            </Badge.Ribbon>
            <div className={styles.progress}>
              <Progress type="circle" percent={similarity || 0} width={80} />
              <span>相似度</span>
            </div>
            <Badge.Ribbon text="对比图" className={styles.image}>
              <ImageSimple src={image2} />
            </Badge.Ribbon>
          </div> :
          <div className={styles.contrastBox}>
            <div className={styles.progress}>
              <UploadImg uploadImgFn={doUploadFile} onChange={onChangeImage} maxCount={1} />
              <span>人脸1</span>
            </div>
            <div className={styles.progress}>
              <div>
                <Progress type="circle" percent={similarity || 0} width={80} />
              </div>
              <div>相似度</div>
            </div>
            <div className={styles.progress}>
              <UploadImg uploadImgFn={doUploadFile} onChange={onChangeOtherImage} maxCount={1} />
              <span>人脸2</span>
            </div>
          </div>
      }
    </article>
  )
}

export default RelationFaces