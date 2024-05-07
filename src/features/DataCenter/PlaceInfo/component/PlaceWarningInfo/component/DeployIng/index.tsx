import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space } from "antd";
import { defaultImgPeople } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { getPlaceDeploy, updatePlaceCtrlTarget } from "server/place";
import DeployCar from "./components/DeployCar";
import DeployFace from "./components/DeployFace";
import DeployFocusPerson from "./components/DeployFocusPerson";
import DeployShip from "./components/DeployShip";
import styles from "./index.module.sass";


interface Props {
  placeId: number
}

const DeployIng: React.FC<Props> = ({ placeId }) => {
  console.debug('DeployIng')


  const [data, setData] = useState<any>()
  const [mmsiList, setMmsiList] = useState<string[]>([])
  const [shipNameList, setShipNameList] = useState<string[]>([])
  const [shipFaceList, setShipFaceList] = useState<any[]>([])
  const [isAllShip, setIsAllShip] = useState(false)
  const [focusList, setFocusList] = useState<any[]>([])
  const [faceList, setFaceList] = useState<any[]>([])
  const [carList, setCarList] = useState<string[]>([])


  const getData = useCallback(
    async () => {
      const vo = await getPlaceDeploy(placeId)
      if (vo) {
        setData(vo)
        if (vo.areaCtrlJson) {
          const areaCtrlJson = vo.areaCtrlJson

          if (areaCtrlJson.controlScope === '0') {
            setIsAllShip(true)
            setMmsiList([])
            setShipNameList([])
            setShipFaceList([])
          } else {
            setIsAllShip(false)
            if (areaCtrlJson.alarmConditionShipMmsis) {
              const _mmsiList = areaCtrlJson.alarmConditionShipMmsis.split(',')
              setMmsiList(_mmsiList)
            } else {
              setMmsiList([])
            }

            if (areaCtrlJson.alarmConditionShipNames) {
              const _shipNameList = areaCtrlJson.alarmConditionShipNames.split(',')
              setShipNameList(_shipNameList)
            } else {
              setShipNameList([])
            }

            if (areaCtrlJson.alarmConditionShipFaceList) {
              setShipFaceList(areaCtrlJson.alarmConditionShipFaceList)
            } else {
              setShipFaceList([])
            }
          }

          if (areaCtrlJson.focusPersonList) {
            setFocusList(areaCtrlJson.focusPersonList)
          } else {
            setFocusList([])
          }

          if (areaCtrlJson.faceDtoList) {
            setFaceList(areaCtrlJson.faceDtoList)
          } else {
            setFaceList([])
          }

          if (areaCtrlJson.licensePlates) {
            const _licensePlates = areaCtrlJson.licensePlates.split(',')
            setCarList(_licensePlates)
          } else {
            setCarList([])
          }
        }
      }
    },
    [placeId],
  )


  useEffect(() => {
    async function main() {
      await getData()
    }
    main()
  }, [getData])


  const handleRefresh = useCallback(
    async () => {
      await getData()
    },
    [getData],
  )

  const handleShip = useCallback(
    () => {

      popup(<DeployShip placeId={placeId} data={data} onFinish={handleRefresh} controlLevel={data?.controlLevel || 3} />, { title: '新增船舶布控', size: 'auto' })
    },
    [placeId, data, handleRefresh]
  )

  const handlePerson = useCallback(
    () => popup(<DeployFocusPerson placeId={placeId} data={data} onFinish={handleRefresh} controlLevel={data?.controlLevel || 3} />, { title: '新增重点人员布控', size: 'auto' }),
    [placeId, data, handleRefresh],
  )

  const handleFace = useCallback(
    () => popup(<DeployFace placeId={placeId} data={data} onFinish={handleRefresh} controlLevel={data?.controlLevel || 3} />, { title: '新增人脸布控', size: 'auto' }),
    [placeId, data, handleRefresh],
  )

  const handleCar = useCallback(
    () => popup(<DeployCar placeId={placeId} data={data} onFinish={handleRefresh} controlLevel={data?.controlLevel || 3} />, { title: '新增车辆布控', size: 'auto' }),
    [placeId, data, handleRefresh],
  )

  const handleDel = useCallback(
    async (type: string, item: any) => {
      if (data) {
        const dto: any = {
          id: data.id,
          areaId: data.areaId,
          areaCtrlJson: {
            ...data.areaCtrlJson
          }
        }

        switch (type) {
          case 'mmsi':
            const _mmsiList = _.filter(mmsiList, val => val !== item)
            dto.areaCtrlJson.alarmConditionShipMmsis = _.isEmpty(_mmsiList) ? null : _mmsiList.toString()
            break;
          case 'shipName':
            const _shipNameList = _.filter(shipNameList, val => val !== item)
            dto.areaCtrlJson.alarmConditionShipNames = _.isEmpty(_shipNameList) ? null : _shipNameList.toString()
            break;
          case 'shipFace':
            const _shipFace = _.filter(shipFaceList, val => !_.isEqual(val, item))
            dto.areaCtrlJson.alarmConditionShipFaceList = _.isEmpty(_shipFace) ? null : _shipFace
            break;
          case 'focus':
            const _focusList = _.filter(focusList, val => !_.isEqual(val, item))
            dto.areaCtrlJson.focusPersonList = _.isEmpty(_focusList) ? null : _focusList
            break;
          case 'face':
            const _faceList = _.filter(faceList, val => !_.isEqual(val, item))
            dto.areaCtrlJson.faceDtoList = _.isEmpty(_faceList) ? null : _faceList
            break;
          case 'car':
            const _carList = _.filter(carList, val => !_.isEqual(val, item))
            dto.areaCtrlJson.licensePlates = _.isEmpty(_carList) ? null : _carList.toString()
            break;
          default:
            break;
        }

        await updatePlaceCtrlTarget(dto)
        await getData()
      }
    },
    [data, getData, mmsiList, shipNameList, shipFaceList, focusList, faceList, carList],
  )


  return (
    <article className={styles.wrapper}>

      <article className={styles.panel}>
        <header>
          <Space>
            <span>船舶布控</span>
            <Button onClick={handleShip}>添加</Button>
          </Space>
        </header>

        {isAllShip &&
          <section>任意船舶</section>
        }

        {mmsiList.length !== 0 &&
          <section>
            <div className={styles.title}>MMSI:</div>
            {mmsiList.map(item =>
              <div className={styles.mmsiCard} key={item}>
                <span>{item}</span>
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDel('mmsi', item)}>
                  <CloseCircleOutlined className={styles.shipClose} />
                </Popconfirm>
              </div>
            )}
          </section>
        }

        {shipNameList.length !== 0 &&
          <section>
            <div className={styles.title}>船名:</div>
            {shipNameList.map(item =>
              <div className={styles.mmsiCard} key={item}>
                <span>{item}</span>
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDel('shipName', item)}>
                  <CloseCircleOutlined className={styles.shipClose} />
                </Popconfirm>
              </div>
            )}
          </section>
        }

        {shipFaceList.length !== 0 &&
          <section>
            <div className={styles.title}>船脸:</div>
            {shipFaceList.map(item =>
              <div className={styles.shipImg} key={item.id}>
                <ImageSimple src={item.url} width={100} height={100} />
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDel('shipFace', item)}>
                  <CloseCircleOutlined className={styles.imgClose} />
                </Popconfirm>
              </div>
            )}
          </section>
        }
      </article>

      <article className={styles.panel}>
        <header>
          <Space>
            <span>重点人员布控</span>
            <Button onClick={handlePerson}>添加</Button>
          </Space>
        </header>
        {focusList.length !== 0 &&
          <section>
            {focusList.map(item =>
              <div className={styles.focusCard} key={item.id}>
                <ImageSimple src={item.url} width={100} height={100} defaultSrc={defaultImgPeople} />
                <div className={styles.focusName}>{item.name}</div>
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDel('focus', item)}>
                  <CloseCircleOutlined className={styles.imgClose} />
                </Popconfirm>
              </div>
            )}
          </section>
        }
      </article>

      <article className={styles.panel}>
        <header>
          <Space>
            <span>人脸布控</span>
            <Button onClick={handleFace}>添加</Button>
          </Space>
        </header>
        {faceList.length !== 0 &&
          <section>
            {faceList.map(item =>
              <div className={styles.focusCard} key={item.url}>
                <ImageSimple src={item.url} width={100} height={100} />
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDel('face', item)}>
                  <CloseCircleOutlined className={styles.imgClose} />
                </Popconfirm>
              </div>
            )}
          </section>
        }
      </article>

      <article className={styles.panel}>
        <header>
          <Space>
            <span>车辆布控</span>
            <Button onClick={handleCar}>添加</Button>
          </Space>
        </header>
        {carList.length !== 0 &&
          <section>
            {carList.map(item =>
              <div className={styles.mmsiCard} key={item}>
                <span>{item}</span>
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDel('car', item)}>
                  <CloseCircleOutlined className={styles.shipClose} />
                </Popconfirm>
              </div>
            )}
          </section>
        }
      </article>

    </article>
  )
}

export default DeployIng