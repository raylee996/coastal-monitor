import { useEffect, useState } from "react";
import BackgroundBox from "./components/BackgroundBox";
import PanelAlarm from "./components/PanelAlarm";
import PanelCollection from "./components/PanelCollection";
import PanelControl from "./components/PanelControl";
import PanelPlace from "./components/PanelPlace";
import PanelReal from "./components/PanelReal";
import PanelTarget from "./components/PanelTarget";
import PanelVideo from "./components/PanelVideo";
import styles from "./index.module.sass";
import './dataCent.sass'
import PersonData from "./components/PersonData";

const DataCenterHome: React.FC = () => {
  console.debug('DataCenterHome')

  const [isWhite, setIsWhite] = useState(() => {
    let date = new Date()
    let hour = date.getHours()
    if (hour >= 18 || hour <= 6) {
      return false
    } else {
      return true
    }
  })


  const [step, setStep] = useState(0)


  useEffect(() => {

    const timer = setInterval(() => {
      setStep(val => {
        const result = val + 1
        if (result > 2) {
          clearInterval(timer)
        }
        return result
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      let data = localStorage.getItem('skin')
      if (data) {
        let param = JSON.parse(data)
        if (!param.auto) {
          return
        }
      }
      let date = new Date()
      let hour = date.getHours()
      if (hour >= 18 || hour <= 6) {
        setIsWhite(false)
      } else {
        setIsWhite(true)
      }
    }, 1000 * 60 * 10)
    return () => clearInterval(timer)
  }, [])

  /* useEffect(() => {
    let time: any
    let x = ran(950, 950)
    let xdiv = 2
    move()
    function move() {
      time = setInterval(() => {
        let img: any = document.getElementsByClassName('yunImg')
        let imgCont: any = img[0]
        let imgContRight: any = img[1]
        let maxw = 950 - imgCont.offsetWidth
        x += ran(xdiv, 0)
        if (x >= maxw) {
          x = maxw
          xdiv = -xdiv
          clearInterval(time)
          setTimeout(() => { move() }, 5000)
        }
        if (x <= 40) {
          x = 40
          xdiv = -xdiv
          clearInterval(time)
          setTimeout(() => { move() }, 5000)
        }
        imgCont.style.left = x + 'px'
        imgContRight.style.right = x + 'px'
      }, 10)
    }

    function ran(max: any, min: any) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    return () => clearInterval(time)
  }, []) */

  useEffect(() => {
    const times = setInterval(() => {
      let data = localStorage.getItem('skin')
      if (data) {
        let param = JSON.parse(data)
        if (param.sun && !param.moon) {
          setIsWhite(true)
        }
        if (!param.sun && param.moon) {
          setIsWhite(false)
        }
        if (param.auto) {
          let date = new Date()
          let hour = date.getHours()
          if (hour >= 18 || hour <= 6) {
            setIsWhite(false)
          } else {
            setIsWhite(true)
          }
        }
      }
    }, 1000)
    return () => clearInterval(times)
  }, [])

  useEffect(() => {
    let article: any = document.getElementsByClassName('centerhome')[0]
    let boxWidth = article.clientWidth
    let boxHeight = article.clientHeight
    const timer = setInterval(() => {
      const rain: any = document.createElement('div')
      rain.classList.add('rain')
      rain.style.top = 0
      rain.style.left = Math.random() * boxWidth + 'px'
      rain.style.opacity = Math.random()
      article.appendChild(rain)
      let race = 1
      const time = setInterval(() => {
        if (parseInt(rain.style.top) > boxHeight) {
          clearInterval(time)
          article.removeChild(rain)
        }
        race++
        rain.style.top = parseInt(rain.style.top) + race + 'px'
      }, 20)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  useEffect(()=>{
    let timeout:any
    main()
    function main(){
      let yun:any = document.querySelector('.yunImg1')
      let yun2:any = document.querySelector('.yunImg')
      if(yun.offsetLeft<=40) {
        yun.className = `yun yun1s  yunImg1`
        yun2.className = `yun yun2s yunImg`
        clearTimeout(timeout)
        timeout=setTimeout(main,6000)
      } else {
        yun.className = `yun yun1 yunImg1`
        yun2.className = `yun yun2 yunImg`
        clearTimeout(timeout)
        timeout=setTimeout(main,6000)
      }
    }
    return ()=> clearTimeout(timeout)
    
  },[])
  return (
    <article className={`${styles.wrapper} centerhome`}>
      <img src={require('../../images/situation/dark/cloud01.png')} alt='' className={`yun  yunImg1`} />
      <img src={require('../../images/situation/dark/cloud02.png')} alt='' className={`yun yunImg`} />


      {/* 数据中心首页 - 地图 */}
      <section className={styles.background}>
        <BackgroundBox isWhite={isWhite} />
      </section>

      {step > 0 &&
        <div className={isWhite ? styles.bgleft : styles.bgleftnight}>
          { /* 数据中心首页 - 预警数据 */}
          <div className={styles.contWidth}>
            < section className={styles.alarmData}>
              <PanelAlarm />
            </section>
          </div>


          {/*数据中心首页 - 重点目标数据  */}
          <div className={styles.targetWidth}>
            <section className={styles.targetData}>
              <PanelTarget />
            </section>
          </div>

          {/*数据中心首页 - 人车数据  */}
          <div className={styles.personWidth}>
            <section className={styles.personData}>
              <PersonData />
            </section>
          </div>

        </div>
      }


      {step > 1 &&/*数据中心首页 - 实时视频  */
        <section className={styles.video}>
          <PanelVideo />
        </section>
      }


      {step > 0 &&/*数据中心首页 - 布控数据  */
        <div className={styles.controlWidth}>
          <section className={styles.controlData}>
            <PanelControl />
          </section>
        </div>
      }


      {step > 1 &&/*数据中心首页 - 实时船舶数据  */
        <div className={styles.RealWidth}>
          <section className={styles.RealData}>
            <PanelReal />
          </section>
        </div>
      }


      {step > 1 &&/*数据中心首页 - 采集数据  */
        <div className={styles.collectionWidth}>
          <section className={styles.collection}>
            <PanelCollection />
          </section>
        </div>
      }


      {step > 2 &&/*数据中心首页 - 重点场所  */
        <section className={isWhite ? styles.place : styles.placenight}>
          <PanelPlace />
        </section>
      }


    </article >
  )
}

export default DataCenterHome