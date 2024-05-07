import { useCallback, useEffect, useState } from "react";
import CardButton from "../CardButton";
import CardTitle from "../CardTitle"
import CardTitleMin from "../CardTitleMin";
import CountCards from "./components/CountCards";
import styles from "./index.module.sass";
import importantShipSrc from 'images/situation/dark/important_ship.png'
import importantCarSrc from 'images/situation/dark/important_car.png'
import importantPersonSrc from 'images/situation/dark/important_person.png'
import { Carousel } from "antd";
import ShipCard from "./components/ShipCard";
import { doGetFocusTargetCountV2, doGetNearFiveShipData } from "server/situation";
/* import PersonCard from "./components/PersonCard";
import CarCard from "./components/CarCard"; */
import { useNavigate } from "react-router-dom";
import popup from "hooks/basis/Popup";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import XcEmpty from "component/XcEmpty";
import HOCPersonnelArchiveInfo from "./components/HOCPersonnelArchiveInfo";
import CarArchiveInfo from "features/DataCenter/CarArchiveInfo";


const options = [{
  name: '近一月',
  value: 1
}, {
  name: '近半年',
  value: 2
}]

const PanelTarget: React.FC = () => {
  console.debug('PanelTarget')


  const navigate = useNavigate();


  const [rangeType, setRangeType] = useState(1)
  const [count, setCount] = useState({ ship: '', person: '', car: '' })
  const [shipList, setShipList] = useState<any[]>()
  /*   const [personList, setPersonList] = useState<any[]>()
    const [carList, setCarList] = useState<any[]>() */
  const [shipSlideIdx, setShipSlideIdx] = useState(0)
  const [isShipData, setIsShipData] = useState(false)
  /*   const [isPersonData, setIsPersonData] = useState(false)
    const [isCarData, setIsCarData] = useState(false) */
  // const piccar = require('images/situation/dark/carpoint.svga')
  // const picship = require('images/situation/dark/shipport.svga')
  // const picperson = require('images/situation/dark/personport.svga')

  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()

      const vo = await doGetFocusTargetCountV2({ dateTime: rangeType }, signal)
      const voShipData = await doGetNearFiveShipData(signal)
      /*   const voPersonData = await doGetNearFivePersonData(signal)
        const voCarData = await doGetNearFiveCarData(signal) */
      setCount(vo)
      setShipList(voShipData)
      setIsShipData(voShipData.length === 0 ? false : true)
      /* setIsPersonData(voPersonData.length === 0 ? false : true)
      setIsCarData(voCarData.length === 0 ? false : true)
      setPersonList(voPersonData)
      setCarList(voCarData) */
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [rangeType])


  const handleTimeRange = useCallback((param: any) => {
    setRangeType(param)
  }, [])

  const handleImportantShip = useCallback(() => {
    navigate('dataCenter/shipArchive', {
      state: {
        focusType: '2',
      }
    })
  }, [navigate])

  const handleImportantPerson = useCallback(() => {
    navigate('dataCenter/personnelArchive', {
      state: {
        focusType: '2',
      }
    })
  }, [navigate])

  const handleImportantCar = useCallback(() => {
    navigate('dataCenter/carArchive', {
      state: {
        focusType: '2',
      }
    })
  }, [navigate])

  const handleShip = useCallback((index: any, data: any) => {
    if (index === 6) {
      navigate('dataCenter/shipArchive')
      popup(<ShipArchiveInfo id={data.archiveId} dataType={data.dataType} />, {
        title: '查看船舶档案',
        size: "fullscreen"
      })
    }
    if (index === 0) {
      navigate('dataCenter/personnelArchive')
      popup(<HOCPersonnelArchiveInfo id={data.archiveId} />, {
        title: '个人档案详情',
        size: "fullscreen"
      })
    }
    if (index === 1) {
      navigate('dataCenter/carArchive')
      popup(<CarArchiveInfo carId={data.archiveId} />, {
        title: '车辆档案详情',
        size: "fullscreen"
      })
    }
  }, [navigate])

  /*   const handlePerson = useCallback((data: any) => {
      navigate('dataCenter/personnelArchive')
      popup(<HOCPersonnelArchiveInfo id={data.archiveId} />, {
        title: '个人档案详情',
        size: "fullscreen"
      })
    }, [navigate])
  
    const handleCar = useCallback((data: any) => {
      navigate('dataCenter/carArchive')
      popup(<CarArchiveInfo carId={data.archiveId} />, {
        title: '车辆档案详情',
        size: "fullscreen"
      })
    }, [navigate]) */

  const handleCarouselShip = useCallback(
    (currentSlide: number, nextSlide: number) => {
      setShipSlideIdx(nextSlide)
    },
    [],
  )



  return (
    <article className={styles.wrapper}>
      <CardTitle text='重点目标数据' />

      <header className={styles.header}>
        <div>
          <CardTitleMin>出现个数</CardTitleMin>
        </div>
        <div>
          <CardButton
            options={options}
            defaultValue={rangeType}
            onChange={handleTimeRange}
          />
        </div>
      </header>

      <section className={styles.count}>
        <CountCards classId='ship' className={styles.countCard} srcs={importantShipSrc} value={count.ship} label='重点船舶' onClick={handleImportantShip} />
        <CountCards classId='person' className={styles.countCard} srcs={importantPersonSrc} value={count.person} label='重点人员' onClick={handleImportantPerson} />
        <CountCards classId='car' className={styles.countCard} srcs={importantCarSrc} value={count.car} label='重点车辆' onClick={handleImportantCar} />
      </section>

      <article className={styles.content} >

        <section className={styles.shipbox}>
          {isShipData ?
            <Carousel
              autoplay={true}
              dotPosition='left'
              dots={false}
              autoplaySpeed={6000}
              beforeChange={handleCarouselShip}
            >
              {shipList && shipList.map((item, index) => <ShipCard key={item.mmsi} data={item} onClick={handleShip} slideIdx={shipSlideIdx} index={index} />)}
            </Carousel> : <div className='data_center'><XcEmpty option={{ height: '50px', marginTop: '-10px' }} /></div>
          }
        </section>

        {/*  <section className={styles.personbox}>
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
        </section> */}

      </article>

    </article>
  )
}

export default PanelTarget