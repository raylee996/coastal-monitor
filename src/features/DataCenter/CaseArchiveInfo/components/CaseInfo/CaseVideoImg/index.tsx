import React, { useEffect, useState } from "react";
import styles from "./index.module.sass";
import UploadImageTable from "component/UploadImageTable";
import { doUploadFile } from "server/common";
import UploadVideoTable from "component/UploadVideoTable";
import { updateCaseMediumUrls } from "server/dataCenter/caseArchive";

interface Props {
  /** 案件档案 */
  id: number
  /** 图片信息 */
  imgUrls: any,
  /** 视频信息 */
  videoUrls: any
}

//案件视图信息
const CaseVideoImg: React.FC<Props> = ({ id, imgUrls, videoUrls }) => {
  console.debug('CaseVideoImg')


  const [imageUrl, setImageUrl] = useState<any>()
  const [videoUrl, setVideoUrl] = useState<any>()


  useEffect(() => {
    imgUrls && setImageUrl(imgUrls)
    videoUrls && setVideoUrl(videoUrls)
  }, [imgUrls, videoUrls])


  async function imageUpdate(arr: any[]) {
    const res = await updateCaseMediumUrls({ id, type: 1, imgUrls: arr.map(v => v.path).filter(v => v).join(",") })
    if (res?.imgUrls) {
      res?.imgUrls && setImageUrl(res?.imgUrls.split(","))
    } else {
      setImageUrl(null)
    }
  }

  async function videoUpdate(arr: any[]) {
    const res = await updateCaseMediumUrls({ id, type: 2, videoUrls: arr.map(v => v.path).filter(v => v).join(",") })
    console.log(res)
    if (res?.videoUrls) {
      res?.videoUrls && setVideoUrl(res?.videoUrls.split(","))
    } else {
      setVideoUrl(null)
    }
  }


  return <>
    <div className={styles.top}>
      <UploadImageTable value={imageUrl} uploadImgFn={doUploadFile} uploadCallback={imageUpdate} />
    </div>
    <div className={styles.top}>
      <UploadVideoTable value={videoUrl} uploadVideoFn={doUploadFile} uploadCallback={videoUpdate} />
    </div>
  </>
}

export default CaseVideoImg
