import { Collapse, message } from "antd";
import MapMarkPoint from "component/MapMarkPoint";
import XcEmpty from "component/XcEmpty";
import CarArchiveInfo from "features/DataCenter/CarArchiveInfo";
import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import { getIconByDeviceType, getMapAisTargetIcon, getMapRadarTargetIcon } from "helper/mapIcon";
import popup from "hooks/basis/Popup";
import { isNumber } from "lodash";
import { useEffect, useState } from "react";
import { getRelationResultList } from "server/core/wisdomSearch";
import { queryImageVideoList } from "server/dataCenter/shipSailing";
import { getDeviceAllAsync } from "server/place";
import MoreBasicInfo, { MoreBasicInfoData } from "../MoreBasicInfo";
import RelationBasicInfo from "../RelationBasicInfo";
// import RelationCode from "../RelationCode";
import RelationFaces from "../RelationFaces";
import RelationImage from "../RelationImage";
import RelationVideo from "../RelationVideo";
import styles from "./index.module.sass";

interface DetailProps {
  /** 智搜数据类型：0人脸 1 车牌 2 IMSI 3 IMEI 4 MAC 5 手机 6 AIS 7 RADAR 8融合 9视频 -1全局智搜  */
  active: any;
  /** 主题名称 */
  label?: string
  /** 图片查询条件 */
  queryImage?: any[]
  /** table中的请求参数 */
  params?: any
}

const { Panel } = Collapse;

type ObjKeyString = { [key: string]: any }

const DefaultActiveKeyArray = [
  // 内容对应 '100'-基本信息 '101'-更多属性 '102'-关联视频 '103'-关联图片 '6'-关联船舶 '2'-关联侦码(IMSI) '0'-关联人脸 '1'-关联车辆 '104'-比对信息 '105'-位置信息
  ['100', '6', '2', '1', '104', '105'], // 人脸
  ['100', '101', '6', '2', '0', '105'], // 车牌
  ['100', '6', '0', '1', '105'], // IMSI
  [], // IMEI
  [], // MAC
  [], // 手机
  ['100', '102', '103', '2', '0', '105'], // AIS
  ['100', '102', '103', '2', '0', '105'], // RADAR
  [],
  [],
  [],
  [],
  ['100'], // 身份证
]

const BasicInfoKey: ObjKeyString = {
  '0': [ // 0人脸
    { label: '姓名', key: 'name' },
    { label: '性别', key: 'genderName' },
  ],
  '1': [ // 1车辆
    { label: '车牌号', key: 'content' },
    { label: '车型', key: 'vehicleTypeName' },
    { label: '车牌颜色', key: 'plateColorName' },
    { label: '车身颜色', key: 'vehicleColorName' },
  ],
  '2': [ // 侦码 2IMSI
    { label: 'IMSI', key: 'imsi' },
  ],
  '6': [ // 船舶 6AIS
    { label: 'MMSI', key: 'content' },
    { label: '船长', key: 'ship_long' },
    { label: '船宽', key: 'ship_wide' },
    { label: '船籍', key: 'registry' },
  ],
  '7': [ // 雷达 7RADAR
    { label: '雷达批号', key: 'content' },
    { label: '目标ID', key: 'target_id' },
    { label: 'MMSI', key: 'mmsi' },
  ],
}

const SearchDetail: React.FC<DetailProps> = ({ active, label, params }) => {
  console.debug('SearchDetail')

  /**
   * 解构智搜数据类型 数据id
   * 智搜数据类型：0人脸 1 车牌 2 IMSI 3 IMEI 4 MAC 5 手机 6 AIS 7 RADAR 8融合 9视频 -1全局智搜
   */
  const { codeType, archive_id, content, customTime } = active

  const [defaultActiveKey, setDefaultActiveKey] = useState(codeType ? DefaultActiveKeyArray[codeType] : [])

  const [data, setData] = useState<ObjKeyString>()

  const [basicInfo, setBasicInfo] = useState<any>()

  const [moreBasicInfo, setMoreBasicInfo] = useState<MoreBasicInfoData>([])

  const [aisBasicInfo, setAisBasicInfo] = useState<any>()

  const [pointList, setPointList] = useState<any[]>()

  const [faceSimilarity, setFaceSimilarity] = useState<{ image1?: string; image2?: string; similarity?: number }>()

  const [allDeviceList, setAllDeviceList] = useState<any>([])

  useEffect(() => {
    isNumber(codeType) && setDefaultActiveKey(DefaultActiveKeyArray[codeType])
  }, [codeType])

  useEffect(() => {
    async function getAllDeviceList() {
      let _deviceList = await getDeviceAllAsync()
      setAllDeviceList(_deviceList)
    }
    getAllDeviceList()
  }, [])


  useEffect(() => {

    if (isNumber(codeType) && content && active) {
      // 需要查询关联数据 以类型为key保存到数组中
      const relation = defaultActiveKey.filter(item => Number(item) < 10)
      relation.map(async item => {
        const relust = await getRelationResult({ srcCodeType: codeType, codeValue: content, tagCodeType: item, archiveId: archive_id })
        setData(val => {
          let obj: ObjKeyString = {}
          obj[item] = relust
          return { ...val, ...obj }
        })
        // 关联船舶是从中获取船舶信息
        item === '6' && relust?.length && defaultActiveKey.includes('6') && getBasicInfo(6, relust[0], setAisBasicInfo)
        return item
      })
      // 基本属性与更多属性
      defaultActiveKey.includes('100') && getBasicInfo(codeType, active)
      // 更多属性暂不对接
      defaultActiveKey.includes('101') && setMoreBasicInfo([])
      // 是否需要查询关联的图片与视频，（需要传递查询时间段）
      if (defaultActiveKey.includes('102')) {
        getImageVideo({ fileType: '02,03', codeType, codeValue: content, customTime }).then(res => {
          setData(val => {
            return { ...val, ...{ '102': res?.video || [] } }
          })
        })
      }
      if (defaultActiveKey.includes('103')) {
        getImageVideo({ fileType: '01', codeType, codeValue: content, customTime }).then(res => {
          setData(val => {
            return { ...val, ...{ '103': res?.image || [] } }
          })
        })
      }
      // 获取人脸比对信息
      defaultActiveKey.includes('104') && setFaceSimilarity({ image2: params?.faceId?.length ? params?.faceId[params?.faceId.length - 1].path : '', image1: active?.path })
      // 位置信息 获取经纬度
      if (defaultActiveKey.includes('105') && active?.latitude && active?.longitude && allDeviceList.length > 0) {
        let currentDeviceObj = allDeviceList.find((item: any) => item.deviceCode === active.deviceCode)
        let toolTipName: any = ''
        let lIcon: any = getMapAisTargetIcon({
          riskLevel: 3,
          caseBottom: 0
        })

        // 数据为空或获取不到deviceType时不进行标注
        if(!currentDeviceObj?.deviceType) return

        // * 智搜数据类型：0人脸 1 车牌 2 IMSI 3 IMEI 4 MAC 5 手机 6 AIS 7 RADAR 8融合 9视频 - 1全局智搜
        // 根据不同类型，展示不同的icon
        switch (active.codeType) {
          case 0:
            lIcon = getIconByDeviceType(currentDeviceObj.deviceType)
            toolTipName = currentDeviceObj.name
            break;
          case 1:
            lIcon = getIconByDeviceType(currentDeviceObj.deviceType)
            toolTipName = currentDeviceObj.name
            break;
          case 6:
            lIcon = getMapAisTargetIcon({
              riskLevel: 0,
              caseBottom: 0
            })
            toolTipName = active.cn_name
            break;
          case 7:
            lIcon = getMapRadarTargetIcon({
              riskLevel: 0,
              caseBottom: 0
            })
            toolTipName = active.content
            break;
          default:
            break;
        }
        const markerOptions = {
          icon: lIcon
        }
        setPointList([{
          latLng: [active.latitude, active.longitude],
          markerId: active.content,
          markerOptions,
          toolTipName
        }])
      }
    }
  }, [active, codeType, defaultActiveKey, content, params?.faceId, customTime, archive_id, allDeviceList])

  // 处理基本信息
  async function getBasicInfo(codeType: any, activeObj: any, func?: Function) {
    const basicInfoKeys = codeType || codeType === 0 ? BasicInfoKey[codeType] : []
    let arr = basicInfoKeys.map((item: any) => {
      return {
        key: item.key,
        label: item.label,
        value: activeObj[item.key]
      }
    })
    const res = { arr, path: activeObj.img_path || activeObj.path, ...(codeType === 6 ? { codeValue: activeObj?.codeValue } : {}) }
    // 处理基本信息
    func ? func(res) : setBasicInfo(res)
  }

  // 请求关联数据 值和类型 0.人脸 1.车辆 2.IMSI 3.IMEI 4.MAC 5.手机 6.MMSI 7.雷达批号 8.目标ID
  async function getRelationResult(params: any) {
    const res = await getRelationResultList(params)
    return res
  }

  // 请求图片或视频
  async function getImageVideo(params: any) {
    const dto = {
      pageSize: 8,
      ...params
    }
    const res = await queryImageVideoList(dto)
    return res
  }

  // 弹窗对应的档案信息
  async function handleBasic() {
    if (!archive_id) {
      return openMessage()
    }
    if ([6, 7].includes(codeType)) { // 船舶、雷达
      openShipArchive(archive_id, codeType)
    }
    else if ([0].includes(codeType)) {
      popup(<PersonnelArchiveInfo id={archive_id} />, { title: '个人档案详情', size: "fullscreen" })
    }
    else if ([1].includes(codeType)) {
      popup(<CarArchiveInfo carId={archive_id} />, { title: '车辆档案详情', size: "fullscreen" })
    }
  }

  function openShipArchive(id: any, codeType: number) {
    if (!id) {
      return openMessage()
    }
    popup(<ShipArchiveInfo id={id} dataType={codeType === 6 ? 1 : 2} />, { title: '查看船舶档案', size: "fullscreen" })
  }

  function openFaceArchive(data: any) {
    if (!data?.archiveId) {
      return openMessage()
    }
    popup(<PersonnelArchiveInfo id={data.archiveId} />, { title: '个人档案详情', size: "fullscreen" })
  }

  function openMessage() {
    message.error('暂无档案！')
    return
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.contentLabel}>{label || '详细信息'}</div>
      <div className={styles.content}>
        {
          defaultActiveKey?.length ? <Collapse defaultActiveKey={defaultActiveKey} ghost>
            {
              defaultActiveKey.includes('100') && <Panel header="基本信息" key="100" className={styles.contentItem}>
                <RelationBasicInfo content={basicInfo?.arr} path={basicInfo?.path} btnFunc={handleBasic} />
              </Panel>
            }
            {
              defaultActiveKey.includes('101') && <Panel header="更多属性" key="101" className={styles.contentItem}>
                <MoreBasicInfo data={moreBasicInfo} />
              </Panel>
            }
            {
              defaultActiveKey.includes('102') && <Panel header="关联视频" key="102" className={styles.contentItem}>
                <RelationVideo videoList={data ? data['102'] : []} />
              </Panel>
            }
            {
              defaultActiveKey.includes('103') && data && data['103'] && <Panel header="关联图片" key="103" className={styles.contentItem}>
                <RelationImage imageList={data ? data['103'] : []} />
              </Panel>
            }
            {
              defaultActiveKey.includes('6') && <Panel header="关联船舶" key="6" className={styles.contentItem}>
                <RelationBasicInfo content={aisBasicInfo?.arr} path={aisBasicInfo?.path} btnFunc={() => openShipArchive(aisBasicInfo?.archiveId, 6)} />
              </Panel>
            }
            {/* 南山项目暂无侦码内容 */}
            {/* {
              defaultActiveKey.includes('2') && <Panel header="关联侦码" key="2" className={styles.contentItem}>
                <RelationCode dataSource={data ? data['2'] : []} />
              </Panel>
            } */}
            {
              defaultActiveKey.includes('0') && <Panel header="船员信息" key="0" className={styles.contentItem}>
                <RelationImage imageList={data ? data['0'] : []} isButton={true}
                  btnOptions={{ btnText: '查看档案', func: openFaceArchive }}
                  btnProps={{ type: "link" }}
                />
              </Panel>
            }
            {
              defaultActiveKey.includes('1') && <Panel header="关联车辆" key="1" className={styles.contentItem}>
                <RelationImage imageList={data ? data['1'] : []} keyArray={['codeValue']} />
              </Panel>
            }
            {
              defaultActiveKey.includes('104') && <Panel header="比对信息" key="104" className={styles.contentItem}>
                <RelationFaces isShow={true} image1={faceSimilarity?.image1} image2={faceSimilarity?.image2} similarity={faceSimilarity?.similarity} />
              </Panel>
            }
            {
              defaultActiveKey.includes('105') && <Panel header="位置信息" key="105" className={styles.contentItem}>
                <section className={styles.mapBox}>
                  <MapMarkPoint pointList={pointList || undefined} />
                </section>
              </Panel>
            }
          </Collapse> : <XcEmpty />
        }

      </div>
    </article>
  )
}

export default SearchDetail