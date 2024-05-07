import ImageSimple from "hooks/basis/ImageSimple";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import '../../../../../dataCenter.sass'
import { PaginationProps } from "antd";
import { ChildProps } from "component/InventedList";
import VideoSimple from "component/VideoSimple";
import TableInterface from "hooks/integrity/TableInterface";

type ImageProps = { id: number; picUrl: string; createTime: string }

interface VideoProps extends ImageProps {
  videoUrl: string
}

export type MediaProp = { image: ImageProps[]; video: VideoProps[] }

interface Props {
  /** 表格的异步请求数据函数 */
  request?: (params: any) => Promise<MediaProp>
  /**  */
  params?: any
  /** 图片与视频合集 */
  data?: MediaProp
  resetEmpty?: boolean
}

const ImageCardItem: React.FC<ChildProps> = (props) => {
  console.debug('DrawRectangleCardItem')
  const { data } = props
  return <li key={data.id}>
    <div className={styles.sourceSrc}>
      <ImageSimple src={data.picUrl} width='100%' height='100%' alt='' />
    </div>
    <p className={styles.sourceSrcTitle}>{data.capTime || '暂无时间'}</p>
  </li>
}

const VideoCardItem: React.FC<{ data: any }> = ({ data }) => {
  console.debug('VideoCardItem')
  return <li key={data.id}>
    <div className={styles.sourceSrc}>
      <VideoSimple
        getVideoParams={{
          startTime: data.vstartTime,
          endTime: data.vendTime,
          deviceChannelCode: data.channel,
          deviceCode: data.deviceCode,
        }}
        posterImage={data.picUrl}
      />
    </div>
    <p className={styles.sourceSrcTitle}>{data.capTime || '暂无时间'}</p>
  </li>
}

const paginationProps: PaginationProps = {
  size: 'small',
  simple: true,
  pageSize: 3,
  showTotal: () => ''
}
const CommonMedia: React.FC<Props> = ({ request, params }) => {
  console.debug('CommonMedia')

  const [imageList, setImageList] = useState<any[]>([])
  const [videoList, setVideoList] = useState<any[]>([])

  useEffect(() => {
    async function main() {
      const res = request ? await request(params) : undefined

      setImageList(res?.image || [])
      setVideoList(res?.video || [])
    }
    params && main()
  }, [params, request])

  return (
    <div className={styles.box}>

      <div className={styles.right}>
        <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联图片</div>
        <TableInterface
          tableDataSource={imageList}
          card={ImageCardItem}
          paginationProps={paginationProps}
        />
        {/*  {imageList?.length ?
          <div className={styles.listBox}><InventedList list={imageList} Children={ImageCardItem} viewCount={10} /></div>
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        } */}
      </div>

      <div className={styles.right}>
        <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联视频</div>
        <TableInterface
          tableDataSource={videoList}
          card={VideoCardItem}
          paginationProps={paginationProps}
        />
        {/*  {videoList?.length ?
          <div className={styles.listBox}><InventedList list={videoList} Children={VideoCardItem} viewCount={10} /></div>
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        } */}
      </div>

    </div>
  )
}

export default CommonMedia