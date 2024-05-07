import styles from "./index.module.sass";
import { Col, Row, Image, PaginationProps, Form, Button, Popconfirm } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { doGetShipGallery, getShipImgList, updateShipImg } from "server/ship";
import TableInterface from "hooks/integrity/TableInterface";
import ImageSimple from "hooks/basis/ImageSimple";
import XcEmpty from "component/XcEmpty";
import { InputType } from "hooks/flexibility/FormPanel";
import RelationVideo from "features/Core/components/WisdomSearch/components/RelationVideo";
import VideoSimple from "component/VideoSimple";
import { TableCardProps } from "hooks/flexibility/CardPanel";
import dayjs from "dayjs";

// const { RangePicker } = DatePicker;

enum ColStyle {
  md = 24,
  lg = 12
}

const paginationProps: PaginationProps = {
  showQuickJumper: true,
  showSizeChanger: true,
  pageSize: 12, //每页项数
  pageSizeOptions: [10, 12, 20, 50, 100],
}

// 照片库列表
const ImageGallery: React.FC<any> = (props: any) => {


  const handleConfirm = useCallback(
    async () => {
      props.onAction('updateImg', props.data.picUrl)
    },
    [props],
  )

  const handleClick = useCallback(
    () => {
      props.onAction('preview', props.data)
    },
    [props],
  )


  return (
    <div className={`${styles.gallery}`}>
      <div className={styles.galleryImg}>
        <ImageSimple
          className={styles.img}
          src={props.data.picUrl}
          preview={false}
          onClick={handleClick}
        />
        <Popconfirm title='确认设置图片为船舶档案头像？' onConfirm={handleConfirm}>
          <Button className={styles.shipImg} type='text' size="small">设为档案头像</Button>
        </Popconfirm>
      </div>
      <div className={styles.viewTitle}>
        {props.data.createTime}
      </div>
    </div>
  )
}

// 视频库列表
const VideoGallery: React.FC<TableCardProps<any>> = ({ index, data }) => {

  const getVideoParams = useMemo(() => ({
    startTime: data.vstartTime,
    endTime: data.vendTime,
    deviceChannelCode: data.channel,
    deviceCode: data.deviceCode,
  }), [data])

  return (
    <div className={`${styles.gallery} ${(index + 1) % 3 === 0 ? styles.delMarginLeft : ''}`} >
      <div className={styles.galleryImg}>
        {data.fileType === '03'
          ? <VideoSimple getVideoParams={getVideoParams} posterImage={data.picUrl} />
          : <VideoSimple src={data.videoUrl} posterImage={data.picUrl} />
        }
      </div>
      <div className={styles.viewTitle}>
        {data.capTime || data.createTime}
      </div>
    </div>
  )
}


interface IShipViewGallery {
  id?: any
  /** 船舶数据类型 1-AIS 2-雷达 */
  dataType?: number
  onLoadShipInfo?: () => Promise<any>
}

// 视图库页
const ShipViewGallery: React.FC<IShipViewGallery> = ({ id, dataType, onLoadShipInfo }) => {
  console.debug('ShipViewGallery')


  // 船舶档案-档案照片
  const [shipImgList, setShipImgList] = useState<any>([])
  const [form] = Form.useForm()
  const customerTime = Form.useWatch('customerTime', form);

  // 船舶档案-档案视频
  const [shipVideoList, setShipVideoList] = useState<any>([])

  // 档案图片的预览
  const [visible, setVisible] = useState(false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState<number>(0)

  // 照片库的批量预览
  const [imgsVisible, setImgsVisible] = useState(false)
  const [previewImgsList, setPreviewImgsList] = useState<any>([])
  const [currentImgsVisibleIndex, setCurrentImgsVisibleIndex] = useState(0)

  // 时间搜索
  const searchInputs = [
    ['时间', 'customerTime', InputType.dateRange]
  ]

  useEffect(() => {
    // 获取档案照片，档案视频
    async function main() {
      // 档案照片
      let imgData = await doGetShipGallery({ id, fileType: '01', businessType: dataType === 1 ? '12_1' : '12_2', dataType, hasShip: 1 })
      setShipImgList(imgData.data)

      // 档案视频
      let videoData = await doGetShipGallery({ id, fileType: '02,03', businessType: dataType === 1 ? '12_1' : '12_2', dataType })
      setShipVideoList(videoData.data)
    }
    id && main()
  }, [dataType, id])

  // 根据时间提前获取所有照片库的列表
  useEffect(() => {
    async function getPreviewList() {
      let vo = await getShipImgList({ pageNumber: 1, pageSize: -1 }, { archiveId: id, fileType: '01', dataType, customerTime, hasShip: 1 })
      setPreviewImgsList(vo.data)
    }
    getPreviewList()
  }, [customerTime, dataType, id])


  let queryInit = useMemo(() => ({ customerTime: [dayjs().subtract(3, 'month'), dayjs()] }), [])

  const extraParams = useMemo(() => ({ archiveId: id, fileType: '01', dataType, hasShip: 1 }), [dataType, id])

  async function handleImageActions(type: any, data: any) {
    if (type === 'updateImg') {
      await updateShipImg(id, dataType || 1, data)
      onLoadShipInfo && onLoadShipInfo()
    } else if (type === 'preview') {
      // 获取当前点击的图片位置
      let currentIndex = previewImgsList.findIndex((item: any) => {
        return item.id === data.id
      })
      setCurrentImgsVisibleIndex(currentIndex)
      setImgsVisible(true)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panelList}>
        <Row gutter={{ xs: 24, sm: 12, md: 12, lg: 12 }}>
          <Col md={ColStyle.md} lg={ColStyle.lg} >
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                <div className={styles.subTitle}><span className={`iconfont icon-zhuangshitubiao ${styles.titleIconFont}`}></span>档案照片</div>
              </div>
              <div className={`${styles.panelContent} ${styles.panelContentOne}`}>
                <div className={styles.viewList}>
                  {
                    // 档案照片
                    shipImgList.length !== 0 ?
                      shipImgList.map((shipImgItem: any, shipImgIndex: number) => {
                        return (
                          <div key={'ship_img_item' + shipImgIndex} className={styles.viewItem} onClick={() => { setVisible(true); setCurrentVisibleIndex(shipImgIndex) }}>
                            <div className={styles.viewItemImg}>
                              <ImageSimple src={shipImgItem.picUrl} preview={false} />
                            </div>
                            <div className={styles.viewImgTitle}>{shipImgItem.createTime}</div>
                          </div>
                        )
                      })
                      :
                      <XcEmpty />
                  }
                  <div style={{ display: 'none' }}>
                    <Image.PreviewGroup preview={{ visible, onVisibleChange: (vis) => setVisible(vis), current: currentVisibleIndex }}>
                      {
                        shipImgList.map((shipImgItem: any) => {
                          return (
                            <Image src={shipImgItem.picUrl} key={shipImgItem.id}></Image>
                          )
                        })
                      }
                    </Image.PreviewGroup>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col md={ColStyle.md} lg={ColStyle.lg}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                <div className={styles.subTitle}>
                  <span className={`iconfont icon-zhuangshitubiao ${styles.titleIconFont}`}></span>档案视频
                </div>
              </div>
              <div className={`${styles.panelContent} ${styles.panelContentOne}`}>
                <div className={styles.viewList}>
                  {
                    // 档案视频
                    shipVideoList.length ? <RelationVideo videoList={shipVideoList} /> : <XcEmpty />
                  }

                </div>
              </div>
            </div>
          </Col>

          <Col md={ColStyle.md} lg={ColStyle.lg}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                <div className={styles.subTitle}>
                  <span className={`iconfont icon-zhuangshitubiao ${styles.titleIconFont}`}></span>照片库
                </div>
              </div>
              <div className={`${styles.panelContent}`}>
                <TableInterface
                  queryForm={form}
                  queryInputs={searchInputs}
                  queryData={queryInit}
                  card={ImageGallery}
                  extraParams={extraParams}
                  request={getShipImgList}
                  cardOptions={{
                    isFlex: true,
                    onCardActions: handleImageActions
                  }}
                  paginationProps={paginationProps}
                />
              </div>
              <div style={{ display: 'none' }}>
                <Image.PreviewGroup preview={{ visible: imgsVisible, current: currentImgsVisibleIndex, onVisibleChange: (vis) => setImgsVisible(vis) }}>
                  {
                    previewImgsList.map((shipImgItem: any) => {
                      return (
                        <Image key={shipImgItem.id} src={shipImgItem.picUrl}></Image>
                      )
                    })
                  }
                </Image.PreviewGroup>
              </div>
            </div>
          </Col>

          <Col md={ColStyle.md} lg={ColStyle.lg}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                <div className={styles.subTitle}>
                  <span className={`iconfont icon-zhuangshitubiao ${styles.titleIconFont}`}></span>视频库
                </div>
              </div>
              <div className={`${styles.panelContent}`}>
                <TableInterface
                  queryInputs={searchInputs}
                  queryData={queryInit}
                  card={VideoGallery}
                  extraParams={{ archiveId: id, fileType: '02,03', dataType }}
                  request={getShipImgList}
                  cardOptions={{
                    isFlex: true,
                  }}
                  paginationProps={paginationProps}
                />
              </div>
            </div>
          </Col>

        </Row>
      </div>
    </div>
  )
}

export default ShipViewGallery