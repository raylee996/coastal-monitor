import { useCallback, useEffect, useState } from "react";

import CardTitle from "../CardTitle"

import styles from "./index.module.sass";

import { Carousel, message } from "antd";
import { doGetNearFiveCarData, doGetNearFivePersonData } from "server/situation";
import PersonCard from "./components/PersonCard";
import CarCard from "./components/CarCard";
import { useNavigate } from "react-router-dom";
import popup from "hooks/basis/Popup";
import CarArchiveInfo from "features/DataCenter/CarArchiveInfo";
import HOCPersonnelArchiveInfo from "./components/HOCPersonnelArchiveInfo";
import XcEmpty from "component/XcEmpty";
import { doGetPersonInfo } from "server/personnel";
import { getCarArchiveData } from "server/car";




const PersonData: React.FC = () => {
  console.debug('PersonData')


  const navigate = useNavigate();


  const [personList, setPersonList] = useState<any[]>()
  const [carList, setCarList] = useState<any[]>()

  const [isPersonData, setIsPersonData] = useState(false)
  const [isCarData, setIsCarData] = useState(false)

  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()
      const voPersonData = await doGetNearFivePersonData(signal)
      const voCarData = await doGetNearFiveCarData(signal)
      
      setIsPersonData(voPersonData.length === 0 ? false : true)
      setIsCarData(voCarData.length === 0 ? false : true)
      setPersonList(voPersonData)
      setCarList(voCarData)
    }
    main()
    const timer = setInterval(()=>{
      main()
    },1000 * 30 * 1)
    return () => {
      signal && signal.abort()
      clearInterval(timer)
    }
  }, [])




  const handlePerson = useCallback(async (data: any) => {
    // 检查人员是否有档案
    if (!data?.archiveId) {
      message.error('该人员暂无档案')
      return
    }
    const vo = await doGetPersonInfo({ id: data.archiveId })
    if (!vo) {
      message.error('该人员暂无档案')
      return
    }

    navigate('dataCenter/personnelArchive')
    popup(<HOCPersonnelArchiveInfo id={data.archiveId} />, {
      title: '个人档案详情',
      size: "fullscreen"
    })
  }, [navigate])

  const handleCar = useCallback(async (data: any) => {
    // 检查车辆是否有档案
    if (!data?.archiveId) {
      message.error('该车辆暂无档案')
      return
    }
    const vo = await getCarArchiveData(data.archiveId)
    if (!vo) {
      message.error('该车辆暂无档案')
      return
    }

    navigate('dataCenter/carArchive')
    popup(<CarArchiveInfo carId={data.archiveId} />, {
      title: '车辆档案详情',
      size: "fullscreen"
    })
  }, [navigate])




  return (
    <article className={styles.wrapper}>
      <CardTitle text='实时人车数据' />
      <section className={styles.personbox}>
        {isPersonData ?
          <Carousel
            autoplay={true}
            dotPosition='left'
            dots={false}
          >
            {personList && personList.map(item => <PersonCard key={item.archiveId} data={item} onClick={handlePerson} />)}
          </Carousel> : <div className='data_center'><XcEmpty option={{ height: '50px', marginTop: '-10px' }} /></div>
        }
      </section>

      <section className={styles.carbox}>
        {isCarData ?
          <Carousel
            autoplay={true}
            dotPosition='left'
            dots={false}
          >
            {carList && carList.map(item => <CarCard key={item.archiveId} data={item} onClick={handleCar} />)}
          </Carousel> : <div className='data_center'><XcEmpty option={{ height: '50px', marginTop: '-10px' }} /></div>
        }
      </section>
    </article>
  )
}

export default PersonData