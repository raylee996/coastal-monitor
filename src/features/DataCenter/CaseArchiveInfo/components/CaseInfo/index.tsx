import React, { useEffect, useState } from "react";
import { getCaseArchiveDetail } from "server/dataCenter/caseArchive";
import CaseBaseInfo from "./CaseBaseInfo";
import CaseRelationGoods from "./CaseRelationGoods";
import CaseVideoImg from "./CaseVideoImg";

interface Props {
  /** 案件档案id值 */
  id: number
}

//案件信息
const CaseInfo: React.FC<Props> = ({ id }) => {

  const [data, setData] = useState<any>()

  const [videoImg, setVideoImg] = useState<any>()

  useEffect(() => {
    main(id)
  }, [id])

  async function main(id: number) {
    const vo = await getCaseArchiveDetail({ id })
    const { imgUrls, videoUrls, ...obj } = vo || {}
    setData(obj)
    setVideoImg({ imgUrls, videoUrls })
  }

  return <>
    {/*案件基本信息*/}
    <CaseBaseInfo data={data} />
    {/*涉案物品*/}
    <CaseRelationGoods id={id} />
    {/*视图信息*/}
    <CaseVideoImg id={id} imgUrls={videoImg?.imgUrls} videoUrls={videoImg?.videoUrls} />

  </>
}

export default CaseInfo
