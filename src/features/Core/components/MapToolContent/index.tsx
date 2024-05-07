import { Button, Popover } from "antd";
import { useAppSelector } from "app/hooks";
import windowUI from "component/WindowUI";
import createElementByComponent from "helper/elementComponent";
import { getMapPinIcon } from "helper/mapIcon";
import { useCallback, useMemo } from "react";
import { addPinMarker, addTextMarker, delTextMarker, removeTextMarker } from "server/map";
import { selectValue } from "slice/coreMapSlice";
import Area, { DrawType } from "webgis/extendUntils/tool/Area";
import PinPopup from "../PinPopup";
import AreaTargetPopup from "../SituationalAnalysis/components/AreaTargetPopup";
import styles from "./index.module.sass";
// import pinSrc from "images/core/pin.svg";
import threedSrc from "images/core/3D.png";
import cjSrc from "images/core/cj.png";
import cmjSrc from "images/core/cmj.png";
import bjSrc from "images/core/bj.png";
import hzSrc from "images/core/hz.png";
import jpSrc from "images/core/jp.png";
import './index.sass'


const pinIcon = getMapPinIcon()

const MapToolContent: React.FC = () => {
  console.debug('MapToolContent')


  const { map2d } = useAppSelector(selectValue)


  const handleDistanceTool = useCallback(
    () => {
      if (map2d) {
        map2d.createRulerTool()
      }
    },
    [map2d],
  )

  const handleAreaTool = useCallback(
    (type: DrawType) => {
      if (map2d) {
        map2d.createAreaTool(type)
      }
    },
    [map2d],
  )

  const handleCreate = useCallback(
    (e: any, tool: Area) => {
      windowUI(<AreaTargetPopup layer={e.layer} />, {
        title: `区域设备`,
        width: 330,
        height: 360,
        offset: [480, 100],
        onClose: () => {
          tool.clear()
        }
      })
    },
    [],
  )

  const handleAreaTargetTool = useCallback(
    (type: DrawType) => {
      if (map2d) {
        map2d.createAreaTool(type, {
          isNotShowAreaValue: true,
          onCreate: handleCreate
        })
      }
    },
    [map2d, handleCreate],
  )

  const handleTextCreate = useCallback(
    async (data: any) => {
      await addTextMarker(data)
    },
    [],
  )

  const handleTextClear = useCallback(
    async (data: any) => {
      await removeTextMarker(data)
    },
    [],
  )

  const handleTextTool = useCallback(
    () => {
      if (map2d) {
        map2d.createTextTool({
          limit: 30,
          onCreate: handleTextCreate,
          onClear: handleTextClear
        })
      }
    },
    [map2d, handleTextCreate, handleTextClear],
  )

  const handleRemove = useCallback(
    async (id?: number) => {
      await delTextMarker({ id })
    },
    [],
  )


  const handlePinCreate = useCallback(async (marker: any) => {
    const latLng = marker.getLatLng()

    const id = await addPinMarker(latLng)

    marker.addTo(map2d!.map)

    const htmlEle = createElementByComponent(<PinPopup layer={marker} id={id} onClear={handleRemove} />)

    marker.bindPopup(htmlEle, {
      offset: L.point(0, -14),
      minWidth: 40,
      autoPan: false,
      className: 'leaflet-popup-ui',
      closeButton: false
    })

    marker.on("mouseover ", function (evt: any) {
      evt.target.openPopup()
    })
  }, [map2d, handleRemove])

  const handlePin = useCallback(
    () => {
      if (map2d) {
        map2d.createPinTool({
          onCreate: handlePinCreate,
          icon: pinIcon
        })
      }
    },
    [map2d, handlePinCreate],
  )

  // 截图
  const handleScreenShot = useCallback(
    () => {
      const screenShotBtn: any = document.getElementById('screenShot');
      screenShotBtn && screenShotBtn.onclick()
    },
    [],
  )


  const AreaTool = useMemo(
    () => (
      <>
        <Button onClick={() => handleAreaTool('Polygon')}>多边形</Button>
        <Button onClick={() => handleAreaTool('Rectangle')}>正方形</Button>
        <Button onClick={() => handleAreaTool('Circle')}>圆形</Button>
      </>
    )
    ,
    [handleAreaTool]
  )

  const AreaTargetTool = useMemo(
    () => (
      <>
        <Button onClick={() => handleAreaTargetTool('Polygon')}>多边形</Button>
        <Button onClick={() => handleAreaTargetTool('Rectangle')}>正方形</Button>
        <Button onClick={() => handleAreaTargetTool('Circle')}>圆形</Button>
      </>
    )
    ,
    [handleAreaTargetTool]
  )


  return (
    <article className={`${styles.wrapper} maptoolbotton`}>
      <Button type="text" onClick={handlePin} title="定位">
        <img className={styles.pin} src={threedSrc} alt='图钉' />
      </Button>
      <Button style={{marginTop:'6px'}} title="测距" type="text" onClick={handleDistanceTool}>
        <img className={styles.pin} src={cjSrc} alt='测距' />
      </Button>
      <Popover content={AreaTool} placement="left" >
        <Button style={{marginTop:'6px'}} title="测面积"  type="text">
          <img className={styles.pin} src={cmjSrc} alt='测面积' />
        </Button>
      </Popover>
      <Button style={{marginTop:'6px'}} title="标记"  type="text"   onClick={handleTextTool}>
        <img className={styles.pin} src={bjSrc} alt='标记' />
      </Button>
      <Popover content={AreaTargetTool} placement="left">
        <Button style={{marginTop:'6px'}} title="绘区域"  type="text" >
          <img className={styles.pin} src={hzSrc} alt='绘区域' />
        </Button>
      </Popover>
      <Button style={{marginTop:'6px'}} title="截屏"   type="text"  onClick={handleScreenShot}>
        <img className={styles.pin} src={jpSrc} alt='截屏' />
      </Button>
    </article>
  )
}

export default MapToolContent