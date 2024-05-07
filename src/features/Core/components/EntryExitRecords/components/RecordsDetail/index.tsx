import { EnvironmentOutlined, FieldTimeOutlined } from "@ant-design/icons";
import XcEmpty from "component/XcEmpty";
import { defaultImgPeople } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import { useEffect, useState } from "react";
import { getRelativeFaceCarList, getSailorInfoList } from "server/core/entryExitRecords";
import styles from "./index.module.sass";


const allIconList = ['yanjing', 'maozi', 'kouzhao', 'nv', 'nan']

const radioList = [
  { key: '0', label: '船员信息', icon: '' },
  { key: '1', label: '关联人脸', icon: '' },
  { key: '2', label: '关联车辆', icon: '' },
]

const keyToProps: { [key: string]: string } = {
  '0': 'first',
  '1': 'second',
  '2': 'third'
}

interface Props {
  active: any
}

const RecordsDetail: React.FC<Props> = ({ active }) => {
  console.debug('RecordsDetail')

  const [value, setValue] = useState<string>('0')

  const [faceInfo, setFaceInfo] = useState<any[]>([])

  const [carInfo, setCarInfo] = useState<any[]>([])

  const [basicInfo, setBasicInfo] = useState<any[]>([])

  useEffect(() => {
    const { id, codeValue, codeType, capTime } = active
    // 获取船员信息
    id && codeValue && codeType && getSailorInfo(id, codeValue, codeType)
    // 获取关联信息（人脸、车辆）
    codeValue && codeType && getRelativeFaceCarInfo(codeValue, codeType, capTime)
  }, [active])

  async function getSailorInfo(id: any, codeValue: any, codeType: number) {
    const res = await getSailorInfoList({ businessType: '06', businessId: id, codeValue, codeType })
    setBasicInfo(res)
  }

  async function getRelativeFaceCarInfo(codeValue: any, srcCodeType: number, capTime: string) {
    const res = await getRelativeFaceCarList({ codeValue, srcCodeType, capTime })
    res?.face && setFaceInfo(res.face)
    res?.car && setCarInfo(res.car)
  }

  function handleChange(activeKey: string) {
    setValue(activeKey);
  }

  return (
    <article className={styles.wrapper}>
      <div className={`${styles.wrapperContent} ${styles[`${keyToProps[value]}_bg`]}`}>
        <div className={styles.tabs}>
          {radioList.map(item =>
            <div className={styles.tabItem} key={item.key} onClick={() => handleChange(item.key)}>
              <div className={`${styles.tabLabel} ${value === item.key ? styles.active : ''}`}>{item.label}</div>
            </div>
          )}
        </div>
        <div className={styles.content}>
          {value === '0' && (basicInfo?.length ? basicInfo.map((item, index) =>
            <div key={index} className={`${styles.box} ${index % 2 === 0 ? styles.box_even_bg : styles.box_odd_bg}`}>

              <div className={styles.image}>
                <ImageSimple src={item?.xcSailor?.imgPath} width={'100%'} height={'100%'} defaultSrc={defaultImgPeople}/>
              </div>

              <div className={`${styles.image} ${item?.standFace ? styles.failImage : ''}`}>
                <div className={styles.badge}>抓拍</div>
                <ImageSimple src={item?.standFace?.path2 || item?.standFace?.path1} width={'100%'} height={'100%'} defaultSrc={defaultImgPeople}/>
              </div>

              <div className={styles.textContent}>

                <div className={styles.textBox}>
                  <div className={styles.textFirstBox}>
                    <span>人员：</span>
                    <div className={styles.text} title={item?.xcSailor?.name}>{item?.xcSailor ? (item.xcSailor.name || '--') : '未登记'}</div>
                  </div>
                  <div className={styles.iconListBox}>
                    <div className={`${styles.iconContent} ${styles.iconContentHeight}`}>
                      {allIconList.map((v, idx) => {
                        if (!item?.standFace) {
                          return ( // 未抓拍时不展示图标 遍历图标
                            <div className={`${styles.icon} ${styles.iconItemHeight} ${styles.none_bg}`} key={idx}></div>
                          )
                        }
                        return ( // 抓拍到时展示所有图标，有特征的高亮背景
                          <div className={`${styles.icon} ${styles.iconItemHeight} ${item?.standFace?.iconList.includes(v) ? styles.possess : styles.discard}`} key={idx}>
                            <span className={`${styles.iconStyle} iconfont icon-${v}`}></span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.textBox}>
                  <span>时间：</span>
                  {
                    item?.standFace?.capTime ? <div className={styles.text} title={item.standFace.capTime}>{item.standFace.capTime}</div>
                      : '--'
                  }
                </div>
                <div className={styles.textBox}>
                  <span>点位：</span>
                  {
                    item?.standFace?.capAddress ? <div className={styles.text} title={item.standFace.capAddress}>{item.standFace.capAddress}</div>
                      : '--'
                  }
                </div>
              </div>

            </div>
          ) : <XcEmpty />)}

          {value === '1' && (faceInfo?.length ? faceInfo.map((item, index) =>
            <div key={item.id} className={`${styles.box} ${index % 2 === 0 ? styles.box_even_bg : styles.box_odd_bg}`}>
              <div className={styles.image}>
                <ImageSimple src={item.path} width={'100%'} height={'100%'} />
              </div>
              <div className={styles.textContent}>
                <div className={styles.textBox}>
                  <div className={styles.textFirstBox}>
                    <span>姓名：</span>
                    <div className={styles.text} title={item.name}>{item.name || '--'}</div>
                  </div>
                  <div className={styles.iconListBox}>
                    <div className={`${styles.iconContent} ${styles.iconContentHeight}`}>
                      {allIconList.map(v => // 抓拍到时展示所有图标，有特征的高亮背景 遍历图标
                        <div className={`${styles.icon} ${styles.iconItemHeight} ${item?.iconList.includes(v) ? styles.possess : styles.discard}`} key={v}>
                          <span className={`${styles.iconStyle} iconfont icon-${v}`}></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.textBox}>
                  <span>时间：</span>
                  <div className={styles.text} title={item.capTime}>{item.capTime || '--'}</div>
                </div>
                <div className={styles.textBox}>
                  <span>点位：</span>
                  <div className={styles.text} title={item.capAddress}>{item.capAddress || '--'}</div>
                </div>
              </div>
            </div>
          ) : <XcEmpty />)}

          {value === '2' && (carInfo?.length ? carInfo.map(item =>
            <div key={item.id} className={styles.box}>
              <div className={styles.image}>
                <ImageSimple src={item.path} />
                <div className={styles.imageText}>{item.name}</div>
              </div>
              <div className={`${styles.iconBox} ${styles.faceWidth}`}>
                <div>车牌：{item.licensePlate || '--'}</div>
                <div className={`${styles.text} ${styles.faceTop} ${styles.faceLineHight}`} title={item.address}><EnvironmentOutlined className={styles.iconFirst} />{item.address || '--'}</div>
                <div className={`${styles.text} ${styles.faceLineHight}`} title={item.time}><FieldTimeOutlined className={styles.iconFirst} />{item.capTime || '--'}</div>
              </div>
            </div>
          ) : <XcEmpty />)}
        </div>
      </div>
    </article>
  )
}

export default RecordsDetail