import { Button, Checkbox, Row, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";
import { selectValue } from "slice/coreMapSlice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import SelectSimple from "hooks/basis/SelectSimple";
import { CameraTypeAllDict } from "helper/dictionary";
import { setIndex, setParams } from "slice/funMenuSlice";
import _ from "lodash";
import { getAllCameraByPlaceId } from "server/device";
import { getPlaceListDetailinfos } from "server/place";
import popup from "hooks/basis/Popup";
import PlaceInfo from "features/DataCenter/PlaceInfo";
import { setCoreArea } from "slice/coreAreaSlice";
import { setNavigate } from "slice/routerSlice";
import windowUI from "component/WindowUI";
import VoicePlayPanel from "features/Core/components/Voice/VoicePlayPanel";


const { Text } = Typography;

interface Props {
  /** 重点场所id */
  placeId?: number
  layer?: any
  onClosePopup?: () => void
}

const AreaTargetPopup: React.FC<Props> = ({ placeId, layer, onClosePopup }) => {
  console.debug('AreaTargetPopup')

  const dispatch = useAppDispatch()
  const { map2d } = useAppSelector(selectValue)


  const [list, setList] = useState<any[]>([])
  const [checkboxGroup, setCheckboxGroup] = useState<string[]>([])
  const [cameraType, setCameraType] = useState(0)
  const [placeInfos, setPlaceInfo] = useState<any>()


  const showList = useMemo(() => {
    if (cameraType === 0) {
      return list
    } else {
      const result = _.filter(list, (ele: any) => ele.cameraType === cameraType)
      return result
    }
  }, [list, cameraType])

  const isDisabled = useMemo(() => checkboxGroup.length === 0, [checkboxGroup])

  const isShowVOD = useMemo(() => {
    if (checkboxGroup.length === 0) {
      return false
    } else {
      const vodList = _.filter(showList, item => item.deviceType === '9')
      const valList = vodList.map(item => item.value)
      const is = checkboxGroup.some(item => valList.includes(item))
      return is
    }
  }, [checkboxGroup, showList])

  useEffect(() => {
    async function main() {
      if (placeId) {
        const vo = await getPlaceListDetailinfos(placeId)
        setPlaceInfo(vo)
      }
    }
    main()
  }, [placeId])

  useEffect(() => {

    if (map2d && layer && !placeId) {
      let result: any[] = []

      const isInLayer = (layer: any, _device: any) => {
        let isIn = false
        if (layer.pm._shape === 'Circle') {
          const latLng = L.latLng(_device.latitude, _device.longitude)
          const distance = latLng.distanceTo(layer._latlng)
          isIn = distance <= layer._mRadius
        } else {
          const pt = turf.point([_device.longitude, _device.latitude]);
          const [polygon] = layer._latlngs
          const pointList = polygon.map((val: any) => [val.lng, val.lat])
          pointList.push(pointList[0])
          const poly = turf.polygon([pointList]);
          isIn = turf.booleanPointInPolygon(pt, poly)
        }
        return isIn
      }

      map2d.map.eachLayer((item: any) => {
        if (item.options?.extraData?.deviceCode) {
          const device = item.options?.extraData
          if (device.group) {
            device.group.forEach((_device: any) => {
              const is = isInLayer(layer, _device)
              is && result.push({
                label: _device.name,
                value: _device.deviceCode,
                deviceCode: _device.deviceCode,
                deviceType: _device.deviceType,
                cameraType: _device.cameraType
              })
            })
          } else {
            const is = isInLayer(layer, device)
            is && result.push({
              label: device.name,
              value: device.deviceCode,
              deviceCode: device.deviceCode,
              deviceType: device.deviceType,
              cameraType: device.cameraType
            })
          }

        }
      })
      setList(result)
      setCheckboxGroup(result.map(ele => ele.value))
    }

  }, [map2d, layer, placeId])

  useEffect(() => {
    async function main() {
      if (placeId) {
        const vo = await getAllCameraByPlaceId(placeId)
        const _list: any[] = vo.map((item: any) => ({
          ...item,
          label: item.name,
          value: item.deviceCode,
        }))
        setList(_list)
        setCheckboxGroup(_list.map(ele => ele.value))
      }
    }
    main()
  }, [placeId])


  const handleCheckboxGroup = useCallback((params: any[]) => {
    setCheckboxGroup(params)
  }, [])

  const handleMonitor = useCallback(
    () => {

      const cameraDeviceList = _.filter(list, (item: any) => item.cameraType !== 0 && checkboxGroup.includes(item.deviceCode))
      const checkCameraList = cameraDeviceList.map((item: any) => item.deviceCode)

      dispatch(setIndex(7))
      dispatch(setParams({
        placeId,
        checkCameraList
      }))
      onClosePopup && onClosePopup()
    },
    [list, dispatch, placeId, onClosePopup, checkboxGroup],
  )

  const handleVod = useCallback(
    () => {
      const vodList = _.filter(showList, item => item.deviceType === '9')
      const valList = vodList.map(item => item.value)
      const codes = _.filter(checkboxGroup, item => valList.includes(item))
      windowUI(<VoicePlayPanel deviceCodes={codes} />, {
        title: '点播',
        offset: [1480, 80],
        width: '400px',
        height: '800px',
        key: '点播'
      })
    },
    [checkboxGroup, showList],
  )


  const handleData = useCallback(
    () => {
      if (placeInfos) {
        popup(<PlaceInfo
          id={placeInfos.id}
          labelId={placeInfos.labelId}
          defaultTargetKey='1'
          placeInfo={placeInfos}
        />, {
          title: '查看重点场所详情',
          size: "fullscreen"
        })
      } else {
        dispatch(setCoreArea(layer))
        dispatch(setNavigate({
          path: '/dataCenter/collectionData',
          state: {
            activeKey: 'item-1',
            sourceDataActiveKey: '1',
          }
        }))
      }
    },
    [dispatch, layer, placeInfos],
  )

  const handleCameraType = useCallback(
    (val: number) => {
      setCameraType(val)
    },
    []
  )



  return (
    <article className={styles.wrapper}>
      <div className={styles.topcss}>
        {placeInfos &&
          <>
            场所名称：
            <Text className={styles.checkboxText} ellipsis={{ tooltip: placeInfos.name }} >
              {placeInfos.name}
            </Text>
            &emsp;
            场所类型：
            <Text className={styles.checkboxText} ellipsis={{ tooltip: placeInfos.labelName }} >
              {placeInfos.labelName}
            </Text>
          </>
        }
      </div>
      <header>
        <SelectSimple className={styles.select} dict={CameraTypeAllDict} size='small' defaultValue={0} onChange={handleCameraType} />
      </header>
      <section className={styles.content}>
        <Checkbox.Group className={styles.group} value={checkboxGroup} onChange={handleCheckboxGroup}>
          {showList.map((ele, index) =>
            <Row className={styles.row} key={index} >
              <Checkbox value={ele.value}>{ele.label}</Checkbox>
            </Row>
          )}
        </Checkbox.Group>
      </section>
      <footer>
        <Space>
          {isShowVOD && <Button size="small" onClick={handleVod} >点播</Button>}
          <Button size="small" onClick={handleMonitor} disabled={isDisabled}>实时监控</Button>
          <Button size="small" onClick={handleData} >实时数据</Button>
        </Space>
      </footer>
    </article>
  )
}

export default AreaTargetPopup