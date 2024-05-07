import { Button } from "antd";
import { useAppDispatch } from "app/hooks";
import popupUI from "component/PopupUI";
import { getPointListAsync } from "server/device";
import { setIndex, setParams } from "slice/funMenuSlice";
import RelationCar from "./components/RelationCar";
import RelationFace from "./components/RelationFace";
import styles from "./index.module.sass";

interface Props {
    /** 数据内容 */
    data: any
}

const ColorList = ['#fadb14', '#ff4d4f', '#ffa940', '#fadb14']

const PlanManagementPopup: React.FC<Props> = ({ data }) => {
    console.debug('PlanManagementPopup')

    const { index, latLng, cameraScope, typeId, placeName, time, desc } = data

    const dispatch = useAppDispatch()

    async function handleOpen(type: string) {
        const typeObj: { [key: string]: any } = {
            face: {
                businessFunctions: ['3'],
                func: handleOpenFace
            },
            car: {
                businessFunctions: ['4'],
                func: handleOpenCar
            },
            monitorVideo: {
                businessFunctions: ['1'],
                func: handleMonitorVideo
            }
        }

        if (typeObj[type]) {
            const { businessFunctions, func } = typeObj[type]
            const res = await getPointListAsync({
                businessFunctions,
                // 经纬度和范围
                longitude: latLng?.length && latLng[0] ? latLng[0] : null,
                latitude: latLng?.length && latLng[1] ? latLng[1] : null,
                distance: cameraScope
            })
            func(res?.length ? res.map((item: any) => item.deviceCode) : [])
        }

    }

    // 视频调阅
    function handleMonitorVideo(data: string[]) {
        dispatch(setIndex(7))
        dispatch(setParams({
            checkCameraList: data
        }))
    }

    function handleOpenFace(data: string[]) {
        popupUI(<RelationFace deviceList={data} />, { title: '人脸数据', size: "middle", })
    }

    function handleOpenCar(data: string[]) {
        popupUI(<RelationCar deviceList={data} />, { title: '车辆数据', size: "middle", })
    }

    // 通知附近警力

    return <article className={styles.wrapper}>
        <div className={styles.label}>
            <div className={styles.labelRound} style={{ backgroundColor: ColorList[Math.round(Math.random() * 3)] }}></div>
            <div className={styles.labelText}>
                {`预案${index}目的地：${placeName || '--'}`}
            </div>
        </div>
        <div className={styles.content}>
            <div className={styles.contentItem}>
                <div className={styles.timeLable}>{'预计到达时间：'}</div>
                <div>{time || '--'}</div>
            </div>
            <div className={styles.contentItem}>
                <div className={styles.descLable}>{'预案描述：'}</div>
                {/* <div>{desc || '--'}</div> */}
                <div className={styles.itemText}>{desc || '--'}</div>
            </div>
        </div>
        <div className={styles.btnBox}>
            {/* 1:调用附近摄像机, 2:查看附件车辆, 3:查看附件人员, 4:无人机跟拍, 5:无人船抵近, 6:音柱喊话, 7:通知附近警力, 8:通知值班领导 */}
            {
                typeId.includes('1') ?
                    <Button type={'link'} onClick={() => handleOpen('monitorVideo')}>调阅视频</Button> : <></>
            }
            {
                typeId.includes('3') ?
                    <Button type={'link'} onClick={() => handleOpen('face')}>人脸数据</Button> : <></>
            }
            {
                typeId.includes('2') ?
                    <Button type={'link'} onClick={() => handleOpen('car')}>车辆数据</Button> : <></>
            }
        </div>
    </article>
}

export default PlanManagementPopup
